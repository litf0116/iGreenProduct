# iGreenApp Capacitor 打包实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 将现有的 React + Vite 工程师工单 APP (iGreenApp) 使用 Capacitor 技术打包成 Android APK

**架构:** 使用 Capacitor 作为跨平台运行时，将 Web 应用嵌入原生 Android WebView 中，同时保留原生功能扩展能力（如相机、GPS、推送等）。

**技术栈:** React 18 + Vite + Tailwind CSS + shadcn/ui + Capacitor 6.x + Android SDK

---

## 前置检查

### 环境要求
- Node.js 18+ (当前项目使用)
- Android Studio (包含 Android SDK)
- JDK 17+
- Git 工作树隔离（推荐）

---

## 第一阶段：Capacitor 环境初始化

### Task 1: 安装 Capacitor 核心依赖

**目标:** 安装 Capacitor CLI 和核心库

**文件:**
- 修改: `iGreenApp/package.json`

**步骤 1: 安装依赖包**

运行:
```bash
cd /Users/mac/workspace/iGreenProduct/iGreenApp
npm install @capacitor/core@^6.0.0 @capacitor/cli@^6.0.0 --save
```

**步骤 2: 验证安装**

运行:
```bash
npx cap --version
```

预期输出: `6.x.x`

**步骤 3: Commit**

```bash
git add package.json package-lock.json
# 或者如果是 pnpm: git add package.json pnpm-lock.yaml
git commit -m "feat: 安装 Capacitor 核心依赖"
```

---

### Task 2: 初始化 Capacitor 配置

**目标:** 创建 Capacitor 配置文件并初始化项目

**文件:**
- 创建: `iGreenApp/capacitor.config.ts`
- 修改: `iGreenApp/vite.config.ts` (确认构建目录)

**步骤 1: 创建配置文件**

创建 `capacitor.config.ts`:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.igreen.engineer',
  appName: 'iGreen工程师',
  webDir: 'build',  // Vite 构建输出目录
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true,  // 允许明文通信（开发环境）
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff',
    },
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
};

export default config;
```

**步骤 2: 验证 vite.config.ts 构建配置**

确认 `vite.config.ts` 中:
```typescript
build: {
  target: 'esnext',
  outDir: 'build',  // 与 capacitor.config.ts 中的 webDir 一致
}
```

**步骤 3: 初始化 Capacitor**

运行:
```bash
npx cap init
```

预期输出: `Capacitor project initialized!`

**步骤 4: Commit**

```bash
git add capacitor.config.ts
git commit -m "feat: 初始化 Capacitor 配置"
```

---

### Task 3: 安装并添加 Android 平台

**目标:** 添加 Android 平台支持并生成原生项目

**文件:**
- 创建: `iGreenApp/android/` 目录（自动生成）
- 修改: `iGreenApp/package.json`

**步骤 1: 安装 Android 平台包**

运行:
```bash
npm install @capacitor/android@^6.0.0 --save
```

**步骤 2: 添加 Android 平台**

运行:
```bash
npx cap add android
```

预期输出:
```
√ Adding native android project in android (took xms)
√ Installing android dependencies (took xms)
√ add complete!
```

**步骤 3: 验证目录结构**

运行:
```bash
ls -la android/
```

预期存在:
- `android/app/`
- `android/build.gradle`
- `android/settings.gradle`

**步骤 4: Commit**

```bash
git add package.json android/
git commit -m "feat: 添加 Capacitor Android 平台"
```

---

## 第二阶段：Web 构建与资源同步

### Task 4: 配置生产环境构建

**目标:** 确保 Web 应用构建正确，适配移动端

**文件:**
- 创建: `iGreenApp/.env.production`
- 修改: `iGreenApp/vite.config.ts`

**步骤 1: 创建生产环境变量**

创建 `.env.production`:
```bash
VITE_API_URL=https://your-production-api.com
```

**步骤 2: 更新 vite.config.ts 移动端优化**

修改 `vite.config.ts`，添加移动端优化:
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    // ... 现有 alias 配置
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    // 移动端优化
    cssMinify: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 生产环境移除 console
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 'lucide-react'],
        },
      },
    },
  },
  server: {
    // ... 现有配置
  },
});
```

