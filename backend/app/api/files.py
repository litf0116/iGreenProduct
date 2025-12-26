"""
Files API Routes
文件上传相关的API路由
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile, Form
from sqlalchemy.orm import Session
import uuid
import os
import aiofiles
from pathlib import Path

from app.core.database import get_db
from app.models.user import User
from app.models.file import File
from app.schemas.file import FileUploadResponse
from app.utils.dependencies import get_current_active_user
from app.core.config import settings

router = APIRouter(prefix="/files", tags=["Files"])


# 确保上传目录存在
UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    field_type: str = Form(None, description="Field type (photo, signature, etc.)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    上传文件

    Args:
        file: 上传的文件
        field_type: 字段类型
        db: 数据库会话
        current_user: 当前用户

    Returns:
        FileUploadResponse: 文件信息
    """
    # 检查文件大小
    file.file.seek(0, 2)  # 移动到文件末尾
    file_size = file.file.tell()  # 获取文件大小
    file.file.seek(0)  # 重置到文件开头

    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed size ({settings.MAX_FILE_SIZE} bytes)"
        )

    # 生成唯一文件名
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{file_id}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    # 保存文件
    try:
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    # 创建文件记录
    file_url = f"/{settings.UPLOAD_DIR}/{unique_filename}"

    new_file = File(
        id=file_id,
        name=file.filename,
        url=file_url,
        type=file.content_type or "application/octet-stream",
        size=file_size,
        field_type=field_type
    )

    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    return FileUploadResponse(
        id=new_file.id,
        url=new_file.url,
        name=new_file.name,
        type=new_file.type,
        size=new_file.size
    )


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    删除文件

    Args:
        file_id: 文件ID
        db: 数据库会话
        current_user: 当前用户

    Returns:
        dict: 成功消息
    """
    file_record = db.query(File).filter(File.id == file_id).first()

    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    # 删除物理文件
    file_path = Path(f".{file_record.url}")
    if file_path.exists():
        try:
            file_path.unlink()
        except Exception as e:
            # 记录错误但继续删除数据库记录
            print(f"Error deleting physical file: {str(e)}")

    # 删除数据库记录
    db.delete(file_record)
    db.commit()

    return {"message": "File deleted successfully"}


@router.post("/face-recognition/verify")
async def verify_face(
    image: UploadFile = FastAPIFile(...),
    user_id: str = Form(None, description="User ID to match against"),
    current_user: User = Depends(get_current_active_user)
):
    """
    人脸识别验证

    注意: 这是一个模拟实现。在生产环境中，应该集成真实的人脸识别服务。

    Args:
        image: 人脸图片
        user_id: 要匹配的用户ID (可选)
        current_user: 当前用户

    Returns:
        dict: 验证结果
    """
    # 检查文件类型
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # TODO: 集成实际的人脸识别API
    # 这里是模拟实现
    # 在实际应用中，应该:
    # 1. 将图片发送到人脸识别服务 (如AWS Rekognition, Azure Face API等)
    # 2. 如果提供了user_id，与该用户的注册人脸进行比对
    # 3. 返回真实的验证结果和置信度

    return {
        "verified": True,
        "confidence": 0.95,
        "message": "Face verified successfully (mock implementation)"
    }
