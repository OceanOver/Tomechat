import argparse

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import RedirectResponse

from tomechat import __version__
from tomechat.server.api_server.kb_routes import kb_router
from tomechat.server.api_server.openai_routes import openai_router
from tomechat.server.chat.completion import completion
from tomechat.server.utils import MakeFastAPIOffline
from tomechat.settings import Settings


def create_app(run_mode: str | None = None):
    # Ensure data dirs and the /media static dir exist (fresh startup won't fail on missing dirs)
    Settings.basic_settings.make_dirs()
    app = FastAPI(title="Tomechat API Server", version=__version__)
    MakeFastAPIOffline(app)
    # Add CORS middleware to allow all origins
    # Set OPEN_CROSS_DOMAIN=True in basic_settings.yaml to enable CORS
    if Settings.basic_settings.OPEN_CROSS_DOMAIN:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.get("/", summary="swagger docs", include_in_schema=False)
    async def document():
        return RedirectResponse(url="/docs")

    app.include_router(kb_router)
    app.include_router(openai_router)
    # Other endpoints
    app.post(
        "/other/completion",
        tags=["Other"],
        summary="Request LLM completion",
    )(completion)

    # Media files
    app.mount("/media", StaticFiles(directory=Settings.basic_settings.MEDIA_PATH), name="media")

    return app


def run_api(host, port, **kwargs):
    if kwargs.get("ssl_keyfile") and kwargs.get("ssl_certfile"):
        uvicorn.run(
            app,
            host=host,
            port=port,
            ssl_keyfile=kwargs.get("ssl_keyfile"),
            ssl_certfile=kwargs.get("ssl_certfile"),
        )
    else:
        uvicorn.run(app, host=host, port=port)


app = create_app()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        prog="langchain-ChatGLM",
        description="About langchain-ChatGLM, local knowledge based ChatGLM with langchain",
    )
    parser.add_argument("--host", type=str, default="0.0.0.0")
    parser.add_argument("--port", type=int, default=7861)
    parser.add_argument("--ssl_keyfile", type=str)
    parser.add_argument("--ssl_certfile", type=str)
    # Startup message
    args = parser.parse_args()
    args_dict = vars(args)

    run_api(
        host=args.host,
        port=args.port,
        ssl_keyfile=args.ssl_keyfile,
        ssl_certfile=args.ssl_certfile,
    )
