#!/bin/bash

# iGreen+ UniApp Quick Start Script
# 快速启动/构建脚本

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "============================================"
echo "  iGreen+ UniApp - 快速启动脚本"
echo "============================================"
echo ""
echo "Project: $PROJECT_DIR"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印帮助
show_help() {
  echo "用法: $0 [命令]"
  echo ""
  echo "命令:"
  echo "  dev, d      启动开发服务器 (默认)"
  echo "  build, b    构建生产版本"
  echo "  install, i  安装依赖"
  echo "  help, h     显示帮助信息"
  echo ""
  echo "示例:"
  echo "  $0 dev      # 启动开发服务器"
  echo "  $0 build    # 构建生产版本"
}

# 安装依赖
install_deps() {
  echo -e "${BLUE}📦 安装依赖...${NC}"
  npm install
  echo -e "${GREEN}✅ 依赖安装完成${NC}"
}

# 启动开发服务器
start_dev() {
  echo -e "${BLUE}🚀 启动开发服务器...${NC}"
  echo ""
  echo "H5:  http://localhost:3000"
  echo ""
  npm run dev
}

# 构建生产版本
build_prod() {
  echo -e "${BLUE}🔨 构建生产版本...${NC}"
  npm run build:h5
  echo ""
  echo -e "${GREEN}✅ 构建完成!${NC}"
  echo ""
  echo "输出目录: dist/"
  echo ""
  echo "下一步:"
  echo -e "  ${YELLOW}1.${NC} 使用 HBuilderX 打开项目"
  echo -e "  ${YELLOW}2.${NC} 发行 → 原生 App-云打包"
  echo -e "  ${YELLOW}3.${NC} 生成 APK 文件"
  echo ""
  echo "详细指南: 参见 APK_BUILD_GUIDE.md"
}

# 解析命令
case "${1:-dev}" in
  dev|d)
    start_dev
    ;;
  build|b)
    build_prod
    ;;
  install|i)
    install_deps
    ;;
  help|h|--help|-h)
    show_help
    ;;
  *)
    echo "未知命令: $1"
    echo ""
    show_help
    exit 1
    ;;
esac
