# iGreen+ Unified Backend

统一的后端服务，支持：
- 工程师移动APP (iGreenApp)
- 管理员派单系统 (iGreenticketing)

## 技术栈

- **FastAPI**: 现代化的Python Web框架
- **SQLAlchemy**: ORM数据库工具
- **Pydantic**: 数据验证和序列化
- **MySQL/SQLite**: 数据库支持

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并根据实际情况修改配置：

```bash
cp .env.example .env
```

**重要配置项：**
- `DATABASE_TYPE`: 选择 `sqlite` (开发) 或 `mysql` (生产)
- `DATABASE_HOST/PORT/USER/PASSWORD/NAME`: MySQL数据库连接信息
- `SECRET_KEY`: JWT密钥（生产环境必须修改）
- `ALLOWED_ORIGINS`: 允许的前端源地址

### 3. 初始化数据库

```bash
python scripts/init_db.py
```

这将创建所有数据库表并插入初始数据。

### 4. 启动服务器

```bash
# 开发模式（带热重载）
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 或者直接运行
python main.py
```

### 5. 访问API文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 数据库配置

### 使用SQLite（开发环境）

在 `.env` 文件中设置：
```
DATABASE_TYPE=sqlite
```

数据库文件将创建为 `igreen.db`

### 使用MySQL（生产环境）

1. 创建数据库：
```sql
CREATE DATABASE igreen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'igreen_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON igreen_db.* TO 'igreen_user'@'localhost';
FLUSH PRIVILEGES;
```

2. 在 `.env` 文件中配置：
```
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=igreen_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=igreen_db
```

## API端点

### 认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册

### 用户管理
- `GET /api/users` - 获取用户列表
- `GET /api/users/{id}` - 获取用户详情
- `POST /api/users` - 创建用户
- `PUT /api/users/{id}` - 更新用户
- `DELETE /api/users/{id}` - 删除用户

### 工单管理
- `GET /api/tickets` - 获取工单列表
- `GET /api/tickets/{id}` - 获取工单详情
- `POST /api/tickets` - 创建工单
- `PUT /api/tickets/{id}` - 更新工单
- `DELETE /api/tickets/{id}` - 删除工单

### 模板管理
- `GET /api/templates` - 获取模板列表
- `GET /api/templates/{id}` - 获取模板详情
- `POST /api/templates` - 创建模板
- `PUT /api/templates/{id}` - 更新模板
- `DELETE /api/templates/{id}` - 删除模板

### 其他
- `GET /api/groups` - 分组管理
- `GET /api/sites` - 站点管理
- `GET /api/configs` - 配置管理
- `POST /api/files/upload` - 文件上传

## 项目结构

```
backend/
├── app/
│   ├── api/           # API路由
│   ├── core/          # 核心配置
│   ├── models/        # SQLAlchemy模型
│   ├── schemas/       # Pydantic模式
│   └── utils/         # 工具函数
├── scripts/           # 脚本文件
├── uploads/           # 上传文件目录
├── main.py           # 应用入口
├── requirements.txt  # Python依赖
└── .env              # 环境配置
```

## 部署说明

1. 确保已安装MySQL数据库
2. 创建数据库并配置用户权限
3. 修改 `.env` 文件中的数据库配置
4. 运行初始化脚本
5. 使用生产级WSGI服务器（如Gunicorn）启动应用

```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 注意事项

- 生产环境务必修改 `SECRET_KEY`
- 生产环境使用MySQL而非SQLite
- 定期备份数据库
- 配置防火墙和安全规则
- 使用HTTPS协议
