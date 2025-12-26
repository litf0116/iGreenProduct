"""
Template Models
模板相关模型
"""
from sqlalchemy import Column, String, Integer, DateTime, Enum, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class FieldType(str, enum.Enum):
    """字段类型枚举"""
    TEXT = "text"
    NUMBER = "number"
    DATE = "date"
    LOCATION = "location"
    PHOTO = "photo"
    SIGNATURE = "signature"
    FACE_RECOGNITION = "faceRecognition"


class Template(Base):
    """
    模板表
    存储维护工作流程模板
    """
    __tablename__ = "templates"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, comment="模板名称")
    description = Column(Text, nullable=True, comment="模板描述")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False, comment="更新时间")

    # Relationships
    steps = relationship("TemplateStep", back_populates="template", cascade="all, delete-orphan", order_by="TemplateStep.order")
    tickets = relationship("Ticket", back_populates="template")

    def __repr__(self):
        return f"<Template(id={self.id}, name={self.name})>"


class TemplateStep(Base):
    """
    模板步骤表
    存储模板的工作步骤
    """
    __tablename__ = "template_steps"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, comment="步骤名称")
    description = Column(Text, nullable=True, comment="步骤描述")
    order = Column(Integer, nullable=False, comment="步骤顺序")

    # Foreign Keys
    template_id = Column(String(36), ForeignKey("templates.id", ondelete="CASCADE"), nullable=False, comment="所属模板ID")

    # Relationships
    template = relationship("Template", back_populates="steps")
    fields = relationship("TemplateField", back_populates="step", cascade="all, delete-orphan", order_by="TemplateField.id")

    def __repr__(self):
        return f"<TemplateStep(id={self.id}, name={self.name}, order={self.order})>"


class TemplateField(Base):
    """
    模板字段表
    存储步骤中的数据字段
    """
    __tablename__ = "template_fields"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, comment="字段名称")
    type = Column(Enum(FieldType), nullable=False, comment="字段类型")
    required = Column(Boolean, nullable=False, default=False, comment="是否必填")

    # Foreign Keys
    step_id = Column(String(36), ForeignKey("template_steps.id", ondelete="CASCADE"), nullable=False, comment="所属步骤ID")

    # Relationships
    step = relationship("TemplateStep", back_populates="fields")

    def __repr__(self):
        return f"<TemplateField(id={self.id}, name={self.name}, type={self.type})>"
