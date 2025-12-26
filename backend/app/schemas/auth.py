"""
Authentication Schemas
认证相关的数据模型
"""
from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    """JWT Token响应"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token中包含的数据"""
    user_id: Optional[str] = None
    username: Optional[str] = None
    role: Optional[str] = None
