"""
Group Model
分组模型
"""
from sqlalchemy import Column, String, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class GroupStatus(str, enum.Enum):
    """分组状态枚举"""
    ACTIVE = "active"
    INACTIVE = "inactive"


class Group(Base):
    """
    分组表
    存储用户分组信息
    """
    __tablename__ = "groups"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, comment="分组名称")
    description = Column(String(500), nullable=True, comment="分组描述")
    tags = Column(JSON, nullable=True, default=list, comment="标签列表")
    status = Column(Enum(GroupStatus), nullable=False, default=GroupStatus.ACTIVE, comment="状态")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False, comment="更新时间")

    # Relationships
    users = relationship("User", back_populates="group")

    def __repr__(self):
        return f"<Group(id={self.id}, name={self.name}, status={self.status})>"
