from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncGenerator, Iterable, Mapping
from contextlib import asynccontextmanager
from typing import cast

from fastapi import APIRouter, HTTPException
from openai import AsyncClient
from sse_starlette.sse import EventSourceResponse

from tomechat.server.model_factory import (
    get_default_llm,
    get_model_info,
    get_OpenAIClient,
)
from tomechat.server.schemas import OpenAIChatInput, OpenAIChatOutput
from tomechat.settings import Settings
from tomechat.utils import build_logger

logger = build_logger()


DEFAULT_API_CONCURRENCIES = 5  # 默认单个模型最大并发数

model_semaphores: dict[tuple[str, str], asyncio.Semaphore] = {}  # key: (model_name, platform)
openai_router = APIRouter(prefix="/v1", tags=["OpenAI 兼容平台整合接口"])


def get_pinned_llm_model() -> str:
    """固定使用 MODEL_CHAT_MODEL 指定的模型，不支持切换。"""
    return get_default_llm()


@asynccontextmanager
async def get_model_client(model_name: str) -> AsyncGenerator[AsyncClient]:
    """
    对重名模型进行调度，依次选择：空闲的模型 -> 当前访问数最少的模型
    """
    max_semaphore = 0
    selected_key: tuple[str, str] | None = None
    model_infos = get_model_info(model_name=model_name, multiple=True)

    for m, c in model_infos.items():
        key = (m, c["platform_name"])
        api_concurrencies = c.get("api_concurrencies", DEFAULT_API_CONCURRENCIES)
        if key not in model_semaphores:
            model_semaphores[key] = asyncio.Semaphore(api_concurrencies)
        semaphore = model_semaphores[key]
        if semaphore._value >= api_concurrencies:
            selected_key = key
            break
        elif semaphore._value > max_semaphore:
            selected_key = key

    assert selected_key is not None
    key = selected_key
    semaphore = model_semaphores[key]
    try:
        await semaphore.acquire()
        yield cast(AsyncClient, get_OpenAIClient(platform_name=key[1], is_async=True))
    except Exception:
        logger.exception(f"failed when request to {key}")
        raise
    finally:
        semaphore.release()


async def openai_request(
    method,
    body,
    extra_json: Mapping | None = None,
    header: Iterable = (),
    tail: Iterable = (),
    drop: Iterable[str] = (),
):
    """
    helper function to make openai request with extra fields
    """
    extra_json = extra_json or {}

    async def generator():
        try:
            for x in header:
                if isinstance(x, str):
                    chunk = OpenAIChatOutput(content=x, object="chat.completion.chunk")
                elif isinstance(x, dict):
                    chunk = OpenAIChatOutput.model_validate(x)
                else:
                    raise RuntimeError(f"unsupported value: {header}")
                for k, v in extra_json.items():
                    setattr(chunk, k, v)
                yield chunk.model_dump_json()

            async for resp in await method(**params):
                for k, v in extra_json.items():
                    setattr(resp, k, v)
                yield resp.model_dump_json()

            for x in tail:
                if isinstance(x, str):
                    chunk = OpenAIChatOutput(content=x, object="chat.completion.chunk")
                elif isinstance(x, dict):
                    chunk = OpenAIChatOutput.model_validate(x)
                else:
                    raise RuntimeError(f"unsupported value: {tail}")
                for k, v in extra_json.items():
                    setattr(chunk, k, v)
                yield chunk.model_dump_json()
        except asyncio.exceptions.CancelledError:
            logger.warning("streaming progress has been interrupted by user.")
            return
        except Exception as e:
            logger.error(f"openai request error: {e}")
            yield {"data": json.dumps({"error": str(e)})}

    params = {k: v for k, v in body.model_dump(exclude_unset=True).items() if k not in set(drop)}
    if params.get("max_tokens") == 0:
        params["max_tokens"] = Settings.model_settings.MAX_TOKENS

    if hasattr(body, "stream") and body.stream:
        return EventSourceResponse(generator())
    else:
        result = await method(**params)
        for k, v in extra_json.items():
            setattr(result, k, v)
        return result.model_dump()


@openai_router.get("/models")
async def list_models() -> dict:
    """
    返回固定的模型列表（仅 MODEL_CHAT_MODEL 指定的模型）。
    """
    model_name = get_pinned_llm_model()
    infos = get_model_info(model_name=model_name, multiple=True)
    data = [
        {
            "id": name,
            "object": "model",
            "owned_by": c["platform_name"],
            "platform_name": c["platform_name"],
        }
        for name, c in infos.items()
    ]
    return {"object": "list", "data": data}


# Gemini 的 OpenAI 兼容端点不接受这些字段，收到即 400
GEMINI_UNSUPPORTED_PARAMS = ("frequency_penalty", "presence_penalty")


def platform_drop_params(model_name: str) -> tuple[str, ...]:
    try:
        info = get_model_info(model_name=model_name)
    except RuntimeError:
        return ()
    base_url = info.get("api_base_url", "")
    # 平台名可任意命名（默认 "openai-compatible"），Gemini 的可靠特征是 endpoint URL
    if "gemini" in info.get("platform_name", "").lower() or "generativelanguage" in base_url:
        return GEMINI_UNSUPPORTED_PARAMS
    return ()


@openai_router.post("/chat/completions")
async def create_chat_completions(
    body: OpenAIChatInput,
):
    body.model = get_pinned_llm_model()

    if body.knowledge_base_name and body.search_engine:
        raise HTTPException(
            status_code=400,
            detail="knowledge_base_name 与 search_engine 只能二选一",
        )

    if body.knowledge_base_name or body.search_engine:
        # agent 路径:局部导入,保证纯透传路径零 langchain 开销
        from tomechat.server.chat.agent_chat import agent_chat_response  # noqa: PLC0415

        return await agent_chat_response(body)

    async with get_model_client(body.model) as client:
        result = await openai_request(
            client.chat.completions.create,
            body,
            drop=platform_drop_params(body.model),
        )
        return result
