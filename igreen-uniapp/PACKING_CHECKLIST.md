# iGreen+ APK 打包流程指南

## 📋 打包前检查清单

### ✅ 已完成的准备

- [x] 项目代码 (6个页面，20个组件)
- [x] 图标资源 (7个尺寸)
- [x] 启动图 (2个尺寸)
- [x] manifest.json 配置
- [x] 打包脚本

### 待完成 (在 HBuilderX 中操作)

- [ ] 配置 App 图标
- [ ] 配置启动图
- [ ] 云打包

---

## 🚀 打包步骤

### 步骤 1: 打开 HBuilderX

```bash
# 方式 A: 使用命令行
open /Applications/HBuilderX.app

# 方式 B: 手动打开
# 在应用程序中找到 HBuilderX 并打开
```

### 步骤 2: 导入项目

1. HBuilderX 启动后，点击 **"打开项目"**
2. 或菜单: **文件 → 打开项目**
3. 选择路径: `/Users/mac/workspace/iGreenProduct/igreen-uniapp`
4. 点击 **"打开"**

### 步骤 3: 配置 App 图标

1. 在项目上 **右键单击**
2. 选择 **工具 → 图标配置 → App图标**
3. 在弹出的窗口中:
   - 点击 **"选择图片"**
   - 选择文件: `src/static/icons/app-icon-1024.png`
   - 点击 **"生成所有图标"**
   - 点击 **"保存"**

### 步骤 4: 配置启动图

1. 在项目上 **右键单击**
2. 选择 **工具 → 启动图配置**
3. 在弹出的窗口中:
   - 勾选 **"使用本地启动图"**
   - **iPhone Portrait**: 选择 `src/static/splash/splash-iphone.png`
   - **Android Portrait**: 选择 `src/static/splash/splash-android.png`
   - 点击 **"保存"**

### 步骤 5: 云打包 APK

1. 菜单栏点击 **发行**
2. 选择 **原生 App-云打包**
3. 在弹出的窗口中配置:

   | 配置项 | 值 |
   |--------|-----|
   | 打包类型 | 打包 APK |
   | Android 包名 | `com.igreen.app` |
   | 版本名称 | `1.0.0` |
   | 版本号 | `100` |
   | 使用云端证书 | ☑️ 勾选 |

4. 点击 **"打包"**
5. 等待 3-5 分钟
6. 点击 **"下载"** 保存 APK 文件

---

## 📱 安装测试

打包完成后:

1. 将 APK 文件传输到 Android 手机
2. 在手机上打开 APK 文件
3. 根据提示安装
4. 测试登录、工单等功能

---

## 🔧 常见问题

### Q1: 图标显示不正确

**解决**: 重新配置图标
```
工具 → 图标配置 → App图标 → 重新选择图片 → 保存
```

### Q2: 启动白屏

**可能原因**:
1. API 地址不可用
2. 权限未配置

**解决**: 检查 manifest.json 中的权限配置

### Q3: 打包失败

**解决**:
1. 检查网络连接
2. 确认 DCloud 账号已登录
3. 尝试使用本地打包

---

## 📞 相关链接

- [DCloud 开发者中心](https://dev.dcloud.net.cn/)
- [uni-app 文档](https://uniapp.dcloud.io/)
- [HBuilderX 下载](https://www.dcloud.io/hbuilderx.html)

---

## 📁 项目资源清单

```
igreen-uniapp/src/static/
├── icons/                    # App 图标
│   ├── app-icon-1024.png
│   ├── app-icon-192.png
│   ├── app-icon-180.png
│   ├── app-icon-144.png
│   ├── app-icon-96.png
│   ├── app-icon-72.png
│   └── app-icon-48.png
└── splash/                   # 启动图
    ├── splash-iphone.png     # 1242x2208
    └── splash-android.png    # 1080x1920
```

**打包状态**: ✅ 就绪  
**预计打包时间**: 3-5 分钟
