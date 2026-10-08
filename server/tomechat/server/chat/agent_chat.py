"""基于 langchain 1.x create_agent 的 tool-calling 对话。

/v1/chat/completions 在请求带 knowledge_base_name 或 search_engine 时走此模块:
KB 检索 / 联网搜索作为 tools,由 LLM 自主决定调用;检索引用经 docs_sink(闭包 list)
收集,挂到响应 chunk 的 docs 字段(与前端既有协议一致)。
"""

from __future__ import annotations

import asyncio
import json
import uuid
from collections.abc import AsyncGenerator
from typing import Any

from fastapi.concurrency import run_in_threadpool
from langchain.agents import create_agent
from langchain_core.messages import (
    AIMessage,
    AIMessageChunk,
    BaseMessage,
    HumanMessage,
    SystemMessage,
)
from langchain_core.tools import tool
from sse_starlette.sse import EventSourceResponse

from tomechat.server.chat.search_engine import search_engine
from tomechat.server.knowledge_base.doc_service import search_docs
from tomechat.server.knowledge_base.kb_service.base import KBServiceFactory
from tomechat.server.knowledge_base.utils import format_reference
from tomechat.server.model_factory import get_ChatOpenAI, get_default_llm
from tomechat.server.schemas import OpenAIChatInput, OpenAIChatOutput
from tomechat.server.utils import (
    api_address,
    build_logger,
)
from tomechat.settings import Settings

logger = build_logger()

AGENT_SYSTEM_PROMPT = (
    "你是一个可以检索本地知识库和联网搜索的助手。"
    "回答问题前,先调用提供的检索工具获取相关信息,再基于检索结果回答。"
    "如果检索结果与问题无关,可以按你自己的知识回答。"
)


def _extract_text(content: str | list) -> str:
    """消息 content 兼容纯文本与多模态 list 两种形态。"""
    if isinstance(content, str):
        return content
    return "".join(part.get("text", "") for part in content if isinstance(part, dict))


def build_kb_search_tool(kb_name: str, docs_sink: list):
    @tool
    async def kb_search(
        query: str,
        top_k: int = Settings.kb_settings.VECTOR_SEARCH_TOP_K,
        score_threshold: float = Settings.kb_settings.SCORE_THRESHOLD,
    ) -> str:
        """检索本地知识库,返回与 query 最相关的文档片段(JSON)。回答需要知识库内容支撑的问题时调用。"""
        logger.info(f"kb_search invoked: kb={kb_name!r}, query={query!r}, top_k={top_k}")
        kb = KBServiceFactory.get_service_by_name(kb_name)
        if kb is None:
            return f"知识库 {kb_name} 不存在"
        try:
            # 直接函数调用不会解包 Body() 默认值,必须显式传参(同 openai_routes 先例)
            docs = await run_in_threadpool(
                search_docs,
                query=query,
                knowledge_base_name=kb_name,
                top_k=top_k,
                score_threshold=score_threshold,
                file_name="",
                metadata={},
            )
            docs_sink.extend(format_reference(kb_name, docs, api_address(is_public=True), doc_source="kb"))
            return json.dumps(
                {
                    "results": [
                        {
                            "page_content": d.get("page_content", ""),
                            "source": d.get("metadata", {}).get("source", ""),
                            "filename": d.get("metadata", {}).get("filename", ""),
                        }
                        for d in docs
                    ]
                },
                ensure_ascii=False,
            )
        except Exception as e:
            logger.warning(f"knowledge base {kb_name!r} search failed: {e}")
            return f"检索失败: {e}"
        logger.info(f"kb_search done: kb={kb_name!r}, query={query!r}, hits={len(docs)}")

    return kb_search


def build_web_search_tool(docs_sink: list):
    @tool
    async def web_search(
        query: str,
        top_k: int = Settings.kb_settings.SEARCH_ENGINE_TOP_K,
    ) -> str:
        """联网搜索,返回与 query 最相关的网页摘要(JSON)。需要最新信息或知识库之外的信息时调用。"""
        logger.info(f"web_search invoked: query={query!r}, top_k={top_k}")
        try:
            result = await run_in_threadpool(search_engine, query, top_k)
            docs = result.get("docs", [])
            logger.info(f"web_search done: query={query!r}, engine={result.get('search_engine', '')}, hits={len(docs)}")
            docs_sink.extend(
                format_reference(
                    result.get("search_engine", ""),
                    [{"page_content": d.page_content, "metadata": d.metadata} for d in docs],
                    api_address(is_public=True),
                    doc_source="se",
                )
            )
            return json.dumps(
                {
                    "results": [
                        {
                            "page_content": d.page_content,
                            "source": d.metadata.get("source", ""),
                            "filename": d.metadata.get("filename", ""),
                        }
                        for d in docs
                    ]
                },
                ensure_ascii=False,
            )
        except Exception as e:
            logger.warning(f"search engine failed: {e}")
            return f"检索失败: {e}"

    return web_search


