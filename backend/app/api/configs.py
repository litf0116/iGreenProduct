"""
Configuration API Routes
系统配置相关的API路由 (SLA配置、问题类型、站点级别配置)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.user import User
from app.models.config import SLAConfig, ProblemType, SiteLevelConfig
from app.models.ticket import Priority
from app.schemas.sla_config import SLAConfigCreate, SLAConfigResponse
from app.schemas.problem_type import ProblemTypeCreate, ProblemTypeUpdate, ProblemTypeResponse
from app.schemas.site_level_config import SiteLevelConfigCreate, SiteLevelConfigUpdate, SiteLevelConfigResponse
from app.utils.dependencies import get_current_active_user

router = APIRouter(tags=["Configurations"])


# ============================================================================
# SLA Configurations
# ============================================================================

@router.get("/sla-configs", response_model=List[SLAConfigResponse])
async def get_sla_configs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有SLA配置"""
    configs = db.query(SLAConfig).all()
    return configs


@router.get("/sla-configs/{priority}", response_model=SLAConfigResponse)
async def get_sla_config(
    priority: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取指定优先级的SLA配置"""
    try:
        priority_enum = Priority(priority)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid priority: {priority}")

    config = db.query(SLAConfig).filter(SLAConfig.priority == priority_enum).first()

    if not config:
        raise HTTPException(status_code=404, detail="SLA config not found")

    return config


@router.post("/sla-configs", response_model=SLAConfigResponse)
async def create_or_update_sla_config(
    config_data: SLAConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建或更新SLA配置 (需要管理员权限)"""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can modify SLA configs")

    # 检查是否已存在
    existing_config = db.query(SLAConfig).filter(
        SLAConfig.priority == config_data.priority
    ).first()

    if existing_config:
        # 更新
        existing_config.response_time = config_data.response_time
        existing_config.resolution_time = config_data.resolution_time
        db.commit()
        db.refresh(existing_config)
        return existing_config
    else:
        # 创建
        new_config = SLAConfig(
            id=str(uuid.uuid4()),
            priority=config_data.priority,
            response_time=config_data.response_time,
            resolution_time=config_data.resolution_time
        )
        db.add(new_config)
        db.commit()
        db.refresh(new_config)
        return new_config


# ============================================================================
# Problem Types
# ============================================================================

@router.get("/problem-types", response_model=List[ProblemTypeResponse])
async def get_problem_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有问题类型"""
    types = db.query(ProblemType).all()
    return types


@router.post("/problem-types", response_model=ProblemTypeResponse, status_code=201)
async def create_problem_type(
    type_data: ProblemTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建问题类型 (需要管理员或经理权限)"""
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # 检查名称是否已存在
    existing_type = db.query(ProblemType).filter(ProblemType.name == type_data.name).first()
    if existing_type:
        raise HTTPException(status_code=400, detail="Problem type name already exists")

    new_type = ProblemType(
        id=str(uuid.uuid4()),
        name=type_data.name,
        description=type_data.description
    )

    db.add(new_type)
    db.commit()
    db.refresh(new_type)

    return new_type


@router.put("/problem-types/{type_id}", response_model=ProblemTypeResponse)
async def update_problem_type(
    type_id: str,
    type_data: ProblemTypeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新问题类型 (需要管理员或经理权限)"""
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    problem_type = db.query(ProblemType).filter(ProblemType.id == type_id).first()

    if not problem_type:
        raise HTTPException(status_code=404, detail="Problem type not found")

    # 更新字段
    if type_data.name is not None:
        existing_type = db.query(ProblemType).filter(
            ProblemType.name == type_data.name,
            ProblemType.id != type_id
        ).first()
        if existing_type:
            raise HTTPException(status_code=400, detail="Problem type name already exists")
        problem_type.name = type_data.name

    if type_data.description is not None:
        problem_type.description = type_data.description

    db.commit()
    db.refresh(problem_type)

    return problem_type


@router.delete("/problem-types/{type_id}")
async def delete_problem_type(
    type_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除问题类型 (需要管理员权限)"""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete problem types")

    problem_type = db.query(ProblemType).filter(ProblemType.id == type_id).first()

    if not problem_type:
        raise HTTPException(status_code=404, detail="Problem type not found")

    db.delete(problem_type)
    db.commit()

    return {"message": "Problem type deleted successfully"}


# ============================================================================
# Site Level Configurations
# ============================================================================

@router.get("/site-level-configs", response_model=List[SiteLevelConfigResponse])
async def get_site_level_configs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有站点级别配置"""
    configs = db.query(SiteLevelConfig).all()
    return configs


@router.post("/site-level-configs", response_model=SiteLevelConfigResponse, status_code=201)
async def create_site_level_config(
    config_data: SiteLevelConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建站点级别配置 (需要管理员权限)"""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create site level configs")

    # 检查名称是否已存在
    existing_config = db.query(SiteLevelConfig).filter(
        SiteLevelConfig.name == config_data.name
    ).first()
    if existing_config:
        raise HTTPException(status_code=400, detail="Site level config name already exists")

    new_config = SiteLevelConfig(
        id=str(uuid.uuid4()),
        name=config_data.name,
        description=config_data.description,
        sla_multiplier=config_data.sla_multiplier
    )

    db.add(new_config)
    db.commit()
    db.refresh(new_config)

    return new_config


@router.put("/site-level-configs/{config_id}", response_model=SiteLevelConfigResponse)
async def update_site_level_config(
    config_id: str,
    config_data: SiteLevelConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新站点级别配置 (需要管理员权限)"""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update site level configs")

    config = db.query(SiteLevelConfig).filter(SiteLevelConfig.id == config_id).first()

    if not config:
        raise HTTPException(status_code=404, detail="Site level config not found")

    # 更新字段
    if config_data.name is not None:
        existing_config = db.query(SiteLevelConfig).filter(
            SiteLevelConfig.name == config_data.name,
            SiteLevelConfig.id != config_id
        ).first()
        if existing_config:
            raise HTTPException(status_code=400, detail="Site level config name already exists")
        config.name = config_data.name

    if config_data.description is not None:
        config.description = config_data.description

    if config_data.sla_multiplier is not None:
        config.sla_multiplier = config_data.sla_multiplier

    db.commit()
    db.refresh(config)

    return config


@router.delete("/site-level-configs/{config_id}")
async def delete_site_level_config(
    config_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除站点级别配置 (需要管理员权限)"""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete site level configs")

    config = db.query(SiteLevelConfig).filter(SiteLevelConfig.id == config_id).first()

    if not config:
        raise HTTPException(status_code=404, detail="Site level config not found")

    db.delete(config)
    db.commit()

    return {"message": "Site level config deleted successfully"}
