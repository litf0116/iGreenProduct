
# Ticketing System Development (iGreenticketing)

管理员派单系统 - 充电桩维护工单管理系统

原始设计稿: https://www.figma.com/design/d9KMnq3Mq7eqvnAUoLYFy5/Ticketing-System-Development

## 开发环境运行

安装依赖：
```bash
npm install
```

启动开发服务器：
```bash
npm run dev
```

## 部署说明

### 自动部署

#### 完整部署（推荐）
```bash
# 构建并完整部署到生产环境
./scripts/auto-deploy.sh
```

#### 快速更新
```bash
# 完整更新流程：构建 + 上传 + 重启
./scripts/quick-update.sh

# 仅构建项目
./scripts/quick-update.sh build-only

# 仅上传构建产物
./scripts/quick-update.sh upload-only

# 仅重启服务
./scripts/quick-update.sh restart-only
```

### 手动部署

1. 构建生产版本：
```bash
npm run build
```

2. 验证构建结果：
```bash
ls -la dist/
```

3. 上传到服务器：
```bash
scp -r dist/ root@180.188.45.250:/www/wwwroot/igreen/igreen-front.new
```

4. 在服务器上设置权限并重启Nginx：
```bash
ssh root@180.188.45.250
cd /www/wwwroot/igreen
# 备份现有版本
mkdir -p backup
if [ -d . ]; then
    mkdir -p backup/backup-$(date +%Y%m%d_%H%M%S)
    find . -maxdepth 1 -type f -exec mv {} backup/backup-$(date +%Y%m%d_%H%M%S)/ \;
    find . -maxdepth 1 -type d -name 'assets' -exec mv {} backup/backup-$(date +%Y%m%d_%H%M%S)/ \;
fi
# 部署新版本
mv igreen-front.new/* ./
rm -rf igreen-front.new
chown -R www-data:www-data .
chmod -R 755 .
nginx -t && systemctl reload nginx
```

### 环境配置

复制环境变量配置文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件配置：
- `VITE_API_URL`: 后端API地址

### 部署验证

部署完成后验证：
```bash
curl -I http://180.188.45.250/
```

## 项目结构

```
igreen-front/
├── src/
│   ├── components/     # React组件
│   ├── lib/           # 工具函数和API客户端
│   ├── store/         # 状态管理
│   └── assets/        # 静态资源
├── scripts/           # 部署脚本
├── dist/             # 构建输出目录
└── package.json      # 项目配置
```

## 测试

运行测试套件：
```bash
# 运行所有测试
npm run test:all

# 运行单元测试
npm run test:run

# 运行UI测试
npm run test:ui

# 运行端到端测试
npm run test:e2e
```