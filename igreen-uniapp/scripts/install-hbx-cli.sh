#!/bin/bash

# install-hbx-cli.sh - HBuilderX CLI 安装脚本

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_VERSION="3.8.0"
CLI_FILENAME="HBuilderX.3.8.0.dmg"
CLI_DOWNLOAD_URL="https://download1.dcloud.io/hbuilderx/HBuilderX.3.8.0.dmg"

echo "========================================="
echo "  HBuilderX CLI 安装脚本"
echo "========================================="
echo ""
echo "HBuilderX CLI 不是纯 npm 包，需要从 DCloud 官网下载。"
echo ""

# 检查系统类型
if [[ "$OSTYPE" == "darwin"* ]]; then
  PLATFORM="macos"
  echo "检测到系统: macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  PLATFORM="linux"
  echo "检测到系统: Linux"
else
  echo "❌ 错误: 不支持的系统: $OSTYPE"
  exit 1
fi

echo ""
echo "📥 步骤 1/3: 下载 HBuilderX"
echo ""
echo "下载地址: $CLI_DOWNLOAD_URL"
echo ""

# 下载 DMG（macOS）或 tar.gz（Linux）
DOWNLOAD_DIR="/tmp"
DOWNLOAD_FILE="$DOWNLOAD_DIR/$CLI_FILENAME"

if [ ! -f "$DOWNLOAD_FILE" ]; then
  if command -v curl &> /dev/null; then
    echo "使用 curl 下载..."
    curl -L -o "$DOWNLOAD_FILE" "$CLI_DOWNLOAD_URL"
  elif command -v wget &> /dev/null; then
    echo "使用 wget 下载..."
    wget -O "$DOWNLOAD_FILE" "$CLI_DOWNLOAD_URL"
  else
    echo "❌ 错误: 需要安装 curl 或 wget"
    exit 1
  fi
  
  if [ -f "$DOWNLOAD_FILE" ]; then
    echo "✅ 下载完成: $DOWNLOAD_FILE"
  else
    echo "❌ 下载失败"
    exit 1
  fi
else
  echo "✅ 文件已存在: $DOWNLOAD_FILE"
fi

echo ""
echo "📥 步骤 2/3: 安装 HBuilderX"
echo ""

if [[ "$PLATFORM" == "macos" ]]; then
  if [ ! -d "/Applications/HBuilderX.app" ]; then
    echo "请手动安装 HBuilderX.app"
    echo ""
    echo "步骤:"
    echo "  1. 打开: $DOWNLOAD_FILE"
    echo "  2. 将 HBuilderX.app 拖到 /Applications/"
    echo "  3. 安装完成后，CLI 命令 'hbx' 将可用"
    echo ""
    echo "安装完成后，请重新运行此脚本验证安装"
    exit 0
  else
    echo "✅ HBuilderX.app 已安装在 /Applications/"
  fi
else
  if [[ "$PLATFORM" == "linux" ]]; then
    if [ ! -d "$HOME/HBuilderX" ]; then
      echo "请手动安装 HBuilderX"
      echo ""
      echo "步骤:"
      echo "  1. 解压: $DOWNLOAD_FILE"
      echo "  2. 移动到: $HOME/HBuilderX"
      echo "  3. 添加到 PATH: export PATH=\$PATH:\$HOME/HBuilderX"
      echo ""
      exit 0
    else
      echo "✅ HBuilderX 已安装"
    fi
  fi
fi

echo ""
echo "📥 步骤 3/3: 验证安装"
echo ""

if command -v hbx &> /dev/null; then
  echo "✅ HBuilderX CLI 安装成功！"
  echo ""
  echo "CLI 路径: $(which hbx)"
  hbx --version 2>/dev/null || hbx -V 2>/dev/null || echo "无法获取版本"
  echo ""
  echo "========================================="
  echo "  ✅ 安装完成!"
  echo "========================================="
  echo ""
  echo "现在可以使用以下命令:"
  echo "  hbx run --platform h5        # H5 开发"
  echo "  hbx run --platform app        # App 开发"
  echo "  hbx build --platform h5      # H5 构建"
  echo "  hbx build --platform app      # App 构建"
  echo ""
  echo "更多帮助: hbx --help"
  echo ""
else
  echo "⚠️  警告: hbx 命令未找到"
  echo ""
  echo "请检查:"
  echo "  1. HBuilderX 是否正确安装"
  echo "  2. CLI 是否添加到 PATH"
  echo ""
  echo "手动添加到 PATH（macOS/Linux）:"
  echo '  export PATH=$PATH:/Applications/HBuilderX.app/Contents/MacOS'
  echo ""
  echo "或添加到 ~/.bashrc 或 ~/.zshrc:"
  echo '  export PATH=$PATH:/Applications/HBuilderX.app/Contents/MacOS'
fi

# 清理下载文件（可选）
# rm -f "$DOWNLOAD_FILE"
