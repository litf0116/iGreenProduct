# iGreen+ APK 本地打包指南

## 前提条件

### 1. 安装必要软件

```bash
# 安装 Homebrew (如果未安装)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Java 17 (Android Studio 需要)
brew install openjdk@17

# 安装 Android Studio
# 下载地址: https://developer.android.com/studio
# 或使用 brew:
# brew install --cask android-studio
```

### 2. 配置环境变量

```bash
# 添加到 ~/.zshrc 或 ~/.bash_profile
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

---

## 打包步骤

### 步骤 1: 生成 App 资源

```bash
cd /Users/mac/workspace/iGreenProduct/igreen-uniapp

# 方式 A: 使用 HBuilderX GUI (推荐)
# 1. 用 HBuilderX 打开项目
# 2. 发行 → 原生 App-本地打包 → 生成离线打包 App 资源
# 3. 选择输出目录: dist/app

# 方式 B: 确保开发服务器可运行
npm run serve &
# 验证: http://localhost:3000 返回 200
```

### 步骤 2: 下载离线打包 SDK

```bash
# 下载地址: https://uniapp.dcloud.io/quickstart?id=expak
# 下载 "Android 离线打包SDK"

# 解压到项目目录
cd /Users/mac/workspace/iGreenProduct/igreen-uniapp
mkdir -p android-pack
cd android-pack
unzip ~/Downloads/HBuilder-OfflineSDK.zip
```

### 步骤 3: 配置 Android 项目

1. **打开 Android Studio**
2. **File → Open**
3. 选择 `android-pack/HelloUniapp` 目录

4. **配置应用信息** (`AndroidManifest.xml`):

```xml
<!-- 包名 -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.igreen.app">

<!-- 版本信息 -->
<meta-data
    android:name="versionName"
    android:value="1.0.0" />
<meta-data
    android:name="versionCode"
    android:value="100" />
```

### 步骤 4: 替换资源

```bash
# 复制 App 资源到 Android 项目
cp -r dist/build/app-plus/* android-pack/HelloUniapp/src/main/assets/apps/__UNI__XXXXXXX/
```

### 步骤 5: 配置签名 (Release APK 需要)

1. **生成签名文件**:

```bash
keytool -genkeypair -v -storetype PKCS12 -keyalg RSA \
  -keysize 2048 -validity 10000 \
  -keystore igreen-release.keystore \
  -alias igreen-key \
  -storepass your_password \
  -keypass your_password
```

2. **配置签名** (`signing.gradle`):

```groovy
signingConfigs {
    release {
        storeFile file("igreen-release.keystore")
        storePassword "your_password"
        keyAlias "igreen-key"
        keyPassword "your_password"
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
    }
}
```

### 步骤 6: 生成 APK

**调试 APK (快速测试)**:
```
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

**发布 APK (需要签名)**:
```
Build → Generate Signed Bundle / APK
→ 选择 APK
→ 选择签名配置
→ 点击 Create
```

---

## 常见问题

### Q1: Build 失败，提示 SDK 找不到

**解决方案**:
```bash
# 确认 ANDROID_HOME 环境变量
echo $ANDROID_HOME

# 在 Android Studio 中配置:
# Preferences → Appearance & Behavior → System Settings → Android SDK
```

### Q2: 打包后应用启动白屏

**解决方案**:
1. 检查 `manifest.json` 中的 `appid` 是否正确
2. 确保 `src/utils/api.ts` 中的 API 地址可访问
3. 在 `AndroidManifest.xml` 添加网络权限:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Q3: 图标不显示

**解决方案**:
1. 在 `manifest.json` 配置 App 图标
2. 或手动替换 `res/drawable` 目录下的图标文件

---

## 快速参考

| 步骤 | 命令/操作 |
|------|-----------|
| 启动开发 | `npm run serve` |
| 验证构建 | `curl http://localhost:3000` (返回 200) |
| HBuilderX | 发行 → 原生 App-本地打包 |
| Android Studio | Build → Generate Signed APK |
| 包名 | `com.igreen.app` |
| 版本 | `1.0.0` (versionCode: 100) |

---

## 相关链接

- [uni-app 离线打包文档](https://uniapp.dcloud.io/quickstart?id=expak)
- [Android Studio 下载](https://developer.android.com/studio)
- [签名配置指南](https://developer.android.com/studio/publish/app-signing)
