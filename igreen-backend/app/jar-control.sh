#!/bin/bash

# iGreenProduct JAR包控制脚本
# 简化版：启动、停止、重启、查看日志

set -e

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="${APP_DIR:-$SCRIPT_DIR}"

# 使用固定 JAR 包名称
JAR_FILE="${JAR_FILE:-${APP_DIR}/igreen-backend-1.0.0-SNAPSHOT.jar}"
APP_NAME="igreen"
PID_FILE="${PID_FILE:-${APP_DIR}/${APP_NAME}.pid}"
LOG_DIR="${LOG_DIR:-${APP_DIR}/logs}"
LOG_FILE="${LOG_FILE:-${LOG_DIR}/${APP_NAME}.log}"

# JVM参数
JAVA_OPTS="-Xmx1024m -Xms512m -XX:+UseG1GC -Dspring.profiles.active=prod"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 获取进程ID
get_pid() {
    if [ -f "$PID_FILE" ]; then
        cat "$PID_FILE" 2>/dev/null || echo ""
    else
        pgrep -f "$APP_NAME.jar" 2>/dev/null || echo ""
    fi
}

# 检查应用是否运行
is_running() {
    local pid=$(get_pid)
    [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

# 启动应用
start() {
    log_info "启动 $APP_NAME ..."

    if is_running; then
        log_warning "应用已在运行 (PID: $(get_pid))"
        return 0
    fi

    if [ ! -f "$JAR_FILE" ]; then
        log_error "JAR文件不存在: $JAR_FILE"
        exit 1
    fi

    mkdir -p "$LOG_DIR"
    touch "$LOG_FILE"

    log_info "启动命令: java $JAVA_OPTS -jar $JAR_FILE"
    nohup java $JAVA_OPTS -jar "$JAR_FILE" > "$LOG_FILE" 2>&1 &
    local pid=$!

    echo $pid > "$PID_FILE"
    log_success "应用已启动 (PID: $pid)"
    log_info "日志: tail -f $LOG_FILE"
}

# 停止应用
stop() {
    log_info "停止 $APP_NAME ..."

    if ! is_running; then
        log_warning "应用未运行"
        rm -f "$PID_FILE"
        return 0
    fi

    local pid=$(get_pid)
    log_info "停止进程 PID: $pid"

    # 优雅停止
    kill -TERM "$pid" 2>/dev/null || true

    # 等待30秒
    local count=0
    while [ $count -lt 30 ]; do
        if ! kill -0 "$pid" 2>/dev/null; then
            rm -f "$PID_FILE"
            log_success "应用已停止"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done

    # 强制停止
    log_warning "执行强制停止..."
    kill -KILL "$pid" 2>/dev/null || true
    rm -f "$PID_FILE"
    log_success "应用已强制停止"
}

# 重启应用
restart() {
    log_info "重启 $APP_NAME ..."
    stop
    sleep 2
    start
}

# 查看日志
logs() {
    local lines=${1:-50}
    local follow=${2:-false}

    if [ ! -f "$LOG_FILE" ]; then
        log_error "日志文件不存在: $LOG_FILE"
        exit 1
    fi

    if [ "$follow" = "true" ]; then
        log_info "实时日志 (Ctrl+C退出):"
        tail -f "$LOG_FILE"
    else
        tail -n "$lines" "$LOG_FILE"
    fi
}

# 帮助信息
help() {
    echo "用法: $0 <命令>"
    echo ""
    echo "命令:"
    echo "  start           启动应用"
    echo "  stop            停止应用"
    echo "  restart         重启应用"
    echo "  logs [行数]     查看日志 (默认50行)"
    echo "  logs-follow     实时查看日志"
    echo ""
    echo "示例:"
    echo "  $0 start"
    echo "  $0 stop"
    echo "  $0 restart"
    echo "  $0 logs 100"
    echo "  $0 logs-follow"
}

# 主函数
main() {
    local cmd="${1:-help}"
    shift

    case "$cmd" in
        start) start ;;
        stop) stop ;;
        restart) restart ;;
        logs) logs "${1:-50}" ;;
        logs-follow) logs "50" "true" ;;
        help|-h|--help) help ;;
        *)
            log_error "未知命令: $cmd"
            help
            exit 1
            ;;
    esac
}

main "$@"
