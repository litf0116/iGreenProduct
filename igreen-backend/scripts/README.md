# iGreenProduct 后端脚本目录

## 📁 目录结构

```
igreen-backend/scripts/
├── jar-control.sh           # JAR包生命周期管理脚本 ⭐
├── deploy-to-server.sh      # 一键完整部署脚本
├── quick-update.sh          # 快速JAR包更新脚本
├── full-deploy.sh           # 完整自动化部署流程
├── drone-deploy.sh          # CI/CD流水线部署脚本
├── api_test.sh              # API接口测试脚本
├── e2e_test.sh              # 端到端测试脚本
├── engineer_test.sh         # 工程师功能测试
├── groups_test.sh           # 用户组管理测试
├── templates_test.sh        # 模板管理测试
├── tickets_test.sh          # 工单管理测试
├── users_test.sh            # 用户管理测试
├── test_site_api.sh         # 站点API测试脚本
└── README.md               # 使用说明
```

## 🚀 部署脚本使用指南

### 1. JAR包控制脚本 (`jar-control.sh`) ⭐

**用途**: Spring Boot JAR包的完整生命周期管理

```bash
# 基本操作
./jar-control.sh start          # 启动应用
./jar-control.sh stop           # 停止应用
./jar-control.sh restart        # 重启应用
./jar-control.sh status         # 查看应用状态

# 日志管理
./jar-control.sh logs           # 查看最近50行日志
./jar-control.sh logs 100       # 查看最近100行日志
./jar-control.sh logs-follow    # 实时查看日志
./jar-control.sh clean-logs     # 清理日志文件

# 系统监控
./jar-control.sh resources      # 查看资源使用情况

# 帮助信息
./jar-control.sh help           # 显示详细帮助
```

**核心特性**:
- ✅ 优雅启动/停止 (支持超时控制)
- ✅ 健康检查自动验证
- ✅ 详细的状态监控
- ✅ 实时日志查看
- ✅ 系统资源监控
- ✅ PID文件管理

### 2. 快速更新脚本 (`quick-update.sh`)

**用途**: 日常代码更新，快速部署到已配置的环境

```bash
# 完整更新 (编译+上传+重启)
./igreen-backend/scripts/quick-update.sh

# 仅编译JAR包
./igreen-backend/scripts/quick-update.sh build-only

# 编译并上传JAR包
./igreen-backend/scripts/quick-update.sh upload-only

# 仅重启远程服务
./igreen-backend/scripts/quick-update.sh restart-only

# 查看帮助信息
./igreen-backend/scripts/quick-update.sh --help
```

**适用场景**:
- ✅ 代码修改后的快速部署
- ✅ Bug修复上线
- ✅ 小功能迭代
- ✅ 配置参数调整

### 2. 完整部署脚本 (`deploy-to-server.sh`)

**用途**: 完整的生产环境部署，包括环境配置

```bash
# 执行完整部署
./igreen-backend/scripts/deploy-to-server.sh
```

**执行流程**:
1. 环境检查 (Java, Maven, MySQL, Nginx)
2. 数据库连接验证
3. 目录结构创建
4. 应用编译打包
5. systemd服务配置
6. Nginx反向代理配置
7. 部署验证测试

**适用场景**:
- 🏗️ 首次环境部署
- 🔧 服务器配置变更
- 🗄️ 数据库结构变更
- 🌐 Nginx配置修改

### 3. CI/CD部署脚本 (`drone-deploy.sh`)

**用途**: 在Drone CI/CD流水线中使用

```bash
# 在Drone CI中自动执行
./igreen-backend/scripts/drone-deploy.sh
```

**功能特性**:
- 条件分支部署 (仅main/master分支)
- Docker镜像构建和推送
- SSH远程服务器部署
- 支持回滚操作

## 🧪 测试脚本使用指南

### API测试脚本

