"""agent_chat 工具层单测:tools、docs_sink 引用收集、create_agent runner。"""

import asyncio
import json

import pytest
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain_core.messages import AIMessage, AIMessageChunk
from langchain_core.outputs import ChatGenerationChunk

from tomechat.server.chat import agent_chat
from tomechat.server.chat.agent_chat import (
    build_kb_search_tool,
    build_web_search_tool,
    run_agent_invoke,
    run_agent_stream,
    to_langchain_messages,
)


class _FakeToolCallingModel(GenericFakeChatModel):
    """按序返回预置消息;bind_tools 返回自身以便 create_agent 使用。

    显式实现 _astream:GenericFakeChatModel 默认逐字符流式,空 content 的
    tool_calls 消息会产生空流并报 "No generations found in stream"。
    """

    def bind_tools(self, tools, **kwargs):
        return self

    async def _astream(self, messages, stop=None, run_manager=None, **kwargs):
        message = next(self.messages)
        yield ChatGenerationChunk(
            message=AIMessageChunk(
                content=message.content,
                tool_calls=getattr(message, "tool_calls", None) or [],
            )
        )


FAKE_DOCS = [
    {
        "page_content": "知识库内容片段",
        "metadata": {"source": "/kb/xxx/doc.md", "filename": "doc.md"},
    }
]


@pytest.fixture
def fake_kb(monkeypatch):
    calls = {}

    def fake_get_service_by_name(name):
        return object() if name == "kb1" else None

    def fake_search_docs(**kwargs):
        calls.update(kwargs)
        return [dict(d) for d in FAKE_DOCS]

    monkeypatch.setattr(agent_chat.KBServiceFactory, "get_service_by_name", fake_get_service_by_name)
    monkeypatch.setattr(agent_chat, "search_docs", fake_search_docs)
    return calls


def test_kb_search_tool_passes_explicit_params(fake_kb):
    sink = []
    tool = build_kb_search_tool("kb1", sink)
    result = asyncio.run(tool.ainvoke({"query": "工伤保险", "top_k": 2, "score_threshold": 0.3}))
    payload = json.loads(result)
    assert payload["results"][0]["page_content"] == "知识库内容片段"
    # 直接函数调用必须显式传参(Body 默认值不解包),并带上固定 kb_name
    assert fake_kb["query"] == "工伤保险"
    assert fake_kb["knowledge_base_name"] == "kb1"
    assert fake_kb["top_k"] == 2
    assert fake_kb["score_threshold"] == 0.3
    # 引用进入 docs_sink
    assert any("doc.md" in ref for ref in sink)


def test_kb_search_tool_missing_kb(fake_kb):
    sink = []
    tool = build_kb_search_tool("no_such_kb", sink)
    result = asyncio.run(tool.ainvoke({"query": "q"}))
    assert "不存在" in result
    assert sink == []


def test_web_search_tool(monkeypatch):
    from langchain_core.documents import Document

    calls = {}

    def fake_search_engine(query, top_k=0, engine_name="", config=None):
        calls["query"] = query
        calls["top_k"] = top_k
        return {
            "docs": [
                Document(
                    page_content="网页摘要",
                    metadata={"source": "https://example.com", "filename": "标题"},
                )
            ],
            "search_engine": "tavily",
        }

    monkeypatch.setattr(agent_chat, "search_engine", fake_search_engine)
    sink = []
    tool = build_web_search_tool(sink)
    result = asyncio.run(tool.ainvoke({"query": "今天天气"}))
    payload = json.loads(result)
    assert payload["results"][0]["source"] == "https://example.com"
    assert calls["query"] == "今天天气"
    assert any("https://example.com" in ref for ref in sink)


