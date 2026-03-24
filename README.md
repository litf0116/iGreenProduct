# iGreen+ EV Charging Station Maintenance System

[![Gitee CI](https://gitee.com/litengfei/i-green-product/badge/pipe.svg?theme=dark)](https://gitee.com/litengfei/i-green-product/pipelines)
[![GitHub CI](https://github.com/litf0116/iGreenProduct/actions/workflows/ci.yml/badge.svg)](https://github.com/litf0116/iGreenProduct/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

统一的充电桩维护工单管理系统，包含工程师移动APP和管理员派单系统。

## 项目结构

```
iGreenProduct/
├── igreen-backend/              # 后端服务 (Spring Boot 3 + Java 17)
│   ├── src/main/java/com/igreen/
│   │   ├── domain/
│   │   │   ├── controller/      # REST API 控制器
│   │   │   ├── service/         # 业务逻辑层
│   │   │   ├── mapper/          # MyBatis-Plus 数据访问
│   │   │   ├── entity/          # JPA 实体
│   │   │   └── dto/             # 数据传输对象
│   │   └── common/
│   │       ├── config/          # 配置类 (Security, CORS)
│   │       ├── exception/       # 异常处理
│   │       └── result/          # 统一响应封装
│   └── init-scripts/            # 数据库初始化脚本
│
├── igreen-front/                # 管理员派单系统 (React + Vite + TypeScript)
│   └── src/
│       ├── components/          # React 组件
│       ├── lib/                 # API 客户端、类型定义
│       └── e2e/                 # Playwright E2E 测试
│
├── iGreenApp/                   # 工程师移动APP (React + Capacitor)
│   └── src/
│       ├── components/          # React 组件
│       └── lib/                 # API 客户端
│
└── tests/                       # 集成测试脚本
    ├── backend/                 # 后端 API 测试
    └── integration/             # 端到端测试
```

## 快速开始

### 1. 后端设置 (Spring Boot)

```bash
# 进入后端目录
cd igreen-backend

# 配置环境变量
cp .env.example .env

# 启动后端服务 (开发模式)
mvn spring-boot:run

# 或者使用 Makefile
make dev
```

后端将在 http://localhost:8080 启动
- API文档: http://localhost:8080/doc.html (Knife4j)
- Swagger UI: http://localhost:8080/swagger-ui.html

### 2. 前端设置 - igreen-front (管理员系统)

```bash
cd igreen-front

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env

# 启动开发服务器
pnpm dev
```

### 3. 前端设置 - iGreenApp (工程师APP)

```bash
cd iGreenApp

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 启动开发服务器
npm run dev

# 构建 Android APK
npm run build:android
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
- **Spring Boot 3.2**: 现代化 Java Web 框架
- **Java 17**: LTS 版本
- **Spring Security**: JWT 身份认证
- **MyBatis-Plus**: ORM 数据访问
- **MySQL 8.0**: 生产数据库
- **H2**: 测试内存数据库
- **Knife4j**: API 文档增强

### 前端 (igreen-front)
- **React 18**: UI 框架
- **TypeScript**: 类型安全
- **Vite 6**: 构建工具
- **Tailwind CSS**: 样式框架
- **Radix UI / shadcn**: UI 组件库
- **Zustand**: 状态管理
- **Vitest + Playwright**: 测试框架

### 移动端 (iGreenApp)
- **React 18**: UI 框架
- **Capacitor 6**: 跨平台原生包装
- **Vite 6**: 构建工具
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
cd igreen-backend

# 构建 JAR 包
mvn clean package -DskipTests

# 运行
java -jar target/igreen-backend-1.0.0.jar --spring.profiles.active=prod

# 或使用 Docker
docker-compose up -d
```

### 前端部署

```bash
cd igreen-front

# 构建生产版本
pnpm build

# 部署 dist/ 目录到 Web 服务器
# 推荐使用 Nginx
```

### 移动端打包

```bash
cd iGreenApp

# 构建 Android APK
npm run build:android
cd android && ./gradlew assembleDebug

# 构建 Release 版本
npm run build:release
cd android && ./gradlew assembleRelease
```

## 环境变量

### 后端 (igreen-backend/.env)
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=igreen_db
DB_USER=igreen_user
DB_PASSWORD=your_secure_password

# JWT 配置
JWT_SECRET=your-very-strong-random-secret-key
JWT_EXPIRATION=86400000

# 应用配置
SERVER_PORT=8080
```

### 前端 (.env)
```env
# 后端API地址
VITE_API_URL=https://api.yourdomain.com
```

## API文档

启动后端后访问：
- Knife4j 文档: http://localhost:8080/doc.html
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

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

### 添加新 API 端点
1. 在 `igreen-backend/src/main/java/com/igreen/domain/entity/` 添加实体类
2. 在 `igreen-backend/src/main/java/com/igreen/domain/dto/` 添加 DTO
3. 在 `igreen-backend/src/main/java/com/igreen/domain/mapper/` 添加 Mapper
4. 在 `igreen-backend/src/main/java/com/igreen/domain/service/` 添加 Service
5. 在 `igreen-backend/src/main/java/com/igreen/domain/controller/` 添加 Controller

### 修改前端 API 调用
编辑 `src/lib/api.ts` 文件添加新的 API 方法

### 运行测试
```bash
# 后端测试
cd igreen-backend && mvn test

# 前端单元测试
cd igreen-front && pnpm test:run

# 前端 E2E 测试
cd igreen-front && pnpm test:e2e
```

### Git 分支命名规范
创建分支时添加日期前缀: `YYYYMMDD_description`
例如: `20250324_add-user-auth`

## CI/CD

项目使用 Gitee CI/CD 和 GitHub Actions 双平台持续集成：

| 平台 | 地址 | 用途 |
|------|------|------|
| Gitee CI | [流水线](https://gitee.com/litengfei/i-green-product/pipelines) | 主要 CI/CD |
| GitHub Actions | [Actions](https://github.com/litf0116/iGreenProduct/actions) | 备份 CI/CD |

## 许可证

[添加您的许可证信息]

## 支持

如有问题，请联系技术支持或创建issue。

## CI/CD Status

Gitee CI/CD service enabled on 2026-03-24.
