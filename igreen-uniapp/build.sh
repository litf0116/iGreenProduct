#!/bin/bash

# iGreen+ UniApp Build Script
# 使用 HBuilderX 内置 CLI 构建

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HBuilderX_CLI="/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli-vite"

echo "============================================"
echo "  iGreen+ UniApp Build Script"
echo "============================================"
echo ""
echo "Project: $PROJECT_DIR"
echo "CLI: $HBuilderX_CLI"
echo ""

# 检查 HBuilderX 是否安装
if [ ! -d "$HBuilderX_CLI" ]; then
  echo "❌ Error: HBuilderX not found at $HBuilderX_CLI"
  echo ""
  echo "Please install HBuilderX from:"
  echo "  https://www.dcloud.io/hbuilderx.html"
  exit 1
fi

# 切换到项目目录
cd "$PROJECT_DIR"

# 确保依赖已安装
echo "📦 Installing dependencies..."
npm install

# 构建函数
build_app() {
  echo ""
  echo "🚀 Building App Plus..."
  node "$HBuilderX_CLI/index.js" build --platform app-plus
  echo ""
  echo "✅ Build complete!"
  echo "Output: dist/build/app-plus/"
}

build_h5() {
  echo ""
  echo "🚀 Building H5..."
  node "$HBuilderX_CLI/index.js" build --platform h5
  echo ""
  echo "✅ Build complete!"
  echo "Output: dist/build/h5/"
}

# 解析参数
case "${1:-h5}" in
  app)
    build_app
    ;;
  h5)
    build_h5
    ;;
  all)
    build_h5
    build_app
    ;;
  *)
    echo "Usage: $0 [app|h5|all]"
    echo ""
    echo "Options:"
    echo "  app    Build Android/iOS App (app-plus)"
    echo "  h5     Build H5 web app (default)"
    echo "  all    Build both H5 and App"
    exit 0
    ;;
esac

echo ""
echo "============================================"
echo "  Build completed successfully!"
echo "============================================"
