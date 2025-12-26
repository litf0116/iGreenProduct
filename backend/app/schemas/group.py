"""
Group Schemas
分组相关的数据模型
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.group import GroupStatus


class GroupBase(BaseModel):
    """分组基础模型"""
    name: str = Field(..., min_length=1, max_length=255, description="分组名称")
    description: Optional[str] = Field(None, max_length=500, description="分组描述")
    tags: Optional[List[str]] = Field(default_factory=list, description="标签列表")
    status: GroupStatus = Field(default=GroupStatus.ACTIVE, description="状态")


class GroupCreate(GroupBase):
    """创建分组请求"""
    pass


class GroupUpdate(BaseModel):
    """更新分组请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    tags: Optional[List[str]] = None
    status: Optional[GroupStatus] = None


class GroupResponse(GroupBase):
    """分组响应"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
