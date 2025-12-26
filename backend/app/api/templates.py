"""
Templates API Routes
模板管理相关的API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.user import User
from app.models.template import Template, TemplateStep, TemplateField
from app.schemas.template import (
    TemplateCreate, TemplateUpdate, TemplateResponse,
    TemplateStepResponse, TemplateFieldResponse
)
from app.utils.dependencies import get_current_active_user

router = APIRouter(prefix="/templates", tags=["Templates"])


def build_template_response(template: Template) -> TemplateResponse:
    """构建模板响应对象"""
    steps_response = []
    for step in template.steps:
        fields_response = [
            TemplateFieldResponse(
                id=field.id,
                name=field.name,
                type=field.type.value,
                required=field.required
            )
            for field in step.fields
        ]

        steps_response.append(TemplateStepResponse(
            id=step.id,
            name=step.name,
            description=step.description,
            order=step.order,
            fields=fields_response
        ))

    return TemplateResponse(
        id=template.id,
        name=template.name,
        description=template.description,
        steps=steps_response,
        created_at=template.created_at,
        updated_at=template.updated_at
    )


@router.get("", response_model=List[TemplateResponse])
async def get_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有模板"""
    templates = db.query(Template).all()
    return [build_template_response(template) for template in templates]


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取指定模板"""
    template = db.query(Template).filter(Template.id == template_id).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    return build_template_response(template)


@router.post("", response_model=TemplateResponse, status_code=201)
async def create_template(
    template_data: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建新模板 (需要管理员或经理权限)"""
    # 检查权限
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # 检查模板名是否已存在
    existing_template = db.query(Template).filter(Template.name == template_data.name).first()
    if existing_template:
        raise HTTPException(status_code=400, detail="Template name already exists")

    # 创建模板
    new_template = Template(
        id=str(uuid.uuid4()),
        name=template_data.name,
        description=template_data.description
    )

    # 创建步骤和字段
    for step_data in template_data.steps:
        new_step = TemplateStep(
            id=str(uuid.uuid4()),
            name=step_data.name,
            description=step_data.description,
            order=step_data.order,
            template_id=new_template.id
        )

        for field_data in step_data.fields:
            new_field = TemplateField(
                id=str(uuid.uuid4()),
                name=field_data.name,
                type=field_data.type,
                required=field_data.required,
                step_id=new_step.id
            )
            new_step.fields.append(new_field)

        new_template.steps.append(new_step)

    db.add(new_template)
    db.commit()
    db.refresh(new_template)

    return build_template_response(new_template)


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: str,
    template_data: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新模板 (需要管理员或经理权限)"""
    # 检查权限
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    template = db.query(Template).filter(Template.id == template_id).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # 更新基本信息
    if template_data.name is not None:
        # 检查新名称是否已被其他模板使用
        existing_template = db.query(Template).filter(
            Template.name == template_data.name,
            Template.id != template_id
        ).first()
        if existing_template:
            raise HTTPException(status_code=400, detail="Template name already exists")
        template.name = template_data.name

    if template_data.description is not None:
        template.description = template_data.description

    # 如果提供了新的步骤，删除旧步骤并创建新步骤
    if template_data.steps is not None:
        # 删除旧步骤（级联删除会自动删除字段）
        for old_step in template.steps:
            db.delete(old_step)

        # 创建新步骤
        for step_data in template_data.steps:
            new_step = TemplateStep(
                id=str(uuid.uuid4()),
                name=step_data.name,
                description=step_data.description,
                order=step_data.order,
                template_id=template.id
            )

            for field_data in step_data.fields:
                new_field = TemplateField(
                    id=str(uuid.uuid4()),
                    name=field_data.name,
                    type=field_data.type,
                    required=field_data.required,
                    step_id=new_step.id
                )
                new_step.fields.append(new_field)

            template.steps.append(new_step)

    db.commit()
    db.refresh(template)

    return build_template_response(template)


@router.delete("/{template_id}")
async def delete_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除模板 (需要管理员权限)"""
    # 检查权限
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete templates")

    template = db.query(Template).filter(Template.id == template_id).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # 检查是否有工单在使用此模板
    if template.tickets:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete template with existing tickets"
        )

    db.delete(template)
    db.commit()

    return {"message": "Template deleted successfully"}
