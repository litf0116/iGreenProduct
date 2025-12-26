"""
Template Schemas
模板相关的数据模型
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.template import FieldType


# ============================================================================
# Template Field Schemas
# ============================================================================

class TemplateFieldBase(BaseModel):
    """模板字段基础模型"""
    name: str = Field(..., min_length=1, max_length=255, description="字段名称")
    type: FieldType = Field(..., description="字段类型")
    required: bool = Field(default=False, description="是否必填")


class TemplateFieldCreate(TemplateFieldBase):
    """创建模板字段请求"""
    pass


class TemplateFieldResponse(TemplateFieldBase):
    """模板字段响应"""
    id: str

    class Config:
        from_attributes = True


# ============================================================================
# Template Step Schemas
# ============================================================================

class TemplateStepBase(BaseModel):
    """模板步骤基础模型"""
    name: str = Field(..., min_length=1, max_length=255, description="步骤名称")
    description: Optional[str] = Field(None, description="步骤描述")
    order: int = Field(..., ge=0, description="步骤顺序")
    fields: List[TemplateFieldCreate] = Field(default_factory=list, description="字段列表")


class TemplateStepCreate(TemplateStepBase):
    """创建模板步骤请求"""
    pass


class TemplateStepResponse(BaseModel):
    """模板步骤响应"""
    id: str
    name: str
    description: Optional[str] = None
    order: int
    fields: List[TemplateFieldResponse] = []

    class Config:
        from_attributes = True


# ============================================================================
# Template Schemas
# ============================================================================

class TemplateBase(BaseModel):
    """模板基础模型"""
    name: str = Field(..., min_length=1, max_length=255, description="模板名称")
    description: Optional[str] = Field(None, description="模板描述")


class TemplateCreate(TemplateBase):
    """创建模板请求"""
    steps: List[TemplateStepCreate] = Field(default_factory=list, description="步骤列表")


class TemplateUpdate(BaseModel):
    """更新模板请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    steps: Optional[List[TemplateStepCreate]] = None


class TemplateResponse(TemplateBase):
    """模板响应"""
    id: str
    steps: List[TemplateStepResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
