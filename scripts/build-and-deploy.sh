#!/bin/bash

# =============================================
# iGreen 前端构建和部署脚本
# 支持 iGreenApp 和 igreen-front 两个前端项目
# =============================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 配置
PROJECT_DIR="/var/folders/1x/qcplfbgn4430v6l9gltk_7v00000gn/T/vibe-kanban/worktrees/d2e1-/iGreenProduct"
DEPLOY_DIR="/opt/igreen"

# iGreenApp 配置
IGREEN_APP_SRC="$PROJECT_DIR/iGreenApp"
IGREEN_APP_DIST="$DEPLOY_DIR/iGreenApp/dist"
IGREEN_APP_CONFIG="$IGREEN_APP_SRC/.env.production"

# igreen-front 配置
IGREEN_FRONT_SRC="$PROJECT_DIR/igreen-front"
IGREEN_FRONT_DIST="$DEPLOY_DIR/igreen-front/dist"
IGREEN_FRONT_CONFIG="$IGREEN_FRONT_SRC/.env.production"

# API配置
API_URL="${API_URL:-http://localhost:8080}"

# 日志
LOG_FILE="/var/log/igreen/frontend-deploy.log"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    echo "[WARN] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# 检查Node.js环境
check_node() {
    log_info "检查Node.js环境..."

    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js 18+"
        exit 1
    fi

    NODE_VERSION=$(node -v)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)

    if [ "$NODE_MAJOR" -lt 18 ]; then
        log_error "Node.js版本需要18+，当前版本: $NODE_VERSION"
        exit 1
    fi

    log_success "Node.js版本: $NODE_VERSION"

    if ! command -v npm &> /dev/null; then
        log_error "npm未安装"
        exit 1
    fi

    NPM_VERSION=$(npm -v)
    log_success "npm版本: $NPM_VERSION"
}

# 构建iGreenApp
build_igreen_app() {
    echo ""
    echo -e "${CYAN}============================================${NC}"
    echo -e "${CYAN}  构建 iGreenApp (工程师APP)${NC}"
    echo -e "${CYAN}============================================${NC}"

    if [ ! -d "$IGREEN_APP_SRC" ]; then
        log_warn "iGreenApp目录不存在: $IGREEN_APP_SRC"
        return 1
    fi

    cd "$IGREEN_APP_SRC"

    # 创建环境配置文件
    log_info "创建iGreenApp环境配置文件..."
    cat > "$IGREEN_APP_CONFIG" << EOF
VITE_API_URL=$API_URL
VITE_APP_NAME=iGreen Engineer
VITE_APP_VERSION=$(date '+%Y.%m.%d')
EOF

    # 安装依赖
    log_info "安装iGreenApp依赖..."
    npm install --legacy-peer-deps --progress=false

    # 构建
    log_info "构建iGreenApp..."
    npm run build

    # 检查构建结果
    if [ -d "dist" ]; then
        log_success "iGreenApp构建成功"
        log_info "构建目录: $IGREEN_APP_SRC/dist"

        # 复制到部署目录
        log_info "复制到部署目录..."
        mkdir -p "$DEPLOY_DIR/iGreenApp"
        rm -rf "$DEPLOY_DIR/iGreenApp/dist"
        cp -r "dist" "$DEPLOY_DIR/iGreenApp/"
        rm -f "$DEPLOY_DIR/iGreenApp/dist/.gitkeep" 2>/dev/null || true

        log_success "iGreenApp部署完成"
        log_info "部署路径: $IGREEN_APP_DIST"
    else
        log_error "iGreenApp构建失败: dist目录不存在"
        return 1
    fi
}

