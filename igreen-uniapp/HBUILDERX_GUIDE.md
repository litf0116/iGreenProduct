# HBuilderX 打包指南

## 概述

本项目使用 **HBuilderX** 进行 APK 打包，这是 uni-app 官方推荐的打包方式。

## 打包方式对比

| 方式 | 难度 | 耗时 | 适用场景 |
|------|------|------|----------|
| **HBuilderX 云打包** | ⭐ 简单 | 3-5分钟 | 快速测试、小规模发布 |
| **HBuilderX 本地打包** | ⭐⭐ 中等 | 10-15分钟 | 无需云服务、企业内部分发 |
| **Android Studio 本地打包** | ⭐⭐⭐ 复杂 | 30-60分钟 | 定制化需求、生产发布 |

---

## 方式一：HBuilderX 云打包 (推荐)

### 步骤 1: 安装 HBuilderX

```bash
# 下载地址: https://www.dcloud.io/hbuilderx.html
# 选择 Mac 版本 (Apple Silicon/Intel)
```

### 步骤 2: 导入项目

1. 打开 HBuilderX
2. **文件 → 导入 → 从本地目录导入**
3. 选择项目路径: `/Users/mac/workspace/iGreenProduct/igreen-uniapp`
4. 点击「导入」

### 步骤 3: 配置 App 信息

打开 `src/manifest.json`，确保以下配置正确:

```json
{
  "name": "iGreen+",
  "appid": "__UNI__3B8A5C9",  // DCloud 应用标识
  "versionName": "1.0.0",
  "versionCode": "100"
}
```

> **重要**: `appid` 需要在 DCloud 开发者中心申请:
> 1. 访问 https://dev.dcloud.net.cn/
> 2. 注册/登录账号
> 3. 创建应用，获取 AppID

### 步骤 4: 配置图标和启动图

1. **App 图标**:
   - 右键项目 → **工具 → 图标配置 → App 图标**
   - 上传 192x192 PNG 图标
   - 勾选「生成所有尺寸」

2. **启动图**:
   - 工具 → **启动图配置**
   - 选择启动模式: **自定义切图**
   - 上传 1242x2208 PNG (iPhone) 和 1080x1920 PNG (Android)

### 步骤 5: 云打包

1. 菜单栏 → **发行 → 原生 App-云打包**
2. 选择 **打包 APK**
3. 配置:
   ```
   Android 包名: com.igreen.app
   版本名称: 1.0.0
   版本号: 100
   ```
4. 勾选「使用云端证书」
5. 点击「打包」
6. 等待打包完成 (~3-5分钟)
7. 下载 APK 文件

---

## 方式二：HBuilderX 本地打包

### 步骤 1: 下载离线打包 SDK

```bash
# 访问: https://uniapp.dcloud.io/quickstart?id=expak
# 下载 "Android 离线打包SDK" (HBuilder-OfflineSDK.zip)

# 解压到项目目录
cd /Users/mac/workspace/iGreenProduct/igreen-uniapp
mkdir -p android-pack
cd android-pack
unzip ~/Downloads/HBuilder-OfflineSDK.zip
```

### 步骤 2: 生成 App 资源

在 HBuilderX 中:
1. 发行 → **原生 App-本地打包**
2. 选择 **生成离线打包 App 资源**
3. 选择输出目录: `android-pack/HelloUniapp/src/main/assets/apps/__UNI__3B8A5C9/`
4. 点击「确定」

### 步骤 3: 配置 Android 项目

1. 打开 **Android Studio**
2. File → **Open**
3. 选择: `android-pack/HelloUniapp`

4. 配置 `AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.igreen.app">
    
    <!-- 权限 -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <uses-permission android:name="android.permission.CAMERA"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    
    <!-- 版本信息 -->
    <meta-data
        android:name="versionName"
        android:value="1.0.0" />
    <meta-data
        android:name="versionCode"
        android:value="100" />
</manifest>
```

