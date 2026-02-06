#!/bin/bash

# =============================================
# iGreen 系统停止脚本
# 停止所有相关服务
# =============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置 - 支持环境变量覆盖
IGREEN_ROOT="${IGREEN_ROOT:-/home/igreen/app}"
PROJECT_DIR="$IGREEN_ROOT"
LOG_DIR="$IGREEN_ROOT/logs"
LOG_FILE="$LOG_DIR/system.log"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
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

# 停止后端服务
stop_backend() {
    echo ""
    echo -e "${YELLOW}停止后端服务...${NC}"

    PIDS=$(pgrep -f "igreen-backend" 2>/dev/null || true)

    if [ -n "$PIDS" ]; then
        for PID in $PIDS; do
            echo "  停止进程: $PID"
            kill $PID 2>/dev/null || true
        done

        sleep 3

        REMAINING=$(pgrep -f "igreen-backend" 2>/dev/null || true)
        if [ -n "$REMAINING" ]; then
            log_warn "强制停止残留进程: $REMAINING"
            kill -9 $REMAINING 2>/dev/null || true
        fi

        log_success "后端服务已停止"
    else
        log_info "后端服务未运行"
    fi
}

# 停止Nginx
stop_nginx() {
    echo ""
    echo -e "${YELLOW}停止Nginx服务...${NC}"

    if systemctl is-active --quiet nginx 2>/dev/null; then
        systemctl stop nginx
        log_success "Nginx已停止"
    else
        log_info "Nginx未运行"
    fi
}

# 停止MySQL
stop_mysql() {
    echo ""
    echo -e "${YELLOW}停止MySQL服务...${NC}"

    if systemctl is-active --quiet mysql 2>/dev/null || systemctl is-active --quiet mysqld 2>/dev/null; then
        systemctl stop mysql 2>/dev/null || systemctl stop mysqld 2>/dev/null
        log_success "MySQL已停止"
    else
        log_info "MySQL未运行"
    fi
}

# 停止所有服务
stop_all() {
    echo "============================================="
    echo "        iGreen 系统停止脚本"
    echo "============================================="
    echo ""

    log_info "开始停止所有服务..."

    stop_backend
    stop_nginx
    stop_mysql

    echo ""
    echo "============================================="
    echo -e "${GREEN}所有服务已停止${NC}"
    echo "============================================="
}

# 停止指定服务
stop_one() {
    case "${1:-all}" in
        backend)
            stop_backend
            ;;
        nginx)
            stop_nginx
            ;;
        mysql|db)
            stop_mysql
            ;;
        all)
            stop_all
            ;;
        *)
            echo "用法: $0 {backend|nginx|mysql|all}"
            exit 1
            ;;
    esac
}

show_help() {
    echo ""
    echo "用法: $0 <命令>"
    echo ""
    echo "命令:"
    echo "  backend  - 停止后端服务"
    echo "  nginx    - 停止Nginx服务"
    echo "  mysql    - 停止MySQL服务"
    echo "  all      - 停止所有服务 (默认)"
    echo ""
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true
    stop_one "${1:-all}"
fi
