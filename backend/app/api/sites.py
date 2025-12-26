"""
Sites API Routes
站点管理相关的API路由
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.user import User
from app.models.site import Site
from app.schemas.site import SiteCreate, SiteUpdate, SiteResponse
from app.utils.dependencies import get_current_active_user

router = APIRouter(prefix="/sites", tags=["Sites"])


@router.get("", response_model=List[SiteResponse])
async def get_sites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有站点"""
    sites = db.query(Site).all()
    return sites


@router.get("/{site_id}", response_model=SiteResponse)
async def get_site(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取指定站点"""
    site = db.query(Site).filter(Site.id == site_id).first()

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    return site


@router.post("", response_model=SiteResponse, status_code=201)
async def create_site(
    site_data: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建新站点 (需要管理员或经理权限)"""
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # 检查站点名是否已存在
    existing_site = db.query(Site).filter(Site.name == site_data.name).first()
    if existing_site:
        raise HTTPException(status_code=400, detail="Site name already exists")

    new_site = Site(
        id=str(uuid.uuid4()),
        name=site_data.name,
        address=site_data.address,
        level=site_data.level,
        status=site_data.status
    )

    db.add(new_site)
    db.commit()
    db.refresh(new_site)

    return new_site


@router.put("/{site_id}", response_model=SiteResponse)
async def update_site(
    site_id: str,
    site_data: SiteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新站点 (需要管理员或经理权限)"""
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    site = db.query(Site).filter(Site.id == site_id).first()

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # 更新字段
    if site_data.name is not None:
        existing_site = db.query(Site).filter(
            Site.name == site_data.name,
            Site.id != site_id
        ).first()
        if existing_site:
            raise HTTPException(status_code=400, detail="Site name already exists")
        site.name = site_data.name

    if site_data.address is not None:
        site.address = site_data.address

    if site_data.level is not None:
        site.level = site_data.level

    if site_data.status is not None:
        site.status = site_data.status

    db.commit()
    db.refresh(site)

    return site


@router.delete("/{site_id}")
async def delete_site(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除站点 (需要管理员权限)"""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete sites")

    site = db.query(Site).filter(Site.id == site_id).first()

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    db.delete(site)
    db.commit()

    return {"message": "Site deleted successfully"}