def test_tavily_search_maps_to_documents(monkeypatch):
    from tomechat.server.chat import search_engine as se

    class FakeTavily:
        def __init__(self, max_results=5, topic="general"):
            self.max_results = max_results

        def invoke(self, input):
            return {
                "results": [
                    {"title": "标题", "url": "https://example.com/a", "content": "摘要A"},
                    {"title": "空摘要", "url": "https://example.com/b", "content": " "},
                ]
            }

    monkeypatch.setattr(se, "TavilySearch", FakeTavily)
    out = se.search_engine("q", top_k=5)
    # 空白摘要被 search_engine 过滤,只剩有效结果
    assert [d.page_content for d in out["docs"]] == ["摘要A"]
    assert out["search_engine"] == "tavily"
    assert out["docs"][0].metadata == {
        "source": "https://example.com/a",
        "filename": "标题",
    }


def test_web_search_tool_error_is_caught(monkeypatch):
    def boom(*a, **kw):
        raise RuntimeError("network down")

    monkeypatch.setattr(agent_chat, "search_engine", boom)
    sink = []
    tool = build_web_search_tool(sink)
    result = asyncio.run(tool.ainvoke({"query": "q"}))
    assert "检索失败" in result
    assert sink == []


def test_run_agent_invoke_end_to_end(monkeypatch, fake_kb):
    sink = []

    def fake_get_ChatOpenAI(model_name=None, **kwargs):
        return _FakeToolCallingModel(
            messages=iter(
                [
                    AIMessage(
                        content="",
                        tool_calls=[{"name": "kb_search", "args": {"query": "工伤保险"}, "id": "t1"}],
                    ),
                    AIMessage(content="根据知识库,答案是……"),
                ]
            )
        )

    monkeypatch.setattr(agent_chat, "get_ChatOpenAI", fake_get_ChatOpenAI)
    agent = agent_chat.build_agent(kb_name="kb1", enable_web_search=False, docs_sink=sink)
    messages = to_langchain_messages([{"role": "user", "content": "工伤保险怎么办理?"}])
    answer = asyncio.run(run_agent_invoke(agent, messages, sink))
    assert "根据知识库" in answer
    assert sink  # 引用已收集


def test_run_agent_stream_filters_tool_node(monkeypatch, fake_kb):
    sink = []

    def fake_get_ChatOpenAI(model_name=None, **kwargs):
        return _FakeToolCallingModel(
            messages=iter(
                [
                    AIMessage(
                        content="",
                        tool_calls=[{"name": "kb_search", "args": {"query": "q"}, "id": "t1"}],
                    ),
                    AIMessage(content="最终回答"),
                ]
            )
        )

    monkeypatch.setattr(agent_chat, "get_ChatOpenAI", fake_get_ChatOpenAI)
    agent = agent_chat.build_agent(kb_name="kb1", enable_web_search=False, docs_sink=sink)
    messages = to_langchain_messages([{"role": "user", "content": "q"}])

    async def collect():
        events = []
        async for ev in run_agent_stream(agent, messages, sink):
            events.append(ev)
            if ev[0] == "end":
                break
        return events

    events = asyncio.run(collect())
    kinds = [e[0] for e in events]
    assert "text" in kinds
    assert "end" in kinds
    # ToolMessage(工具结果)不应作为 text 事件下发
    text_payloads = [e[1] for e in events if e[0] == "text"]
    assert all("知识库内容片段" != t for t in text_payloads)
    assert any("最终回答" in t for t in text_payloads)


def test_to_langchain_messages_roles():
    msgs = to_langchain_messages(
        [
            {"role": "system", "content": "sys"},
            {"role": "user", "content": "hi"},
            {"role": "assistant", "content": "hello"},
        ]
    )
    assert type(msgs[0]).__name__ == "SystemMessage"
    assert type(msgs[1]).__name__ == "HumanMessage"
    assert type(msgs[2]).__name__ == "AIMessage"
    # 多模态 list content 降级取文本
    msgs2 = to_langchain_messages(
        [
            {
                "role": "user",
                "content": [{"type": "text", "text": "图"}, {"type": "image_url"}],
            }
        ]
    )
    assert msgs2[0].content == "图"
