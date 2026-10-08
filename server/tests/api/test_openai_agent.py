"""验证 /v1/chat/completions 的 agent 路径(create_agent tool-calling):
1. 带 knowledge_base_name / search_engine 时:工具被调用,回答 + docs 引用
2. KB 参数不暴露给 LLM/不透传
3. 二选一 400;工具失败仍能回答;模型不调工具时正常回答
4. 不带 KB/搜索时走纯透传,行为不变
"""

import asyncio
import json
from contextlib import asynccontextmanager
from types import SimpleNamespace

from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain_core.messages import AIMessage

import tomechat.server.api_server.openai_routes as routes
import tomechat.server.chat.agent_chat as agent_chat
from tomechat.server.schemas import OpenAIChatInput


class _FakeToolCallingModel(GenericFakeChatModel):
    """显式实现 _astream:GenericFakeChatModel 默认逐字符流式,空 content 的
    tool_calls 消息会产生空流(报 "No generations found in stream")。"""

    def bind_tools(self, tools, **kwargs):
        return self

    async def _astream(self, messages, stop=None, run_manager=None, **kwargs):
        from langchain_core.messages import AIMessageChunk
        from langchain_core.outputs import ChatGenerationChunk

        message = next(self.messages)
        yield ChatGenerationChunk(
            message=AIMessageChunk(
                content=message.content,
                tool_calls=getattr(message, "tool_calls", None) or [],
            )
        )


FAKE_DOCS = [
    {
        "page_content": "巴黎是法国的首都。",
        "metadata": {"source": "/kb/xxx/geo.md", "filename": "geo.md"},
    }
]


def _fake_model(messages):
    return _FakeToolCallingModel(messages=iter(messages))


@asynccontextmanager
async def fake_model_client(model_name):
    captured = SimpleNamespace(last_params=None)

    class FakeResult:
        def model_dump(self):
            return {"captured": True}

    class FakeCompletions:
        async def create(self, **params):
            captured.last_params = params
            return FakeResult()

    yield SimpleNamespace(chat=SimpleNamespace(completions=FakeCompletions()))


def _body(**extra) -> OpenAIChatInput:
    payload = {"messages": [{"role": "user", "content": "法国的首都是哪里?"}]}
    payload.update(extra)
    return OpenAIChatInput(**payload)


def _answer(result: dict) -> str:
    return result["choices"][0]["message"]["content"]


def _tool_call_then_answer_model():
    return _fake_model(
        [
            AIMessage(
                content="",
                tool_calls=[{"name": "kb_search", "args": {"query": "法国首都"}, "id": "t1"}],
            ),
            AIMessage(content="根据知识库,巴黎是法国的首都。"),
        ]
    )


def test_kb_agent_mode(monkeypatch):
    calls = {}

    def fake_get_service_by_name(name):
        return object() if name else None

    def fake_search_docs(**kwargs):
        calls.update(kwargs)
        return [dict(d) for d in FAKE_DOCS]

    monkeypatch.setattr(agent_chat.KBServiceFactory, "get_service_by_name", fake_get_service_by_name)
    monkeypatch.setattr(agent_chat, "search_docs", fake_search_docs)
    monkeypatch.setattr(agent_chat, "get_ChatOpenAI", lambda model_name=None, **kw: _tool_call_then_answer_model())
    monkeypatch.setattr(routes, "get_pinned_llm_model", lambda: "fake-model")

    result = asyncio.run(routes.create_chat_completions(_body(knowledge_base_name="测试知识库")))

    # 工具以显式参数被调用,kb_name 由闭包固定
    assert calls["query"] == "法国首都"
    assert calls["knowledge_base_name"] == "测试知识库"
    assert isinstance(calls["top_k"], int)
    # 回答 + 引用挂到响应
    assert "巴黎是法国的首都" in _answer(result)
    assert isinstance(result.get("docs"), list) and len(result["docs"]) == 1
    assert "geo.md" in result["docs"][0]


def test_kb_agent_mode_stream(monkeypatch):
    def fake_search_docs(**kwargs):
        return [dict(d) for d in FAKE_DOCS]

    monkeypatch.setattr(agent_chat.KBServiceFactory, "get_service_by_name", lambda name: object())
    monkeypatch.setattr(agent_chat, "search_docs", fake_search_docs)
    monkeypatch.setattr(agent_chat, "get_ChatOpenAI", lambda model_name=None, **kw: _tool_call_then_answer_model())
    monkeypatch.setattr(routes, "get_pinned_llm_model", lambda: "fake-model")

    async def collect():
        resp = await routes.create_chat_completions(_body(knowledge_base_name="kb1", stream=True))
        return [json.loads(chunk) async for chunk in resp.body_iterator if isinstance(chunk, str)]

    chunks = asyncio.run(collect())

    def _delta(c: dict) -> dict:
        return c.get("choices", [{}])[0].get("delta", {})

    texts = [_delta(c).get("content") or "" for c in chunks if c.get("object") == "chat.completion.chunk"]
    assert any("巴黎是法国的首都" in t for t in texts)
    # 引用挂到 chunk 上
    docs_chunks = [c for c in chunks if c.get("docs")]
    assert docs_chunks and any("geo.md" in d for d in docs_chunks[-1]["docs"])
    # 结束包带 finish_reason
    assert any(c.get("choices", [{}])[0].get("delta", {}).get("finish_reason") == "stop" for c in chunks)


