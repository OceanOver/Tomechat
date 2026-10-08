from datetime import datetime

from sqlalchemy import JSON, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from tomechat.server.db.base import Base


class MessageModel(Base):
    """
    聊天记录模型
    """

    __tablename__ = "message"
    id: Mapped[str] = mapped_column(String(32), primary_key=True, comment="聊天记录ID")
    conversation_id: Mapped[str | None] = mapped_column(String(32), default=None, index=True, comment="对话框ID")
    chat_type: Mapped[str | None] = mapped_column(String(50), comment="聊天类型")
    query: Mapped[str | None] = mapped_column(String(4096), comment="用户问题")
    response: Mapped[str | None] = mapped_column(String(4096), comment="模型回答")
    # 记录知识库id等，以便后续扩展
    meta_data: Mapped[dict | None] = mapped_column(JSON, default=dict)
    # 满分100 越高表示评价越好
    feedback_score: Mapped[int | None] = mapped_column(Integer, default=-1, comment="用户评分")
    feedback_reason: Mapped[str | None] = mapped_column(String(255), default="", comment="用户评分理由")
    create_time: Mapped[datetime | None] = mapped_column(DateTime, default=func.now(), comment="创建时间")

    def __repr__(self):
        return (
            f"<message(id='{self.id}', conversation_id='{self.conversation_id}', chat_type='{self.chat_type}', "
            f"query='{self.query}', response='{self.response}', meta_data='{self.meta_data}', "
            f"feedback_score='{self.feedback_score}', feedback_reason='{self.feedback_reason}', "
            f"create_time='{self.create_time}')>"
        )
