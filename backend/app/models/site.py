"""
Site Model
站点模型
"""
from sqlalchemy import Column, String, DateTime, Enum
from datetime import datetime
import enum

from app.core.database import Base


class SiteStatus(str, enum.Enum):
    """站点状态枚举"""
    ONLINE = "online"
    OFFLINE = "offline"
    UNDER_CONSTRUCTION = "underConstruction"


class Site(Base):
    """
    站点表
    存储EV充电站点信息
    """
    __tablename__ = "sites"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, comment="站点名称")
    address = Column(String(500), nullable=False, comment="站点地址")
    level = Column(String(50), nullable=False, default="normal", comment="站点级别 (normal, vip等)")
    status = Column(Enum(SiteStatus), nullable=False, default=SiteStatus.ONLINE, comment="站点状态")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False, comment="更新时间")

    def __repr__(self):
        return f"<Site(id={self.id}, name={self.name}, level={self.level}, status={self.status})>"
