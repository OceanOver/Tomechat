from pathlib import Path

SERVER_ROOT = Path(__file__).parents[2]


def _gone(*parts: str) -> bool:
    return not (SERVER_ROOT / Path(*parts)).exists()


def test_dead_chat_modules_are_removed():
    assert _gone("tomechat", "server", "api_server", "chat_routes.py")
    assert _gone("tomechat", "server", "api_server", "server_routes.py")
    assert _gone("tomechat", "server", "chat", "kb_chat.py")
    assert _gone("tomechat", "server", "chat", "feedback.py")
    assert _gone("tomechat", "server", "chat", "file_chat.py")
    assert _gone("tomechat", "server", "chat", "utils.py")


def test_dead_kb_chat_test_is_removed():
    assert _gone("tests", "api", "test_kb_chat.py")


def test_kb_summary_subsystem_is_removed():
    assert _gone("tomechat", "server", "knowledge_base", "kb_summary_api.py")
    assert _gone("tomechat", "server", "knowledge_base", "kb_summary")
    assert _gone("tests", "api", "test_kb_summary_api.py")


def test_schemas_live_outside_api_server():
    from tomechat.server.schemas import (  # noqa: F401
        BaseResponse,
        ChatMessage,
        ListResponse,
        MsgType,
        OpenAIChatInput,
        OpenAIChatOutput,
    )

    assert _gone("tomechat", "server", "api_server", "api_schemas.py")
    assert _gone("tomechat", "server", "pydantic_models.py")
