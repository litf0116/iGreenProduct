# iGreenProduct 前端部署指南

## 📁 项目结构

```
iGreenProduct/
├── iGreenApp/                 # 工程师移动APP (无需部署脚本)
│   ├── .env.example          # 环境变量示例
│   └── package.json          # 项目配置
│
└── igreen-front/             # 管理员派单系统
    ├── scripts/              # 部署脚本
    ├── .deploy.env           # 部署配置
    └── .env.example          # 环境变量示例
```

## 🚀 部署脚本使用指南

### iGreenticketing (管理员系统)

#### 自动部署脚本 (`igreen-front/scripts/auto-deploy.sh`) ⭐

**用途**: 完整的生产环境自动化部署

```bash
# 执行完整部署
cd igreen-front
./scripts/auto-deploy.sh
```

**执行流程**:
1. 构建验证 (检查 dist/ 目录)
2. SSH上传构建产物到服务器根路径
3. 远程备份现有部署
4. 替换新版本文件
5. 设置文件权限
6. 重启Nginx服务
7. 验证部署结果

#### 快速更新脚本 (`igreen-front/scripts/quick-update.sh`)

**用途**: 日常代码更新，快速部署到已配置的环境

```bash
cd igreen-front

# 完整更新 (编译+上传+重启)
./scripts/quick-update.sh

# 仅编译构建
./scripts/quick-update.sh build-only

# 编译并上传构建产物
./scripts/quick-update.sh upload-only

# 仅重启远程服务
./scripts/quick-update.sh restart-only

# 查看帮助信息
./scripts/quick-update.sh --help
```

**适用场景**:
- ✅ 代码修改后的快速部署
- ✅ Bug修复上线
- ✅ 小功能迭代
- ✅ 配置参数调整

### iGreenApp (工程师移动APP)

**注意**: iGreenApp 不使用自动部署脚本，需要手动部署或集成到CI/CD流水线中。

手动部署步骤：
```bash
# 1. 构建生产版本
cd iGreenApp
npm run build

# 2. 上传构建产物到服务器
scp -r dist/ root@180.188.45.250:/www/wwwroot/igreen/

# 3. 在服务器上设置权限
ssh root@180.188.45.250
cd /www/wwwroot/igreen
chown -R www-data:www-data dist
chmod -R 755 dist
nginx -t && systemctl reload nginx
```

## ⚙️ 配置说明

### 服务器配置

iGreenticketing部署脚本使用以下默认配置：

```bash
# 服务器信息
REMOTE_HOST="180.188.45.250"
REMOTE_USER="root"
REMOTE_PATH="/www/wwwroot/igreen"

# iGreenticketing部署到根路径 (/)

# Nginx配置
NGINX_CONF="/etc/nginx/sites-available/default"
```

### 环境变量配置

#### iGreenticketing (.env)
```env
# 后端API地址
VITE_API_URL=https://api.igreen.com

# 应用配置
VITE_APP_TITLE=iGreen+ 管理员系统
VITE_APP_VERSION=1.0.0

# 路由配置 (部署到根路径)
VITE_BASE_URL=/
```

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

- ✅ Node.js 16+
- ✅ npm 或 yarn
- ✅ Nginx (已配置)
- ✅ 目录权限 (www-data 用户)

### 3. 项目目录结构

确保在项目根目录运行脚本：

```
iGreenProduct/
├── iGreenApp/                 # 工程师APP项目目录
│   ├── src/                  # 源代码
│   ├── dist/                 # 构建输出
│   └── package.json          # 项目配置
│
└── igreen-front/             # 管理员系统项目目录
    ├── scripts/              # 脚本目录
    ├── src/                  # 源代码
    ├── dist/                 # 构建输出
    └── package.json          # 项目配置
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

#### 问题2: 构建失败
```bash
# 清理缓存重新构建
cd igreen-front
rm -rf node_modules dist
npm install
npm run build
```

#### 问题3: 权限错误
```bash
# 在服务器上检查权限
ssh root@180.188.45.250
ls -la /www/wwwroot/igreen/
chown -R www-data:www-data /www/wwwroot/igreen/
```

#### 问题4: Nginx配置错误
```bash
# 测试配置
ssh root@180.188.45.250
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log
```

## 📊 部署状态验证

### iGreenticketing 验证
```bash
# 检查应用访问
curl -I http://180.188.45.250/

# 检查构建文件
ssh root@180.188.45.250 "ls -la /www/wwwroot/igreen/"
```

### iGreenApp 验证
```bash
# 检查应用访问
curl -I http://180.188.45.250:3000

# 检查构建文件
ssh root@180.188.45.250 "ls -la /www/wwwroot/igreen/dist/"
```

## 🎯 最佳实践

### 开发环境部署
1. 本地代码修改
2. 运行单元测试 (如有)
3. 使用 `quick-update.sh` 快速部署 (仅适用于 iGreenticketing)
4. 验证功能正常

### 生产环境部署
1. 在测试环境验证
2. 选择业务低峰期
3. 使用 `auto-deploy.sh` 完整部署 (仅适用于 iGreenticketing)
4. 监控Nginx日志
5. 准备回滚方案

### CI/CD集成
1. 在CI流水线中集成部署脚本 (仅适用于 iGreenticketing)
2. 配置自动触发条件
3. 设置多环境部署
4. 添加自动化测试

---

**📞 技术支持**: 如遇问题，请检查Nginx日志并提供错误信息。

**🔄 更新说明**: 脚本会随着项目发展持续更新，建议定期检查最新版本。