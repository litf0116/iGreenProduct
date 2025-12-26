"""
Problem Type Schemas
问题类型相关的数据模型
"""
from pydantic import BaseModel, Field
from typing import Optional


class ProblemTypeBase(BaseModel):
    """问题类型基础模型"""
    name: str = Field(..., min_length=1, max_length=255, description="问题类型名称")
    description: Optional[str] = Field(None, description="问题类型描述")


class ProblemTypeCreate(ProblemTypeBase):
    """创建问题类型请求"""
    pass


class ProblemTypeUpdate(BaseModel):
    """更新问题类型请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class ProblemTypeResponse(ProblemTypeBase):
    """问题类型响应"""
    id: str

    class Config:
        from_attributes = True
