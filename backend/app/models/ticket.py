"""
Ticket Models
工单相关模型
"""
from sqlalchemy import Column, String, DateTime, Enum, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class TicketStatus(str, enum.Enum):
    """工单状态枚举"""
    OPEN = "open"
    ACCEPTED = "accepted"
    IN_PROGRESS = "inProgress"
    CLOSED = "closed"
    ON_HOLD = "onHold"
    CANCELLED = "cancelled"
    SUBMITTED = "submitted"


class TicketType(str, enum.Enum):
    """工单类型枚举"""
    PLANNED = "planned"
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    PROBLEM = "problem"


class Priority(str, enum.Enum):
    """优先级枚举"""
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"
    P4 = "P4"


class CommentType(str, enum.Enum):
    """评论类型枚举"""
    GENERAL = "general"
    ACCEPT = "accept"
    DECLINE = "decline"
    CANCEL = "cancel"


class Ticket(Base):
    """
    工单表
    存储维护工单信息
    """
    __tablename__ = "tickets"

    id = Column(String(36), primary_key=True, index=True)
    title = Column(String(500), nullable=False, comment="工单标题")
    description = Column(Text, nullable=True, comment="工单描述")
    type = Column(Enum(TicketType), nullable=False, comment="工单类型")
    status = Column(Enum(TicketStatus), nullable=False, default=TicketStatus.OPEN, comment="工单状态")
    priority = Column(Enum(Priority), nullable=True, comment="优先级")
    site = Column(String(255), nullable=True, comment="站点名称")

    # Foreign Keys
    template_id = Column(String(36), ForeignKey("templates.id", ondelete="RESTRICT"), nullable=False, comment="模板ID")
    assigned_to = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, comment="分配给")
    created_by = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, comment="创建者")

    # Workflow Data
    completed_steps = Column(JSON, nullable=True, default=list, comment="已完成的步骤ID列表")
    step_data = Column(JSON, nullable=True, default=dict, comment="步骤数据")

    # Additional Fields
    accepted = Column(Boolean, nullable=True, default=None, comment="是否接受")
    accepted_at = Column(DateTime, nullable=True, comment="接受时间")
    departure_at = Column(DateTime, nullable=True, comment="出发时间")
    departure_photo = Column(String(500), nullable=True, comment="出发照片URL")
    arrival_at = Column(DateTime, nullable=True, comment="到达时间")
    arrival_photo = Column(String(500), nullable=True, comment="到达照片URL")
    completion_photo = Column(String(500), nullable=True, comment="完成照片URL")
    cause = Column(Text, nullable=True, comment="问题原因")
    solution = Column(Text, nullable=True, comment="解决方案")
    related_ticket_ids = Column(JSON, nullable=True, default=list, comment="关联工单ID列表")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False, comment="更新时间")
    due_date = Column(DateTime, nullable=False, comment="截止时间")

    # Relationships
    template = relationship("Template", back_populates="tickets")
    assignee = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_tickets")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_tickets")
    comments = relationship("TicketComment", back_populates="ticket", cascade="all, delete-orphan", order_by="TicketComment.created_at")

    def __repr__(self):
        return f"<Ticket(id={self.id}, title={self.title}, status={self.status})>"


class TicketComment(Base):
    """
    工单评论表
    存储工单的评论和操作记录
    """
    __tablename__ = "ticket_comments"

    id = Column(String(36), primary_key=True, index=True)
    comment = Column(Text, nullable=False, comment="评论内容")
    type = Column(Enum(CommentType), nullable=False, default=CommentType.GENERAL, comment="评论类型")

    # Foreign Keys
    ticket_id = Column(String(36), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, comment="工单ID")
    user_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, comment="评论用户ID")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="创建时间")

    # Relationships
    ticket = relationship("Ticket", back_populates="comments")
    user = relationship("User", back_populates="comments")

    def __repr__(self):
        return f"<TicketComment(id={self.id}, ticket_id={self.ticket_id}, type={self.type})>"
