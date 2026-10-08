import enum
import os
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

from langchain_core.documents import Document

from tomechat.server.db.repository.knowledge_base_repository import (
    kb_exists,
    load_kb_from_db,
)
from tomechat.server.knowledge_base.utils import (
    KnowledgeFile,
    get_doc_path,
    get_kb_path,
)
from tomechat.server.model_factory import (
    check_embed_model as _check_embed_model,
)
from tomechat.server.model_factory import (
    get_default_embedding,
)
from tomechat.settings import Settings


class SupportedVSType(str, enum.Enum):
    FAISS = "faiss"


class KBService(ABC):
    """向量库服务抽象：只负责向量库操作（do_* 钩子），数据库 CRUD 编排见 kb_ops.py。"""

    def __init__(
        self,
        knowledge_base_name: str,
        kb_info: str = None,
        embed_model: Optional[str] = None,
    ):
        self.kb_name = knowledge_base_name
        self.kb_info = kb_info or Settings.kb_settings.KB_INFO.get(
            knowledge_base_name, f"关于{knowledge_base_name}的知识库"
        )
        self.embed_model = embed_model or get_default_embedding()
        self.kb_path = get_kb_path(self.kb_name)
        self.doc_path = get_doc_path(self.kb_name)
        self.do_init()

    def __repr__(self) -> str:
        return f"{self.kb_name} @ {self.embed_model}"

    def save_vector_store(self):
        """
        保存向量库: FAISS 保存到磁盘。
        """
        pass

    def check_embed_model(self) -> Tuple[bool, str]:
        return _check_embed_model(self.embed_model)

    def search_docs(
        self,
        query: str,
        top_k: int = Settings.kb_settings.VECTOR_SEARCH_TOP_K,
        # TODO: vector and bm25 should use different value
        score_threshold: float = Settings.kb_settings.SCORE_THRESHOLD,
    ) -> List[Document]:
        if not self.check_embed_model()[0]:
            return []

        docs = self.do_search(query, top_k, score_threshold)
        return docs

    def get_doc_by_ids(self, ids: List[str]) -> List[Document]:
        return []

    def del_doc_by_ids(self, ids: List[str]) -> bool:
        raise NotImplementedError

    def update_doc_by_ids(self, docs: Dict[str, Document]) -> bool:
        """
        传入参数为： {doc_id: Document, ...}
        如果对应 doc_id 的值为 None，或其 page_content 为空，则删除该文档
        """
        if not self.check_embed_model()[0]:
            return False

        self.del_doc_by_ids(list(docs.keys()))
        pending_docs = []
        ids = []
        for _id, doc in docs.items():
            if not doc or not doc.page_content.strip():
                continue
            ids.append(_id)
            pending_docs.append(doc)
        self.do_add_doc(docs=pending_docs, ids=ids)
        return True

    def get_relative_source_path(self, filepath: str):
        """
        将文件路径转化为相对路径，保证查询时一致
        """
        relative_path = filepath
        if os.path.isabs(relative_path):
            try:
                relative_path = Path(filepath).relative_to(self.doc_path)
            except Exception:
                pass

        relative_path = str(relative_path.as_posix().strip("/"))
        return relative_path

    @abstractmethod
    def do_create_kb(self):
        """
        创建知识库子类实自己逻辑
        """
        pass

    @staticmethod
    def list_kbs_type():
        return list(Settings.kb_settings.kbs_config.keys())

    def exists(self, kb_name: str = None):
        kb_name = kb_name or self.kb_name
        return kb_exists(kb_name)

    @abstractmethod
    def vs_type(self) -> str:
        pass

    @abstractmethod
    def do_init(self):
        pass

    @abstractmethod
    def do_drop_kb(self):
        """
        删除知识库子类实自己逻辑
        """
        pass

    @abstractmethod
    def do_search(
        self,
        query: str,
        top_k: int,
        score_threshold: float,
    ) -> List[Tuple[Document, float]]:
        """
        搜索知识库子类实自己逻辑
        """
        pass

    @abstractmethod
    def do_add_doc(
        self,
        docs: List[Document],
        **kwargs,
    ) -> List[Dict]:
        """
        向知识库添加文档子类实自己逻辑
        """
        pass

    @abstractmethod
    def do_delete_doc(self, kb_file: KnowledgeFile):
        """
        从知识库删除文档子类实自己逻辑
        """
        pass

    @abstractmethod
    def do_clear_vs(self):
        """
        从知识库删除全部向量子类实自己逻辑
        """
        pass


class KBServiceFactory:
    @staticmethod
    def get_service(
        kb_name: str,
        vector_store_type: Union[str, SupportedVSType],
        embed_model: Optional[str] = None,
        kb_info: str = None,
    ) -> KBService:
        if isinstance(vector_store_type, str):
            vector_store_type = getattr(SupportedVSType, vector_store_type.upper())
        params = {
            "knowledge_base_name": kb_name,
            "embed_model": embed_model or get_default_embedding(),
            "kb_info": kb_info,
        }
        if SupportedVSType.FAISS == vector_store_type:
            from tomechat.server.knowledge_base.kb_service.faiss_kb_service import (
                FaissKBService,
            )

            return FaissKBService(**params)
        else:
            raise ValueError(f"Unsupported vector store type: {vector_store_type}")

    @staticmethod
    def get_service_by_name(kb_name: str) -> Optional[KBService]:
        _, vs_type, embed_model = load_kb_from_db(kb_name)
        if _ is None:  # kb not in db, just return None
            return None
        return KBServiceFactory.get_service(kb_name, vs_type, embed_model)

    @staticmethod
    def get_default():
        return KBServiceFactory.get_service("default", SupportedVSType.FAISS)
