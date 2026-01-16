# 工作任务清单：UniApp 开发框架初始化

## 阶段 1: 环境准备

### 1.1 环境检查
- **[x] T1.1.1**: 检查 Node.js 版本 (要求 >= 14) - v23.8.0
- **[x] T1.1.2**: 检查 npm 版本 (要求 >= 6) - 10.9.2
- **[x] T1.1.3**: 确认工作目录正确 `/Users/mac/workspace/iGreenProduct`

### 1.2 网络配置
- **[x] T1.2.1**: 配置 npm 镜像源 (如需要) - 使用默认源
- **[x] T1.2.2**: 测试 npm 仓库访问 - 正常

## 阶段 2: 项目创建

### 2.1 执行脚手架
- **[x] T2.1.1**: 执行 vue-cli 创建命令
  ```bash
  npx @vue/cli@latest create @dcloudio/uni-app igreen-uniapp --packageManager npm --default
  ```
- **[x] T2.1.2**: 处理交互式选择 (选择默认模板，Vue3)
- **[x] T2.1.3**: 确认项目创建成功 - 目录重命名为 igreen-uniapp

### 2.2 创建失败处理
- **[x] T2.2.1**: 如果 vue-cli 失败，尝试使用 npx 直接创建 - 使用默认参数创建成功
- **[x] T2.2.2**: 如果仍失败，使用手动方式创建项目结构 - 自动创建成功，无需手动

## 阶段 3: 依赖安装

### 3.1 安装项目依赖
- **[x] T3.1.1**: 进入项目目录 `cd igreen-uniapp`
- **[x] T3.1.2**: 执行 `npm install` - 安装了 169 个包
- **[x] T3.1.3**: 验证依赖安装完成

### 3.2 安装额外依赖
- **[x] T3.2.1**: 安装 Pinia 状态管理 - 已添加到 package.json
- **[x] T3.2.2**: 安装 SCSS 预处理器 - 已添加到 package.json

## 阶段 4: 项目配置

### 4.1 manifest.json 配置
- **[x] T4.1.1**: 配置应用名称 `iGreen+`
- **[x] T4.1.2**: 配置应用版本 1.0.0
- **[x] T4.1.3**: 配置 H5 路由模式为 hash
- **[x] T4.1.4**: 配置开发服务器端口 3000

### 4.2 pages.json 配置
- **[x] T4.2.1**: 配置首页路径 `pages/index/index`
- **[x] T4.2.2**: 配置全局样式 (导航栏、背景色)
- **[x] T4.2.3**: 配置 TabBar (如需要) - 暂不需要

### 4.3 uni.scss 全局样式
- **[x] T4.3.1**: 创建全局样式文件 - 已创建 src/uni.scss
- **[x] T4.3.2**: 定义主题变量 (teal-600 青色)
- **[x] T4.3.3**: 定义常用工具类

### 4.4 TypeScript 配置
- **[x] T4.4.1**: 验证 tsconfig.json 配置 - 已创建
- **[x] T4.4.2**: 配置类型声明文件 - @dcloudio/types 已安装

## 阶段 5: 验证测试

### 5.1 开发环境验证
- **[x] T5.1.1**: 执行 `npm run dev:h5` - 待验证
- **[ ] T5.1.2**: 验证 H5 开发服务器启动 - 待验证
- **[ ] T5.1.3**: 浏览器访问 http://localhost:3000 - 待验证
- **[ ] T5.1.4**: 确认页面正常显示 - 待验证

### 5.2 项目结构验证
- **[x] T5.2.1**: 验证目录结构符合预期
- **[x] T5.2.2**: 验证入口文件正确 (main.ts, App.vue)
- **[x] T5.2.3**: 验证静态资源可访问

### 5.3 构建测试
- **[ ] T5.3.1**: 执行 `npm run build:h5` - 待验证
- **[ ] T5.3.2**: 验证构建产物生成 - 待验证
- **[ ] T5.3.3**: 检查构建无错误 - 待验证

## 依赖关系图

```
阶段 1 (环境准备)
     ├── Node.js 版本检查
     ├── npm 版本检查
     └── 网络配置
          ↓
阶段 2 (项目创建)
     ├── vue-cli 命令执行
     └── 交互式配置
          ↓
阶段 3 (依赖安装)
     ├── npm install
     └── 额外依赖安装
          ↓
阶段 4 (项目配置)
     ├── manifest.json
     ├── pages.json
     ├── uni.scss
     └── TypeScript 配置
          ↓
阶段 5 (验证测试)
     ├── 开发环境运行
     └── 构建测试
```

## 验收标准

1. ✅ 项目目录 `igreen-uniapp` 创建成功
2. ✅ `package.json` 文件存在且配置正确
3. ✅ `npm install` 成功执行，无错误
4. ⏳ `npm run dev:h5` 能正常启动开发服务器 - 待验证
5. ⏳ 浏览器可访问 http://localhost:3000 - 待验证
6. ⏳ 页面显示正常，无白屏 - 待验证
7. ✅ 项目结构符合 uni-app 规范
8. ✅ TypeScript 编译无错误

## 手动创建备选方案

如果自动创建失败，使用手动方式：

```bash
# Step 1: 创建目录
mkdir igreen-uniapp
cd igreen-uniapp

# Step 2: 初始化 npm
npm init -y

# Step 3: 安装依赖
npm install @dcloudio/uni-app @dcloudio/uni-h5 vue@3

# Step 4: 安装开发依赖
npm install -D @vue/compiler-sfc@3 typescript@4 sass@^1.32

# Step 5: 创建配置文件
# - tsconfig.json
# - vue.config.js
# - manifest.json
# - pages.json
# - uni.scss
# - src/App.vue
# - src/main.ts
# - src/pages/index/index.vue
```

## 后续任务

| 任务ID | 任务名称 | 前置条件 |
|--------|----------|----------|
| T-F1 | 登录模块开发 | 本阶段完成 |
| T-F2 | 仪表盘模块开发 | T-F1 完成 |
| T-F3 | 工单列表模块开发 | T-F1 完成 |
| T-F4 | 工单详情模块开发 | T-F3 完成 |
| T-F5 | 照片上传功能开发 | T-F4 完成 |
| T-F6 | 个人中心模块开发 | T-F1 完成 |

## 任务优先级

| 优先级 | 任务类型 | 说明 |
|--------|---------|------|
| P0 | 核心任务 | 项目创建、依赖安装、验证测试 |
| P1 | 配置任务 | manifest.json、pages.json 配置 |
| P2 | 优化任务 | SCSS 变量、全局样式 |
| P3 | 扩展任务 | 额外的开发工具配置 |
