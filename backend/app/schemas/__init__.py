"""
Pydantic Schemas
用于请求和响应的数据模型
"""
from app.schemas.user import (
    UserBase, UserCreate, UserUpdate, UserResponse, UserLogin, UserRegister
)
from app.schemas.group import GroupBase, GroupCreate, GroupUpdate, GroupResponse
from app.schemas.site import SiteBase, SiteCreate, SiteUpdate, SiteResponse
from app.schemas.template import (
    TemplateFieldBase, TemplateFieldCreate, TemplateFieldResponse,
    TemplateStepBase, TemplateStepCreate, TemplateStepResponse,
    TemplateBase, TemplateCreate, TemplateUpdate, TemplateResponse
)
from app.schemas.ticket import (
    TicketCommentBase, TicketCommentCreate, TicketCommentResponse,
    TicketBase, TicketCreate, TicketUpdate, TicketResponse,
    TicketAccept, TicketDecline, TicketCancel
)
from app.schemas.sla_config import SLAConfigBase, SLAConfigCreate, SLAConfigResponse
from app.schemas.problem_type import ProblemTypeBase, ProblemTypeCreate, ProblemTypeUpdate, ProblemTypeResponse
from app.schemas.site_level_config import SiteLevelConfigBase, SiteLevelConfigCreate, SiteLevelConfigUpdate, SiteLevelConfigResponse
from app.schemas.file import FileUploadResponse
from app.schemas.auth import Token, TokenData

__all__ = [
    # User
    "UserBase", "UserCreate", "UserUpdate", "UserResponse", "UserLogin", "UserRegister",
    # Group
    "GroupBase", "GroupCreate", "GroupUpdate", "GroupResponse",
    # Site
    "SiteBase", "SiteCreate", "SiteUpdate", "SiteResponse",
    # Template
    "TemplateFieldBase", "TemplateFieldCreate", "TemplateFieldResponse",
    "TemplateStepBase", "TemplateStepCreate", "TemplateStepResponse",
    "TemplateBase", "TemplateCreate", "TemplateUpdate", "TemplateResponse",
    # Ticket
    "TicketCommentBase", "TicketCommentCreate", "TicketCommentResponse",
    "TicketBase", "TicketCreate", "TicketUpdate", "TicketResponse",
    "TicketAccept", "TicketDecline", "TicketCancel",
    # SLA
    "SLAConfigBase", "SLAConfigCreate", "SLAConfigResponse",
    # Problem Type
    "ProblemTypeBase", "ProblemTypeCreate", "ProblemTypeUpdate", "ProblemTypeResponse",
    # Site Level Config
    "SiteLevelConfigBase", "SiteLevelConfigCreate", "SiteLevelConfigUpdate", "SiteLevelConfigResponse",
    # File
    "FileUploadResponse",
    # Auth
    "Token", "TokenData",
]