def test_search_engine_agent_mode(monkeypatch):
    from langchain_core.documents import Document

    def fake_search_engine(query, top_k=0, engine_name="", config=None):
        return {
            "docs": [
                Document(
                    page_content="搜索结果:巴黎是法国的首都。",
                    metadata={"source": "http://example.com/paris", "filename": "巴黎"},
                )
            ],
            "search_engine": "tavily",
        }

    monkeypatch.setattr(agent_chat, "search_engine", fake_search_engine)
    monkeypatch.setattr(
        agent_chat,
        "get_ChatOpenAI",
        lambda model_name=None, **kw: _fake_model(
            [
                AIMessage(
                    content="",
                    tool_calls=[{"name": "web_search", "args": {"query": "法国首都"}, "id": "t1"}],
                ),
                AIMessage(content="巴黎是法国的首都。"),
            ]
        ),
    )
    monkeypatch.setattr(routes, "get_pinned_llm_model", lambda: "fake-model")

    result = asyncio.run(routes.create_chat_completions(_body(search_engine=True)))
    assert "巴黎" in _answer(result)
    assert result.get("docs") and "http://example.com/paris" in result["docs"][0]


def test_kb_and_search_mutually_exclusive(monkeypatch):
    import pytest
    from fastapi import HTTPException

    monkeypatch.setattr(routes, "get_pinned_llm_model", lambda: "fake-model")

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(routes.create_chat_completions(_body(knowledge_base_name="kb", search_engine=True)))
    assert exc_info.value.status_code == 400


def test_search_failure_still_answers(monkeypatch):
    def boom(*a, **kw):
        raise RuntimeError("network down")

    monkeypatch.setattr(agent_chat, "search_engine", boom)
    monkeypatch.setattr(
        agent_chat,
        "get_ChatOpenAI",
        lambda model_name=None, **kw: _fake_model(
            [
                AIMessage(
                    content="",
                    tool_calls=[{"name": "web_search", "args": {"query": "q"}, "id": "t1"}],
                ),
                AIMessage(content="我无法检索,抱歉。"),
            ]
        ),
    )
    monkeypatch.setattr(routes, "get_pinned_llm_model", lambda: "fake-model")

    result = asyncio.run(routes.create_chat_completions(_body(search_engine=True)))
    assert "无法检索" in _answer(result)
    assert result.get("docs") == []


def test_model_skips_tool_still_answers(monkeypatch):
    """弱模型不调工具 → 静默降级为直接回答,无 docs(行为被测试钉死)。"""
    monkeypatch.setattr(agent_chat.KBServiceFactory, "get_service_by_name", lambda name: object())
    monkeypatch.setattr(
        agent_chat, "get_ChatOpenAI", lambda model_name=None, **kw: _fake_model([AIMessage(content="直接回答")])
    )
    monkeypatch.setattr(routes, "get_pinned_llm_model", lambda: "fake-model")

    result = asyncio.run(routes.create_chat_completions(_body(knowledge_base_name="kb1")))
    assert _answer(result) == "直接回答"
    assert result.get("docs") == []


def test_no_kb_passthrough_untouched(monkeypatch):
    monkeypatch.setattr(routes, "get_pinned_llm_model", lambda: "fake-model")
    monkeypatch.setattr(routes, "get_model_client", fake_model_client)

    result = asyncio.run(routes.create_chat_completions(_body()))
    assert result == {"captured": True}


def test_model_client_error_propagates(monkeypatch):
    """客户端工厂抛错时应向上传播原始异常,而非被吞成
    RuntimeError: generator didn't yield(回归:缺 api_key 场景)。"""
    monkeypatch.setattr(routes, "get_model_info", lambda model_name, multiple=True: {"m": {"platform_name": "p"}})
    monkeypatch.setattr(
        routes,
        "get_OpenAIClient",
        lambda platform_name, is_async=True: (_ for _ in ()).throw(RuntimeError("Missing credentials")),
    )

    async def call():
        async with routes.get_model_client("fake-model") as client:
            return client

    try:
        asyncio.run(call())
        raised = None
    except RuntimeError as e:
        raised = e
    assert raised is not None and "Missing credentials" in str(raised)
