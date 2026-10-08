import os
import sys
from pathlib import Path

sys.path.append("../..")
from tomechat.server.knowledge_base.utils import make_text_splitter
from tomechat.settings import Settings


def text(splitter_name):
    from langchain_community import document_loaders

    # 使用DocumentLoader读取文件
    filepath = str(Path(__file__).parents[1] / "fixtures" / "knowledge_base" / "minimal.txt")
    loader = document_loaders.UnstructuredFileLoader(filepath, autodetect_encoding=True)
    docs = loader.load()
    text_splitter = make_text_splitter(
        splitter_name, Settings.kb_settings.CHUNK_SIZE, Settings.kb_settings.OVERLAP_SIZE
    )
    if splitter_name == "MarkdownHeaderTextSplitter":
        docs = text_splitter.split_text(docs[0].page_content)
        for doc in docs:
            if doc.metadata:
                doc.metadata["source"] = os.path.basename(filepath)
    else:
        docs = text_splitter.split_documents(docs)
    for doc in docs:
        print(doc)
    return docs


import pytest
from langchain_core.documents import Document


@pytest.mark.parametrize(
    "splitter_name",
    [
        "ChineseRecursiveTextSplitter",
        "SpacyTextSplitter",
        "RecursiveCharacterTextSplitter",
        "MarkdownHeaderTextSplitter",
    ],
)
def test_different_splitter(splitter_name):
    try:
        docs = text(splitter_name)
        assert isinstance(docs, list)
        if len(docs) > 0:
            assert isinstance(docs[0], Document)
    except Exception as e:
        pytest.fail(f"test_different_splitter failed with {splitter_name}, error: {str(e)}")
