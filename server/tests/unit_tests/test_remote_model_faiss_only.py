from pathlib import Path

from tomechat.server.knowledge_base.kb_service.base import SupportedVSType

SERVER_ROOT = Path(__file__).parents[2]
REPOSITORY_ROOT = SERVER_ROOT.parent


def test_only_openai_compatible_chat_and_embedding_are_configured(monkeypatch, tmp_path):
    # Build from defaults (no MODEL_* env, no yaml) so the assertion is deterministic
    # regardless of the developer's local .env
    from tomechat.settings import ApiModelSettings

    for var in [
        "MODEL_CHAT_MODEL",
        "MODEL_EMBEDDING_MODEL",
        "MODEL_API_BASE",
        "MODEL_API_KEY",
        "MODEL_API_PROXY",
        "MODEL_PLATFORM_TYPE",
        "MODEL_EMBEDDING_API_BASE",
        "MODEL_EMBEDDING_API_KEY",
        "MODEL_EMBEDDING_API_PROXY",
    ]:
        monkeypatch.delenv(var, raising=False)
    monkeypatch.setattr(
        ApiModelSettings,
        "model_config",
        {**ApiModelSettings.model_config, "yaml_file": str(tmp_path / "model_settings.yaml")},
    )

    platforms = ApiModelSettings().MODEL_PLATFORMS

    assert len(platforms) == 1
    assert platforms[0].platform_type == "openai"
    assert platforms[0].auto_detect_model is False
    assert platforms[0].llm_models
    assert platforms[0].embed_models
    assert set(platforms[0].model_dump()) == {
        "platform_name",
        "platform_type",
        "api_base_url",
        "api_key",
        "api_proxy",
        "api_concurrencies",
        "auto_detect_model",
        "llm_models",
        "embed_models",
    }


def test_only_faiss_vector_store_is_supported():
    assert list(SupportedVSType) == [SupportedVSType.FAISS]
    service_root = SERVER_ROOT / "tomechat" / "server" / "knowledge_base" / "kb_service"
    assert sorted(path.name for path in service_root.glob("*_kb_service.py")) == [
        "faiss_kb_service.py",
    ]


def test_local_model_and_reranker_implementations_are_removed():
    removed = [
        SERVER_ROOT / "tomechat" / "server" / "localai_embeddings.py",
        SERVER_ROOT / "tomechat" / "server" / "reranker",
        SERVER_ROOT / "tomechat" / "server" / "api_server" / "reranker_routes.py",
        REPOSITORY_ROOT / "tools" / "model_loaders",
    ]

    assert [path for path in removed if path.exists()] == []


def test_backend_dependencies_exclude_removed_model_and_vector_backends():
    dependency_text = (SERVER_ROOT / "pyproject.toml").read_text(encoding="utf-8").lower()
    removed_terms = [
        "xinference_client",
        "ollama",
        "flagembedding",
        "elasticsearch",
        "sqlalchemy-vectorstores",
        "pymysql",
        "milvus",
        "chromadb",
        "pgvector",
        "zilliz",
        "relyt",
    ]

    assert [term for term in removed_terms if term in dependency_text] == []
