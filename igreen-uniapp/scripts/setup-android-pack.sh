#!/bin/bash

# setup-android-pack.sh - Android 离线打包环境设置脚本

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SDK_VERSION="3.8.0"
SDK_DOWNLOAD_URL="https://download1.dcloud.io/unisdk/uni-app/download/full/${SDK_VERSION}/uni-app-offline-sdk-android-${SDK_VERSION}.zip"
SDK_FILENAME="uni-app-offline-sdk-android-${SDK_VERSION}.zip"
ANDROID_DIR="$PROJECT_DIR/android-pack"

echo "========================================="
echo "  iGreen+ Android 打包环境设置"
echo "========================================="
echo ""
echo "项目目录: $PROJECT_DIR"
echo "SDK 版本: $SDK_VERSION"
echo ""

# 检查是否已安装
if [ -d "$ANDROID_DIR" ]; then
  echo "⚠️  检测到已存在的 Android 项目"
  echo ""
  read -p "是否重新设置? (y/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "取消设置"
    exit 0
  fi
  rm -rf "$ANDROID_DIR"
  echo "已删除旧项目"
  echo ""
fi

# 创建目录
mkdir -p "$ANDROID_DIR"

# 下载 SDK
echo "📥 步骤 1/4: 下载 Android 离线 SDK"
echo ""
echo "下载地址: $SDK_DOWNLOAD_URL"
echo ""

if [ ! -f "/tmp/$SDK_FILENAME" ]; then
  if command -v curl &> /dev/null; then
    curl -L -o "/tmp/$SDK_FILENAME" "$SDK_DOWNLOAD_URL"
  elif command -v wget &> /dev/null; then
    wget -O "/tmp/$SDK_FILENAME" "$SDK_DOWNLOAD_URL"
  else
    echo "❌ 错误: 需要安装 curl 或 wget"
    exit 1
  fi
else
  echo "✅ SDK 已存在于 /tmp/"
fi

echo ""
echo "✅ SDK 下载完成"
echo ""

# 解压 SDK
echo "📥 步骤 2/4: 解压 SDK"
echo ""

unzip -q "/tmp/$SDK_FILENAME" -d "$ANDROID_DIR"

echo "✅ SDK 解压完成"
echo ""

# 配置项目
echo "📥 步骤 3/4: 配置 Android 项目"
echo ""

APP_ID="__UNI__3B8A5C9"
PACKAGE_NAME="com.igreen.app"
VERSION_NAME="1.0.0"
VERSION_CODE="100"

PROJECT_NAME="HelloUniapp"
PROJECT_PATH="$ANDROID_DIR/$PROJECT_NAME"

# 更新 dcloud_properties.xml
PROPS_FILE="$PROJECT_PATH/src/main/assets/data/dcloud_properties.xml"
if [ -f "$PROPS_FILE" ]; then
  sed -i.bak "s/<property name=\"appid\" value=\"[^\"]*\"/<property name=\"appid\" value=\"$APP_ID\"/>/" "$PROPS_FILE"
  sed -i.bak "s/<property name=\"name\" value=\"[^\"]*\"/<property name=\"name\" value=\"iGreen+\"/>/" "$PROPS_FILE"
  sed -i.bak "s/<property name=\"version\" value=\"[^\"]*\"/<property name=\"version\" value=\"$VERSION_NAME\"/>/" "$PROPS_FILE"
  sed -i.bak "s/<property name=\"package\" value=\"[^\"]*\"/<property name=\"package\" value=\"$PACKAGE_NAME\"/>/" "$PROPS_FILE"
  echo "✅ dcloud_properties.xml 配置完成"
fi

# 更新 AndroidManifest.xml
MANIFEST_FILE="$PROJECT_PATH/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST_FILE" ]; then
  # 更新包名
  sed -i.bak "s/package=\"com\.example\.app\"/package=\"$PACKAGE_NAME\"/" "$MANIFEST_FILE"
  echo "✅ AndroidManifest.xml 配置完成"
fi

# 创建 build.gradle 签名配置
BUILD_GRADLE="$PROJECT_PATH/app/build.gradle"
if [ -f "$BUILD_GRADLE" ]; then
  if ! grep -q "signingConfigs" "$BUILD_GRADLE"; then
    # 在 android 块之前插入签名配置
    sed -i.bak '/^android {/i \
\
android {\
    signingConfigs {\
        debug {\
            storeFile file("debug.keystore")\
            storePassword "android"\
            keyAlias "androiddebugkey"\
            keyPassword "android"\
        }\
    }\
' "$BUILD_GRADLE"
    echo "✅ build.gradle 签名配置添加完成"
  fi
fi

echo ""

# 清理备份文件
find "$ANDROID_DIR" -name "*.bak" -delete
rm -f "/tmp/$SDK_FILENAME"

echo "📥 步骤 4/4: 完成"
echo ""
echo "========================================="
echo "  ✅ 设置完成!"
echo "========================================="
echo ""
echo "Android 项目位置: $PROJECT_PATH"
echo ""
echo "下一步:"
echo "  1. 构建 App 资源: npm run build:app"
echo "  2. 打包 APK: npm run build:android"
echo "  3. 或直接用 Android Studio 打开项目手动编译"
echo ""
echo "详细文档: ANDROID_PACKAGING.md"
echo ""
