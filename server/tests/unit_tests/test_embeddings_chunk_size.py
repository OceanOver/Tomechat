"""chunk_size selection in get_Embeddings: vision models cap at 10, text models use larger batches."""

from unittest.mock import patch

from tomechat.server import model_factory


def _make_chunk_size(monkeypatch, model_name):
    monkeypatch.setattr(
        model_factory, "get_model_info", lambda model_name=None: {"platform_type": "openai"}
    )
    captured = {}

    class FakeEmbeddings:
        def __init__(self, **kwargs):
            captured.update(kwargs)

    with patch("langchain_openai.OpenAIEmbeddings", FakeEmbeddings):
        model_factory.get_Embeddings(embed_model=model_name)
    return captured["chunk_size"]


def test_vision_model_keeps_small_batch(monkeypatch):
    assert _make_chunk_size(monkeypatch, "doubao-embedding-vision") == 10


def test_text_model_uses_larger_batch(monkeypatch):
    assert _make_chunk_size(monkeypatch, "doubao-embedding-large") == 32