**步骤 3: 构建项目**

运行:
```bash
npm run build
```

预期输出: `build/` 目录包含 index.html 和静态资源

**步骤 4: Commit**

```bash
git add .env.production vite.config.ts
git commit -m "chore: 配置移动端生产构建优化"
```

---

### Task 5: 同步 Web 资源到 Android 项目

**目标:** 将 Web 构建产物复制到 Android 原生项目

**文件:**
- 修改: `iGreenApp/android/app/src/main/assets/` (自动生成)

**步骤 1: 执行同步命令**

运行:
```bash
npx cap sync android
```

预期输出:
```
√ Copying web assets from build to android/app/src/main/assets/public (took xms)
√ Updating Android plugins (took xms)
√ sync finished in xms
```

**步骤 2: 验证资源已同步**

运行:
```bash
ls -la android/app/src/main/assets/public/
```

预期存在:
- `index.html`
- `assets/` 目录

**步骤 3: Commit**

```bash
git add android/
git commit -m "chore: 同步 Web 资源到 Android 项目"
```

---

## 第三阶段：Android 项目配置

### Task 6: 配置 Android 应用基础信息

**目标:** 设置应用 ID、版本号、应用名称

**文件:**
- 修改: `iGreenApp/android/app/build.gradle`

**步骤 1: 更新应用配置**

修改 `android/app/build.gradle`:
```gradle
android {
    namespace "com.igreen.engineer"
    compileSdk 34
    
    defaultConfig {
        applicationId "com.igreen.engineer"
        minSdk 24        // Android 7.0+
        targetSdk 34     // Android 14
        versionCode 1
        versionName "1.0.0"
        
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

**步骤 2: 验证配置**

运行:
```bash
cd android && ./gradlew tasks --all | grep assemble
```

预期看到:
- `assembleDebug`
- `assembleRelease`

**步骤 3: Commit**

```bash
git add android/app/build.gradle
git commit -m "chore: 配置 Android 应用基础信息"
```

---

### Task 7: 配置应用权限

**目标:** 添加必要的 Android 权限（网络、相机、位置等）

**文件:**
- 修改: `iGreenApp/android/app/src/main/AndroidManifest.xml`

**步骤 1: 添加权限声明**

修改 `AndroidManifest.xml`，在 `<manifest>` 标签内添加:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

**步骤 2: 配置网络安全（允许明文通信）**

在 `application` 标签添加:
```xml
<application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:theme="@style/AppTheme"
    android:usesCleartextTraffic="true">  <!-- 允许 HTTP 明文通信 -->
    
    <!-- 现有 activity 配置 -->
    
</application>
```

**步骤 3: Commit**

```bash
git add android/app/src/main/AndroidManifest.xml
git commit -m "chore: 配置 Android 应用权限"
```

---

## 第四阶段：应用签名配置

### Task 8: 创建签名密钥

**目标:** 生成 Android 应用签名所需的 keystore 文件

**文件:**
- 创建: `iGreenApp/android/app/igreen-engineer.keystore`

**步骤 1: 生成密钥库**

运行:
```bash
cd android/app
keytool -genkey -v -keystore igreen-engineer.keystore -alias igreen-key \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=iGreen Engineer, OU=Engineering, O=iGreen, L=City, ST=State, C=CN"
```

设置密钥库密码: `igreen2025`（建议更复杂的密码）

**步骤 2: 创建签名配置模板**

创建 `android/signing.properties.example`:
```properties
# 复制此文件为 signing.properties 并填写实际密码
STORE_FILE=app/igreen-engineer.keystore
STORE_PASSWORD=your_keystore_password
KEY_ALIAS=igreen-key
KEY_PASSWORD=your_key_password
```

**步骤 3: 更新 build.gradle 读取签名配置**

修改 `android/app/build.gradle`:
```gradle
// 在 android 块之前添加
Properties signingProps = new Properties()
def signingFile = rootProject.file('signing.properties')
if (signingFile.exists()) {
    signingProps.load(new FileInputStream(signingFile))
}

