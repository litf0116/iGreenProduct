#!/bin/bash

# iGreen+ 自动打包助手
# 执行所有可自动化的打包步骤

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_DIR="/Users/mac/workspace/iGreenProduct/igreen-uniapp"
HBUILDERX="/Applications/HBuilderX.app"

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  iGreen+ 自动打包助手${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# 步骤 1: 检查环境
echo -e "${BLUE}📋 步骤 1: 检查环境...${NC}"
echo ""

CHECK_PASS=true

# 检查 HBuilderX
if [ -d "$HBUILDERX" ]; then
    echo -e "  ✅ HBuilderX 已安装"
else
    echo -e "  ❌ HBuilderX 未安装"
    CHECK_PASS=false
fi

# 检查项目目录
if [ -d "$PROJECT_DIR" ]; then
    echo -e "  ✅ 项目目录存在"
else
    echo -e "  ❌ 项目目录不存在"
    CHECK_PASS=false
fi

# 检查图标
ICON_COUNT=$(ls "$PROJECT_DIR/src/static/icons"/*.png 2>/dev/null | wc -l)
if [ "$ICON_COUNT" -ge 7 ]; then
    echo -e "  ✅ 图标已生成 ($ICON_COUNT 个)"
else
    echo -e "  ⚠️  图标数量不足 ($ICON_COUNT/7)"
fi

# 检查启动图
SPLASH_COUNT=$(ls "$PROJECT_DIR/src/static/splash"/*.png 2>/dev/null | wc -l)
if [ "$SPLASH_COUNT" -ge 2 ]; then
    echo -e "  ✅ 启动图已生成 ($SPLASH_COUNT 个)"
else
    echo -e "  ⚠️  启动图数量不足 ($SPLASH_COUNT/2)"
fi

# 检查 manifest.json
if [ -f "$PROJECT_DIR/src/manifest.json" ]; then
    echo -e "  ✅ manifest.json 已配置"
    
    # 显示关键配置
    APP_NAME=$(grep '"name"' "$PROJECT_DIR/src/manifest.json" | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
    APP_ID=$(grep '"appid"' "$PROJECT_DIR/src/manifest.json" | sed 's/.*: *"\([^"]*\)".*/\1/')
    VERSION=$(grep '"versionName"' "$PROJECT_DIR/src/manifest.json" | sed 's/.*: *"\([^"]*\)".*/\1/')
    
    echo -e "     - 应用名称: $APP_NAME"
    echo -e "     - AppID: $APP_ID"
    echo -e "     - 版本: $VERSION"
else
    echo -e "  ❌ manifest.json 不存在"
    CHECK_PASS=false
fi

echo ""

if [ "$CHECK_PASS" = false ]; then
    echo -e "${RED}❌ 环境检查未通过，请先解决问题${NC}"
    exit 1
fi

# 步骤 2: 打开 HBuilderX
echo -e "${BLUE}📋 步骤 2: 打开 HBuilderX...${NC}"
echo ""

if [ -d "$HBUILDERX" ]; then
    echo -e "  🚀 启动 HBuilderX..."
    
    # 检查是否已经在运行
    if pgrep -f "HBuilderX" > /dev/null; then
        echo -e "  ℹ️  HBuilderX 已在运行中"
    else
        open -a "$HBUILDERX" --hide
        echo -e "  ✅ HBuilderX 已启动"
    fi
    
    # 打开项目
    echo -e ""
    echo -e "  📂 打开项目: $PROJECT_DIR"
    open -a "$HBUILDERX" "$PROJECT_DIR"
    
    # 等待一下让 HBuilderX 加载项目
    sleep 3
    echo -e "  ✅ 项目已打开"
else
    echo -e "  ⚠️  HBuilderX 未安装，请手动打开项目"
fi

echo ""

# 步骤 3: 生成打包配置
echo -e "${BLUE}📋 步骤 3: 生成打包配置...${NC}"
echo ""

# 生成 HTML 操作指南
cat > "$PROJECT_DIR/packaging-guide.html" << 'HTMLEOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>iGreen+ 打包操作指南</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .step {
            background: white;
            padding: 20px;
            margin: 10px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .step h2 {
            color: #0d9488;
            margin-top: 0;
        }
        .screenshot {
            background: #e5e7eb;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            margin: 10px 0;
        }
        button {
            background: #0d9488;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover {
            background: #0f766e;
        }
        .warning {
            background: #fef3c7;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <h1>📦 iGreen+ APK 打包操作指南</h1>
    
    <div class="step">
        <h2>步骤 1: 配置 App 图标</h2>
        <p>在 HBuilderX 项目上右键 → 工具 → 图标配置 → App图标</p>
        <p>选择图片: <code>src/static/icons/app-icon-1024.png</code></p>
        <button onclick="alert('请在 HBuilderX 中操作')">在 HBuilderX 中打开</button>
    </div>
    
    <div class="step">
        <h2>步骤 2: 配置启动图</h2>
        <p>在 HBuilderX 项目上右键 → 工具 → 启动图配置</p>
        <p>iPhone: <code>src/static/splash/splash-iphone.png</code></p>
        <p>Android: <code>src/static/splash/splash-android.png</code></p>
    </div>
    
    <div class="step">
        <h2>步骤 3: 云打包</h2>
        <p>菜单栏: 发行 → 原生 App-云打包</p>
        <p>配置:</p>
        <ul>
            <li>Android 包名: com.igreen.app</li>
            <li>版本名称: 1.0.0</li>
            <li>版本号: 100</li>
            <li>使用云端证书: ☑️ 勾选</li>
        </ul>
        <button onclick="alert('请在 HBuilderX 中操作')">开始打包</button>
    </div>
    
    <div class="warning">
        ⚠️ 打包需要 3-5 分钟，请耐心等待
    </div>
</body>
</html>
HTMLEOF

echo -e "  ✅ 已生成操作指南: packaging-guide.html"

# 步骤 4: 创建快捷方式
echo ""
echo -e "${BLUE}📋 步骤 4: 准备打包...${NC}"
echo ""

# 创建项目配置摘要
cat > "$PROJECT_DIR/.packaging-status.json" << 'JSONEOF'
{
  "status": "ready",
  "timestamp": "DATETIME_PLACEHOLDER",
  "app": {
    "name": "iGreen+",
    "package": "com.igreen.app",
    "version": "1.0.0",
    "versionCode": 100
  },
  "resources": {
    "icons": 7,
    "splash": 2
  },
  "nextSteps": [
    "1. 在 HBuilderX 中配置 App 图标",
    "2. 在 HBuilderX 中配置启动图",
    "3. 发行 → 原生 App-云打包",
    "4. 下载 APK 文件"
  ]
}
JSONEOF

# 替换时间戳
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
sed -i '' "s/DATETIME_PLACEHOLDER/$TIMESTAMP/" "$PROJECT_DIR/.packaging-status.json"

echo -e "  ✅ 状态文件已更新: .packaging-status.json"

# 步骤 5: 显示最终信息
echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  🎉 打包准备完成!${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""
echo -e "${GREEN}📦 项目配置:${NC}"
echo -e "   应用名称: iGreen+"
echo -e "   包名: com.igreen.app"
echo -e "   版本: 1.0.0 (100)"
echo ""
echo -e "${GREEN}📁 资源文件:${NC}"
echo -e "   图标: 7 个尺寸 (48~1024px)"
echo -e "   启动图: 2 个尺寸"
echo ""
echo -e "${GREEN}📋 下一步操作:${NC}"
echo -e "   1. HBuilderX 已打开，项目已加载"
echo -e "   2. 配置图标: 右键项目 → 工具 → 图标配置 → App图标"
echo -e "   3. 配置启动图: 右键项目 → 工具 → 启动图配置"
echo -e "   4. 打包: 发行 → 原生 App-云打包 → 打包 APK"
echo ""
echo -e "${YELLOW}⏱️  预计打包时间: 3-5 分钟${NC}"
echo ""
echo -e "${BLUE}📖 查看详细指南:${NC}"
echo -e "   - PACKING_CHECKLIST.md (推荐)"
echo -e "   - HBUILDERX_GUIDE.md"
echo -e "   - packaging-guide.html (浏览器打开)"
echo ""

# 自动打开操作指南
if [ -f "$PROJECT_DIR/packaging-guide.html" ]; then
    open "$PROJECT_DIR/packaging-guide.html"
    echo -e "${GREEN}✅ 操作指南已在浏览器中打开${NC}"
fi

echo ""
echo -e "${CYAN}============================================${NC}"
