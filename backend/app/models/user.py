"""
User Model
用户模型
"""
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    """用户角色枚举"""
    ADMIN = "admin"
    ENGINEER = "engineer"
    MANAGER = "manager"


class UserStatus(str, enum.Enum):
    """用户状态枚举"""
    ACTIVE = "active"
    INACTIVE = "inactive"


class User(Base):
    """
    用户表
    存储系统用户信息
    """
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, comment="全名")
    username = Column(String(100), unique=True, nullable=False, index=True, comment="用户名")
    email = Column(String(255), unique=True, nullable=False, index=True, comment="邮箱")
    hashed_password = Column(String(255), nullable=False, comment="加密后的密码")
    role = Column(Enum(UserRole), nullable=False, default=UserRole.ENGINEER, comment="角色")
    status = Column(Enum(UserStatus), nullable=False, default=UserStatus.ACTIVE, comment="状态")

    # Foreign Keys
    group_id = Column(String(36), ForeignKey("groups.id", ondelete="SET NULL"), nullable=True, comment="所属分组ID")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False, comment="更新时间")

    # Relationships
    group = relationship("Group", back_populates="users")
    created_tickets = relationship("Ticket", foreign_keys="Ticket.created_by", back_populates="creator")
    assigned_tickets = relationship("Ticket", foreign_keys="Ticket.assigned_to", back_populates="assignee")
    comments = relationship("TicketComment", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, role={self.role})>"
