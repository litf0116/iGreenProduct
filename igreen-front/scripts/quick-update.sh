#!/bin/bash

# iGreenticketing 快速更新脚本
# 用于日常代码更新和快速部署

set -e  # 遇到错误立即退出

# 配置
PROJECT_NAME="iGreenticketing"
SERVER_HOST="180.188.45.250"
SERVER_USER="root"
SERVER_APP_DIR="/www/wwwroot/igreen"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    echo "iGreenticketing 快速更新脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  build-only     仅编译构建，不部署"
    echo "  upload-only    仅上传构建产物，不重启服务"
    echo "  restart-only   仅重启服务，不重新构建"
    echo "  --help         显示此帮助信息"
    echo ""
    echo "默认行为: 完整构建 + 上传 + 重启服务"
}

# 检查依赖
check_dependencies() {
    if ! command -v node &> /dev/null; then
        log_error "未找到 Node.js，请先安装 Node.js"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        log_error "未找到 npm，请先安装 npm"
        exit 1
    fi

    log_info "依赖检查通过"
}

# 构建项目
build_project() {
    log_info "开始构建项目..."

    cd "$PROJECT_ROOT"

    # 清理旧的构建产物
    if [ -d "dist" ]; then
        log_info "清理旧的构建产物..."
        rm -rf dist
    fi

    # 安装依赖
    log_info "安装项目依赖..."
    npm install

    # 构建项目
    log_info "构建生产版本..."
    npm run build

    # 验证构建结果
    if [ ! -f "dist/index.html" ]; then
        log_error "构建失败：未找到 dist/index.html"
        exit 1
    fi

    log_success "项目构建完成"
}

# 上传到服务器
upload_to_server() {
    log_info "上传构建产物到服务器..."

    # 检查SSH连接
    if ! ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "echo 'SSH连接测试'" &> /dev/null; then
        log_error "无法连接到服务器 ${SERVER_HOST}"
        exit 1
    fi

    # 创建远程目录
    ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_APP_DIR}"

    # 上传构建产物
    scp -r dist ${SERVER_USER}@${SERVER_HOST}:${SERVER_APP_DIR}/igreen-front.new

    log_success "构建产物上传完成"
}

# 重启服务
restart_service() {
    log_info "重启服务..."

    ssh ${SERVER_USER}@${SERVER_HOST} << EOF
        set -e

        cd ${SERVER_APP_DIR}

        # 备份现有部署
        mkdir -p backup
        if [ -d . ]; then
            # 备份当前目录内容（除了backup目录）
            mkdir -p backup/backup-\$(date +%Y%m%d_%H%M%S)
            find . -maxdepth 1 -type f -exec mv {} backup/backup-\$(date +%Y%m%d_%H%M%S)/ \;
            find . -maxdepth 1 -type d -name 'assets' -exec mv {} backup/backup-\$(date +%Y%m%d_%H%M%S)/ \;
        fi

        # 替换新版本
        mv igreen-front.new/* ./
        rm -rf igreen-front.new

        # 设置权限
        chown -R www-data:www-data .
        chmod -R 755 .

        # 测试并重启Nginx
        if nginx -t 2>/dev/null; then
            systemctl reload nginx
            echo "Nginx重启成功"
        else
            echo "Nginx配置错误，跳过重启"
            exit 1
        fi

        # 等待服务启动
        sleep 3

        # 检查服务状态
        if systemctl is-active --quiet nginx; then
            echo "Nginx服务运行正常"
        else
            echo "Nginx服务状态异常"
            exit 1
        fi
EOF

    log_success "服务重启完成"
}

# 验证部署
verify_deployment() {
    log_info "验证部署结果..."

    # 检查HTTP响应
    if curl -s --max-time 10 http://localhost/ > /dev/null 2>&1; then
        log_success "应用访问正常"
    else
        log_warn "应用访问测试失败，请手动检查"
    fi
}

# 主函数
main() {
    local action="full"

    # 解析命令行参数
    case "${1:-}" in
        "build-only")
            action="build"
            ;;
        "upload-only")
            action="upload"
            ;;
        "restart-only")
            action="restart"
            ;;
        "--help"|"-h")
            show_help
            exit 0
            ;;
        "")
            action="full"
            ;;
        *)
            log_error "无效参数: $1"
            show_help
            exit 1
            ;;
    esac

    echo "=========================================="
    echo "iGreenticketing 快速更新"
    echo "操作模式: $action"
    echo "=========================================="

    check_dependencies

    case $action in
        "build")
            build_project
            ;;
        "upload")
            build_project
            upload_to_server
            ;;
        "restart")
            upload_to_server
            restart_service
            ;;
        "full")
            build_project
            upload_to_server
            restart_service
            verify_deployment
            ;;
    esac

    log_success "操作完成！"
    echo ""
    echo "管理地址: http://${SERVER_HOST}/"
}

# 执行主函数
main "$@"