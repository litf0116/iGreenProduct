"""
Application Configuration
应用配置文件 - 从环境变量加载配置
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """应用程序设置"""

    # Application Configuration
    APP_NAME: str = "iGreen+ Unified Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database Configuration
    # MySQL数据库连接配置
    # 注意: 请根据实际部署环境修改以下数据库连接参数
    DATABASE_HOST: str = "localhost"  # 数据库主机地址
    DATABASE_PORT: int = 3306  # 数据库端口
    DATABASE_USER: str = "igreen_user"  # 数据库用户名
    DATABASE_PASSWORD: str = ""  # 数据库密码（请在.env文件中设置）
    DATABASE_NAME: str = "igreen_db"  # 数据库名称

    # Database Type (mysql or sqlite)
    # 开发环境可以使用sqlite，生产环境建议使用mysql
    DATABASE_TYPE: str = "sqlite"  # 改为 "mysql" 用于生产环境

    @property
    def DATABASE_URL(self) -> str:
        """构建数据库连接URL"""
        if self.DATABASE_TYPE == "sqlite":
            return "sqlite:///./igreen.db"
        else:
            return f"mysql+pymysql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}?charset=utf8mb4"

    # JWT Configuration
    # 注意: 生产环境请使用强密钥并通过环境变量设置
    SECRET_KEY: str = "your-secret-key-change-in-production-use-strong-random-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24小时

    # File Upload Configuration
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10485760  # 10MB
    ALLOWED_IMAGE_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

    # CORS Configuration
    # 允许的前端源地址
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"

    @property
    def ALLOWED_ORIGINS_LIST(self) -> List[str]:
        """将CORS origins转换为列表"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    # Face Recognition (optional)
    # 人脸识别功能配置（可选）
    FACE_RECOGNITION_API_URL: str = ""
    FACE_RECOGNITION_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


# 创建全局设置实例
settings = Settings()
