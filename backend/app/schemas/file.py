"""
File Schemas
文件相关的数据模型
"""
from pydantic import BaseModel


class FileUploadResponse(BaseModel):
    """文件上传响应"""
    id: str
    url: str
    name: str
    type: str
    size: int

    class Config:
        from_attributes = True
