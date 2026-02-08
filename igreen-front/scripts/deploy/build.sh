#!/bin/bash
# igreen-front 前端项目编译脚本
# 部署位置: /home/igreen/app/front/build.sh

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_DIR="/home/igreen/app/igreen-front"
BUILD_DIR="$PROJECT_DIR/build"
BACKUP_DIR="/home/igreen/app/backup"

# 时间戳
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  iGreen-front 前端编译脚本${NC}"
echo -e "${YELLOW}  开始时间: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# 检查项目目录是否存在
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}错误: 项目目录不存在: $PROJECT_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

echo -e "${YELLOW}[1/4] 进入项目目录: $PROJECT_DIR${NC}"

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}错误: pnpm 未安装，请先安装 pnpm${NC}"
    exit 1
fi

echo -e "${YELLOW}[2/4] 安装依赖...${NC}"
pnpm install
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 依赖安装失败${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 依赖安装完成${NC}"
echo ""

echo -e "${YELLOW}[3/4] 开始构建项目...${NC}"
pnpm build
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 项目构建失败${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 项目构建完成${NC}"
echo ""

# 检查构建输出
echo -e "${YELLOW}[4/4] 验证构建输出...${NC}"
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}错误: 构建目录不存在: $BUILD_DIR${NC}"
    exit 1
fi

if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo -e "${RED}错误: 构建输出不完整，缺少 index.html${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 构建输出验证通过${NC}"
echo ""

# 显示构建信息
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  构建成功!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "构建时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "构建目录: $BUILD_DIR"
echo -e "文件数量: $(find "$BUILD_DIR" -type f | wc -l)"
echo -e "总大小: $(du -sh "$BUILD_DIR" | cut -f1)"
echo ""
echo -e "${YELLOW}下一步操作:${NC}"
echo -e "1. 将 $BUILD_DIR 部署到 nginx 根目录"
echo -e "2. 重新加载 nginx: sudo systemctl reload nginx"
echo ""
