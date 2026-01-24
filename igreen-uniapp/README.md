# iGreen+ UniApp

iGreen+ Engineer Mobile App built with uni-app framework.

## 开发方式

- **开发工具**: HBuilderX CLI（命令行）或 HBuilderX GUI
- **打包方式**: 本地打包（Android Studio）或 HBuilderX 云打包
- **项目状态**: ✅ 已完成，可直接打包

## 快速开始

### 方式一: 使用 HBuilderX CLI（推荐）

#### 安装 CLI

```bash
# 运行安装脚本
npm run install:hbx-cli

# 或手动下载安装
# 1. 访问: https://www.dcloud.io/hbuilderx.html
# 2. 下载 HBuilderX.app (macOS) 或 Linux 版本
# 3. 安装到 /Applications/ (macOS) 或 ~/HBuilderX (Linux)
# 4. 添加到 PATH
#    export PATH=$PATH:/Applications/HBuilderX.app/Contents/MacOS
```

#### 使用 CLI 开发

```bash
# H5 开发
npm run dev:h5        # = hbx run --platform h5

# App 开发
npm run dev:app        # = hbx run --platform app

# 微信小程序
npm run dev:mp-weixin  # = hbx run --platform mp-weixin

# 构建 H5
npm run build:h5        # = hbx build --platform h5

# 构建 App
npm run build:app        # = hbx build --platform app
```

### 方式二: 使用 HBuilderX GUI

```bash
# 1. 安装 HBuilderX
# 访问: https://www.dcloud.io/hbuilderx.html

# 2. 打开项目
# 文件 → 打开目录 → 选择本目录

# 3. 运行项目
# H5: 运行 → 运行到浏览器 → Chrome
# App: 运行 → 运行到手机/模拟器 → App 基座
```

### CLI 命令参考

| 命令 | npm | hbx | 说明 |
|------|-----|-----|------|
| H5 开发 | `npm run dev:h5` | `hbx run --platform h5` | 启动 H5 开发服务器 |
| App 开发 | `npm run dev:app` | `hbx run --platform app` | 启动 App 开发 |
| H5 构建 | `npm run build:h5` | `hbx build --platform h5` | 构建 H5 生产版本 |
| App 构建 | `npm run build:app` | `hbx build --platform app` | 构建 App 资源 |
| 微信小程序 | `npm run dev:mp-weixin` | `hbx run --platform mp-weixin` | 微信小程序开发 |

### 打包 APK

#### 方式 1: HBuilderX 云打包（快速）

```bash
# 在 HBuilderX 中
1. 发行 → 原生 App-云打包
2. 配置:
   - 包名: com.igreen.app
   - 版本名称: 1.0.0
   - 版本号: 100
3. 点击"打包"
4. 等待 3-5 分钟
5. 下载 APK
```

#### 方式 2: 本地打包（推荐）

详见: [ANDROID_PACKAGING.md](./ANDROID_PACKAGING.md)

```bash
# 设置环境（首次需要）
npm run setup:android

# 打包 APK
npm run build:android
```

## Project Structure

```
igreen-uniapp/
├── src/                      # 源代码
│   ├── App.vue              # 主应用组件
│   ├── main.ts              # 入口文件
│   ├── pages.json           # 页面配置
│   ├── manifest.json        # 应用配置
│   ├── uni.scss             # 全局样式
│   ├── pages/               # 页面（6个）
│   ├── components/          # 组件（20个）
│   ├── store/               # Pinia stores
│   ├── utils/               # 工具函数
│   └── types/               # 类型定义
├── scripts/                  # 构建脚本
│   ├── build-android.sh      # APK 打包脚本
│   ├── setup-android-pack.sh # Android 环境设置
│   └── upscale_icon.py      # 图标生成
├── public/                  # 公共资源
│   └── index.html           # 入口 HTML
├── manifest.json            # 应用配置（根目录）
├── pages.json              # 页面配置（根目录）
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── jsconfig.json           # JavaScript 配置
├── ANDROID_PACKAGING.md    # Android 打包指南
└── README.md              # 本文档
```

## 功能模块

### 已完成 (100%)

| 模块 | 描述 | 文件 |
|------|------|------|
| 用户认证 | 登录、登出 | `src/pages/login/` |
| 仪表盘 | 工单概览、统计 | `src/pages/dashboard/` |
| 工单列表 | 多状态筛选、分页 | `src/pages/tickets/` |
| 工单详情 | 详情展示、状态流转 | `src/pages/tickets/detail/` |
| 个人中心 | 用户信息、设置 | `src/pages/profile/` |
| API 集成 | 完整后端 API 对接 | `src/utils/api.ts` |
| 状态管理 | Pinia stores | `src/store/` |

### UI 组件 (20个)

**UI 基础**: Button, Card, Badge, Input, Avatar, Empty, Loading, InfoRow, LanguageSwitcher

**工单组件**: TicketList, TicketCard, StatusBadge, PriorityBadge, TypeBadge, ActionCard, StepList, PhotoGrid

**布局组件**: Header, Sidebar, TabBar

## Tech Stack

- **框架**: uni-app 3.x (Vue3)
- **语言**: TypeScript
- **状态管理**: Pinia
- **样式**: SCSS
- **打包**: HBuilderX / Android Studio

## Theme

应用使用青色 (#0d9488) 主题，与 iGreenApp 设计保持一致。

## Package Info

| 配置项 | 值 |
|--------|-----|
| 应用名称 | iGreen+ |
| 包名 | com.igreen.app |
| 版本 | 1.0.0 |
| 版本号 | 100 |
| 最低 SDK | 21 (Android 5.0) |
| 目标 SDK | 34 (Android 14) |

## 文档

- [Android 打包指南](./ANDROID_PACKAGING.md)
- [UniApp 官方文档](https://uniapp.dcloud.net.cn/)
- [DCloud 开发者中心](https://dev.dcloud.net.cn/)

## License

Private project - All rights reserved.
