"""
Tickets API Routes
工单管理相关的API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models.user import User
from app.models.ticket import Ticket, TicketComment, TicketStatus, TicketType, Priority, CommentType
from app.models.template import Template
from app.schemas.ticket import (
    TicketCreate, TicketUpdate, TicketResponse, TicketCommentResponse,
    TicketAccept, TicketDecline, TicketCancel
)
from app.utils.dependencies import get_current_active_user

router = APIRouter(prefix="/tickets", tags=["Tickets"])


def build_ticket_response(ticket: Ticket) -> TicketResponse:
    """构建工单响应对象"""
    comments_response = [
        TicketCommentResponse(
            id=comment.id,
            comment=comment.comment,
            type=comment.type.value,
            user_id=comment.user_id,
            user_name=comment.user.name,
            ticket_id=comment.ticket_id,
            created_at=comment.created_at
        )
        for comment in ticket.comments
    ]

    return TicketResponse(
        id=ticket.id,
        title=ticket.title,
        description=ticket.description,
        type=ticket.type.value,
        site=ticket.site,
        status=ticket.status.value,
        priority=ticket.priority.value if ticket.priority else None,
        template_id=ticket.template_id,
        template_name=ticket.template.name,
        assigned_to=ticket.assigned_to,
        assigned_to_name=ticket.assignee.name,
        created_by=ticket.created_by,
        created_by_name=ticket.creator.name,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        due_date=ticket.due_date,
        completed_steps=ticket.completed_steps or [],
        step_data=ticket.step_data or {},
        accepted=ticket.accepted,
        accepted_at=ticket.accepted_at,
        departure_at=ticket.departure_at,
        departure_photo=ticket.departure_photo,
        arrival_at=ticket.arrival_at,
        arrival_photo=ticket.arrival_photo,
        completion_photo=ticket.completion_photo,
        cause=ticket.cause,
        solution=ticket.solution,
        comments=comments_response,
        related_ticket_ids=ticket.related_ticket_ids or []
    )


@router.get("", response_model=List[TicketResponse])
async def get_tickets(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    assigned_to: Optional[str] = Query(None, description="Filter by assignee"),
    created_by: Optional[str] = Query(None, description="Filter by creator"),
    type: Optional[str] = Query(None, description="Filter by type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有工单"""
    query = db.query(Ticket)

    # 应用过滤条件
    if status:
        try:
            status_enum = TicketStatus(status)
            query = query.filter(Ticket.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

    if priority:
        try:
            priority_enum = Priority(priority)
            query = query.filter(Ticket.priority == priority_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid priority: {priority}")

    if assigned_to:
        query = query.filter(Ticket.assigned_to == assigned_to)

    if created_by:
        query = query.filter(Ticket.created_by == created_by)

    if type:
        try:
            type_enum = TicketType(type)
            query = query.filter(Ticket.type == type_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid type: {type}")

    tickets = query.all()
    return [build_ticket_response(ticket) for ticket in tickets]


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取指定工单"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return build_ticket_response(ticket)


@router.post("", response_model=TicketResponse, status_code=201)
async def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建新工单"""
    # 验证模板存在
    template = db.query(Template).filter(Template.id == ticket_data.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # 验证被分配用户存在
    assignee = db.query(User).filter(User.id == ticket_data.assigned_to).first()
    if not assignee:
        raise HTTPException(status_code=404, detail="Assignee not found")

    # 创建工单
    new_ticket = Ticket(
        id=str(uuid.uuid4()),
        title=ticket_data.title,
        description=ticket_data.description,
        type=ticket_data.type,
        site=ticket_data.site,
        priority=ticket_data.priority,
        template_id=ticket_data.template_id,
        assigned_to=ticket_data.assigned_to,
        created_by=current_user.id,
        due_date=ticket_data.due_date,
        status=TicketStatus.OPEN,
        completed_steps=[],
        step_data={}
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return build_ticket_response(new_ticket)


@router.put("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新工单"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # 更新字段
    update_fields = ticket_data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(ticket, field, value)

    db.commit()
    db.refresh(ticket)

    return build_ticket_response(ticket)


@router.delete("/{ticket_id}")
async def delete_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除工单"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # 只有创建者或管理员可以删除
    if ticket.created_by != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this ticket")

    db.delete(ticket)
    db.commit()

    return {"message": "Ticket deleted successfully"}


@router.post("/{ticket_id}/accept", response_model=TicketResponse)
async def accept_ticket(
    ticket_id: str,
    accept_data: TicketAccept,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """接受工单"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # 只有被分配的工程师可以接受
    if ticket.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Only assigned engineer can accept this ticket")

    # 更新工单状态
    ticket.accepted = True
    ticket.accepted_at = datetime.utcnow()
    ticket.status = TicketStatus.IN_PROGRESS

    # 添加评论
    if accept_data.comment:
        comment = TicketComment(
            id=str(uuid.uuid4()),
            ticket_id=ticket_id,
            user_id=current_user.id,
            comment=accept_data.comment,
            type=CommentType.ACCEPT
        )
        db.add(comment)

    db.commit()
    db.refresh(ticket)

    return build_ticket_response(ticket)


@router.post("/{ticket_id}/decline", response_model=TicketResponse)
async def decline_ticket(
    ticket_id: str,
    decline_data: TicketDecline,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """拒绝工单"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # 只有被分配的工程师可以拒绝
    if ticket.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Only assigned engineer can decline this ticket")

    # 更新工单状态
    ticket.accepted = False
    ticket.status = TicketStatus.ON_HOLD

    # 添加评论
    comment = TicketComment(
        id=str(uuid.uuid4()),
        ticket_id=ticket_id,
        user_id=current_user.id,
        comment=decline_data.reason,
        type=CommentType.DECLINE
    )
    db.add(comment)

    db.commit()
    db.refresh(ticket)

    return build_ticket_response(ticket)


@router.post("/{ticket_id}/cancel", response_model=TicketResponse)
async def cancel_ticket(
    ticket_id: str,
    cancel_data: TicketCancel,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """取消工单"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # 创建者或管理员可以取消
    if ticket.created_by != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to cancel this ticket")

    # 更新工单状态
    ticket.status = TicketStatus.CANCELLED

    # 添加评论
    comment = TicketComment(
        id=str(uuid.uuid4()),
        ticket_id=ticket_id,
        user_id=current_user.id,
        comment=cancel_data.reason,
        type=CommentType.CANCEL
    )
    db.add(comment)

    db.commit()
    db.refresh(ticket)

    return build_ticket_response(ticket)
