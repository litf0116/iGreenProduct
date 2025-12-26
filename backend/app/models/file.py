"""
File Model
文件模型
"""
from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime

from app.core.database import Base


class File(Base):
    """
    文件表
    存储上传的文件信息(照片、签名等)
    """
    __tablename__ = "files"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(500), nullable=False, comment="文件名")
    url = Column(String(1000), nullable=False, comment="文件URL或路径")
    type = Column(String(100), nullable=False, comment="文件MIME类型")
    size = Column(Integer, nullable=False, comment="文件大小(字节)")
    field_type = Column(String(50), nullable=True, comment="字段类型 (photo, signature等)")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="上传时间")

    def __repr__(self):
        return f"<File(id={self.id}, name={self.name}, type={self.type})>"
