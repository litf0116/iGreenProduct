# 代理配置说明

本项目支持在本地和远程API代理之间灵活切换，方便开发和调试。

## 快速开始

### 使用本地API代理（默认）
```bash
# 方式1: 使用npm脚本
npm run dev:local

# 方式2: 使用环境变量
PROXY_TARGET=http://127.0.0.1:8089 npm run dev

# 方式3: 使用切换脚本
./switch-proxy.sh local && npm run dev
```

### 使用远程API代理
```bash
# 方式1: 使用npm脚本
npm run dev:remote

# 方式2: 使用环境变量
PROXY_TARGET=http://43.255.212.68:8088 npm run dev

# 方式3: 使用切换脚本
./switch-proxy.sh remote && npm run dev
```

## 代理切换脚本

项目提供了 `switch-proxy.sh` 脚本来管理代理配置：

### 查看当前状态
```bash
./switch-proxy.sh
```

### 切换代理
```bash
# 切换到本地代理
./switch-proxy.sh local

# 切换到远程代理
./switch-proxy.sh remote
```

### 测试API连接
```bash
./switch-proxy.sh test
```

### 查看帮助
```bash
./switch-proxy.sh help
```

## 配置文件说明

### vite.config.ts
- 使用环境变量 `PROXY_TARGET` 来动态设置代理地址
- 默认值为 `http://127.0.0.1:8089`（本地代理）

### .env 文件
- 存储前端应用的API地址配置
- 由 `switch-proxy.sh` 脚本自动管理

### 环境文件
- `.env.local` - 本地开发环境变量
- `.env.remote` - 远程开发环境变量

## 可用的npm脚本

- `npm run dev` - 使用默认代理启动开发服务器
- `npm run dev:local` - 强制使用本地代理启动
- `npm run dev:remote` - 强制使用远程代理启动
- `npm run proxy:local` - 切换到本地代理配置
- `npm run proxy:remote` - 切换到远程代理配置
- `npm run proxy:test` - 测试API连接状态

## 网络配置

| 环境 | 前端地址 | 代理目标 | API地址 |
|------|----------|----------|---------|
| 本地开发 | http://localhost:3100 | http://127.0.0.1:8089 | http://127.0.0.1:8089 |
| 远程开发 | http://localhost:3100 | http://43.255.212.68:8088 | http://43.255.212.68:8088 |

## 故障排除

1. **连接被拒绝 (ECONNREFUSED)**
   - 确认后端服务是否在目标端口运行
   - 使用 `./switch-proxy.sh test` 检查API连接状态

2. **代理不生效**
   - 重启开发服务器使代理配置生效
   - 检查环境变量是否正确设置

3. **端口冲突**
   - 确保端口3100没有被其他进程占用
   - 使用 `lsof -i :3100` 检查端口占用情况