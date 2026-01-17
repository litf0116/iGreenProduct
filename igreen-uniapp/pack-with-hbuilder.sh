#!/bin/bash

# iGreen+ HBuilderX 打包助手
# 
# 使用方法:
#   ./pack-with-hbuilder.sh        # 交互式菜单
#   ./pack-with-hbuilder.sh cloud  # 直接云打包
#   ./pack-with-hbuilder.sh local  # 生成本地资源
#

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "============================================"
echo "  iGreen+ HBuilderX 打包助手"
echo "============================================"
echo ""
echo "项目路径: $PROJECT_DIR"
echo ""

# 检查 HBuilderX
HBUILDERX="/Applications/HBuilderX.app"
if [ ! -d "$HBUILDERX" ]; then
    echo "❌ HBuilderX 未安装"
    echo ""
    echo "请先安装 HBuilderX:"
    echo "  1. 访问: https://www.dcloud.io/hbuilderx.html"
    echo "  2. 下载 Mac 版本"
    echo "  3. 安装后运行此脚本"
    exit 1
fi

echo "✅ HBuilderX 已安装"

# 检查项目配置
if [ ! -f "src/manifest.json" ]; then
    echo "❌ manifest.json 不存在"
    exit 1
fi

echo "✅ 项目配置完整"

# 显示当前配置
echo ""
echo "当前配置:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat src/manifest.json | grep -E '"name"|"appid"|"versionName"|"versionCode"' | head -4
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 解析参数
MODE="${1:-menu}"

case $MODE in
    cloud)
        echo ""
        echo "🚀 准备云打包..."
        echo ""
        echo "请在 HBuilderX 中执行以下操作:"
        echo ""
        echo "  1. 打开 HBuilderX"
        echo "  2. 文件 → 导入 → 选择当前目录"
        echo "  3. 菜单: 发行 → 原生 App-云打包"
        echo "  4. 配置:"
        echo "     - Android 包名: com.igreen.app"
        echo "     - 版本名称: 1.0.0"
        echo "     - 版本号: 100"
        echo "  5. 点击「打包」"
        echo ""
        echo "📖 详细文档: HBUILDERX_GUIDE.md"
        ;;
        
    local)
        echo ""
        echo "🚀 生成本地打包资源..."
        echo ""
        
        # 检查离线 SDK
        if [ -d "android-pack/HelloUniapp" ]; then
            echo "📁 输出目录: android-pack/HelloUniapp/src/main/assets/apps/__UNI__3B8A5C9/"
            
            # 检查 HBuilderX CLI
            CLI="$HBUILDERX/Contents/HBuilderX/plugins/uniapp-cli-vite/index.js"
            if [ -f "$CLI" ]; then
                echo "🔧 使用 HBuilderX CLI 构建..."
                node "$CLI" build --platform app-plus
                echo ""
                echo "✅ 构建完成!"
                echo ""
                echo "下一步:"
                echo "  1. 复制资源到 Android 项目"
                echo "  2. 用 Android Studio 打开 android-pack/HelloUniapp"
                echo "  3. Build → Generate Signed APK"
            else
                echo "⚠️  HBuilderX CLI 未找到"
                echo "请在 HBuilderX 中手动执行:"
                echo "  发行 → 原生 App-本地打包 → 生成离线打包 App 资源"
            fi
        else
            echo "⚠️  离线打包 SDK 未配置"
            echo ""
            echo "请先下载离线打包 SDK:"
            echo "  1. 访问: https://uniapp.dcloud.io/quickstart?id=expak"
            echo "  2. 下载 HBuilder-OfflineSDK.zip"
            echo "  3. 解压到: android-pack/"
        fi
        ;;
        
    menu|*)
        echo "选择操作:"
        echo ""
        echo "  [1] 云打包 (推荐 - 3-5分钟)"
        echo "  [2] 生成本地资源 (用于 Android Studio)"
        echo "  [3] 打开 HBuilderX"
        echo "  [4] 查看打包文档"
        echo ""
        read -p "请选择 [1-4]: " choice
        
        case $choice in
            1)
                echo ""
                echo "🚀 云打包步骤:"
                echo ""
                echo "  1. 打开 HBuilderX"
                echo "  2. 文件 → 导入 → 选择当前目录"
                echo "  3. 发行 → 原生 App-云打包"
                echo "  4. 选择「打包 APK」"
                echo "  5. 填写配置并点击打包"
                echo ""
                echo "📖 详细文档: HBUILDERX_GUIDE.md"
                ;;
            2)
                echo ""
                echo "📦 本地打包步骤:"
                echo ""
                echo "  1. 下载离线打包 SDK (如未配置)"
                echo "  2. 在 HBuilderX 中:"
                echo "     发行 → 原生 App-本地打包"
                echo "     生成离线打包 App 资源"
                echo "  3. 用 Android Studio 打开:"
                echo "     android-pack/HelloUniapp"
                echo "  4. Build → Generate Signed APK"
                echo ""
                echo "📖 详细文档: LOCAL_APK_BUILD.md"
                ;;
            3)
                echo "🚀 打开 HBuilderX..."
                open "$HBUILDERX"
                ;;
            4)
                echo "📖 打开打包文档..."
                if command -v mdcat &> /dev/null; then
                    mdcat HBUILDERX_GUIDE.md
                else
                    cat HBUILDERX_GUIDE.md
                fi
                ;;
            *)
                echo "无效选择"
                exit 1
                ;;
        esac
        ;;
esac

echo ""
echo "============================================"
echo "  操作完成"
echo "============================================"
