import asyncio
from pathlib import Path

import httpx

from tomechat.settings import Settings

SERVER_ROOT = Path(__file__).parents[2]
REPO_ROOT = SERVER_ROOT.parents[1]
FRONTEND_ROOT = REPO_ROOT / "frontend"


def _create_app():
    Settings.basic_settings.make_dirs()
    from tomechat.server.api_server.server_app import create_app

    return create_app()


def _api_paths() -> set[str]:
    return {route.path for route in _create_app().routes}


def test_agent_tool_and_graph_routes_are_not_registered():
    paths = _api_paths()

    assert not any(path == "/tools" or path.startswith("/tools/") for path in paths)
    assert not any(path == "/graphs" or path.startswith("/graphs/") for path in paths)
    assert not any(path == "/agent" or path.startswith("/agent/") for path in paths)


def test_live_chat_and_knowledge_base_routes_remain_registered():
    paths = _api_paths()

    # 前端唯一对话入口是 OpenAI 兼容的 /v1，旧的 /chat/* 已整体移除
    assert "/v1/chat/completions" in paths
    assert not any(path.startswith("/chat") for path in paths)
    assert "/knowledge_base/list_knowledge_bases" in paths


def test_removed_routes_return_404():
    async def request_removed_routes() -> list[int]:
        transport = httpx.ASGITransport(app=_create_app())
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            responses = [
                await client.get("/tools"),
                await client.post("/tools/call", json={}),
                await client.get("/graphs"),
                await client.get("/graphs/graph_enabled"),
            ]
        return [response.status_code for response in responses]

    assert asyncio.run(request_removed_routes()) == [404, 404, 404, 404]


def test_agent_tool_and_graph_backend_implementation_is_removed():
    removed_paths = [
        SERVER_ROOT / "tomechat/server/agent",
        SERVER_ROOT / "tomechat/server/api_server/tool_routes.py",
        SERVER_ROOT / "tomechat/server/api_server/graph_routes.py",
        SERVER_ROOT / "tomechat/server/chat/chat.py",
        SERVER_ROOT / "tomechat/server/chat/graph_chat.py",
        SERVER_ROOT / "tomechat/server/callback_handler/agent_callback_handler.py",
        SERVER_ROOT / "graph_search_local_knowledgebase.py",
        SERVER_ROOT / "tests/api/test_tools.py",
        SERVER_ROOT / "tests/test_qwen_agent.py",
    ]

    assert [str(path.relative_to(REPO_ROOT)) for path in removed_paths if path.exists()] == []


def test_agent_only_backend_dependencies_are_removed():
    pyproject = (SERVER_ROOT / "pyproject.toml").read_text()
    removed_dependencies = [
        "langgraph",
        "langgraph-checkpoint",
        "langgraph-checkpoint-sqlite",
        "langgraph-checkpoint-postgres",
        "langchainhub",
        "langchain-experimental",
        "youtube-search",
        'arxiv = "',
    ]

    assert [dependency for dependency in removed_dependencies if dependency in pyproject] == []


def test_history_length_uses_the_current_model_settings(monkeypatch):
    from tomechat.server.model_factory import get_history_len

    monkeypatch.setattr(Settings.model_settings, "HISTORY_LEN", 0)

    assert get_history_len() == 0


def test_legacy_chat_client_interface_is_removed():
    assert not (SERVER_ROOT / "tomechat/server/api_client.py").exists()
    # 旧 /chat/* 路由文件已整体删除
    assert not (SERVER_ROOT / "tomechat/server/api_server/chat_routes.py").exists()


def test_openai_chat_transport_has_no_function_or_tool_fields():
    from tomechat.server.schemas import (
        OpenAIChatInput,
        OpenAIChatOutput,
    )

    assert {"function_call", "functions"}.isdisjoint(OpenAIChatInput.model_fields)
    # 输入侧不接受客户端自定义工具;输出侧 tool_calls 仅经 extra 属性挂载(agent 路径)
    assert "tool_calls" not in OpenAIChatOutput.model_fields

    chunk = OpenAIChatOutput(object="chat.completion.chunk", content="")
    assert "tool_calls" not in chunk.model_dump()["choices"][0]["delta"]

    chunk.tool_calls = [
        {
            "index": 0,
            "id": "t1",
            "type": "function",
            "function": {"name": "kb_search", "arguments": ""},
        }
    ]
    delta = chunk.model_dump()["choices"][0]["delta"]
    assert delta["tool_calls"][0]["function"]["name"] == "kb_search"


def test_frontend_agent_plugin_tool_and_market_entrypoints_are_removed():
    removed_paths = [
        FRONTEND_ROOT / "src/app/market",
        FRONTEND_ROOT / "src/app/api/market",
        FRONTEND_ROOT / "src/app/api/plugin",
        FRONTEND_ROOT / "src/app/settings/agent",
        FRONTEND_ROOT / "src/features/PluginStore",
        FRONTEND_ROOT / "src/features/PluginSettings",
        FRONTEND_ROOT / "src/features/PluginDevModal",
        FRONTEND_ROOT / "src/features/PluginDetailModal",
        FRONTEND_ROOT / "src/features/ChatInput/ActionBar/Tools",
        FRONTEND_ROOT / "src/store/market",
        FRONTEND_ROOT / "src/store/tool",
        FRONTEND_ROOT / "src/services/market.ts",
        FRONTEND_ROOT / "src/services/plugin.ts",
        FRONTEND_ROOT / "src/types/market.ts",
        FRONTEND_ROOT / "src/types/tool",
    ]

    assert [str(path.relative_to(REPO_ROOT)) for path in removed_paths if path.exists()] == []


def test_frontend_agent_plugin_and_market_configuration_is_removed():
    package_json = (FRONTEND_ROOT / "package.json").read_text()
    env_example = (FRONTEND_ROOT / ".env.example").read_text()
    server_config = (FRONTEND_ROOT / "src/config/server/app.ts").read_text()
    top_actions = (FRONTEND_ROOT / "src/features/SideBar/TopActions.tsx").read_text()

    for dependency in [
        "@cfworker/json-schema",
        "@lobehub/chat-plugin-sdk",
        "@lobehub/chat-plugins-gateway",
        "systemjs",
    ]:
        assert dependency not in package_json
    for config_name in [
        "AGENTS_INDEX_URL",
        "PLUGINS_INDEX_URL",
        "PLUGIN_SETTINGS",
        "DEFAULT_AGENT_CONFIG",
    ]:
        assert config_name not in env_example
        assert config_name not in server_config
    assert "/market" not in top_actions
