# Capacitor Android 打包学习笔记

## 2026-02-01 验证完成

### 已完成的验证项

1. ✅ capacitor.config.ts 配置正确
   - appId: com.igreen.engineer
   - appName: iGreen工程师
   - webDir: build
   - 插件配置: SplashScreen, StatusBar

2. ✅ npx cap sync android 执行成功
   - 同步时间: ~0.4s
   - 检测到插件: @capacitor/camera@6.1.3

3. ✅ Debug APK 构建成功
   - 文件: app-debug.apk
   - 大小: 6.3MB
   - 构建时间: ~11s

4. ✅ Release APK 已签名
   - 文件: app-release.apk
   - 大小: 5.0MB
   - 签名验证: jarsigner 验证通过

5. ✅ 应用图标和启动屏
   - 图标资源: 74 个文件 (mipmap-xxxhdpi 等)
   - 启动屏: 支持横竖屏和深色模式

6. ✅ 网络权限配置
   - INTERNET 权限
   - ACCESS_NETWORK_STATE 权限
   - usesCleartextTraffic="true"

7. ✅ Web 资源打包
   - index.html 正确生成
   - JS/CSS 资源已打包
   - 相机插件已集成

### 关键配置

**国内镜像加速:**
- Gradle: https://mirrors.cloud.tencent.com/gradle/
- Maven: https://maven.aliyun.com/repository/public

**插件版本兼容:**
- Capacitor 6.x 使用 @capacitor/camera@latest-6 (6.1.3)
- 避免使用 v8 插件与 Capacitor 6 混用

**构建命令:**
```bash
yarn build
npx cap sync android
cd android && ./gradlew assembleRelease
```