android {
    // ... 现有配置
    
    signingConfigs {
        release {
            if (signingFile.exists()) {
                storeFile file(signingProps['STORE_FILE'])
                storePassword signingProps['STORE_PASSWORD']
                keyAlias signingProps['KEY_ALIAS']
                keyPassword signingProps['KEY_PASSWORD']
                v1SigningEnabled true
                v2SigningEnabled true
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

**步骤 4: Commit（不包含密钥文件）**

```bash
git add android/signing.properties.example android/app/build.gradle
git commit -m "chore: 配置 Android 应用签名"

# 将 keystore 添加到 .gitignore
echo "android/app/*.keystore" >> .gitignore
git add .gitignore
git commit -m "chore: 添加密钥文件到 gitignore"
```

---

## 第五阶段：构建 APK

### Task 9: 构建 Debug APK（测试用）

**目标:** 生成 Debug 版本 APK 用于测试

**文件:**
- 输出: `iGreenApp/android/app/build/outputs/apk/debug/app-debug.apk`

**步骤 1: 清理并构建**

运行:
```bash
cd android
./gradlew clean assembleDebug
```

**步骤 2: 验证 APK 生成**

运行:
```bash
ls -lh app/build/outputs/apk/debug/
```

预期输出: `app-debug.apk` (约 10-20MB)

**步骤 3: 安装到设备测试**

连接 Android 设备或启动模拟器，然后:
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

**步骤 4: Commit（构建输出不需要提交）**

Debug APK 是构建产物，不需要提交到 Git。

---

### Task 10: 构建 Release APK（发布用）

**目标:** 生成签名后的 Release APK

**前置条件:** 完成 Task 8 签名配置

**文件:**
- 输入: `iGreenApp/android/signing.properties`
- 输出: `iGreenApp/android/app/build/outputs/apk/release/app-release.apk`

**步骤 1: 创建签名配置文件**

创建 `android/signing.properties`:
```properties
STORE_FILE=app/igreen-engineer.keystore
STORE_PASSWORD=igreen2025
KEY_ALIAS=igreen-key
KEY_PASSWORD=igreen2025
```

**步骤 2: 构建 Release APK**

运行:
```bash
cd android
./gradlew clean assembleRelease
```

**步骤 3: 验证 APK 已签名**

运行:
```bash
jarsigner -verify -verbose -certs app/build/outputs/apk/release/app-release.apk
```

预期输出包含: `jar verified`

**步骤 4: 检查 APK 信息**

运行:
```bash
$ANDROID_HOME/build-tools/34.0.0/aapt dump badging app/build/outputs/apk/release/app-release.apk
```

预期看到:
- `package: name='com.igreen.engineer'`
- `versionCode='1'`
- `versionName='1.0.0'`

---

## 第六阶段：优化与增强

### Task 11: 添加应用图标

**目标:** 为 Android 应用配置启动图标

**文件:**
- 创建: 图标资源文件

**步骤 1: 准备图标资源**

在项目根目录创建 `resources/` 文件夹，放置:
- `icon.png` (1024x1024px)
- `splash.png` (2732x2732px)

**步骤 2: 安装 Capacitor Assets 工具**

运行:
```bash
npm install @capacitor/assets --save-dev
```

**步骤 3: 生成图标和启动屏**

运行:
```bash
npx capacitor-assets generate --android
```

**步骤 4: 同步到 Android 项目**

运行:
```bash
npx cap sync android
```

**步骤 5: Commit**

```bash
git add resources/ android/app/src/main/res/
git commit -m "feat: 添加 Android 应用图标和启动屏"
```

---

### Task 12: 添加原生插件（可选）

**目标:** 集成常用原生插件（相机、地理位置等）

**文件:**
- 修改: `iGreenApp/package.json`
- 修改: `iGreenApp/android/` 相关配置

**步骤 1: 安装相机插件**

运行:
```bash
npm install @capacitor/camera
npx cap sync android
```

**步骤 2: 更新 AndroidManifest.xml 权限**

确保 `AndroidManifest.xml` 包含相机权限（已在 Task 7 添加）

**步骤 3: 在前端代码中使用**

修改相关组件，添加相机调用:
```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

async function takePhoto() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri
  });
  return image.webPath;
}
```

**步骤 4: Commit**

```bash
git add package.json src/components/
git commit -m "feat: 集成 Capacitor 相机插件"
```

---

## 第七阶段：CI/CD 配置（可选）

### Task 13: 创建 GitHub Actions 工作流

**目标:** 配置自动构建和发布

**文件:**
- 创建: `.github/workflows/build-apk.yml`

**步骤 1: 创建工作流文件**

创建 `.github/workflows/build-apk.yml`:
```yaml
name: Build Android APK

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'
        
    - name: Install dependencies
      run: |
        cd iGreenApp
        npm ci
        
    - name: Build web app
      run: |
        cd iGreenApp
        npm run build
        
    - name: Sync Capacitor
      run: |
        cd iGreenApp
        npx cap sync android
        
    - name: Build Debug APK
      run: |
        cd iGreenApp/android
        ./gradlew assembleDebug
        
    - name: Upload APK
      uses: actions/upload-artifact@v4
      with:
        name: debug-apk
        path: iGreenApp/android/app/build/outputs/apk/debug/app-debug.apk
```

**步骤 2: Commit**

```bash
git add .github/workflows/build-apk.yml
git commit -m "ci: 添加 GitHub Actions APK 构建工作流"
```

---

## 第八阶段：文档和交付

### Task 14: 创建打包文档

**目标:** 编写打包操作手册

**文件:**
- 创建: `docs/capacitor-build-guide.md`

**步骤 1: 创建文档**

内容应包含:
1. 环境准备
2. 构建命令速查
3. 发布流程
4. 常见问题

**步骤 2: Commit**

```bash
git add docs/capacitor-build-guide.md
git commit -m "docs: 添加 Capacitor 打包指南"
```

---

## 验证清单

完成所有任务后，确认以下检查项:

- [ ] `capacitor.config.ts` 配置正确
- [ ] `npx cap sync android` 执行成功
- [ ] Debug APK 可以正常安装和运行
- [ ] Release APK 已签名并可安装
- [ ] 应用图标和启动屏显示正常
- [ ] 网络请求可以正常访问后端 API
- [ ] 基本功能（登录、工单列表等）工作正常

---

## 命令速查表

```bash
# 日常开发
npm run dev              # 启动 Web 开发服务器
npx cap sync android     # 同步 Web 资源到 Android
npx cap open android     # 打开 Android Studio

# 构建 APK
cd android && ./gradlew assembleDebug    # Debug APK
cd android && ./gradlew assembleRelease  # Release APK

# 安装测试
adb install android/app/build/outputs/apk/debug/app-debug.apk
adb install android/app/build/outputs/apk/release/app-release.apk

# 调试
adb logcat | grep Capacitor     # 查看日志
chrome://inspect/#devices       # Chrome 远程调试
```

---

**计划制定完成！**

## 执行方式选择

**1. Subagent-Driven Development（推荐）**
- 我使用 `superpowers:subagent-driven-development` 在当前会话执行任务
- 每个 Task 使用新的 subagent 执行
- 我在每个任务后审查并继续下一个

**2. 并行会话执行**
- 新开一个会话，使用 `superpowers:executing-plans` 批量执行
- 适合一次性完成多个独立任务

**请选择执行方式，我将立即开始实施。**