### 步骤 4: 配置应用信息

编辑 `android-pack/HelloUniapp/src/main/assets/data/dcloud_properties.xml`:

```xml
<properties>
    <!-- 应用标识 (与 manifest.json 中的 appid 一致) -->
    <property name="appid" value="__UNI__3B8A5C9"/>
    
    <!-- 应用名称 -->
    <property name="name" value="iGreen+"/>
    
    <!-- 应用版本 -->
    <property name="version" value="1.0.0"/>
    
    <!-- 包名 -->
    <property name="package" value="com.igreen.app"/>
</properties>
```

### 步骤 5: 生成签名 (Release APK)

1. **生成 keystore 文件**:

```bash
keytool -genkeypair -v -storetype PKCS12 -keyalg RSA \
    -keysize 2048 -validity 10000 \
    -keystore igreen-release.keystore \
    -alias igreen-key \
    -storepass your_password \
    -keypass your_password
```

2. **配置签名** (创建 `android-pack/HelloUniapp/key.properties`):

```properties
storeFile=igreen-release.keystore
storePassword=your_password
keyAlias=igreen-key
keyPassword=your_password
```

3. **配置 `android-pack/HelloUniapp/app/build.gradle`**:

```groovy
android {
    signingConfigs {
        release {
            keyProperties.keyFile = rootProject.file('key.properties')
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

### 步骤 6: 构建 APK

**调试 APK**:
```
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

**发布 APK**:
```
Build → Generate Signed Bundle / APK
→ 选择 APK
→ 选择 keystore
→ 点击 Create
```

---

## 常见问题

### Q1: 打包失败，提示证书错误

**解决方案**: 使用云端证书或重新生成签名:
```bash
keytool -genkeypair -v -storetype PKCS12 -keyalg RSA \
    -keysize 2048 -validity 10000 \
    -keystore new-keystore.keystore \
    -alias new-alias \
    -storepass new_password \
    -keypass new_password
```

### Q2: 应用启动白屏

**检查项**:
1. 确保 API 地址可访问
2. 检查 `manifest.json` 中的 `appid` 是否正确
3. 添加网络权限:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
```

### Q3: 图标不显示

**解决方案**:
1. 使用 HBuilderX 图标配置工具重新生成
2. 或手动替换:
   - `res/drawable-hdpi/ic_launcher.png`
   - `res/drawable-mdpi/ic_launcher.png`
   - `res/drawable-xhdpi/ic_launcher.png`

### Q4: 相机/相册功能不可用

**检查权限配置** (`manifest.json`):
```json
"app-plus": {
    "distribute": {
        "android": {
            "permissions": [
                "<uses-permission android:name=\"android.permission.CAMERA\"/>",
                "<uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"/>"
            ]
        }
    }
}
```

---

## 版本信息

| 配置项 | 值 |
|--------|-----|
| 应用名称 | iGreen+ |
| 包名 | com.igreen.app |
| 版本名称 | 1.0.0 |
| 版本号 | 100 |
| 最低 SDK | 21 (Android 5.0) |
| 目标 SDK | 34 (Android 14) |

---

## 快速参考

| 操作 | HBuilderX 菜单 |
|------|---------------|
| 导入项目 | 文件 → 导入 → 从本地目录导入 |
| 配置图标 | 工具 → 图标配置 → App图标 |
| 配置启动图 | 工具 → 启动图配置 |
| 云打包 | 发行 → 原生 App-云打包 |
| 本地打包 | 发行 → 原生 App-本地打包 |

---

## 相关链接

- [HBuilderX 下载](https://www.dcloud.io/hbuilderx.html)
- [uni-app 官方文档](https://uniapp.dcloud.io/)
- [DCloud 开发者中心](https://dev.dcloud.net.cn/)
- [Android 打包配置](https://uniapp.dcloud.io/tutorial/app-permission-android.html)
