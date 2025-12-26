"""
Users API Routes
用户管理相关的API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.utils.dependencies import get_current_active_user
from app.utils.auth import get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserResponse])
async def get_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    group_id: Optional[str] = Query(None, description="Filter by group"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取所有用户

    Args:
        role: 角色过滤
        group_id: 分组过滤
        status: 状态过滤
        db: 数据库会话
        current_user: 当前用户

    Returns:
        List[UserResponse]: 用户列表
    """
    query = db.query(User)

    # 应用过滤条件
    if role:
        try:
            role_enum = UserRole(role)
            query = query.filter(User.role == role_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {role}"
            )

    if group_id:
        query = query.filter(User.group_id == group_id)

    if status:
        try:
            status_enum = UserStatus(status)
            query = query.filter(User.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status}"
            )

    users = query.all()

    # 构建响应，包含group_name
    result = []
    for user in users:
        user_dict = {
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "email": user.email,
            "role": user.role.value,
            "group_id": user.group_id,
            "group_name": user.group.name if user.group else None,
            "status": user.status.value,
            "created_at": user.created_at,
        }
        result.append(UserResponse(**user_dict))

    return result


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取指定用户

    Args:
        user_id: 用户ID
        db: 数据库会话
        current_user: 当前用户

    Returns:
        UserResponse: 用户信息
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(
        id=user.id,
        name=user.name,
        username=user.username,
        email=user.email,
        role=user.role.value,
        group_id=user.group_id,
        group_name=user.group.name if user.group else None,
        status=user.status.value,
        created_at=user.created_at,
    )


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    创建新用户 (需要管理员权限)

    Args:
        user_data: 用户数据
        db: 数据库会话
        current_user: 当前用户

    Returns:
        UserResponse: 创建的用户信息
    """
    # 检查权限
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can create users"
        )

    # 检查邮箱是否已存在
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 检查用户名是否已存在
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # 创建新用户
    new_user = User(
        id=str(uuid.uuid4()),
        name=user_data.name,
        username=user_data.username,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role,
        group_id=user_data.group_id,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse(
        id=new_user.id,
        name=new_user.name,
        username=new_user.username,
        email=new_user.email,
        role=new_user.role.value,
        group_id=new_user.group_id,
        group_name=new_user.group.name if new_user.group else None,
        status=new_user.status.value,
        created_at=new_user.created_at,
    )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    更新用户信息

    Args:
        user_id: 用户ID
        user_data: 更新数据
        db: 数据库会话
        current_user: 当前用户

    Returns:
        UserResponse: 更新后的用户信息
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # 检查权限：只能编辑自己或管理员可以编辑所有人
    if current_user.id != user_id and current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )

    # 更新字段
    if user_data.name is not None:
        user.name = user_data.name
    if user_data.username is not None:
        # 检查用户名是否已被其他用户使用
        existing_username = db.query(User).filter(
            User.username == user_data.username,
            User.id != user_id
        ).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        user.username = user_data.username
    if user_data.group_id is not None:
        user.group_id = user_data.group_id
    if user_data.status is not None:
        user.status = user_data.status

    db.commit()
    db.refresh(user)

    return UserResponse(
        id=user.id,
        name=user.name,
        username=user.username,
        email=user.email,
        role=user.role.value,
        group_id=user.group_id,
        group_name=user.group.name if user.group else None,
        status=user.status.value,
        created_at=user.created_at,
    )


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    删除用户 (需要管理员权限)

    Args:
        user_id: 用户ID
        db: 数据库会话
        current_user: 当前用户

    Returns:
        dict: 成功消息
    """
    # 检查权限
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete users"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # 不能删除自己
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}
