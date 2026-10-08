from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String


def utc_now() -> datetime:
    """返回带时区的当前 UTC 时间（替代已弃用的 datetime.utcnow）"""
    return datetime.now(timezone.utc)


class BaseModel:
    """
    基础模型
    """

    id = Column(Integer, primary_key=True, index=True, comment="主键ID")
    create_time = Column(DateTime(timezone=True), default=utc_now, comment="创建时间")
    update_time = Column(DateTime(timezone=True), default=None, onupdate=utc_now, comment="更新时间")
    create_by = Column(String, default=None, comment="创建者")
    update_by = Column(String, default=None, comment="更新者")
