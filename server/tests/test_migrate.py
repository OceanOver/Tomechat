import os
import shutil
import sys
from pathlib import Path
from pprint import pprint

root_path = Path(__file__).parent.parent
sys.path.append(str(root_path))

from tomechat.server.knowledge_base import kb_ops
from tomechat.server.knowledge_base.kb_service.base import KBServiceFactory
from tomechat.server.knowledge_base.migrate import (
    folder2db,
    prune_db_docs,
    prune_folder_files,
)
from tomechat.server.knowledge_base.utils import (
    KnowledgeFile,
    get_doc_path,
    get_kb_path,
)

# setup test knowledge base
kb_name = "test_kb_for_migrate"
test_files = {
    "readme.md": str(root_path / "readme.md"),
}


kb_path = get_kb_path(kb_name)
doc_path = get_doc_path(kb_name)

if not os.path.isdir(doc_path):
    os.makedirs(doc_path)

for k, v in test_files.items():
    shutil.copy(v, os.path.join(doc_path, k))


def test_recreate_vs():
    folder2db([kb_name], "recreate_vs")

    kb = KBServiceFactory.get_service_by_name(kb_name)
    assert kb and kb.exists()

    files = kb_ops.list_files(kb)
    print(files)
    for name in test_files:
        assert name in files
        os.path.join(doc_path, name)

        # list docs based on file name
        docs = kb_ops.list_docs(kb, file_name=name)
        assert len(docs) > 0
        pprint(docs[0])
        for doc in docs:
            assert doc.metadata["source"] == name

        # list docs base on metadata
        docs = kb_ops.list_docs(kb, metadata={"source": name})
        assert len(docs) > 0

        for doc in docs:
            assert doc.metadata["source"] == name


def test_increment():
    kb = KBServiceFactory.get_service_by_name(kb_name)
    kb_ops.clear_vs(kb)
    assert kb_ops.list_files(kb) == []
    assert (
        kb_ops.list_docs(
            kb,
        )
        == []
    )

    folder2db([kb_name], "increment")

    files = kb_ops.list_files(kb)
    print(files)
    for f in test_files:
        assert f in files

        docs = kb_ops.list_docs(kb, file_name=f)
        assert len(docs) > 0
        pprint(docs[0])

        for doc in docs:
            assert doc.metadata["source"] == f


def test_prune_db():
    del_file, keep_file = list(test_files)[:2]
    os.remove(os.path.join(doc_path, del_file))

    prune_db_docs([kb_name])

    kb = KBServiceFactory.get_service_by_name(kb_name)
    files = kb_ops.list_files(kb)
    print(files)
    assert del_file not in files
    assert keep_file in files

    docs = kb_ops.list_docs(kb, file_name=del_file)
    assert len(docs) == 0

    docs = kb_ops.list_docs(kb, file_name=keep_file)
    assert len(docs) > 0
    pprint(docs[0])

    shutil.copy(test_files[del_file], os.path.join(doc_path, del_file))


def test_prune_folder():
    del_file, keep_file = list(test_files)[:2]
    kb = KBServiceFactory.get_service_by_name(kb_name)

    # delete docs for file
    kb_ops.delete_doc(kb, KnowledgeFile(del_file, kb_name))
    files = kb_ops.list_files(kb)
    print(files)
    assert del_file not in files
    assert keep_file in files

    docs = kb_ops.list_docs(kb, file_name=del_file)
    assert len(docs) == 0

    docs = kb_ops.list_docs(kb, file_name=keep_file)
    assert len(docs) > 0

    docs = kb_ops.list_docs(kb, file_name=del_file)
    assert len(docs) == 0

    assert os.path.isfile(os.path.join(doc_path, del_file))

    # prune folder
    prune_folder_files([kb_name])

    # check result
    assert not os.path.isfile(os.path.join(doc_path, del_file))
    assert os.path.isfile(os.path.join(doc_path, keep_file))


def test_drop_kb():
    kb = KBServiceFactory.get_service_by_name(kb_name)
    kb_ops.drop_kb(kb)
    assert not kb.exists()
    assert not os.path.isdir(kb_path)

    kb = KBServiceFactory.get_service_by_name(kb_name)
    assert kb is None
