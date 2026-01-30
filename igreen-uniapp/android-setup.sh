#!/bin/bash

# iGreen+ Android APK 本地打包安装脚本
# 执行此脚本前请确保已安装 Homebrew

set -e

echo "============================================"
echo "  iGreen+ Android 本地打包环境配置"
echo "============================================"
echo ""

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查 Homebrew
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}⚠️  Homebrew 未安装，正在安装...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# 步骤1: 安装 Java 17
echo -e "${BLUE}📦 步骤1: 检查/安装 Java 17${NC}"
if ! command -v java &> /dev/null; then
    echo "安装 OpenJDK 17..."
    brew install openjdk@17
    echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
    echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
else
    java -version 2>&1 | head -1
    echo -e "${GREEN}✅ Java 已安装${NC}"
fi

# 步骤2: 安装 Android Studio
echo ""
echo -e "${BLUE}📦 步骤2: 安装 Android Studio${NC}"
if ! command -v android-studio &> /dev/null && [ ! -d "/Applications/Android Studio.app" ]; then
    echo "下载并安装 Android Studio..."
    brew install --cask android-studio
    echo -e "${GREEN}✅ Android Studio 安装完成${NC}"
else
    if [ -d "/Applications/Android Studio.app" ]; then
        echo -e "${GREEN}✅ Android Studio 已安装${NC}"
    else
        echo "Android Studio 未安装，请手动下载安装:"
        echo "https://developer.android.com/studio"
        echo ""
        echo "安装完成后运行此脚本继续配置"
        exit 1
    fi
fi

# 步骤3: 配置 Android SDK
echo ""
echo -e "${BLUE}📦 步骤3: 配置 Android SDK${NC}"
export ANDROID_HOME=$HOME/Library/Android/sdk

if [ ! -d "$ANDROID_HOME" ]; then
    echo "创建 Android SDK 目录..."
    mkdir -p $ANDROID_HOME
    
    # 下载命令行工具
    echo "下载 Android 命令行工具..."
    cd /tmp
    curl -LO https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip
    unzip -q commandlinetools-mac-11076708_latest.zip
    mkdir -p $ANDROID_HOME/cmdline-tools
    mv cmdline-tools $ANDROID_HOME/cmdline-tools/latest
    
    # 安装 SDK 组件
    echo "安装 Android SDK 组件..."
    export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
    yes | sdkmanager --licenses || true
    sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
    
    echo -e "${GREEN}✅ Android SDK 配置完成${NC}"
else
    echo -e "${GREEN}✅ Android SDK 已存在${NC}"
fi

# 配置环境变量
echo ""
echo -e "${BLUE}📦 配置环境变量...${NC}"
cat >> ~/.zshrc << 'EOF'

# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin
EOF

echo -e "${GREEN}✅ 环境变量已添加到 ~/.zshrc${NC}"

# 步骤4: 下载 uni-app 离线打包 SDK
echo ""
echo -e "${BLUE}📦 步骤4: 下载 uni-app 离线打包 SDK${NC}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

if [ ! -d "android-pack" ]; then
    echo "请下载 uni-app 离线打包 SDK:"
    echo ""
    echo "1. 访问: https://uniapp.dcloud.io/quickstart?id=expak"
    echo "2. 下载 'Android 离线打包SDK'"
    echo "3. 解压到: igreen-uniapp/android-pack"
    echo ""
    echo "下载完成后运行: bash android-setup.sh"
    
    # 创建占位目录
    mkdir -p android-pack
    
    # 创建下载说明
    cat > android-pack/README.md << 'INSTALLEOF'
# Android 离线打包 SDK

请下载并解压 SDK 到此目录:

1. 访问: https://uniapp.dcloud.io/quickstart?id=expak
2. 下载 "Android 离线打包SDK" (HBuilder-OfflineSDK.zip)
3. 解压文件到此目录

解压后目录结构应为:
android-pack/
├── HelloUniapp/          # Android 项目
│   ├── build.gradle
│   ├── settings.gradle
│   └── src/
└── README.md
INSTALLEOF
else
    if [ -d "android-pack/HelloUniapp" ]; then
        echo -e "${GREEN}✅ 离线打包 SDK 已存在${NC}"
    else
        echo "SDK 目录存在但缺少 HelloUniapp，请重新下载 SDK"
    fi
fi

echo ""
echo "============================================"
echo "  配置完成!"
echo "============================================"
echo ""
echo "下一步:"
echo -e "${YELLOW}1.${NC} 下载 uni-app 离线打包 SDK (见上方说明)"
echo -e "${YELLOW}2.${NC} 用 Android Studio 打开: android-pack/HelloUniapp"
echo -e "${YELLOW}3.${NC} 构建 → Generate Signed APK"
echo ""
echo "详细文档: LOCAL_APK_BUILD.md"
