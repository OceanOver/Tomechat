"""Model platform config loading and LLM/Embedding/OpenAI client factory."""

from typing import Any, Dict, List, Literal, Optional, Tuple, Union

import httpx
import openai
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.embeddings import Embeddings
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI, OpenAI

from tomechat.server.utils import api_address
from tomechat.settings import Settings
from tomechat.utils import build_logger

logger = build_logger()


def get_config_platforms() -> Dict[str, Dict]:
    """
    Get configured model platforms; converts pydantic models to dicts.
    """
    platforms = [m.model_dump() for m in Settings.model_settings.MODEL_PLATFORMS]
    return {m["platform_name"]: m for m in platforms}


def get_config_models(
    model_name: str = None,
    model_type: Optional[Literal["llm", "embed"]] = None,
    platform_name: str = None,
) -> Dict[str, Dict]:
    """
    Get configured model list, returns:
    {model_name: {
        "platform_name": xx,
        "platform_type": xx,
        "model_type": xx,
        "model_name": xx,
        "api_base_url": xx,
        "api_key": xx,
        "api_proxy": xx,
    }}
    """
    result = {}
    if model_type is None:
        model_types = ["llm_models", "embed_models"]
    else:
        model_types = [f"{model_type}_models"]

    for m in list(get_config_platforms().values()):
        if platform_name is not None and platform_name != m.get("platform_name"):
            continue

        for m_type in model_types:
            models = m.get(m_type, [])
            if not models:
                continue
            for m_name in models:
                if model_name is None or model_name == m_name:
                    result[m_name] = {
                        "platform_name": m.get("platform_name"),
                        "platform_type": m.get("platform_type"),
                        "model_type": m_type.split("_")[0],
                        "model_name": m_name,
                        "api_base_url": m.get("api_base_url"),
                        "api_key": m.get("api_key"),
                        "api_proxy": m.get("api_proxy"),
                    }
    return result


def get_model_info(model_name: str = None, platform_name: str = None, multiple: bool = False) -> Dict:
    """
    Get configured model info, mainly api_base_url and api_key.
    If multiple=True, returns all models with the same name; otherwise only the first.
    """
    result = get_config_models(model_name=model_name, platform_name=platform_name)
    if len(result) > 0:
        if multiple:
            return result
        else:
            return list(result.values())[0]
    else:
        raise RuntimeError(
            f"model '{model_name}' not found in MODEL_PLATFORMS, "
            f"please check model_settings.yaml (llm_models/embed_models) "
            f"against MODEL_CHAT_MODEL / MODEL_EMBEDDING_MODEL"
        )


def get_default_llm():
    return Settings.model_settings.DEFAULT_LLM_MODEL


def get_default_embedding():
    return Settings.model_settings.DEFAULT_EMBEDDING_MODEL


def get_history_len() -> int:
    return Settings.model_settings.HISTORY_LEN


def _wrap_params(params: dict, model_info: dict | None, local_wrap: bool):
    """Fill base_url/api_key/proxy based on local_wrap or platform config.

    langchain-openai 1.x removed the openai_api_base/openai_api_key/openai_proxy aliases;
    proxy is passed via the httpx client (same as the get_OpenAIClient precedent).
    """
    if local_wrap:
        params.update(
            base_url=f"{api_address()}/v1",
            api_key="EMPTY",
        )
    else:
        params.update(
            base_url=model_info.get("api_base_url"),
            api_key=model_info.get("api_key"),
        )
        if api_proxy := model_info.get("api_proxy"):
            params["http_client"] = httpx.Client(proxy=api_proxy)
            params["http_async_client"] = httpx.AsyncClient(proxy=api_proxy)


def _get_ChatGemini(
    model_name: str,
    model_info: dict,
    temperature: float,
    max_tokens: Optional[int],
    streaming: bool,
    callbacks: List[BaseCallbackHandler],
    verbose: bool,
) -> BaseChatModel:
    """Gemini platform goes through the native langchain-google-genai SDK.

    OpenAI-compatible endpoints drop thought_signature when replaying tool
    history (always 400 on Gemini 3 series); the native SDK round-trips it
    natively via additional_kwargs. api_base_url is meaningless for the
    native route.
    """
    from langchain_google_genai import ChatGoogleGenerativeAI

    params = dict(
        model=model_name,
        api_key=model_info.get("api_key"),
        temperature=temperature,
        streaming=streaming,
        verbose=verbose,
        callbacks=callbacks,
    )
    if max_tokens is not None:
        params["max_tokens"] = max_tokens
    if api_proxy := model_info.get("api_proxy"):
        params["client_args"] = {"proxy": api_proxy}
    return ChatGoogleGenerativeAI(**params)


