"""
SLA Configuration Schemas
SLA配置相关的数据模型
"""
from pydantic import BaseModel, Field
from app.models.ticket import Priority


class SLAConfigBase(BaseModel):
    """SLA配置基础模型"""
    priority: Priority = Field(..., description="优先级")
    response_time: int = Field(..., ge=1, description="响应时间(分钟)")
    resolution_time: int = Field(..., ge=1, description="解决时间(分钟)")


class SLAConfigCreate(SLAConfigBase):
    """创建/更新SLA配置请求"""
    pass


class SLAConfigResponse(SLAConfigBase):
    """SLA配置响应"""
    id: str

    class Config:
        from_attributes = True
