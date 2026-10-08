import uuid

from sqlalchemy.orm import Session

from tomechat.server.db.models.message_model import MessageModel
from tomechat.server.db.session import with_session


@with_session
def add_message_to_db(
    session: Session,
    conversation_id: str,
    chat_type: str,
    query: str,
    response: str = "",
    message_id: str | None = None,
    metadata: dict | None = None,
):
    """
    新增聊天记录
    """
    if not message_id:
        message_id = uuid.uuid4().hex
    m = MessageModel(
        id=message_id,
        chat_type=chat_type,
        query=query,
        response=response,
        conversation_id=conversation_id,
        meta_data=metadata or {},
    )
    session.add(m)
    session.commit()
    return m.id


@with_session
def get_message_by_id(session: Session, message_id) -> MessageModel:
    """
    查询聊天记录
    """
    m = session.query(MessageModel).filter_by(id=message_id).first()
    return m


@with_session
def feedback_message_to_db(session: Session, message_id: str, feedback_score: int, feedback_reason: str):
    """
    反馈聊天记录
    """
    m = session.query(MessageModel).filter_by(id=message_id).first()
    if m:
        m.feedback_score = feedback_score
        m.feedback_reason = feedback_reason
    session.commit()
    return m.id if m else None


@with_session
def filter_message(session: Session, conversation_id: str, limit: int = 10):
    messages = (
        session.query(MessageModel)
        .filter_by(conversation_id=conversation_id)
        .
        # 用户最新的query 也会插入到db，忽略这个message record
        filter(MessageModel.response != "")
        .
        # 返回最近的limit 条记录
        order_by(MessageModel.create_time.desc())
        .limit(limit)
        .all()
    )
    # 直接返回 List[MessageModel] 报错
    data = []
    for m in messages:
        data.append({"query": m.query, "response": m.response})
    return data
