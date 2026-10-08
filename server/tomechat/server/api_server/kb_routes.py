from __future__ import annotations

from fastapi import APIRouter

from tomechat.server.knowledge_base.doc_service import (
    delete_docs,
    download_doc,
    list_files,
    recreate_vector_store,
    search_docs,
    update_docs,
    update_info,
    upload_docs,
)
from tomechat.server.knowledge_base.service import create_kb, delete_kb, list_kbs
from tomechat.server.schemas import BaseResponse, ListResponse

kb_router = APIRouter(prefix="/knowledge_base", tags=["Knowledge Base Management"])

kb_router.get("/list_knowledge_bases", response_model=ListResponse, summary="获取知识库列表")(list_kbs)

kb_router.post("/create_knowledge_base", response_model=BaseResponse, summary="创建知识库")(create_kb)

kb_router.post("/delete_knowledge_base", response_model=BaseResponse, summary="删除知识库")(delete_kb)

kb_router.get("/list_files", response_model=ListResponse, summary="获取知识库内的文件列表")(list_files)

kb_router.post("/search_docs", response_model=list[dict], summary="搜索知识库")(search_docs)

kb_router.post(
    "/upload_docs",
    response_model=BaseResponse,
    summary="上传文件到知识库，并/或进行向量化",
)(upload_docs)

kb_router.post("/delete_docs", response_model=BaseResponse, summary="删除知识库内指定文件")(delete_docs)

kb_router.post("/update_info", response_model=BaseResponse, summary="更新知识库介绍")(update_info)

kb_router.post("/update_docs", response_model=BaseResponse, summary="更新现有文件到知识库")(update_docs)

kb_router.get("/download_doc", summary="下载对应的知识文件")(download_doc)

kb_router.post("/recreate_vector_store", summary="根据content中文档重建向量库，流式输出处理进度。")(
    recreate_vector_store
)
