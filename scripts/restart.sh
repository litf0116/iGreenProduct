#!/bin/bash

# =============================================
# iGreen 系统重启脚本
# 重启所有服务
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
BACKEND_SCRIPT="$IGREEN_ROOT/scripts/start-backend.sh"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 重启后端
restart_backend() {
    echo ""
    echo -e "${YELLOW}重启后端服务...${NC}"

    if [ -f "$BACKEND_SCRIPT" ]; then
        $BACKEND_SCRIPT restart
    else
        # 手动重启
        PIDS=$(pgrep -f "igreen-backend" 2>/dev/null || true)
        if [ -n "$PIDS" ]; then
            for PID in $PIDS; do
                kill $PID 2>/dev/null || true
            done
            sleep 3
        fi

        cd "$PROJECT_DIR/backend"
        nohup java -Xmx2048m -Xms512m -XX:+UseG1GC -Dspring.profiles.active=prod \
            -jar target/igreen-backend-1.0.0-SNAPSHOT.jar > /var/log/igreen/backend.log 2>&1 &

        sleep 10

        if curl -s -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
            log_success "后端服务重启成功"
        else
            log_error "后端服务重启失败"
        fi
    fi
}

# 重启Nginx
restart_nginx() {
    echo ""
    echo -e "${YELLOW}重启Nginx服务...${NC}"

    if systemctl is-active --quiet nginx; then
        systemctl reload nginx
        log_success "Nginx已重载配置"
    else
        systemctl start nginx
        log_success "Nginx已启动"
    fi
}

# 重启MySQL
restart_mysql() {
    echo ""
    echo -e "${YELLOW}重启MySQL服务...${NC}"

    if systemctl is-active --quiet mysql 2>/dev/null || systemctl is-active --quiet mysqld 2>/dev/null; then
        systemctl restart mysql 2>/dev/null || systemctl restart mysqld 2>/dev/null
        log_success "MySQL已重启"
    else
        systemctl start mysql 2>/dev/null || systemctl start mysqld 2>/dev/null
        log_success "MySQL已启动"
    fi
}

# 重启所有服务
restart_all() {
    echo "============================================="
    echo "        iGreen 系统重启脚本"
    echo "============================================="
    echo ""

    log_info "开始重启所有服务..."

    echo ""
    log_info "步骤1/3: 重启MySQL..."
    restart_mysql

    echo ""
    log_info "步骤2/3: 重启后端服务..."
    restart_backend

    echo ""
    log_info "步骤3/3: 重启Nginx..."
    restart_nginx

    echo ""
    echo "============================================="
    echo -e "${GREEN}所有服务重启完成${NC}"
    echo "============================================="
    echo ""
    echo "验证地址:"
    echo "  - 后端健康检查: http://localhost:8080/actuator/health"
    echo "  - API文档: http://localhost:8080/swagger-ui.html"
    echo ""
}

# 重启指定服务
restart_one() {
    case "${1:-all}" in
        backend)
            restart_backend
            ;;
        nginx)
            restart_nginx
            ;;
        mysql|db)
            restart_mysql
            ;;
        all)
            restart_all
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
    echo "  backend  - 重启后端服务"
    echo "  nginx    - 重启Nginx服务"
    echo "  mysql    - 重启MySQL服务"
    echo "  all      - 重启所有服务 (默认)"
    echo ""
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    restart_one "${1:-all}"
fi
