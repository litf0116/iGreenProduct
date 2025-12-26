"""
Authentication API Routes
认证相关的API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserLogin, UserRegister, UserResponse
from app.schemas.auth import Token
from app.utils.auth import verify_password, get_password_hash, create_access_token
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=dict)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    用户登录

    Args:
        user_data: 登录数据(email, password)
        db: 数据库会话

    Returns:
        dict: 包含用户信息和token
    """
    # 查找用户
    user = db.query(User).filter(User.email == user_data.email).first()

    # 验证用户和密码
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 创建访问令牌
    access_token = create_access_token(
        data={"sub": user.id, "username": user.username, "role": user.role.value}
    )

    # 获取分组名称
    group_name = user.group.name if user.group else None

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "email": user.email,
            "role": user.role.value,
            "groupId": user.group_id,
            "groupName": group_name,
        },
        "token": access_token
    }


@router.post("/register", response_model=dict)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    用户注册

    Args:
        user_data: 注册数据
        db: 数据库会话

    Returns:
        dict: 包含用户信息和token
    """
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
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 创建访问令牌
    access_token = create_access_token(
        data={"sub": new_user.id, "username": new_user.username, "role": new_user.role.value}
    )

    return {
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "username": new_user.username,
            "email": new_user.email,
            "role": new_user.role.value,
        },
        "token": access_token
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    用户登出

    注意: JWT是无状态的，实际的登出逻辑应该在客户端实现(删除token)
    此端点主要用于记录登出事件或清理服务器端会话(如果有)

    Args:
        current_user: 当前用户

    Returns:
        dict: 成功消息
    """
    return {"message": "Logged out successfully"}
