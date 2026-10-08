from pathlib import Path

from click.testing import CliRunner

from tomechat.cli import main
from tomechat.server.knowledge_base.kb_service.base import SupportedVSType
from tomechat.settings import Settings

SERVER_ROOT = Path(__file__).parents[2]
REPOSITORY_ROOT = SERVER_ROOT.parents[1]


def test_only_openai_compatible_chat_and_embedding_are_configured():
    platforms = Settings.model_settings.MODEL_PLATFORMS

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


def test_init_cli_uses_generic_model_service_options():
    result = CliRunner().invoke(main, ["init", "--help"])

    assert result.exit_code == 0
    assert "--model-api-base" in result.output
    assert "--xinference-endpoint" not in result.output


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
