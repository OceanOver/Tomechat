"""Env-driven LLM / embedding platform construction in ApiModelSettings.model_post_init."""

import pytest

from tomechat.settings import ApiModelSettings

MODEL_ENV_VARS = [
    "MODEL_CHAT_MODEL",
    "MODEL_EMBEDDING_MODEL",
    "MODEL_API_BASE",
    "MODEL_API_KEY",
    "MODEL_API_PROXY",
    "MODEL_PLATFORM_TYPE",
    "MODEL_EMBEDDING_API_BASE",
    "MODEL_EMBEDDING_API_KEY",
    "MODEL_EMBEDDING_API_PROXY",
]


@pytest.fixture
def clean_env(monkeypatch, tmp_path):
    """Clear MODEL_* env vars and point the yaml source at an empty path so
    ApiModelSettings() is built deterministically from defaults."""
    for var in MODEL_ENV_VARS:
        monkeypatch.delenv(var, raising=False)
    monkeypatch.setattr(
        ApiModelSettings,
        "model_config",
        {**ApiModelSettings.model_config, "yaml_file": str(tmp_path / "model_settings.yaml")},
    )
    return monkeypatch


@pytest.mark.usefixtures("clean_env")
def test_no_env_vars_falls_back_to_single_default_platform():
    settings = ApiModelSettings()

    assert len(settings.MODEL_PLATFORMS) == 1
    platform = settings.MODEL_PLATFORMS[0]
    assert platform.platform_type == "openai"
    assert platform.llm_models == [settings.DEFAULT_LLM_MODEL]
    assert platform.embed_models == [settings.DEFAULT_EMBEDDING_MODEL]


def test_same_llm_and_embedding_config_merges_into_single_platform(clean_env):
    clean_env.setenv("MODEL_API_BASE", "https://api.example.com/v1")
    clean_env.setenv("MODEL_API_KEY", "key")
    clean_env.setenv("MODEL_EMBEDDING_API_BASE", "https://api.example.com/v1")
    clean_env.setenv("MODEL_EMBEDDING_API_KEY", "key")

    settings = ApiModelSettings()

    assert len(settings.MODEL_PLATFORMS) == 1
    platform = settings.MODEL_PLATFORMS[0]
    assert platform.api_base_url == "https://api.example.com/v1"
    assert platform.llm_models == [settings.DEFAULT_LLM_MODEL]
    assert platform.embed_models == [settings.DEFAULT_EMBEDDING_MODEL]


def test_embedding_only_fallback_merges_into_single_platform(clean_env):
    clean_env.setenv("MODEL_API_BASE", "https://api.example.com/v1")
    clean_env.setenv("MODEL_API_KEY", "key")
    # No MODEL_EMBEDDING_API_*: embedding config falls back to the LLM service
    clean_env.setenv("MODEL_EMBEDDING_API_BASE", "https://api.example.com/v1")

    settings = ApiModelSettings()

    assert len(settings.MODEL_PLATFORMS) == 1
    assert settings.MODEL_PLATFORMS[0].embed_models == [settings.DEFAULT_EMBEDDING_MODEL]


def test_different_embed_endpoint_splits_into_separate_platform(clean_env):
    clean_env.setenv("MODEL_CHAT_MODEL", "chat-model")
    clean_env.setenv("MODEL_API_BASE", "https://llm.example.com/v1")
    clean_env.setenv("MODEL_API_KEY", "llm-key")
    clean_env.setenv("MODEL_EMBEDDING_MODEL", "embed-model")
    clean_env.setenv("MODEL_EMBEDDING_API_BASE", "https://embed.example.com/v1")
    clean_env.setenv("MODEL_EMBEDDING_API_KEY", "embed-key")

    settings = ApiModelSettings()

    assert len(settings.MODEL_PLATFORMS) == 2
    llm, embed = settings.MODEL_PLATFORMS
    assert llm.platform_name == "llm"
    assert llm.api_base_url == "https://llm.example.com/v1"
    assert llm.api_key == "llm-key"
    assert llm.llm_models == ["chat-model"]
    assert llm.embed_models == []
    assert embed.platform_name == "embedding"
    assert embed.platform_type == "openai"
    assert embed.api_base_url == "https://embed.example.com/v1"
    assert embed.api_key == "embed-key"
    assert embed.embed_models == ["embed-model"]


def test_gemini_llm_keeps_embedding_on_openai_compatible_platform(clean_env):
    clean_env.setenv("MODEL_PLATFORM_TYPE", "gemini")
    clean_env.setenv("MODEL_API_BASE", "https://generativelanguage.googleapis.com/v1beta/openai/")
    clean_env.setenv("MODEL_API_KEY", "key")

    settings = ApiModelSettings()

    assert len(settings.MODEL_PLATFORMS) == 2
    llm, embed = settings.MODEL_PLATFORMS
    assert llm.platform_type == "gemini"
    assert llm.llm_models == [settings.DEFAULT_LLM_MODEL]
    # Embedding always goes through the OpenAI-compatible route
    assert embed.platform_name == "embedding"
    assert embed.platform_type == "openai"
    # Unset embedding fields fall back to the LLM service config
    assert embed.api_base_url == llm.api_base_url
    assert embed.api_key == llm.api_key


def test_invalid_platform_type_falls_back_to_openai(clean_env):
    clean_env.setenv("MODEL_PLATFORM_TYPE", "bogus")

    settings = ApiModelSettings()

    assert settings.MODEL_PLATFORMS[0].platform_type == "openai"
