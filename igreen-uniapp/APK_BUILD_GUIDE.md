# iGreen+ APK 打包指南

## 项目概述

- **项目路径**: `/Users/mac/workspace/iGreenProduct/igreen-uniapp`
- **框架**: uni-app 3.x + Vue 3 + TypeScript
- **状态管理**: Pinia
- **样式**: SCSS

---

## 方式一：HBuilderX 打包 (推荐)

### 1. 安装 HBuilderX

```bash
# 下载地址: https://www.dcloud.io/hbuilderx.html
# 选择 Mac 版本下载并安装
```

### 2. 导入项目

1. 打开 HBuilderX
2. 文件 → 导入 → 从本地目录导入
3. 选择 `/Users/mac/workspace/iGreenProduct/igreen-uniapp`

### 3. 配置 App 信息

修改 `src/manifest.json`:

```json
{
  "name": "iGreen+",
  "appid": "__UNI__XXXXXX",  // 在 DCloud 开发者中心申请
  "description": "iGreen+ Engineer Mobile App",
  "versionName": "1.0.0",
  "versionCode": "100"
}
```

### 4. 配置 App 图标和启动图

1. 在 HBuilderX 中右键项目 → 工具 → 图标配置
2. 上传 192x192 的 PNG 图标作为 App 图标
3. 工具 → 启动图配置 → 配置启动画面

### 5. 打包 APK

**云打包 (推荐)**:
1. 发行 → 原生 App-云打包
2. 选择「打包 APK」
3. 填写配置:
   - Android 包名: `com.igreen.app`
   - 版本名称: `1.0.0`
   - 版本号: `100`
4. 点击「打包」

**本地打包**:
1. 发行 → 原生 App-本地打包 → 生成离线打包 App 资源
2. 下载 Android 离线打包 SDK
3. 使用 Android Studio 打开，Build → Generate Signed APK

---

## 方式二：命令行构建

### 启动开发服务器

```bash
cd /Users/mac/workspace/iGreenProduct/igreen-uniapp
npm run dev
# 访问 http://localhost:3000
```

### 构建 H5

```bash
npm run build:h5
# 输出: dist/build/h5/
```

### 构建 App 资源

```bash
npm run build:app
# 输出: dist/build/app-plus/
```

> **注意**: App 资源需要结合 HBuilderX 或离线打包 SDK 使用

---

## 方式三：HBuilderX CLI

如果已安装 HBuilderX，可使用内置 CLI：

```bash
# HBuilderX CLI 路径
CLI="/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli-vite"

# 构建 H5
node "$CLI" build --platform h5

# 构建 App
node "$CLI" build --platform app-plus
```

---

## 配置文件说明

### manifest.json (App 配置)

```json
{
  "app-plus": {
    "distribute": {
      "android": {
        "permissions": [
          "<uses-permission android:name=\"android.permission.INTERNET\"/>",
          "<uses-permission android:name=\"android.permission.CAMERA\"/>",
          "<uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"/>"
        ]
      }
    }
  }
}
```

### API 配置

修改 `src/utils/api.ts`:

```typescript
const API_BASE_URL = 'http://YOUR_SERVER_IP:8000';
```

---

## 版本信息

| 项目 | 值 |
|------|-----|
| 当前版本 | 1.0.0 |
| Android 包名 | `com.igreen.app` |
| 最低 SDK | 21 (Android 5.0) |
| 目标 SDK | 34 (Android 14) |

---

## 常见问题

### 1. 打包后网络请求失败

Android 9+ 默认禁止明文 HTTP，需要在 `manifest.json` 添加:

```json
"app-plus": {
  "distribute": {
    "android": {
      "permissions": [...]
    }
  }
}
```

或创建 `src/static/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">YOUR_SERVER_IP</domain>
  </domain-config>
</network-security-config>
```

### 2. 图标不显示

确保图标在 `src/static/` 目录，并在 manifest.json 中配置。

### 3. 启动白屏

检查 `src/App.vue` 中的应用初始化逻辑，确保 API 地址可访问。

---

## 相关链接

- [uni-app 官方文档](https://uniapp.dcloud.io/)
- [HBuilderX 下载](https://www.dcloud.io/hbuilderx.html)
- [Android 打包配置](https://uniapp.dcloud.io/tutorial/app-permission-android.html)
- [DCloud 开发者中心](https://dev.dcloud.net.cn/)
