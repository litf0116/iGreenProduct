"""
Groups API Routes
分组管理相关的API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.user import User
from app.models.group import Group
from app.schemas.group import GroupCreate, GroupUpdate, GroupResponse
from app.utils.dependencies import get_current_active_user

router = APIRouter(prefix="/groups", tags=["Groups"])


@router.get("", response_model=List[GroupResponse])
async def get_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有分组"""
    groups = db.query(Group).all()
    return groups


@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取指定分组"""
    group = db.query(Group).filter(Group.id == group_id).first()

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    return group


@router.post("", response_model=GroupResponse, status_code=201)
async def create_group(
    group_data: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建新分组 (需要管理员或经理权限)"""
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # 检查分组名是否已存在
    existing_group = db.query(Group).filter(Group.name == group_data.name).first()
    if existing_group:
        raise HTTPException(status_code=400, detail="Group name already exists")

    new_group = Group(
        id=str(uuid.uuid4()),
        name=group_data.name,
        description=group_data.description,
        tags=group_data.tags or [],
        status=group_data.status
    )

    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    return new_group


@router.put("/{group_id}", response_model=GroupResponse)
async def update_group(
    group_id: str,
    group_data: GroupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新分组 (需要管理员或经理权限)"""
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    group = db.query(Group).filter(Group.id == group_id).first()

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # 更新字段
    if group_data.name is not None:
        existing_group = db.query(Group).filter(
            Group.name == group_data.name,
            Group.id != group_id
        ).first()
        if existing_group:
            raise HTTPException(status_code=400, detail="Group name already exists")
        group.name = group_data.name

    if group_data.description is not None:
        group.description = group_data.description

    if group_data.tags is not None:
        group.tags = group_data.tags

    if group_data.status is not None:
        group.status = group_data.status

    db.commit()
    db.refresh(group)

    return group


@router.delete("/{group_id}")
async def delete_group(
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除分组 (需要管理员权限)"""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete groups")

    group = db.query(Group).filter(Group.id == group_id).first()

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # 检查是否有用户在此分组中
    if group.users:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete group with existing users"
        )

    db.delete(group)
    db.commit()

    return {"message": "Group deleted successfully"}
