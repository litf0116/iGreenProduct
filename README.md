# iGreen+ EV Charging Station Maintenance System

统一的充电桩维护工单管理系统，包含工程师移动APP和管理员派单系统。

## 项目结构

```
iGreenProduct/
├── backend/                    # 统一后端服务 (FastAPI)
│   ├── app/
│   │   ├── api/               # API路由端点
│   │   ├── core/              # 核心配置和数据库
│   │   ├── models/            # SQLAlchemy数据库模型
│   │   ├── schemas/           # Pydantic数据模式
│   │   └── utils/             # 工具函数
│   ├── scripts/               # 数据库初始化脚本
│   ├── main.py               # 应用入口
│   └── requirements.txt      # Python依赖
│
├── iGreenApp/                 # 工程师移动APP (React + Vite)
│   └── src/
│       └── lib/api.ts        # 后端API客户端
│
└── iGreenticketing/           # 管理员派单系统 (React + Vite)
    └── src/
        └── lib/api.ts        # 后端API客户端
```

## 快速开始

### 1. 后端设置

```bash
# 进入后端目录
cd backend

# 安装Python依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接信息

# 初始化数据库
python scripts/init_db.py

# 启动后端服务
python main.py
# 或使用uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

后端将在 http://localhost:8000 启动
- API文档: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 2. 前端设置 - iGreenApp (工程师APP)

```bash
cd iGreenApp

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置后端API地址

# 启动开发服务器
npm run dev
```

### 3. 前端设置 - iGreenticketing (管理员系统)

```bash
cd iGreenticketing

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置后端API地址

# 启动开发服务器
npm run dev
```

## 默认用户

数据库初始化后会创建以下用户：

| 用户名 | 密码 | 角色 | 用途 |
|--------|------|------|------|
| admin | admin123 | 管理员 | 系统管理 |
| engineer | engineer123 | 工程师 | 工程师APP登录 |
| manager | manager123 | 经理 | 管理员系统登录 |

**重要：生产环境部署时请立即修改这些默认密码！**

## 数据库配置

### 开发环境 (SQLite)

在 `backend/.env` 中设置：
```env
DATABASE_TYPE=sqlite
```

### 生产环境 (MySQL)

1. 创建MySQL数据库：
```sql
CREATE DATABASE igreen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'igreen_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON igreen_db.* TO 'igreen_user'@'localhost';
FLUSH PRIVILEGES;
```

2. 在 `backend/.env` 中配置：
```env
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=igreen_user
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=igreen_db
```

## 技术栈

### 后端
- **FastAPI**: 现代化Python Web框架
- **SQLAlchemy**: ORM数据库工具
- **Pydantic**: 数据验证和序列化
- **MySQL/SQLite**: 数据库
- **JWT**: 身份认证

### 前端
- **React**: UI框架
- **TypeScript**: 类型安全
- **Vite**: 构建工具
- **Tailwind CSS**: 样式框架

## 主要功能

### 工程师APP (iGreenApp)
- 📱 工单查看和接单
- ✅ 按步骤完成维护任务
- 📸 上传照片和位置信息
- 👤 人脸识别验证
- 📝 填写维护报告

### 管理员系统 (iGreenticketing)
- 🎫 创建和分配工单
- 👥 用户和分组管理
- 🏢 站点管理
- 📋 模板管理
- 📊 工单状态监控
- ⚙️ 系统配置

## 部署

### 后端部署

```bash
# 使用Gunicorn部署
pip install gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 前端部署

```bash
# 构建生产版本
npm run build

# 部署 dist/ 目录到Web服务器
# 推荐使用 Nginx 或 Apache
```

## 环境变量

### 后端 (backend/.env)
```env
# 应用配置
APP_NAME=iGreen+ Unified Backend
DEBUG=False

# 数据库 (MySQL)
DATABASE_TYPE=mysql
DATABASE_HOST=your_mysql_host
DATABASE_PORT=3306
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=igreen_db

# 安全
SECRET_KEY=your-very-strong-random-secret-key

# CORS (前端URL)
ALLOWED_ORIGINS=https://app.yourdomain.com,https://admin.yourdomain.com
```

### 前端 (.env)
```env
# 后端API地址
VITE_API_URL=https://api.yourdomain.com
```

## API文档

启动后端后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 安全注意事项

1. ✅ 修改默认密码
2. ✅ 使用强随机SECRET_KEY
3. ✅ 生产环境使用HTTPS
4. ✅ 配置防火墙规则
5. ✅ 定期备份数据库
6. ✅ 使用环境变量存储敏感信息
7. ✅ 限制CORS来源

## 故障排除

### 后端无法启动
- 检查Python版本 (需要3.8+)
- 确认所有依赖已安装
- 检查.env配置是否正确
- 查看数据库连接是否正常

### 前端无法连接后端
- 检查VITE_API_URL配置
- 确认后端服务正在运行
- 检查CORS配置
- 查看浏览器控制台错误

### 数据库错误
- 确认数据库服务运行中
- 检查连接凭据
- 运行 `python scripts/init_db.py` 初始化
- 查看数据库日志

## 开发指南

### 添加新API端点
1. 在 `backend/app/models/` 添加数据模型
2. 在 `backend/app/schemas/` 添加Pydantic模式
3. 在 `backend/app/api/` 添加路由
4. 在 `main.py` 中注册路由

### 修改前端API调用
编辑 `src/lib/api.ts` 文件添加新的API方法

## 许可证

[添加您的许可证信息]

## 支持

如有问题，请联系技术支持或创建issue。
