# iGreen+ UniApp

iGreen+ Engineer Mobile App built with uni-app framework.

## Quick Start

```bash
# Install dependencies
npm install

# Development (H5)
npm run dev:h5

# Development (App)
npm run dev:app-plus

# Development (WeChat Mini Program)
npm run dev:mp-weixin

# Build for H5
npm run build:h5

# Build for App
npm run build:app-plus

# Build for WeChat Mini Program
npm run build:mp-weixin
```

## APK 打包

本项目使用 **HBuilderX** 进行 APK 打包。

### 方式一：云打包 (推荐)

```bash
# 查看打包指南
cat HBUILDERX_GUIDE.md

# 或运行交互式菜单
./pack-with-hbuilder.sh
```

**打包步骤**:
1. 用 HBuilderX 打开项目
2. 菜单: 发行 → 原生 App-云打包
3. 配置包名: `com.igreen.app`
4. 点击打包

### 方式二：本地打包

```bash
# 生成本地资源
./pack-with-hbuilder.sh local
```

详细文档: `HBUILDERX_GUIDE.md` | `LOCAL_APK_BUILD.md`

## Project Structure

```
igreen-uniapp/
├── src/
│   ├── App.vue              # App entry component
│   ├── main.ts              # JS entry file
│   ├── pages.json           # Pages configuration
│   ├── manifest.json        # App manifest configuration
│   ├── uni.scss             # Global SCSS styles
│   ├── pages/               # Page components
│   │   ├── login/           # Login page
│   │   ├── dashboard/       # Dashboard page
│   │   ├── tickets/         # Ticket list & detail
│   │   └── profile/         # Profile page
│   ├── components/          # Reusable components (20 components)
│   │   ├── ui/              # UI: Button, Card, Badge, etc.
│   │   ├── tickets/         # Ticket: Card, List, StatusBadge, etc.
│   │   └── layout/          # Layout: Header, Sidebar, TabBar
│   ├── utils/               # Utility functions
│   ├── store/               # Pinia stores (user, tickets)
│   └── static/              # Static assets
├── public/                  # Public assets
├── package.json
├── tsconfig.json,
├── vue.config.js
└── README.md
```

## Tech Stack

- **Framework**: uni-app 3.x (Vue3)
- **Language**: TypeScript
- **State Management**: Pinia
- **Styling**: SCSS
- **UI Components**: Custom components (20 total)

## Theme

The app uses a teal-600 (#0d9488) primary color scheme, matching the iGreenApp design.

## Package Info

| Config | Value |
|--------|-------|
| Package Name | com.igreen.app |
| Version | 1.0.0 |
| Version Code | 100 |
| Min SDK | 21 (Android 5.0) |
| Target SDK | 34 (Android 14) |

## License

Private project - All rights reserved.
