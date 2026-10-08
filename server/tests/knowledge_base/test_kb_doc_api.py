from uuid import uuid4


def test_search_docs_for_unknown_runtime_name_returns_empty():
    # search_docs 查询 sqlite；测试环境可能尚无 info.db，先确保表存在
    from tomechat.server.knowledge_base.migrate import create_tables

    create_tables()

    from tomechat.server.knowledge_base.doc_service import search_docs

    docs = search_docs(
        query="你好",
        knowledge_base_name=f"missing_kb_{uuid4().hex}",
        top_k=3,
        score_threshold=0.5,
    )

    assert docs == []
