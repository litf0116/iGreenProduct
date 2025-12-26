"""
Ticket Schemas
工单相关的数据模型
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.ticket import TicketStatus, TicketType, Priority, CommentType


# ============================================================================
# Ticket Comment Schemas
# ============================================================================

class TicketCommentBase(BaseModel):
    """工单评论基础模型"""
    comment: str = Field(..., min_length=1, description="评论内容")
    type: CommentType = Field(default=CommentType.GENERAL, description="评论类型")


class TicketCommentCreate(TicketCommentBase):
    """创建工单评论请求"""
    pass


class TicketCommentResponse(TicketCommentBase):
    """工单评论响应"""
    id: str
    user_id: str
    user_name: str
    ticket_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Ticket Schemas
# ============================================================================

class TicketBase(BaseModel):
    """工单基础模型"""
    title: str = Field(..., min_length=1, max_length=500, description="工单标题")
    description: Optional[str] = Field(None, description="工单描述")
    type: TicketType = Field(..., description="工单类型")
    site: Optional[str] = Field(None, description="站点名称")
    priority: Optional[Priority] = Field(None, description="优先级")


class TicketCreate(TicketBase):
    """创建工单请求"""
    template_id: str = Field(..., description="模板ID")
    assigned_to: str = Field(..., description="分配给(用户ID)")
    due_date: datetime = Field(..., description="截止时间")


class TicketUpdate(BaseModel):
    """更新工单请求"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    type: Optional[TicketType] = None
    site: Optional[str] = None
    status: Optional[TicketStatus] = None
    priority: Optional[Priority] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_steps: Optional[List[str]] = None
    step_data: Optional[Dict[str, Any]] = None
    departure_at: Optional[datetime] = None
    departure_photo: Optional[str] = None
    arrival_at: Optional[datetime] = None
    arrival_photo: Optional[str] = None
    completion_photo: Optional[str] = None
    cause: Optional[str] = None
    solution: Optional[str] = None
    related_ticket_ids: Optional[List[str]] = None


class TicketResponse(TicketBase):
    """工单响应"""
    id: str
    template_id: str
    template_name: str
    status: str
    assigned_to: str
    assigned_to_name: str
    created_by: str
    created_by_name: str
    created_at: datetime
    updated_at: datetime
    due_date: datetime
    completed_steps: List[str] = []
    step_data: Dict[str, Any] = {}
    accepted: Optional[bool] = None
    accepted_at: Optional[datetime] = None
    departure_at: Optional[datetime] = None
    departure_photo: Optional[str] = None
    arrival_at: Optional[datetime] = None
    arrival_photo: Optional[str] = None
    completion_photo: Optional[str] = None
    cause: Optional[str] = None
    solution: Optional[str] = None
    comments: List[TicketCommentResponse] = []
    related_ticket_ids: List[str] = []

    class Config:
        from_attributes = True


# ============================================================================
# Ticket Action Schemas
# ============================================================================

class TicketAccept(BaseModel):
    """接受工单请求"""
    comment: Optional[str] = Field(None, description="接受备注")


class TicketDecline(BaseModel):
    """拒绝工单请求"""
    reason: str = Field(..., min_length=1, description="拒绝原因")


class TicketCancel(BaseModel):
    """取消工单请求"""
    reason: str = Field(..., min_length=1, description="取消原因")
