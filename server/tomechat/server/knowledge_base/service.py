import urllib

from fastapi import Body

from tomechat.server.db.repository.knowledge_base_repository import list_kbs_from_db
from tomechat.server.knowledge_base import kb_ops
from tomechat.server.knowledge_base.kb_service.base import KBServiceFactory
from tomechat.server.knowledge_base.utils import validate_kb_name
from tomechat.server.model_factory import get_default_embedding
from tomechat.server.schemas import BaseResponse, ListResponse
from tomechat.settings import Settings
from tomechat.utils import build_logger

logger = build_logger()


def list_kbs():
    # Get List of Knowledge Base
    return ListResponse(data=list_kbs_from_db())


def create_kb(
    knowledge_base_name: str = Body(..., examples=["knowledge_base_name"]),
    vector_store_type: str = Body(Settings.kb_settings.DEFAULT_VS_TYPE),
    kb_info: str = Body("", description="知识库内容简介。"),
    embed_model: str = Body(get_default_embedding()),
) -> BaseResponse:
    # Create selected knowledge base
    if not validate_kb_name(knowledge_base_name):
        return BaseResponse(code=403, msg="Don't attack me")
    if knowledge_base_name is None or knowledge_base_name.strip() == "":
        return BaseResponse(code=404, msg="知识库名称不能为空，请重新填写知识库名称")

    kb = KBServiceFactory.get_service_by_name(knowledge_base_name)
    if kb is not None:
        return BaseResponse(code=404, msg=f"已存在同名知识库 {knowledge_base_name}")

    kb = KBServiceFactory.get_service(knowledge_base_name, vector_store_type, embed_model, kb_info=kb_info)
    try:
        kb_ops.create_kb(kb)
    except Exception as e:
        msg = f"创建知识库出错： {e}"
        logger.error(f"{e.__class__.__name__}: {msg}")
        return BaseResponse(code=500, msg=msg)

    return BaseResponse(code=200, msg=f"已新增知识库 {knowledge_base_name}")


def delete_kb(
    knowledge_base_name: str = Body(..., examples=["knowledge_base_name"]),
) -> BaseResponse:
    # Delete selected knowledge base
    if not validate_kb_name(knowledge_base_name):
        return BaseResponse(code=403, msg="Don't attack me")
    knowledge_base_name = urllib.parse.unquote(knowledge_base_name)

    kb = KBServiceFactory.get_service_by_name(knowledge_base_name)

    if kb is None:
        return BaseResponse(code=404, msg=f"未找到知识库 {knowledge_base_name}")

    try:
        status = kb_ops.clear_vs(kb)
        status = kb_ops.drop_kb(kb)
        if status:
            return BaseResponse(code=200, msg=f"成功删除知识库 {knowledge_base_name}")
    except Exception as e:
        msg = f"删除知识库时出现意外： {e}"
        logger.error(f"{e.__class__.__name__}: {msg}")
        return BaseResponse(code=500, msg=msg)

    return BaseResponse(code=500, msg=f"删除知识库失败 {knowledge_base_name}")
