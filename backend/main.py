"""
iGreen+ Unified Backend API
统一的后端服务 - 支持工程师APP和管理员派单系统
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import settings
from app.core.database import init_db
from app.api import auth, users, tickets, templates, groups, sites, configs, files


# 创建FastAPI应用实例
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="iGreen+ EV Charging Station Maintenance System - Unified Backend API",
    debug=settings.DEBUG,
)

# 配置CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建上传目录
upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(exist_ok=True, parents=True)

# 挂载静态文件目录 (用于文件上传)
app.mount(f"/{settings.UPLOAD_DIR}", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# 注册路由
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(tickets.router, prefix="/api", tags=["Tickets"])
app.include_router(templates.router, prefix="/api", tags=["Templates"])
app.include_router(groups.router, prefix="/api", tags=["Groups"])
app.include_router(sites.router, prefix="/api", tags=["Sites"])
app.include_router(configs.router, prefix="/api", tags=["Configurations"])
app.include_router(files.router, prefix="/api", tags=["Files"])


@app.on_event("startup")
async def startup_event():
    """
    应用启动时执行的操作
    """
    # 初始化数据库（创建表）
    # 注意: 在生产环境中建议使用Alembic进行数据库迁移
    init_db()
    print(f"✅ {settings.APP_NAME} started successfully!")
    print(f"📊 Database URL: {settings.DATABASE_URL}")
    print(f"🌐 CORS enabled for: {', '.join(settings.ALLOWED_ORIGINS_LIST)}")
    print(f"📁 Upload directory: {settings.UPLOAD_DIR}")


@app.get("/")
async def root():
    """
    根路径 - API信息
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/api/health")
async def health_check():
    """
    健康检查端点
    """
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
