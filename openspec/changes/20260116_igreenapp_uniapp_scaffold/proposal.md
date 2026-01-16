# 变更提案：使用标准脚手架生成 UniApp 开发框架

## 提案 ID

`20260116_igreenapp_uniapp_scaffold`

## 概述

使用官方标准脚手架创建 uni-app 开发框架项目，为后续 iGreenApp 迁移到安卓原生应用奠定基础。

## 为什么

当前 iGreenApp 使用 React + Vite 开发，仅能在浏览器中运行。为了实现真正的安卓原生应用，需要：
- 使用 uni-app 框架生成原生 APK
- 官方脚手架确保项目结构和配置的规范性
- 获得最佳的开发体验和兼容性

## 背景

### 当前项目状态

| 模块 | 当前技术 | 状态 |
|------|----------|------|
| 工程师APP | React 18 + Vite + TypeScript | Web应用，仅支持浏览器 |
| 后端API | Spring Boot (开发中) | FastAPI 待迁移 |
| 现有uniapp代码 | Vue2 + uni-app | sned_app/receive_app (功能不完整) |

### 现有 uniapp 代码分析

| 项目 | 位置 | 技术栈 | 状态 |
|------|------|--------|------|
| sned_app | `/sned_app/src/uniapp_export/` | Vue2 | 基础框架、登录、仪表盘 |
| receive_app | `/receive_app/src/uniapp_export/` | Vue2 | 基础框架 |

## 目标

1. 使用官方标准脚手架创建 uni-app Vue3 项目
2. 配置 TypeScript 支持
3. 配置基础项目结构和全局设置
4. 确保项目可正常编译运行
5. 为后续功能迁移提供基础框架

## 范围

### 包含

- 使用 vue-cli 或官方 CLI 创建项目
- TypeScript 配置
- 基础目录结构
- 全局样式配置
- manifest.json 配置
- pages.json 页面配置
- 验证开发环境正常运行

### 不包含

- 业务功能实现
- 页面组件开发
- API 对接
- 离线功能
- 推送功能

## 架构设计

### 创建方式选择

| 方式 | 命令 | 优缺点 |
|------|------|--------|
| **方式1: vue-cli** | `npx @vue/cli @dcloudio/uni-app` | 与现有 Vue 项目一致，可配置 |
| **方式2: HBuilderX CLI** | `hbuilderx-cli create` | 官方推荐，需安装 HBuilderX |
| **方式3: degit** | `npx degit dcloudio/uni-app-template` | 快速简单，但模板可能过期 |

**推荐：方式1 (vue-cli)**

原因：
- 与现有 iGreenApp 的 Vite 项目技术栈一致
- 可选择 TypeScript 模板
- 熟悉的配置方式

### 技术栈

| 组件 | 选择 | 说明 |
|------|------|------|
| 框架 | uni-app 3.x | Vue3 + TypeScript 支持 |
| 构建工具 | vue-cli / vite | 项目构建 |
| 语言 | TypeScript | 类型安全 |
| 状态管理 | Pinia | Vue3 官方推荐 |
| CSS 预处理器 | SCSS | 样式管理 |

### 项目结构

```
igreen-uniapp/
├── src/
│   ├── App.vue              # 应用入口组件
│   ├── main.ts              # JS入口文件
│   ├── pages.json           # 页面配置
│   ├── manifest.json        # 应用配置
│   ├── uni.scss             # 全局样式
│   ├── pages/               # 页面目录
│   │   └── index/
│   │       └── index.vue    # 默认页面
│   └── static/              # 静态资源
│       └── logo.png
├── public/                  # 公共资源
├── package.json
├── tsconfig.json
├── vue.config.js
└── README.md
```

### 页面配置 (pages.json)

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "iGreen+",
    "navigationBarBackgroundColor": "#ffffff",
    "backgroundColor": "#f8f8f8"
  }
}
```

### 应用配置 (manifest.json)

```json
{
  "name": "iGreen+",
  "appid": "",
  "description": "iGreen+ Engineer Mobile App",
  "versionName": "1.0.0",
  "versionCode": "100",
  "transformPx": false,
  "networkTimeout": {
    "request": 10000,
    "connectSocket": 10000,
    "uploadFile": 10000,
    "downloadFile": 10000
  },
  "app-plus": {
    "usingComponents": true,
    "nvueStyleCompiler": "uni-app",
    "compilerVersion": 3,
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true,
      "autoclose": true,
      "delay": 0
    },
    "modules": {}
  },
  "quickapp": {},
  "mp-weixin": {
    "appid": "",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "minified": true,
      "postcss": true
    },
    "usingComponents": true
  },
  "mp-alipay": {
    "usingComponents": true
  },
  "mp-baidu": {
    "usingComponents": true
  },
  "mp-toutiao": {
    "usingComponents": true
  },
  "h5": {
    "title": "iGreen+",
    "router": {
      "mode": "hash",
      "base": "./"
    },
    "devServer": {
      "port": 3000,
      "disableHostCheck": true,
      "https": false
    },
    "optimization": {
      "treeShaking": {
        "enable": true
      }
    }
  }
}
```

## 风险和注意事项

1. **网络问题**: npm 仓库访问可能受限，需配置镜像源
2. **Node 版本**: 需确保 Node.js 版本 ≥ 14
3. **CLI 参数**: 交互式选择可能需手动处理
4. **模板选择**: 确保选择 Vue3 + TypeScript 模板

## 成功标准

1. 项目成功创建，无错误
2. npm install 正常完成
3. 开发服务器可正常启动
4. H5 预览可正常访问
5. 项目结构符合预期

## 创建步骤

### 步骤 1: 环境检查

```bash
# 检查 Node.js 版本
node -v

# 检查 npm 版本
npm -v

# 确保版本满足要求 (Node >= 14, npm >= 6)
```

### 步骤 2: 创建项目

```bash
# 进入项目目录
cd /Users/mac/workspace/iGreenProduct

# 使用 vue-cli 创建 uni-app 项目
npx @vue/cli@latest create @dcloudio/uni-app igreen-uniapp \
  --packageManager npm \
  --typescript

# 或者使用交互式创建
npx @vue/cli @dcloudio/uni-app igreen-uniapp
```

### 步骤 3: 安装依赖

```bash
cd igreen-uniapp
npm install
```

### 步骤 4: 配置项目

- 配置 manifest.json
- 配置 pages.json
- 配置 uni.scss 全局样式

### 步骤 5: 验证运行

```bash
# H5 开发模式
npm run dev:h5

# App 开发模式
npm run dev:app-plus

# 微信小程序
npm run dev:mp-weixin
```

## 后续规划

本次仅创建基础框架，后续变更将基于此框架继续：

| 提案ID | 目标 |
|--------|------|
| 20260116_igreenapp_uniapp_migration | 完整功能迁移 |
| 20260116_igreenapp_uniapp_location | 定位服务集成 |
| 20260116_igreenapp_uniapp_photos | 照片上传功能 |

## 实施时间表

| 阶段 | 时间 | 任务 | 交付物 |
|------|------|------|--------|
| Phase 1 | 10分钟 | 环境检查 | 确认环境满足要求 |
| Phase 2 | 15分钟 | 项目创建 | 执行脚手架命令 |
| Phase 3 | 10分钟 | 依赖安装 | npm install 完成 |
| Phase 4 | 15分钟 | 基础配置 | manifest/pages/uni.scss 配置 |
| Phase 5 | 10分钟 | 验证测试 | 开发服务器正常运行 |

**总计预估: 约60分钟**
