"""model_factory 平台路由单测:openai 兼容与 gemini 原生 SDK 双路线。"""

from langchain_openai import ChatOpenAI

from tomechat.server import model_factory as mf


def _fake_info(info: dict):
    return lambda model_name=None, **kw: {
        "platform_name": "p",
        "platform_type": info.get("platform_type", "openai"),
        "model_name": model_name,
        "api_base_url": info.get("api_base_url"),
        "api_key": info.get("api_key", ""),
        "api_proxy": info.get("api_proxy", ""),
    }


def test_gemini_platform_returns_google_genai(monkeypatch):
    from langchain_google_genai import ChatGoogleGenerativeAI

    monkeypatch.setattr(
        mf,
        "get_model_info",
        _fake_info({"platform_type": "gemini", "api_key": "fake-key"}),
    )
    model = mf.get_ChatOpenAI(model_name="gemini-3.8-flash")
    assert isinstance(model, ChatGoogleGenerativeAI)
    assert model.model == "gemini-3.8-flash"


def test_default_platform_returns_chat_openai(monkeypatch):
    monkeypatch.setattr(
        mf,
        "get_model_info",
        _fake_info({"api_base_url": "https://example.com/v1", "api_key": "k"}),
    )
    model = mf.get_ChatOpenAI(model_name="some-model")
    assert isinstance(model, ChatOpenAI)
    assert model.openai_api_base == "https://example.com/v1"


def test_gemini_local_wrap_stays_chat_openai(monkeypatch):
    """local_wrap 是本服务自身的 OpenAI 兼容端点,不走原生 SDK。"""
    monkeypatch.setattr(
        mf,
        "get_model_info",
        _fake_info({"platform_type": "gemini", "api_key": "k"}),
    )
    model = mf.get_ChatOpenAI(model_name="gemini-3.8-flash", local_wrap=True)
    assert isinstance(model, ChatOpenAI)
