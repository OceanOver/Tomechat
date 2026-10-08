from __future__ import annotations

from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from langchain_core.vectorstores import VectorStore

from tomechat.server.file_rag.retrievers.base import BaseRetrieverService

# RRF 常数,与原 EnsembleRetriever 默认值一致
_RRF_K = 60


class EnsembleRetrieverService(BaseRetrieverService):
    """BM25 + 向量检索的 RRF 混合。

    ponytail: 原 EnsembleRetriever 已随 langchain 1.x 移入 langchain-classic,
    用 ~20 行手工 RRF 代替,不为此新增依赖;需要加权调优再考虑引入。
    """

    def do_init(
        self,
        retriever: list[BaseRetriever] | None = None,
        top_k: int = 5,
    ):
        self.vs = None
        self.top_k = top_k
        self.retriever = retriever or []

    @staticmethod
    def from_vectorstore(
        vectorstore: VectorStore,
        top_k: int,
        score_threshold: int | float,
    ):
        faiss_retriever = vectorstore.as_retriever(
            search_type="similarity_score_threshold",
            search_kwargs={"score_threshold": score_threshold, "k": top_k},
        )
        import jieba

        docs = list(vectorstore.docstore._dict.values())
        bm25_retriever = BM25Retriever.from_documents(
            docs,
            preprocess_func=jieba.lcut_for_search,
        )
        bm25_retriever.k = top_k
        return EnsembleRetrieverService(retriever=[bm25_retriever, faiss_retriever], top_k=top_k)

    def get_relevant_documents(self, query: str):
        scores: dict[str, tuple[float, Document]] = {}
        for retriever in self.retriever:
            for rank, doc in enumerate(retriever.invoke(query)):
                key = doc.page_content
                prev_score, _ = scores.get(key, (0.0, doc))
                scores[key] = (prev_score + 1.0 / (_RRF_K + rank + 1), doc)
        ranked = sorted(scores.values(), key=lambda x: x[0], reverse=True)
        return [doc for _, doc in ranked[: self.top_k]]
