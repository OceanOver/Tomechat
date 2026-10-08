from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from tomechat.server.db.base import Base


class KnowledgeFileModel(Base):
    """
    知识文件模型
    """

    __tablename__ = "knowledge_file"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, comment="知识文件ID")
    file_name: Mapped[str | None] = mapped_column(String(255), comment="文件名")
    file_ext: Mapped[str | None] = mapped_column(String(10), comment="文件扩展名")
    kb_name: Mapped[str | None] = mapped_column(String(50), comment="所属知识库名称")
    document_loader_name: Mapped[str | None] = mapped_column(String(50), comment="文档加载器名称")
    text_splitter_name: Mapped[str | None] = mapped_column(String(50), comment="文本分割器名称")
    file_version: Mapped[int | None] = mapped_column(Integer, default=1, comment="文件版本")
    file_mtime: Mapped[float | None] = mapped_column(Float, default=0.0, comment="文件修改时间")
    file_size: Mapped[int | None] = mapped_column(Integer, default=0, comment="文件大小")
    custom_docs: Mapped[bool | None] = mapped_column(Boolean, default=False, comment="是否自定义docs")
    docs_count: Mapped[int | None] = mapped_column(Integer, default=0, comment="切分文档数量")
    create_time: Mapped[datetime | None] = mapped_column(DateTime, default=func.now(), comment="创建时间")

    def __repr__(self):
        return (
            f"<KnowledgeFile(id='{self.id}', file_name='{self.file_name}', file_ext='{self.file_ext}', "
            f"kb_name='{self.kb_name}', document_loader_name='{self.document_loader_name}', "
            f"text_splitter_name='{self.text_splitter_name}', file_version='{self.file_version}', "
            f"create_time='{self.create_time}')>"
        )


class FileDocModel(Base):
    """
    文件-向量库文档模型
    """

    __tablename__ = "file_doc"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, comment="ID")
    kb_name: Mapped[str | None] = mapped_column(String(50), comment="知识库名称")
    file_name: Mapped[str | None] = mapped_column(String(255), comment="文件名称")
    doc_id: Mapped[str | None] = mapped_column(String(50), comment="向量库文档ID")
    meta_data: Mapped[dict | None] = mapped_column(JSON, default=dict)

    def __repr__(self):
        return (
            f"<FileDoc(id='{self.id}', kb_name='{self.kb_name}', file_name='{self.file_name}', "
            f"doc_id='{self.doc_id}', metadata='{self.meta_data}')>"
        )
