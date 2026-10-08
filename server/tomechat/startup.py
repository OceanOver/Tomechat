import asyncio
import logging
import logging.config
import multiprocessing
import multiprocessing as mp
import os
import sys
from contextlib import asynccontextmanager
from multiprocessing import Process
from multiprocessing.synchronize import Event

# 设置numexpr最大线程数，默认为CPU核心数
try:
    from numexpr.utils import detect_number_of_cores

    n_cores = detect_number_of_cores()
    os.environ["NUMEXPR_MAX_THREADS"] = str(n_cores)
except Exception:
    pass

import click
from fastapi import FastAPI

from tomechat.utils import build_logger

logger = build_logger()


def _set_app_event(app: FastAPI, started_event: Event | None = None):
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        if started_event is not None:
            started_event.set()
        yield

    app.router.lifespan_context = lifespan


def run_api_server(started_event: Event | None = None, run_mode: str | None = None):
    import uvicorn  # noqa: PLC0415

    from tomechat.server.api_server.server_app import create_app  # noqa: PLC0415
    from tomechat.server.utils import set_httpx_config  # noqa: PLC0415
    from tomechat.settings import Settings  # noqa: PLC0415
    from tomechat.utils import (  # noqa: PLC0415
        get_config_dict,
        get_log_file,
        get_timestamp_ms,
    )

    logger.info(f"Api MODEL_PLATFORMS: {Settings.model_settings.MODEL_PLATFORMS}")
    set_httpx_config()
    Settings.basic_settings.make_dirs()
    app = create_app(run_mode=run_mode)
    _set_app_event(app, started_event)

    host = Settings.basic_settings.API_SERVER["host"]
    port = Settings.basic_settings.API_SERVER["port"]

    logging_conf = get_config_dict(
        "INFO",
        get_log_file(log_path=Settings.basic_settings.LOG_PATH, sub_dir=f"run_api_server_{get_timestamp_ms()}"),
        1024 * 1024 * 1024 * 3,
        1024 * 1024 * 1024 * 3,
    )
    logging.config.dictConfig(logging_conf)  # type: ignore

    if Settings.basic_settings.LANG_SMITH["OPEN_LANGSMITH"] is True:
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGSMITH_API_KEY"] = Settings.basic_settings.LANG_SMITH["LANGCHAIN_API_KEY"]
        os.environ["LANGCHAIN_PROJECT"] = Settings.basic_settings.LANG_SMITH["LANGCHAIN_PROJECT"]
    logger.info(f"LANG_SMITH CONFIG: {Settings.basic_settings.LANG_SMITH}")

    uvicorn.run(app, host=host, port=port)


def dump_server_info(after_start=False, args=None):
    import platform  # noqa: PLC0415

    import langchain  # noqa: PLC0415

    from tomechat import __version__  # noqa: PLC0415
    from tomechat.server.utils import api_address  # noqa: PLC0415
    from tomechat.settings import Settings  # noqa: PLC0415

    print("\n")
    print("=" * 30 + "Tomechat Configuration" + "=" * 30)
    print(f"操作系统：{platform.platform()}.")
    print(f"python版本：{sys.version}")
    print(f"项目版本：{__version__}")
    print(f"langchain版本：{langchain.__version__}")
    print(f"数据目录：{Settings.TOMECHAT_ROOT}")
    print("\n")

    print(f"当前使用的分词器：{Settings.kb_settings.TEXT_SPLITTER_NAME}")

    print(f"默认选用的 Embedding 名称： {Settings.model_settings.DEFAULT_EMBEDDING_MODEL}")

    if after_start:
        print("\n")
        print("服务端运行信息：")
        assert args is not None
        if args.api:
            print(f"    Tomechat Api Server: {api_address()}")
    print("=" * 30 + "Tomechat Configuration" + "=" * 30)
    print("\n")


async def start_main_server(args):
    import signal  # noqa: PLC0415

    from tomechat.settings import Settings  # noqa: PLC0415
    from tomechat.utils import (  # noqa: PLC0415
        get_config_dict,
        get_log_file,
        get_timestamp_ms,
    )

    logging_conf = get_config_dict(
        "INFO",
        get_log_file(log_path=Settings.basic_settings.LOG_PATH, sub_dir=f"start_main_server_{get_timestamp_ms()}"),
        1024 * 1024 * 1024 * 3,
        1024 * 1024 * 1024 * 3,
    )
    logging.config.dictConfig(logging_conf)  # type: ignore

    def handler(signalname):
        """
        Python 3.9 has `signal.strsignal(signalnum)` so this closure would not be needed.
        Also, 3.8 includes `signal.valid_signals()` that can be used to create a mapping for the same purpose.
        """

        def f(signal_received, frame):
            raise KeyboardInterrupt(f"{signalname} received")

        return f

    # This will be inherited by the child process if it is forked (not spawned)
    signal.signal(signal.SIGINT, handler("SIGINT"))
    signal.signal(signal.SIGTERM, handler("SIGTERM"))

    mp.set_start_method("spawn")
    manager = mp.Manager()
    run_mode = None

    dump_server_info(args=args)

    if len(sys.argv) > 1:
        logger.info("正在启动服务：")
        logger.info(f"如需查看 llm_api 日志，请前往 {Settings.basic_settings.LOG_PATH}")

    processes = {}

    api_started = manager.Event()
    if args.api:
        process = Process(
            target=run_api_server,
            name="API Server",
            kwargs={
                "started_event": api_started,
                "run_mode": run_mode,
            },
            daemon=False,
        )
        processes["api"] = process

    try:
        if p := processes.get("api"):
            p.start()
            p.name = f"{p.name} ({p.pid})"
            api_started.wait()  # 等待api.py启动完成

        dump_server_info(after_start=True, args=args)

        # 等待所有进程退出
        while processes:
            p = processes["api"]
            p.join(2)
            if not p.is_alive():
                processes.pop("api")
    except Exception as e:
        logger.error(e)
        logger.warning("Caught KeyboardInterrupt! Setting stop event...")
    finally:
        for p in processes.values():
            logger.warning("Sending SIGKILL to %s", p)
            # Queues and other inter-process communication primitives can break when
            # process is killed, but we don't care here

            if isinstance(p, dict):
                for process in p.values():
                    process.kill()
            else:
                p.kill()

        for p in processes.values():
            logger.info("Process status: %s", p)


@click.command(help="启动服务")
@click.option(
    "--api",
    "api",
    is_flag=True,
    help="run api.py",
)
def main(api):
    class args:  # noqa: N801
        pass

    args.api = api  # type: ignore

    # 添加这行代码
    cwd = os.getcwd()
    sys.path.append(cwd)
    multiprocessing.freeze_support()
    print("cwd:" + cwd)
    from tomechat.server.knowledge_base.migrate import create_tables  # noqa: PLC0415

    create_tables()
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()

    asyncio.set_event_loop(loop)
    loop.run_until_complete(start_main_server(args))


if __name__ == "__main__":
    main()
