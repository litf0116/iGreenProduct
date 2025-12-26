"""
Site Level Configuration Schemas
站点级别配置相关的数据模型
"""
from pydantic import BaseModel, Field
from typing import Optional


class SiteLevelConfigBase(BaseModel):
    """站点级别配置基础模型"""
    name: str = Field(..., min_length=1, max_length=255, description="站点级别名称")
    description: Optional[str] = Field(None, description="描述")
    sla_multiplier: float = Field(default=1.0, ge=0.1, le=10.0, description="SLA时间倍数")


class SiteLevelConfigCreate(SiteLevelConfigBase):
    """创建站点级别配置请求"""
    pass


class SiteLevelConfigUpdate(BaseModel):
    """更新站点级别配置请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    sla_multiplier: Optional[float] = Field(None, ge=0.1, le=10.0)


class SiteLevelConfigResponse(SiteLevelConfigBase):
    """站点级别配置响应"""
    id: str

    class Config:
        from_attributes = True
