"""
Site Schemas
站点相关的数据模型
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.site import SiteStatus


class SiteBase(BaseModel):
    """站点基础模型"""
    name: str = Field(..., min_length=1, max_length=255, description="站点名称")
    address: str = Field(..., min_length=1, max_length=500, description="站点地址")
    level: str = Field(default="normal", max_length=50, description="站点级别")
    status: SiteStatus = Field(default=SiteStatus.ONLINE, description="站点状态")


class SiteCreate(SiteBase):
    """创建站点请求"""
    pass


class SiteUpdate(BaseModel):
    """更新站点请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    address: Optional[str] = Field(None, min_length=1, max_length=500)
    level: Optional[str] = Field(None, max_length=50)
    status: Optional[SiteStatus] = None


class SiteResponse(SiteBase):
    """站点响应"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
