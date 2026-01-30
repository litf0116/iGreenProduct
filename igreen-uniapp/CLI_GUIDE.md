# HBuilderX CLI 安装和使用指南

## 概述

HBuilderX CLI 是 uni-app 官方的命令行开发工具，支持完全的命令行操作，无需 GUI。

---

## 安装

### 步骤 1: 下载 HBuilderX

#### macOS

1. 访问: https://www.dcloud.io/hbuilderx.html
2. 下载 macOS 版本
3. 解压并安装到 `/Applications/HBuilderX.app`

#### Linux

1. 访问: https://www.dcloud.io/hbuilderx.html
2. 下载 Linux 版本（tar.gz）
3. 解压到 `~/HBuilderX`
4. 添加到 PATH:
   ```bash
   echo 'export PATH=$PATH:$HOME/HBuilderX' >> ~/.bashrc
   source ~/.bashrc
   ```

### 步骤 2: 添加 CLI 到 PATH

#### macOS

```bash
# 临时添加（仅当前终端）
export PATH=$PATH:/Applications/HBuilderX.app/Contents/MacOS

# 永久添加（所有终端）
echo 'export PATH=$PATH:/Applications/HBuilderX.app/Contents/MacOS' >> ~/.zshrc
source ~/.zshrc

# 验证安装
which hbx
hbx --version
```

#### Linux

```bash
# 临时添加
export PATH=$PATH:$HOME/HBuilderX

# 永久添加
echo 'export PATH=$PATH:$HOME/HBuilderX' >> ~/.bashrc
source ~/.bashrc

# 验证安装
which hbx
hbx --version
```

### 步骤 3: 验证安装

```bash
# 检查是否安装成功
which hbx

# 查看版本
hbx --version

# 查看帮助
hbx --help
```

### 自动安装脚本

本项目提供了自动安装脚本：

```bash
cd igreen-uniapp
npm run install:hbx-cli
```

---

## 使用

### 开发

#### H5 开发

```bash
cd igreen-uniapp

# 方式 1: 使用 npm script
npm run dev:h5

# 方式 2: 直接使用 hbx
hbx run --platform h5

# 方式 3: 指定浏览器
hbx run --platform h5 --browser chrome
```

**效果**: 启动 H5 开发服务器，通常在 `http://localhost:8080`

#### App 开发

```bash
cd igreen-uniapp

# 方式 1: 使用 npm script
npm run dev:app

# 方式 2: 直接使用 hbx
hbx run --platform app
```

**效果**: 启动 App 基座，需要连接真机或模拟器

#### 微信小程序开发

```bash
cd igreen-uniapp

# 方式 1: 使用 npm script
npm run dev:mp-weixin

# 方式 2: 直接使用 hbx
hbx run --platform mp-weixin
```

**效果**: 生成微信小程序代码，需要在微信开发者工具中打开

### 构建

#### H5 构建

```bash
cd igreen-uniapp

# 方式 1: 使用 npm script
npm run build:h5

# 方式 2: 直接使用 hbx
hbx build --platform h5
```

**输出**: `unpackage/dist/build/h5/`

#### App 构建

```bash
cd igreen-uniapp

# 方式 1: 使用 npm script
npm run build:app

# 方式 2: 直接使用 hbx
hbx build --platform app
```

**输出**: `unpackage/resources/build/android/`

### 其他平台

```bash
# 微信小程序
hbx build --platform mp-weixin

# 支付宝小程序
hbx build --platform mp-alipay

# 百度小程序
hbx build --platform mp-baidu

# 字节跳动小程序
hbx build --platform mp-toutiao
```

---

## CLI 命令参考

### 常用命令

| 命令 | 说明 |
|------|------|
| `hbx run` | 运行项目 |
| `hbx build` | 构建项目 |
| `hbx create` | 创建新项目 |
| `hbx --version` | 查看版本 |
| `hbx --help` | 查看帮助 |

### 运行选项

```bash
# 指定平台
hbx run --platform h5        # H5
hbx run --platform app        # App
hbx run --platform mp-weixin  # 微信小程序

# 指定模式
hbx run --mode production

# 指定浏览器（H5）
hbx run --platform h5 --browser chrome
hbx run --platform h5 --browser safari
```

### 构建选项

```bash
# 指定平台
hbx build --platform h5
hbx build --platform app

# 指定输出目录
hbx build --platform h5 --output ./dist

# 指定模式
hbx build --mode production

# 清理缓存
hbx build --clean
```

---

## 常见问题

### Q1: `hbx: command not found`

**原因**: CLI 未添加到 PATH

**解决**:
```bash
# macOS
export PATH=$PATH:/Applications/HBuilderX.app/Contents/MacOS

# Linux
export PATH=$PATH:$HOME/HBuilderX
```

### Q2: 版本太旧

**解决**:
1. 下载最新版 HBuilderX
2. 覆盖安装
3. 重新验证: `hbx --version`

### Q3: 权限错误（macOS）

**原因**: HBuilderX.app 没有执行权限

**解决**:
```bash
chmod +x /Applications/HBuilderX.app/Contents/MacOS/hbx
```

### Q4: Linux 下 CLI 不可用

**原因**: HBuilderX.app 目录结构不同

**解决**:
1. 确保解压到 `~/HBuilderX`
2. 检查 `~/HBuilderX/hbx` 是否存在
3. 添加到 PATH

---

## 快速参考

### 开发工作流

```bash
cd igreen-uniapp

# H5 开发
npm run dev:h5

# 修改代码后自动刷新...

# 构建
npm run build:h5
```

### App 打包工作流

```bash
cd igreen-uniapp

# 1. 构建 App 资源
npm run build:app

# 2. 本地打包 APK
npm run build:android

# 3. APK 位置
# android-pack/HelloUniapp/app/build/outputs/apk/release/
```

---

## 相关文档

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [HBuilderX 下载](https://www.dcloud.io/hbuilderx.html)
- [项目 README](./README.md)
- [Android 打包指南](./ANDROID_PACKAGING.md)

---

## 支持

如有问题：
1. 查看本文档的"常见问题"章节
2. 检查 HBuilderX 官方文档
3. 查看 CLI 帮助: `hbx --help`
