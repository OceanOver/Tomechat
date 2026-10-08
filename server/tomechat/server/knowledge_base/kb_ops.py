"""知识库组合操作：向量库操作（KBService）与数据库 CRUD 的编排层。

服务层（service.py / doc_service.py / migrate.py）经由本模块操作知识库；
KBService 自身只负责向量库（do_* 钩子），不直接触达 db.repository。
"""

import os
from pathlib import Path
from typing import Dict, List

from langchain_core.documents import Document

from tomechat.server.db.repository.knowledge_base_repository import (
    add_kb_to_db,
    delete_kb_from_db,
)
from tomechat.server.db.repository.knowledge_file_repository import (
    add_file_to_db,
    count_files_from_db,
    delete_file_from_db,
    delete_files_from_db,
    file_exists_in_db,
    list_docs_from_db,
    list_files_from_db,
)
from tomechat.server.knowledge_base.kb_service.base import KBService
from tomechat.server.knowledge_base.model.kb_document_model import DocumentWithVSId
from tomechat.server.knowledge_base.utils import KnowledgeFile


def create_kb(kb: KBService) -> bool:
    """创建知识库：建目录 + 写库 + 向量库初始化。"""
    if not os.path.exists(kb.doc_path):
        os.makedirs(kb.doc_path)

    status = add_kb_to_db(kb.kb_name, kb.kb_info, kb.vs_type(), kb.embed_model)

    if status:
        kb.do_create_kb()
    return status


def clear_vs(kb: KBService) -> bool:
    """清空知识库：向量库全清 + 删除文件记录。"""
    kb.do_clear_vs()
    status = delete_files_from_db(kb.kb_name)
    return status


def drop_kb(kb: KBService) -> bool:
    """删除知识库：向量库删除 + 删除知识库记录。"""
    kb.do_drop_kb()
    status = delete_kb_from_db(kb.kb_name)
    return status


def add_doc(kb: KBService, kb_file: KnowledgeFile, docs: List[Document] = [], **kwargs) -> bool:
    """向知识库添加文件。

    如果指定了docs，则不再将文本向量化，并将数据库对应条目标为custom_docs=True。
    """
    if not kb.check_embed_model()[0]:
        return False

    if docs:
        custom_docs = True
    else:
        docs = kb_file.file2text()
        custom_docs = False

    if docs:
        # 将 metadata["source"] 改为相对路径
        for doc in docs:
            try:
                doc.metadata.setdefault("source", kb_file.filename)
                source = doc.metadata.get("source", "")
                if os.path.isabs(source):
                    rel_path = Path(source).relative_to(kb.doc_path)
                    doc.metadata["source"] = str(rel_path.as_posix().strip("/"))
            except Exception:
                pass
        delete_doc(kb, kb_file)
        doc_infos = kb.do_add_doc(docs, **kwargs)
        status = add_file_to_db(
            kb_file,
            custom_docs=custom_docs,
            docs_count=len(docs),
            doc_infos=doc_infos,
        )
    else:
        status = False
    return status


def delete_doc(kb: KBService, kb_file: KnowledgeFile, delete_content: bool = False, **kwargs) -> bool:
    """从知识库删除文件：向量库删除 + 删除文件记录。"""
    kb.do_delete_doc(kb_file, **kwargs)
    status = delete_file_from_db(kb_file)
    if delete_content and os.path.exists(kb_file.filepath):
        os.remove(kb_file.filepath)
    return status


def update_info(kb: KBService, kb_info: str) -> bool:
    """更新知识库介绍。"""
    kb.kb_info = kb_info
    status = add_kb_to_db(kb.kb_name, kb.kb_info, kb.vs_type(), kb.embed_model)
    return status


def update_doc(kb: KBService, kb_file: KnowledgeFile, docs: List[Document] = [], **kwargs) -> bool:
    """使用content中的文件更新向量库。

    如果指定了docs，则使用自定义docs，并将数据库对应条目标为custom_docs=True。
    """
    if not kb.check_embed_model()[0]:
        return False

    if os.path.exists(kb_file.filepath):
        delete_doc(kb, kb_file, **kwargs)
        return add_doc(kb, kb_file, docs=docs, **kwargs)
    return False


def exist_doc(kb: KBService, file_name: str) -> bool:
    return file_exists_in_db(KnowledgeFile(knowledge_base_name=kb.kb_name, filename=file_name))


def list_files(kb: KBService) -> list[str]:
    return list_files_from_db(kb.kb_name)


def count_files(kb: KBService) -> int:
    return count_files_from_db(kb.kb_name)


def list_docs(kb: KBService, file_name: str = None, metadata: Dict = {}) -> List[DocumentWithVSId]:
    """通过file_name或metadata检索Document（库记录 + 向量库内容组装）。"""
    doc_infos = list_docs_from_db(kb_name=kb.kb_name, file_name=file_name, metadata=metadata)
    docs = []
    for x in doc_infos:
        doc_info = kb.get_doc_by_ids([x["id"]])[0]
        if doc_info is not None:
            # 处理非空的情况
            doc_with_id = DocumentWithVSId(**{**doc_info.dict(), "id": x["id"]})
            docs.append(doc_with_id)
    return docs


def get_kb_file_details(kb_name: str) -> List[Dict]:
    """知识库内文件的视图信息：文件夹与数据库记录合并。"""
    from tomechat.server.db.repository.knowledge_file_repository import get_file_detail
    from tomechat.server.knowledge_base.kb_service.base import KBServiceFactory
    from tomechat.server.knowledge_base.utils import list_files_from_folder

    kb = KBServiceFactory.get_service_by_name(kb_name)
    if kb is None:
        return []

    files_in_folder = list_files_from_folder(kb_name)
    files_in_db = list_files(kb)
    result = {}

    for doc in files_in_folder:
        result[doc] = {
            "kb_name": kb_name,
            "file_name": doc,
            "file_ext": os.path.splitext(doc)[-1],
            "file_version": 0,
            "document_loader": "",
            "docs_count": 0,
            "text_splitter": "",
            "create_time": None,
            "in_folder": True,
            "in_db": False,
        }
    lower_names = {x.lower(): x for x in result}
    for doc in files_in_db:
        doc_detail = get_file_detail(kb_name, doc)
        if doc_detail:
            doc_detail["in_db"] = True
            if doc.lower() in lower_names:
                result[lower_names[doc.lower()]].update(doc_detail)
            else:
                doc_detail["in_folder"] = False
                result[doc] = doc_detail

    data = []
    for i, v in enumerate(result.values()):
        v["No"] = i + 1
        data.append(v)

    return data
