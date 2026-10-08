import multiprocessing as mp
import os
import sys
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Callable, Dict, Generator, List, Optional, Union

from fastapi import FastAPI

from tomechat.settings import Settings
from tomechat.utils import build_logger

logger = build_logger()


def MakeFastAPIOffline(
    app: FastAPI,
    static_dir=Path(__file__).parent / "api_server" / "static",
    static_url="/static-offline-docs",
    docs_url: Optional[str] = "/docs",
    redoc_url: Optional[str] = "/redoc",
) -> None:
    """patch the FastAPI obj that doesn't rely on CDN for the documentation page"""
    from fastapi import Request
    from fastapi.openapi.docs import (
        get_redoc_html,
        get_swagger_ui_html,
        get_swagger_ui_oauth2_redirect_html,
    )
    from fastapi.staticfiles import StaticFiles
    from starlette.responses import HTMLResponse

    openapi_url = app.openapi_url
    swagger_ui_oauth2_redirect_url = app.swagger_ui_oauth2_redirect_url

    def remove_route(url: str) -> None:
        """
        remove original route from app
        """
        index = None
        for i, r in enumerate(app.routes):
            if r.path.lower() == url.lower():
                index = i
                break
        if isinstance(index, int):
            app.routes.pop(index)

    # Set up static file mount
    app.mount(
        static_url,
        StaticFiles(directory=Path(static_dir).as_posix()),
        name="static-offline-docs",
    )

    if docs_url is not None:
        remove_route(docs_url)
        remove_route(swagger_ui_oauth2_redirect_url)

        # Define the doc and redoc pages, pointing at the right files
        @app.get(docs_url, include_in_schema=False)
        async def custom_swagger_ui_html(request: Request) -> HTMLResponse:
            root = request.scope.get("root_path")
            favicon = f"{root}{static_url}/favicon.png"
            return get_swagger_ui_html(
                openapi_url=f"{root}{openapi_url}",
                title=app.title + " - Swagger UI",
                oauth2_redirect_url=swagger_ui_oauth2_redirect_url,
                swagger_js_url=f"{root}{static_url}/swagger-ui-bundle.js",
                swagger_css_url=f"{root}{static_url}/swagger-ui.css",
                swagger_favicon_url=favicon,
            )

        @app.get(swagger_ui_oauth2_redirect_url, include_in_schema=False)
        async def swagger_ui_redirect() -> HTMLResponse:
            return get_swagger_ui_oauth2_redirect_html()

    if redoc_url is not None:
        remove_route(redoc_url)

        @app.get(redoc_url, include_in_schema=False)
        async def redoc_html(request: Request) -> HTMLResponse:
            root = request.scope.get("root_path")
            favicon = f"{root}{static_url}/favicon.png"

            return get_redoc_html(
                openapi_url=f"{root}{openapi_url}",
                title=app.title + " - ReDoc",
                redoc_js_url=f"{root}{static_url}/redoc.standalone.js",
                with_google_fonts=False,
                redoc_favicon_url=favicon,
            )


def api_address(is_public: bool = False) -> str:
    """
    允许用户在 basic_settings.API_SERVER 中配置 public_host, public_port
    以便使用云服务器或反向代理时生成正确的公网 API 地址（如知识库文档下载链接）
    """
    from tomechat.settings import Settings

    server = Settings.basic_settings.API_SERVER
    if is_public:
        host = server.get("public_host", "127.0.0.1")
        port = server.get("public_port", "7861")
    else:
        host = server.get("host", "127.0.0.1")
        port = server.get("port", "7861")
        if host == "0.0.0.0":
            host = "127.0.0.1"
    return f"http://{host}:{port}"


def get_prompt_template(type: str, name: str) -> str:
    """
    从prompt_config中加载模板内容
    type: 对应于 model_settings.llm_model_config 模型类别其中的一种，以及 "rag"，如果有新功能，应该进行加入。
    """

    from tomechat.settings import Settings  # noqa: PLC0415

    return Settings.prompt_settings.model_dump().get(type, {}).get(name)


def set_httpx_config(
    timeout: float = Settings.basic_settings.HTTPX_DEFAULT_TIMEOUT,
    proxy: Union[str, Dict] = None,
    unused_proxies: List[str] = [],
):
    """
    设置httpx默认timeout。httpx默认timeout是5秒，在请求LLM回答时不够用。
    对于在线API，如要使用代理需要手动配置。
    """

    import httpx

    httpx._config.DEFAULT_TIMEOUT_CONFIG.connect = timeout
    httpx._config.DEFAULT_TIMEOUT_CONFIG.read = timeout
    httpx._config.DEFAULT_TIMEOUT_CONFIG.write = timeout

    # 在进程范围内设置系统级代理
    proxies = {}
    if isinstance(proxy, str):
        for n in ["http", "https", "all"]:
            proxies[n + "_proxy"] = proxy
    elif isinstance(proxy, dict):
        for n in ["http", "https", "all"]:
            if p := proxy.get(n):
                proxies[n + "_proxy"] = p
            elif p := proxy.get(n + "_proxy"):
                proxies[n + "_proxy"] = p

    for k, v in proxies.items():
        os.environ[k] = v

    # set host to bypass proxy
    no_proxy = [x.strip() for x in os.environ.get("no_proxy", "").split(",") if x.strip()]
    no_proxy += [
        "http://127.0.0.1",
        "http://localhost",
    ]
    for x in unused_proxies:
        host = ":".join(x.split(":")[:2])
        if host not in no_proxy:
            no_proxy.append(host)
    os.environ["NO_PROXY"] = ",".join(no_proxy)

    def _get_proxies():
        return proxies

    import urllib.request

    urllib.request.getproxies = _get_proxies


def run_in_thread_pool(
    func: Callable,
    params: List[Dict] = [],
) -> Generator:
    """
    在线程池中批量运行任务，并将运行结果以生成器的形式返回。
    请确保任务中的所有操作是线程安全的，任务函数请全部使用关键字参数。
    """
    tasks = []
    with ThreadPoolExecutor() as pool:
        for kwargs in params:
            tasks.append(pool.submit(func, **kwargs))

        for obj in as_completed(tasks):
            try:
                yield obj.result()
            except Exception as e:
                logger.exception(f"error in sub thread: {e}")


def run_in_process_pool(
    func: Callable,
    params: List[Dict] = [],
) -> Generator:
    """
    在线程池中批量运行任务，并将运行结果以生成器的形式返回。
    请确保任务中的所有操作是线程安全的，任务函数请全部使用关键字参数。
    """
    tasks = []
    max_workers = None
    if sys.platform.startswith("win"):
        max_workers = min(mp.cpu_count(), 60)  # max_workers should not exceed 60 on windows
    with ProcessPoolExecutor(max_workers=max_workers) as pool:
        for kwargs in params:
            tasks.append(pool.submit(func, **kwargs))

        for obj in as_completed(tasks):
            try:
                yield obj.result()
            except Exception as e:
                logger.exception(f"error in sub process: {e}")
