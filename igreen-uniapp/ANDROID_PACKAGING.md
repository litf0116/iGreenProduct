# iGreen+ Android APK 本地打包指南

## 概述

本文档介绍如何使用 CLI 开发方式 + 本地 Android Studio 打包的方式生成 APK 文件。

## 优势

✅ 完全控制打包过程
✅ 支持自动化（CI/CD）
✅ 无需排队，本地编译快速
✅ 可以自定义混淆和多渠道打包
✅ 版本控制友好（配置即代码）

---

## 前置要求

### 必需工具

| 工具 | 版本要求 | 用途 |
|------|---------|------|
| Node.js | >= 14 | 运行 CLI |
| npm | >= 6 | 包管理 |
| Java JDK | 11 或 17 | Android 编译 |
| Android Studio | 最新版本 | APK 打包 |
| Android SDK | API 21-34 | 运行时库 |

### 可选工具

| 工具 | 用途 |
|------|------|
| Git | 版本控制 |
| curl 或 wget | 下载 SDK |

---

## 快速开始

### 方式 1: 自动设置（推荐）

```bash
cd igreen-uniapp

# 设置 Android 打包环境
./scripts/setup-android-pack.sh

# 构建 App 资源（使用 HBuilderX CLI）
hbx build --platform app

# 或使用 npm 脚本
npm run build:app

# 打包 APK（可选，也可用 Android Studio 手动编译）
npm run build:android
```

### 方式 2: 手动设置

如果自动脚本失败，请按照以下步骤手动设置。

---

## 详细步骤

### 步骤 1: 下载 Android 离线 SDK

#### 1.1 访问下载页面

浏览器打开: https://uniapp.dcloud.net.cn/tutorial/app/android/localrun.html

#### 1.2 下载 SDK

下载: `Android 离线 SDK` (uni-app-offline-sdk-android-3.8.0.zip)

#### 1.3 解压到项目

```bash
cd igreen-uniapp
mkdir -p android-pack
cd android-pack
unzip ~/Downloads/uni-app-offline-sdk-android-3.8.0.zip
```

### 步骤 2: 配置 Android 项目

#### 2.1 应用信息配置

创建 `android-pack/HelloUniapp/src/main/assets/data/dcloud_properties.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<properties>
    <property name="appid" value="__UNI__3B8A5C9"/>
    <property name="name" value="iGreen+"/>
    <property name="version" value="1.0.0"/>
    <property name="package" value="com.igreen.app"/>
</properties>
```

#### 2.2 AndroidManifest.xml 配置

编辑 `android-pack/HelloUniapp/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.igreen.app">

    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
    <uses-permission android:name="android.permission.CAMERA"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
</manifest>
```

#### 2.3 build.gradle 签名配置

编辑 `android-pack/HelloUniapp/app/build.gradle`:

```gradle
android {
    compileSdkVersion 34
    buildToolsVersion "34.0.0"

    defaultConfig {
        applicationId "com.igreen.app"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 100
        versionName "1.0.0"
    }

    signingConfigs {
        debug {
            storeFile file("debug.keystore")
            storePassword "android"
            keyAlias "androiddebugkey"
            keyPassword "android"
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 步骤 3: 生成 App 资源

```bash
cd igreen-uniapp

