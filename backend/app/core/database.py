"""
数据库连接和会话管理
Database connection and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings

# 创建数据库引擎
# 连接参数说明:
# - pool_pre_ping: 在使用连接前先检查连接是否有效
# - pool_recycle: 连接在池中的最大生存时间(秒)
# - echo: 是否打印SQL语句(开发环境建议开启)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DEBUG,
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类，所有ORM模型都将继承此类
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    数据库会话依赖注入
    Database session dependency for FastAPI

    使用方法:
    @app.get("/")
    def read_root(db: Session = Depends(get_db)):
        # db session可以在这里使用
        pass
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    初始化数据库
    创建所有表

    注意: 在生产环境中建议使用Alembic进行数据库迁移
    """
    Base.metadata.create_all(bind=engine)
