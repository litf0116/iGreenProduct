#!/bin/bash

# iGreen+ Android 本地打包完整指南
# 
# 由于本地打包需要 Android Studio，本指南提供两种方案:
# 方案A: 使用 HBuilderX 云打包 (推荐，最简单)
# 方案B: 本地 Android Studio 打包 (需要安装 ~5GB 软件)
#

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "============================================"
echo "  iGreen+ Android APK 打包"
echo "============================================"
echo ""
echo "选择打包方式:"
echo "  [1] HBuilderX 云打包 (推荐，5分钟完成)"
echo "  [2] 本地 Android Studio 打包 (需要安装 ~5GB)"
echo "  [3] 只构建 App 资源"
echo ""
read -p "请选择 [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "============================================"
        echo "  方案A: HBuilderX 云打包"
        echo "============================================"
        echo ""
        echo "步骤:"
        echo "  1. 打开 HBuilderX"
        echo "  2. 文件 → 导入 → 选择 igreen-uniapp 目录"
        echo "  3. 菜单: 发行 → 原生 App-云打包"
        echo "  4. 配置:"
        echo "     - Android 包名: com.igreen.app"
        echo "     - 版本名称: 1.0.0"
        echo "     - 版本号: 100"
        echo "  5. 点击「打包」"
        echo ""
        echo "预计耗时: 3-5 分钟"
        echo ""
        echo "详细文档: APK_BUILD_GUIDE.md"
        ;;
        
    2)
        echo ""
        echo "============================================"
        echo "  方案B: 本地 Android Studio 打包"
        echo "============================================"
        echo ""
        echo "前置要求:"
        echo "  - Homebrew 已安装"
        echo "  - Java 17+"
        echo "  - Android Studio"
        echo "  - ~5GB 磁盘空间"
        echo ""
        echo "运行安装脚本:"
        echo "  bash android-setup.sh"
        echo ""
        echo "详细文档: LOCAL_APK_BUILD.md"
        ;;
        
    3)
        echo ""
        echo "============================================"
        echo "  构建 App 资源"
        echo "============================================"
        echo ""
        
        # 检查 HBuilderX
        if [ -d "/Applications/HBuilderX.app" ]; then
            echo "使用 HBuilderX CLI 构建..."
            CLI="/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli-vite"
            if [ -f "$CLI/index.js" ]; then
                node "$CLI" build --platform app-plus
                echo ""
                echo "✅ 构建完成!"
                echo "输出目录: dist/build/app-plus/"
            else
                echo "❌ 未找到 HBuilderX CLI"
            fi
        else
            echo "❌ HBuilderX 未安装"
            echo ""
            echo "请选择方案A或方案B"
        fi
        ;;
        
    *)
        echo "无效选择"
        exit 1
        ;;
esac
