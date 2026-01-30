#!/bin/bash

# iGreen+ 打包启动脚本
# 快速打开 HBuilderX 并准备打包

set -e

PROJECT_DIR="/Users/mac/workspace/iGreenProduct/igreen-uniapp"
HBUILDERX="/Applications/HBuilderX.app"

echo "============================================"
echo "  iGreen+ APK 打包准备"
echo "============================================"
echo ""

# 检查 HBuilderX
if [ ! -d "$HBUILDERX" ]; then
    echo "❌ HBuilderX 未安装"
    echo "   下载: https://www.dcloud.io/hbuilderx.html"
    exit 1
fi

echo "✅ HBuilderX 已安装"

# 检查项目
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ 项目目录不存在: $PROJECT_DIR"
    exit 1
fi

echo "✅ 项目目录存在"

# 检查图标
if [ -d "$PROJECT_DIR/src/static/icons" ]; then
    ICON_COUNT=$(ls "$PROJECT_DIR/src/static/icons"/*.png 2>/dev/null | wc -l)
    echo "✅ 图标已生成 ($ICON_COUNT 个)"
else
    echo "⚠️  图标未生成，运行: npm run generate:icons"
fi

# 检查启动图
if [ -d "$PROJECT_DIR/src/static/splash" ]; then
    SPLASH_COUNT=$(ls "$PROJECT_DIR/src/static/splash"/*.png 2>/dev/null | wc -l)
    echo "✅ 启动图已生成 ($SPLASH_COUNT 个)"
else
    echo "⚠️  启动图未生成，运行: npm run generate:icons"
fi

echo ""
echo "============================================"
echo "  打包步骤"
echo "============================================"
echo ""
echo "  1. HBuilderX 将自动打开"
echo "  2. 导入项目: $PROJECT_DIR"
echo "  3. 配置图标: 右键项目 → 工具 → 图标配置 → App图标"
echo "  4. 配置启动图: 右键项目 → 工具 → 启动图配置"
echo "  5. 打包: 发行 → 原生 App-云打包 → 打包 APK"
echo ""
echo "📖 详细文档: PACKING_CHECKLIST.md"
echo ""

# 打开项目
echo "🚀 打开 HBuilderX..."
open -a "$HBUILDERX" "$PROJECT_DIR"

echo ""
echo "============================================"
echo "  准备完成!"
echo "============================================"