# 构建本地 App 资源
npm run build:app
```

资源会生成到 `unpackage/resources/build/android/` 目录。

### 步骤 4: 复制资源到 Android 项目

```bash
# 复制生成的资源
cp -r unpackage/resources/build/android/* \
   android-pack/HelloUniapp/src/main/assets/apps/__UNI__3B8A5C9/
```

或使用提供的脚本:

```bash
./scripts/build-android.sh
```

### 步骤 5: 使用 Android Studio 编译 APK

#### 5.1 打开项目

1. 打开 Android Studio
2. File → Open
3. 选择 `igreen-uniapp/android-pack/HelloUniapp`
4. 等待 Gradle 同步完成

#### 5.2 编译调试 APK

```
Build → Build Bundle(s) / APK(s) → Build APK(s)
→ 选择 debug 构建类型
→ 等待编译完成
```

APK 位置: `android-pack/HelloUniapp/app/build/outputs/apk/debug/`

#### 5.3 编译发布 APK

```
Build → Generate Signed Bundle / APK
→ 选择 APK
→ 创建或选择 keystore
→ 选择 release 构建类型
→ 等待编译完成
```

APK 位置: `android-pack/HelloUniapp/app/build/outputs/apk/release/`

---

## 生成签名文件

### 创建调试签名（已内置）

调试签名通常由 Android Studio 自动生成，无需手动创建。

### 创建发布签名

```bash
cd igreen-uniapp/android-pack/HelloUniapp

keytool -genkeypair -v -storetype PKCS12 -keyalg RSA \
    -keysize 2048 -validity 10000 \
    -keystore igreen-release.keystore \
    -alias igreen-key \
    -storepass your_secure_password \
    -keypass your_secure_password \
    -dname "CN=iGreen, OU=iGreen, O=iGreen, L=City, ST=State, C=CN"
```

### 配置发布签名

创建 `android-pack/HelloUniapp/keystore.properties`:

```properties
storeFile=igreen-release.keystore
storePassword=your_secure_password
keyAlias=igreen-key
keyPassword=your_secure_password
```

更新 `android-pack/HelloUniapp/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            def keystorePropertiesFile = rootProject.file("keystore.properties")
            if (keystorePropertiesFile.exists()) {
                def keystoreProperties = new Properties()
                keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 常见问题

### Q1: 编译失败 "SDK location not found"

**原因**: Android SDK 路径未配置

**解决**:
1. Android Studio → Preferences → Appearance & Behavior → System Settings → Android SDK
2. 设置 Android SDK Location
3. 添加 `local.properties` 文件到 `android-pack/HelloUniapp`:
   ```
   sdk.dir=/path/to/Android/Sdk
   ```

### Q2: Gradle 同步失败

**原因**: 网络问题或版本不兼容

**解决**:
1. 配置 Gradle 镜像:
   ```bash
   cd android-pack/HelloUniapp/gradle
   echo "maven { url 'https://maven.aliyun.com/repository/public/' }" > wrapper/gradle-wrapper.properties
   ```
2. 检查 JDK 版本 (需要 JDK 11 或 17)

### Q3: 资源构建失败

**原因**: manifest.json 或 pages.json 配置错误

**解决**:
1. 检查 `manifest.json` 的 appid 是否正确
2. 检查 `pages.json` 的页面路径是否存在
3. 查看构建日志: `unpackage/dist/build/h5`

### Q4: APK 安装后白屏

**原因**: API 地址不可访问或权限问题

**解决**:
1. 检查 `.env` 中的 `VITE_API_URL`
2. 确保网络权限已添加到 AndroidManifest.xml
3. 查看设备日志: `adb logcat | grep igreen`

### Q5: 编译速度慢

**解决**:
1. 增加编译内存:
   ```bash
   cd android-pack/HelloUniapp
   echo "org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=1024m" > gradle.properties
   ```
2. 使用 Gradle Daemon
3. 开启增量编译

---

## CI/CD 集成

### GitHub Actions 示例

创建 `.github/workflows/build-android.yml`:

```yaml
name: Build Android APK

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          cd igreen-uniapp
          npm ci

      - name: Setup Android SDK
        uses: android-actions/setup-android@v2

      - name: Build App resources
        run: |
          cd igreen-uniapp
          npm run build:app

      - name: Build APK
        run: |
          cd igreen-uniapp/android-pack/HelloUniapp
          ./gradlew assembleRelease

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-release
          path: igreen-uniapp/android-pack/HelloUniapp/app/build/outputs/apk/release/*.apk
```

---

## 版本管理

### 更新版本号

1. 编辑 `package.json`:
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. 编辑 `manifest.json`:
   ```json
   {
     "versionName": "1.0.1",
     "versionCode": 101
   }
   ```

3. 编辑 `android-pack/HelloUniapp/app/build.gradle`:
   ```gradle
   defaultConfig {
       versionCode 101
       versionName "1.0.1"
   }
   ```

### 版本号规则

- `versionName`: 用户可见的版本号 (1.0.0)
- `versionCode`: 整数，每次发布递增 (100, 101, 102...)

---

## 目录结构

```
igreen-uniapp/
├── src/                      # 源代码
├── scripts/                  # 构建脚本
│   ├── build-android.sh      # 打包脚本
│   └── setup-android-pack.sh # 环境设置脚本
├── android-pack/            # Android 项目（离线 SDK）
│   └── HelloUniapp/
│       └── app/
│           └── build.gradle  # Android 构建配置
├── unpackage/               # 构建输出
│   └── resources/
│       └── build/
│           └── android/   # 生成的资源
├── manifest.json            # 应用配置
├── pages.json              # 页面配置
└── package.json           # 项目配置
```

---

## 相关文档

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Android 离线打包指南](https://uniapp.dcloud.net.cn/tutorial/app/android/localrun.html)
- [HBuilderX 云打包](https://uniapp.dcloud.net.cn/tutorial/publish/app.html)

---

## 支持

如有问题，请:
1. 查看本文档的"常见问题"章节
2. 检查 uni-app 官方文档
3. 查看 Android 编译日志
4. 联系开发团队
