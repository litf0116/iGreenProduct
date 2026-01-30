#!/bin/bash

# build-android.sh - 本地 Android APK 构建脚本

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "========================================="
echo "  iGreen+ 本地 Android 打包"
echo "========================================="
echo ""

# 检查 Android 项目是否存在
ANDROID_DIR="$PROJECT_DIR/android-pack/HelloUniapp"
if [ ! -d "$ANDROID_DIR" ]; then
  echo "❌ 错误: 未找到 Android 项目"
  echo "   请先下载离线 SDK 并运行 setup-android-pack.sh"
  echo ""
  echo "   SDK 下载地址:"
  echo "   https://uniapp.dcloud.net.cn/tutorial/app/android/localrun.html"
  exit 1
fi

echo "📦 步骤 1: 构建 App 资源"
cd "$PROJECT_DIR"

# 检查是否安装了 HBuilderX CLI
if command -v hbx &> /dev/null; then
  echo "使用 HBuilderX CLI 构建..."
  hbx build --platform app
else
  echo "⚠️  警告: HBuilderX CLI 未安装"
  echo "   将使用 npm run build:app"
  echo "   建议运行: npm run install:hbx-cli"
  echo ""
  npm run build:app
fi

if [ ! -d "$PROJECT_DIR/unpackage/resources/build/android" ]; then
  echo "❌ 错误: 资源构建失败"
  exit 1
fi

echo "✅ 资源构建完成"
echo ""

# 检查 APK ID
APP_ID="__UNI__3B8A5C9"
TARGET_DIR="$ANDROID_DIR/src/main/assets/apps/$APP_ID"

echo "📦 步骤 2: 复制资源到 Android 项目"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -r "$PROJECT_DIR/unpackage/resources/build/android/"* "$TARGET_DIR/"

echo "✅ 资源复制完成"
echo ""

echo "📦 步骤 3: 配置应用信息"

# 更新 dcloud_properties.xml
PROPS_FILE="$ANDROID_DIR/src/main/assets/data/dcloud_properties.xml"
if [ -f "$PROPS_FILE" ]; then
  sed -i.bak 's/<property name="appid" value="[^"]*"/<property name="appid" value="'$APP_ID'"/' "$PROPS_FILE"
  echo "✅ 应用 ID 配置完成"
else
  echo "⚠️  警告: dcloud_properties.xml 不存在"
fi

echo ""
echo "📦 步骤 4: 使用 Android Studio 编译 APK"
echo ""
echo "请执行以下步骤:"
echo ""
echo "  1. 打开 Android Studio"
echo "  2. File → Open → 选择: $ANDROID_DIR"
echo "  3. Build → Build Bundle(s) / APK(s) → Build APK(s)"
echo "  4. 选择 release 构建类型"
echo "  5. 等待编译完成"
echo ""
echo "编译完成后，APK 文件位于:"
echo "  $ANDROID_DIR/app/build/outputs/apk/release/"
echo ""
