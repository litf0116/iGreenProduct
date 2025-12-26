"""
User Schemas
用户相关的数据模型
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    """用户基础模型"""
    name: str = Field(..., min_length=1, max_length=255, description="全名")
    username: str = Field(..., min_length=3, max_length=100, description="用户名")
    email: EmailStr = Field(..., description="邮箱")
    role: UserRole = Field(default=UserRole.ENGINEER, description="角色")
    group_id: Optional[str] = Field(None, description="所属分组ID")
    status: UserStatus = Field(default=UserStatus.ACTIVE, description="状态")


class UserCreate(BaseModel):
    """创建用户请求"""
    name: str = Field(..., min_length=1, max_length=255)
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    role: UserRole = UserRole.ENGINEER
    group_id: Optional[str] = None


class UserUpdate(BaseModel):
    """更新用户请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    group_id: Optional[str] = None
    status: Optional[UserStatus] = None


class UserResponse(BaseModel):
    """用户响应"""
    id: str
    name: str
    username: str
    email: str
    role: str
    group_id: Optional[str] = None
    group_name: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """登录请求"""
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    """注册请求"""
    name: str = Field(..., min_length=1, max_length=255)
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    role: UserRole = UserRole.ENGINEER