```bash
# 用户管理测试
./igreen-backend/scripts/users_test.sh

# 工单管理测试
./igreen-backend/scripts/tickets_test.sh

# 用户组管理测试
./igreen-backend/scripts/groups_test.sh

# 模板管理测试
./igreen-backend/scripts/templates_test.sh

# 工程师功能测试
./igreen-backend/scripts/engineer_test.sh

# 端到端集成测试
./igreen-backend/scripts/e2e_test.sh
```

### 站点API测试

```bash
# 站点相关API测试
./igreen-backend/scripts/test_site_api.sh

# 通用API测试
./igreen-backend/scripts/api_test.sh
```

## ⚙️ 配置说明

### 服务器配置

所有部署脚本都使用以下默认配置：

```bash
# 服务器信息
REMOTE_HOST="180.188.45.250"
REMOTE_USER="root"
REMOTE_PATH="/opt/igreen"

# 数据库配置
DB_HOST="localhost"
DB_PORT=3306
DB_NAME="igreen_db"
DB_USERNAME="igreen_db"
DB_PASSWORD="knS8jexaAnByhpj4"

# 应用配置
APP_PORT=8080
UPLOAD_DIR="/opt/igreen/uploads"
JWT_SECRET="iGreenProduct2025SecureJWTKeyForProductionEnvironment"
```

### 自定义配置

如需修改配置，请编辑相应脚本文件开头的变量定义。

## 📋 使用前准备

### 1. SSH密钥配置

```bash
# 生成SSH密钥 (如果还没有)
ssh-keygen -t rsa -b 4096

# 复制公钥到服务器
ssh-copy-id root@180.188.45.250

# 测试SSH连接
ssh root@180.188.45.250 "echo 'SSH连接成功'"
```

### 2. 服务器环境要求

- ✅ Java 17+
- ✅ Maven 3.6+
- ✅ MySQL 8.0+
- ✅ Nginx (可选)
- ✅ systemd服务管理器

### 3. 项目目录结构

确保在项目根目录运行脚本：

```
iGreenProduct/
├── igreen-backend/          # 后端项目目录
│   ├── scripts/            # 脚本目录
│   ├── src/                # 源代码
│   ├── target/             # 编译输出
│   └── pom.xml            # Maven配置
└── ...其他文件
```

## 🔍 故障排除

### 常见问题

#### 问题1: SSH连接失败
```bash
# 检查SSH密钥
ls -la ~/.ssh/

# 测试连接
ssh -v root@180.188.45.250
```

#### 问题2: 编译失败
```bash
# 清理并重新编译
cd igreen-backend
mvn clean compile
mvn package -DskipTests
```

#### 问题3: 服务启动失败
```bash
# 检查服务状态
ssh root@180.188.45.250 "sudo systemctl status igreen-backend"

# 查看日志
ssh root@180.188.45.250 "sudo journalctl -u igreen-backend -f"
```

#### 问题4: 数据库连接失败
```bash
# 测试数据库连接
mysql -h localhost -u igreen_db -p'knS8jexaAnByhpj4' -e "SELECT 1;" igreen_db
```

## 📊 脚本状态验证

运行验证脚本检查所有脚本状态：

```bash
# 运行验证脚本
./validate-scripts.sh
```

## 🎯 最佳实践

### 开发环境部署
1. 本地代码修改
2. 运行单元测试
3. 使用 `quick-update.sh` 快速部署
4. 验证功能正常

### 生产环境部署
1. 在测试环境验证
2. 选择业务低峰期
3. 使用 `deploy-to-server.sh` 完整部署
4. 监控服务状态和日志
5. 准备回滚方案

### CI/CD集成
1. 在Drone CI中集成 `drone-deploy.sh`
2. 配置自动触发条件
3. 设置多环境部署
4. 添加自动化测试

---

**📞 技术支持**: 如遇问题，请检查日志并提供错误信息。

**🔄 更新说明**: 脚本会随着项目发展持续更新，建议定期检查最新版本。</content>
<parameter name="filePath">igreen-backend/scripts/README.md