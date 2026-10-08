from __future__ import annotations

import json
import time
from typing import Any, List, Literal

from pydantic import BaseModel, Field

from tomechat.server.model_factory import get_default_llm
from tomechat.settings import Settings


class MsgType:
    TEXT = 1
    IMAGE = 2
    AUDIO = 3
    VIDEO = 4


class OpenAIBaseInput(BaseModel):
    user: str | None = None
    # Use the following arguments if you need to pass additional parameters to
    # the API that aren't available via kwargs.
    # The extra values given here take precedence over values defined on the
    # client or passed to this method.
    extra_headers: dict[str, Any] | None = None
    extra_query: dict[str, Any] | None = None
    extra_json: dict[str, Any] | None = Field(None, alias="extra_body")
    timeout: float | None = None

    class Config:
        extra = "allow"


class OpenAIChatMessageInput(BaseModel):
    content: str | list[dict[str, Any]]
    role: Literal["system", "user", "assistant"]


class OpenAIChatInput(OpenAIBaseInput):
    messages: list[OpenAIChatMessageInput]
    model: str = get_default_llm()
    frequency_penalty: float | None = None
    logit_bias: dict[str, int] | None = None
    logprobs: bool | None = None
    max_tokens: int | None = None
    n: int | None = None
    presence_penalty: float | None = None
    response_format: dict[str, Any] | None = None
    seed: int | None = None
    stop: str | list[str] | None = None
    stream: bool | None = None
    temperature: float | None = Settings.model_settings.TEMPERATURE
    top_logprobs: int | None = None
    top_p: float | None = None

    # 知识库 RAG 参数:仅供 /chat/completions 检索使用。
    # exclude=True 确保不随 model_dump 转发给 LLM。
    knowledge_base_name: str | None = Field(default=None, exclude=True)

    # 联网搜索开关:开启后回答前先用搜索引擎检索并注入上下文。
    search_engine: bool | None = Field(default=None, exclude=True)


class OpenAIBaseOutput(BaseModel):
    id: str | None = None
    content: str | None = None
    model: str | None = None
    object: Literal["chat.completion", "chat.completion.chunk"] = "chat.completion.chunk"
    role: Literal["assistant"] = "assistant"
    finish_reason: str | None = None
    created: int = Field(default_factory=lambda: int(time.time()))

    status: int | None = None
    message_type: int = MsgType.TEXT
    message_id: str | None = None  # id in database table
    is_ref: bool = False  # wheather show in seperated expander

    # reference documents shown alongside the answer
    docs: list[Any] | None = None
    filtered_docs: list[Any] | None = None

    class Config:
        extra = "allow"

    def model_dump(self) -> dict[str, Any]:
        # tool_calls 单独处理:进 delta,不留在顶层
        extra = {k: v for k, v in (self.model_extra or {}).items() if k != "tool_calls"}
        result = {
            "id": self.id,
            "object": self.object,
            "model": self.model,
            "created": self.created,
            "status": self.status,
            "message_type": self.message_type,
            "message_id": self.message_id,
            "is_ref": self.is_ref,
            **extra,
        }
        if self.docs is not None:
            result["docs"] = self.docs
        if self.filtered_docs is not None:
            result["filtered_docs"] = self.filtered_docs

        if self.object == "chat.completion.chunk":
            delta: dict[str, Any] = {"content": self.content}
            if self.finish_reason is not None:
                delta["finish_reason"] = self.finish_reason
            if self.model_extra and "tool_calls" in self.model_extra:
                # agent 路径:工具调用过程以 OpenAI delta.tool_calls 格式下发
                delta["tool_calls"] = self.model_extra["tool_calls"]
            result["choices"] = [
                {
                    "delta": delta,
                    "role": self.role,
                }
            ]
        elif self.object == "chat.completion":
            result["choices"] = [
                {
                    "message": {
                        "role": self.role,
                        "content": self.content,
                        "finish_reason": self.finish_reason,
                    }
                }
            ]
        return result

    def model_dump_json(self) -> str:
        return json.dumps(self.model_dump(), ensure_ascii=False)


class OpenAIChatOutput(OpenAIBaseOutput): ...


class BaseResponse(BaseModel):
    code: int = Field(default=200, description="API status code")
    msg: str = Field(default="success", description="API status message")
    data: Any = Field(default=None, description="API data")

    @classmethod
    def success(cls, data: Any = "", message: str = "success"):
        return cls(code=200, msg=message, data=data)

    @classmethod
    def error(cls, data: Any = "", message: str = "error", code: int = 500):
        return cls(code=code, msg=message, data=data)

    class Config:
        json_schema_extra = {
            "example": {
                "code": 200,
                "msg": "success",
            }
        }


class ListResponse(BaseResponse):
    data: List[Any] = Field(..., description="List of data")

    class Config:
        json_schema_extra = {
            "example": {
                "code": 200,
                "msg": "success",
                "data": ["doc1.docx", "doc2.pdf", "doc3.txt"],
            }
        }


class ChatMessage(BaseModel):
    question: str = Field(..., description="Question text")
    response: str = Field(..., description="Response text")
    history: List[List[str]] = Field(..., description="History text")
    source_documents: List[str] = Field(..., description="List of source documents and their scores")

    class Config:
        json_schema_extra = {
            "example": {
                "question": "工伤保险如何办理？",
                "response": "根据已知信息，可以总结如下：\n\n"
                "1. 参保单位为员工缴纳工伤保险费，以保障员工在发生工伤时能够获得相应的待遇。\n"
                "2. 不同地区的工伤保险缴费规定可能有所不同，需要向当地社保部门咨询以了解具体的缴费标准和规定。\n"
                "3. 工伤从业人员及其近亲属需要申请工伤认定，确认享受的待遇资格，并按时缴纳工伤保险费。\n"
                "4. 工伤保险待遇包括工伤医疗、康复、辅助器具配置费用、伤残待遇、工亡待遇、一次性工亡补助金等。\n"
                "5. 工伤保险待遇领取资格认证包括长期待遇领取人员认证和一次性待遇领取人员认证。\n"
                "6. 工伤保险基金支付的待遇项目包括工伤医疗待遇、康复待遇、辅助器具配置费用、"
                "一次性工亡补助金、丧葬补助金等。",
                "history": [
                    [
                        "工伤保险是什么？",
                        "工伤保险是指用人单位按照国家规定，为本单位的职工和用人单位的其他人员，缴纳工伤保险费，"
                        "由保险机构按照国家规定的标准，给予工伤保险待遇的社会保险制度。",
                    ]
                ],
                "source_documents": [
                    "出处 [1] 广州市单位从业的特定人员参加工伤保险办事指引.docx：\n\n\t"
                    "( 一)  从业单位  (组织)  按“自愿参保”原则，  为未建 立劳动关系的特定从业人员"
                    "单项参加工伤保险 、缴纳工伤保 险费。",
                    "出处 [2] ...",
                    "出处 [3] ...",
                ],
            }
        }
