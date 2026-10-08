from tomechat.server.knowledge_base import kb_ops
from tomechat.server.knowledge_base.kb_service.faiss_kb_service import FaissKBService
from tomechat.server.knowledge_base.migrate import create_tables
from tomechat.server.knowledge_base.utils import KnowledgeFile

kbService = FaissKBService("test")
test_kb_name = "test"
test_file_name = "README.md"
testKnowledgeFile = KnowledgeFile(test_file_name, test_kb_name)
search_content = "如何启动api服务"


def test_init():
    create_tables()


def test_create_db():
    assert kb_ops.create_kb(kbService)


def test_add_doc():
    assert kb_ops.add_doc(kbService, testKnowledgeFile)


def test_search_db():
    result = kbService.search_docs(search_content)
    assert len(result) > 0


def test_delete_doc():
    assert kb_ops.delete_doc(kbService, testKnowledgeFile)


def test_delete_db():
    assert kb_ops.drop_kb(kbService)