def build_agent(kb_name: str | None, enable_web_search: bool, docs_sink: list):
    """构建带检索工具的 agent。docs_sink 为 per-request 引用收集器,由调用方持有。"""
    tools = []
    if kb_name:
        tools.append(build_kb_search_tool(kb_name, docs_sink))
    if enable_web_search:
        tools.append(build_web_search_tool(docs_sink))
    model = get_ChatOpenAI(model_name=get_default_llm())
    assert model is not None, "failed to create ChatOpenAI for agent"
    return create_agent(model=model, tools=tools, system_prompt=AGENT_SYSTEM_PROMPT)


def to_langchain_messages(messages) -> list[BaseMessage]:
    """OpenAIChatMessageInput 列表(或 dict) -> langchain 消息列表(全部历史一并传入,token 裁剪由前端负责)。"""
    out: list[BaseMessage] = []
    for m in messages:
        role = m["role"] if isinstance(m, dict) else m.role
        content = _extract_text(m["content"] if isinstance(m, dict) else m.content)
        if role == "system":
            out.append(SystemMessage(content=content))
        elif role == "assistant":
            out.append(AIMessage(content=content))
        else:
            out.append(HumanMessage(content=content))
    return out


async def run_agent_stream(
    agent, messages: list[BaseMessage], docs_sink: list
) -> AsyncGenerator[tuple[str, Any], None]:
    """流式运行 agent,产出归一化事件:
    ("text", str)  模型增量文本(已过滤 tool 节点回显)
    ("tool_call", dict)  工具调用增量
    ("end", docs)  结束,携带引用列表
    """
    async for msg, meta in agent.astream({"messages": messages}, stream_mode="messages"):
        if meta.get("langgraph_node") != "model" or not isinstance(msg, AIMessageChunk):
            continue
        for tc in msg.tool_call_chunks or []:
            yield (
                "tool_call",
                {"name": tc.get("name"), "args": tc.get("args"), "id": tc.get("id")},
            )
        text = _extract_text(msg.content)
        if text:
            yield ("text", text)
    yield ("end", docs_sink)


async def run_agent_invoke(agent, messages: list[BaseMessage], docs_sink: list) -> str:
    """非流式运行 agent,返回最终回答文本。"""
    result = await agent.ainvoke({"messages": messages})
    for m in reversed(result.get("messages", [])):
        if isinstance(m, AIMessage) and not m.tool_calls:
            return _extract_text(m.content)
    return ""


def _format_tool_calls(tool_calls: list[dict]) -> list[dict]:
    """langchain tool_call_chunks -> OpenAI delta.tool_calls 格式。"""
    formatted = []
    for tc in tool_calls:
        formatted.append(
            {
                "index": tc.get("index") or 0,
                "id": tc.get("id"),
                "type": "function",
                "function": {"name": tc.get("name") or "", "arguments": tc.get("args") or ""},
            }
        )
    return formatted


async def agent_chat_response(body: OpenAIChatInput):
    """KB/联网搜索请求的 agent 路径(替代原 system 消息注入)。

    ponytail: agent 路径暂不走 openai_routes.get_model_client 信号量
    (它只管 openai.AsyncClient 调度),高并发场景再抽公共信号量。
    """
    docs_sink: list = []
    agent = build_agent(body.knowledge_base_name, bool(body.search_engine), docs_sink)
    messages = to_langchain_messages(body.messages)

    if body.stream:

        async def generator():
            try:
                async for kind, payload in run_agent_stream(agent, messages, docs_sink):
                    if kind == "text":
                        chunk = OpenAIChatOutput(
                            id=f"chat{uuid.uuid4()}",
                            object="chat.completion.chunk",
                            content=payload,
                            model=body.model,
                            docs=docs_sink,
                        )
                        yield chunk.model_dump_json()
                    elif kind == "tool_call":
                        # OpenAI SDK 客户端会忽略 delta.tool_calls;前端可展示"检索中"
                        chunk = OpenAIChatOutput(
                            id=f"chat{uuid.uuid4()}",
                            object="chat.completion.chunk",
                            content="",
                            model=body.model,
                            docs=docs_sink,
                        )
                        chunk.tool_calls = _format_tool_calls([payload])
                        yield chunk.model_dump_json()
                    else:  # end
                        chunk = OpenAIChatOutput(
                            id=f"chat{uuid.uuid4()}",
                            object="chat.completion.chunk",
                            content="",
                            model=body.model,
                            finish_reason="stop",
                            docs=docs_sink,
                        )
                        yield chunk.model_dump_json()
            except asyncio.exceptions.CancelledError:
                logger.warning("streaming progress has been interrupted by user.")
                return
            except Exception as e:
                logger.error(f"agent chat error: {e}")
                yield {"data": json.dumps({"error": str(e)})}

        return EventSourceResponse(generator())

    answer = await run_agent_invoke(agent, messages, docs_sink)
    result = OpenAIChatOutput(
        id=f"chat{uuid.uuid4()}",
        object="chat.completion",
        content=answer,
        model=body.model,
        finish_reason="stop",
        docs=docs_sink,
    )
    return result.model_dump()
