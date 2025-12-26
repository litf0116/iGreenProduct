"""
Configuration Models
配置相关模型
"""
from sqlalchemy import Column, String, Integer, Enum, Text, Float

from app.core.database import Base
from app.models.ticket import Priority


class SLAConfig(Base):
    """
    SLA配置表
    存储不同优先级的响应和解决时间配置
    """
    __tablename__ = "sla_configs"

    id = Column(String(36), primary_key=True, index=True)
    priority = Column(Enum(Priority), nullable=False, unique=True, comment="优先级")
    response_time = Column(Integer, nullable=False, comment="响应时间(分钟)")
    resolution_time = Column(Integer, nullable=False, comment="解决时间(分钟)")

    def __repr__(self):
        return f"<SLAConfig(priority={self.priority}, response_time={self.response_time}, resolution_time={self.resolution_time})>"


class SiteLevelConfig(Base):
    """
    站点级别配置表
    存储不同站点级别的配置信息(如SLA倍数等)
    """
    __tablename__ = "site_level_configs"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, comment="站点级别名称")
    description = Column(Text, nullable=True, comment="描述")
    sla_multiplier = Column(Float, nullable=False, default=1.0, comment="SLA时间倍数")

    def __repr__(self):
        return f"<SiteLevelConfig(id={self.id}, name={self.name}, sla_multiplier={self.sla_multiplier})>"


class ProblemType(Base):
    """
    问题类型表
    存储可用的问题类型
    """
    __tablename__ = "problem_types"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, comment="问题类型名称")
    description = Column(Text, nullable=True, comment="问题类型描述")

    def __repr__(self):
        return f"<ProblemType(id={self.id}, name={self.name})>"