def get_ChatOpenAI(
    model_name: Optional[str] = None,
    temperature: float = Settings.model_settings.TEMPERATURE,
    max_tokens: Optional[int] = Settings.model_settings.MAX_TOKENS,
    streaming: bool = True,
    callbacks: List[BaseCallbackHandler] = [],
    verbose: bool = True,
    local_wrap: bool = False,  # use local wrapped api
    **kwargs: Any,
) -> BaseChatModel:
    model_name = model_name or get_default_llm()
    model_info = get_model_info(model_name)
    if model_info.get("platform_type") == "gemini" and not local_wrap:
        try:
            return _get_ChatGemini(
                model_name=model_name,
                model_info=model_info,
                temperature=temperature,
                max_tokens=max_tokens,
                streaming=streaming,
                callbacks=callbacks,
                verbose=verbose,
            )
        except Exception:
            logger.exception(f"failed to create ChatGoogleGenerativeAI for model: {model_name}.")
            return None
    params = dict(
        streaming=streaming,
        verbose=verbose,
        callbacks=callbacks,
        model=model_name,
        temperature=temperature,
        max_tokens=max_tokens,
        **kwargs,
    )
    # remove paramters with None value to avoid openai validation error
    for k in list(params):
        if params[k] is None:
            params.pop(k)

    try:
        _wrap_params(params, model_info, local_wrap)
        model = ChatOpenAI(**params)
    except Exception:
        logger.exception(f"failed to create ChatOpenAI for model: {model_name}.")
        model = None
    return model


def get_OpenAI(
    model_name: str | None,
    temperature: float,
    max_tokens: int | None = Settings.model_settings.MAX_TOKENS,
    streaming: bool = True,
    echo: bool = True,
    callbacks: List[BaseCallbackHandler] = [],
    verbose: bool = True,
    local_wrap: bool = False,  # use local wrapped api
    **kwargs: Any,
) -> OpenAI:
    model_info = get_model_info(model_name)
    params = dict(
        streaming=streaming,
        verbose=verbose,
        callbacks=callbacks,
        model=model_name,
        temperature=temperature,
        max_tokens=max_tokens,
        echo=echo,
        **kwargs,
    )
    try:
        _wrap_params(params, model_info, local_wrap)
        model = OpenAI(**params)
    except Exception:
        logger.exception(f"failed to create OpenAI for model: {model_name}.")
        model = None
    return model


def get_Embeddings(
    embed_model: str = None,
    local_wrap: bool = False,  # use local wrapped api
) -> Embeddings:
    from langchain_openai import OpenAIEmbeddings

    embed_model = embed_model or get_default_embedding()
    model_info = get_model_info(model_name=embed_model)
    params = dict(model=embed_model)
    # ark and other OpenAI-compatible endpoints only accept string input, not pre-tokenized token id arrays
    params["check_embedding_ctx_length"] = False
    # ark endpoints limit the per-request input array size (doubao-embedding-vision caps at 10); default 1000 gets a 400
    params["chunk_size"] = 10
    # ark rate limits are strict; default 2 retries with short backoff always 429 on batch uploads
    params["max_retries"] = 8
    try:
        _wrap_params(params, model_info, local_wrap)
        return OpenAIEmbeddings(**params)
    except Exception:
        logger.exception(f"failed to create Embeddings for model: {embed_model}.")


def check_embed_model(embed_model: str = None) -> Tuple[bool, str]:
    """
    check weather embed_model accessable, use default embed model if None
    """
    embed_model = embed_model or get_default_embedding()
    embeddings = get_Embeddings(embed_model=embed_model)
    try:
        embeddings.embed_query("this is a test")
        return True, ""
    except Exception as e:
        msg = f"failed to access embed model '{embed_model}': {e}"
        logger.error(msg)
        return False, msg


def get_OpenAIClient(
    platform_name: str = None,
    model_name: str = None,
    is_async: bool = True,
) -> Union[openai.Client, openai.AsyncClient]:
    """
    construct an openai Client for specified platform or model
    """
    if platform_name is None:
        platform_info = get_model_info(model_name=model_name, platform_name=platform_name)
        platform_name = platform_info.get("platform_name")
    platform_info = get_config_platforms().get(platform_name)
    assert platform_info, f"cannot find configured platform: {platform_name}"
    params = {
        "base_url": platform_info.get("api_base_url"),
        "api_key": platform_info.get("api_key"),
    }
    httpx_params = {}
    if api_proxy := platform_info.get("api_proxy"):
        # ponytail: httpx>=0.28 removed the proxies param in favor of proxy; no longer force-bind the local NIC
        httpx_params = {"proxy": api_proxy}

    if is_async:
        if httpx_params:
            params["http_client"] = httpx.AsyncClient(**httpx_params)
        return openai.AsyncClient(**params)
    else:
        if httpx_params:
            params["http_client"] = httpx.Client(**httpx_params)
        return openai.Client(**params)


__all__ = [
    "check_embed_model",
    "get_ChatOpenAI",
    "get_config_models",
    "get_config_platforms",
    "get_default_embedding",
    "get_default_llm",
    "get_Embeddings",
    "get_history_len",
    "get_model_info",
    "get_OpenAI",
    "get_OpenAIClient",
]