# 构建igreen-front
build_igreen_front() {
    echo ""
    echo -e "${CYAN}============================================${NC}"
    echo -e "${CYAN}  构建 igreen-front (管理后台)${NC}"
    echo -e "${CYAN}============================================${NC}"

    if [ ! -d "$IGREEN_FRONT_SRC" ]; then
        log_warn "igreen-front目录不存在: $IGREEN_FRONT_SRC"
        return 1
    fi

    cd "$IGREEN_FRONT_SRC"

    # 创建环境配置文件
    log_info "创建igreen-front环境配置文件..."
    cat > "$IGREEN_FRONT_CONFIG" << EOF
VITE_API_URL=$API_URL
VITE_APP_NAME=iGreen Admin
VITE_APP_VERSION=$(date '+%Y.%m.%d')
EOF

    # 安装依赖
    log_info "安装igreen-front依赖..."
    npm install --legacy-peer-deps --progress=false

    # 构建
    log_info "构建igreen-front..."
    npm run build

    # 检查构建结果
    if [ -d "dist" ]; then
        log_success "igreen-front构建成功"
        log_info "构建目录: $IGREEN_FRONT_SRC/dist"

        # 复制到部署目录
        log_info "复制到部署目录..."
        mkdir -p "$DEPLOY_DIR/igreen-front"
        rm -rf "$DEPLOY_DIR/igreen-front/dist"
        cp -r "dist" "$DEPLOY_DIR/igreen-front/"
        rm -f "$DEPLOY_DIR/igreen-front/dist/.gitkeep" 2>/dev/null || true

        log_success "igreen-front部署完成"
        log_info "部署路径: $IGREEN_FRONT_DIST"
    else
        log_error "igreen-front构建失败: dist目录不存在"
        return 1
    fi
}

# 构建所有前端
build_all() {
    log_info "开始构建所有前端项目..."

    # 确保日志目录存在
    mkdir -p "$(dirname "$LOG_FILE")"

    check_node

    # 构建iGreenApp
    build_igreen_app || log_warn "iGreenApp构建失败"

    # 构建igreen-front
    build_igreen_front || log_warn "igreen-front构建失败"

    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}  前端构建完成!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo "部署路径:"
    echo "  - iGreenApp: $IGREEN_APP_DIST"
    echo "  - igreen-front: $IGREEN_FRONT_DIST"
    echo ""
    echo "请确保Nginx配置正确并重载配置:"
    echo "  nginx -t && nginx -s reload"
    echo ""
}

# 部署单个项目
deploy_one() {
    local project="${1:-}"
    shift

    mkdir -p "$(dirname "$LOG_FILE")"
    check_node

    case "$project" in
        app)
            build_igreen_app
            ;;
        admin|front|igreen-front)
            build_igreen_front
            ;;
        all)
            build_all
            ;;
        *)
            echo "用法: $0 {app|admin|all}"
            echo ""
            echo "选项:"
            echo "  app    - 构建部署iGreenApp (工程师APP)"
            echo "  admin  - 构建部署igreen-front (管理后台)"
            echo "  all    - 构建部署所有前端项目"
            echo ""
            echo "示例:"
            echo "  API_URL=http://your-domain.com $0 app"
            echo "  API_URL=http://your-domain.com $0 all"
            exit 1
            ;;
    esac
}

# 显示帮助
show_help() {
    echo ""
    echo -e "${CYAN}============================================${NC}"
    echo -e "${CYAN}  iGreen 前端构建部署脚本${NC}"
    echo -e "${CYAN}============================================${NC}"
    echo ""
    echo "用法:"
    echo "  $0 <命令> [选项]"
    echo ""
    echo "命令:"
    echo "  app        构建部署 iGreenApp (工程师APP)"
    echo "  admin      构建部署 igreen-front (管理后台)"
    echo "  all        构建部署所有前端项目 (默认)"
    echo "  help       显示此帮助信息"
    echo ""
    echo "环境变量:"
    echo "  API_URL    后端API地址 (默认: http://localhost:8080)"
    echo ""
    echo "示例:"
    echo "  # 构建所有前端"
    echo "  $0 all"
    echo ""
    echo "  # 指定API地址构建"
    echo "  API_URL=https://api.igreen.com $0 all"
    echo ""
    echo "  # 仅构建工程师APP"
    echo "  API_URL=http://localhost:8080 $0 app"
    echo ""
}

# 主入口
main() {
    local command="${1:-all}"

    mkdir -p "$(dirname "$LOG_FILE")"
    touch "$LOG_FILE"

    log_info "开始执行前端构建部署..."
    log_info "命令: $command"
    log_info "API地址: $API_URL"

    deploy_one "$command"
}

# 判断调用方式
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
