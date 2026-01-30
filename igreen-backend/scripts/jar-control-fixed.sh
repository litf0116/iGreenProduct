#!/bin/bash

# iGreenProduct JAR包控制脚本
# 用于管理Spring Boot应用的启动、停止、重启等操作

set -e

# 定义命令绝对路径（应对PATH环境变量不完整的情况）
CMD_DIRNAME="/usr/bin/dirname"
CMD_MKDIR="/bin/mkdir"
CMD_TOUCH="/usr/bin/touch"
CMD_CAT="/bin/cat"
CMD_RM="/bin/rm"
CMD_SLEEP="/bin/sleep"
CMD_ECHO="/bin/echo"
CMD_TAIL="/usr/bin/tail"
CMD_PS="/bin/ps"
CMD_DU="/usr/bin/du"
CMD_KILL="/bin/kill"
CMD_PGREP="/usr/bin/pgrep"
CMD_CURL="/usr/bin/curl"
CMD_NETSTAT="/bin/netstat"
CMD_PWD="/bin/pwd"
CMD_GREP="/usr/bin/grep"
CMD_AWK="/usr/bin/awk"

# 配置变量 (可通过环境变量或命令行参数覆盖)
SCRIPT_DIR="$(${CMD_DIRNAME} "${BASH_SOURCE[0]}")"
if [ ! -d "$SCRIPT_DIR" ]; then
    SCRIPT_DIR="$(cd "$(${CMD_DIRNAME} "${BASH_SOURCE[0]}")" && ${CMD_PWD})"
fi
DEFAULT_APP_DIR="$(${CMD_DIRNAME} "$SCRIPT_DIR")"

APP_NAME="${APP_NAME:-igreen-backend}"
APP_DIR="${APP_DIR:-$DEFAULT_APP_DIR}"
JAR_FILE="${JAR_FILE:-${APP_DIR}/${APP_NAME}.jar}"
PID_FILE="${PID_FILE:-${APP_DIR}/${APP_NAME}.pid}"
LOG_DIR="${LOG_DIR:-${APP_DIR}/logs}"
LOG_FILE="${LOG_FILE:-${LOG_DIR}/${APP_NAME}.log}"
JAVA_OPTS="-Xmx1024m -Xms512m -XX:+UseG1GC -XX:+UseContainerSupport -Dspring.profiles.active=prod"
SPRING_OPTS="-Dserver.port=8080 -Ddb.host=localhost -Ddb.name=igreen_db -Ddb.username=igreen_db -Ddb.password=knS8jexaAnByhpj4 -Dupload.dir=/opt/igreen/uploads -Djwt.secret=iGreenProduct2025SecureJWTKeyForProductionEnvironment"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    ${CMD_ECHO} -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    ${CMD_ECHO} -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    ${CMD_ECHO} -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    ${CMD_ECHO} -e "${RED}[ERROR]${NC} $1"
}

# 检查是否以root用户运行
check_permissions() {
    if [ "$EUID" -ne 0 ]; then
        log_warning "建议以root用户运行以获得最佳权限"
        log_info "如果遇到权限问题，请使用: sudo $0 $@"
    fi
}

# 智能检测路径
auto_detect_paths() {
    # 如果脚本在 */scripts/ 目录下，尝试检测上级目录
    if [[ "$SCRIPT_DIR" == */scripts ]]; then
        PARENT_DIR="$(${CMD_DIRNAME} "$SCRIPT_DIR")"

        # 检查上级目录是否有JAR文件
        if [ -f "${PARENT_DIR}/${APP_NAME}.jar" ]; then
            APP_DIR="$PARENT_DIR"
            JAR_FILE="${PARENT_DIR}/${APP_NAME}.jar"
            PID_FILE="${PARENT_DIR}/${APP_NAME}.pid"
            LOG_DIR="${PARENT_DIR}/logs"
            LOG_FILE="${LOG_DIR}/${APP_NAME}.log"
            log_info "✅ 自动检测到应用目录: $APP_DIR"
        fi
    fi

    # 检查当前目录是否有JAR文件
    if [ -f "./${APP_NAME}.jar" ]; then
        APP_DIR="$(${CMD_PWD})"
        JAR_FILE="${APP_DIR}/${APP_NAME}.jar"
        PID_FILE="${APP_DIR}/${APP_NAME}.pid"
        LOG_DIR="${APP_DIR}/logs"
        LOG_FILE="${LOG_DIR}/${APP_NAME}.log"
        log_info "✅ 在当前目录找到JAR文件: $APP_DIR"
    fi

    # 最终验证
    if [ ! -f "$JAR_FILE" ]; then
        log_warning "未找到JAR文件: $JAR_FILE"
        log_info "你可以："
        log_info "1. 使用 --jar-file 参数指定JAR文件路径"
        log_info "2. 使用 --app-dir 参数指定应用目录"
        log_info "3. 将JAR文件放到脚本同级目录"
    fi
}

# 检查JAR文件是否存在
check_jar_file() {
    if [ ! -f "$JAR_FILE" ]; then
        log_error "JAR文件不存在: $JAR_FILE"
        log_info "请先上传JAR文件或运行部署脚本"
        log_info "或者使用以下选项指定路径："
        log_info "  --jar-file=/path/to/your-app.jar"
        log_info "  --app-dir=/path/to/app/directory"
        exit 1
    fi
}

# 获取进程ID
get_pid() {
    if [ -f "$PID_FILE" ]; then
        ${CMD_CAT} "$PID_FILE" 2>/dev/null || ${CMD_ECHO} ""
    else
        # 通过进程名查找
        ${CMD_PGREP} -f "$APP_NAME.jar" 2>/dev/null || ${CMD_ECHO} ""
    fi
}

# 检查应用是否在运行
is_running() {
    local pid=$(get_pid)
    if [ -n "$pid" ] && ${CMD_KILL} -0 "$pid" 2>/dev/null; then
        return 0  # 正在运行
    else
        return 1  # 未运行
    fi
}

# 创建日志目录
create_log_dir() {
    ${CMD_MKDIR} -p "$LOG_DIR"
    ${CMD_TOUCH} "$LOG_FILE" 2>/dev/null || true
}

# 启动应用
start_app() {
    log_info "启动 $APP_NAME 应用..."

    if is_running; then
        log_warning "应用已在运行 (PID: $(get_pid))"
        return 0
    fi

    check_jar_file
    create_log_dir

    log_info "启动命令: nohup java $JAVA_OPTS $SPRING_OPTS -jar $JAR_FILE > $LOG_FILE 2>&1 &"

    # 启动应用
    nohup java $JAVA_OPTS $SPRING_OPTS -jar "$JAR_FILE" > "$LOG_FILE" 2>&1 &
    local pid=$!

    # 保存PID
    ${CMD_ECHO} $pid > "$PID_FILE"
    log_info "应用PID: $pid"

    # 等待应用启动
    log_info "等待应用启动..."
    local count=0
    while [ $count -lt 60 ]; do
        if ${CMD_CURL} -f -s http://localhost:8080/actuator/health >/dev/null 2>&1; then
            log_success "应用启动成功!"
            log_info "健康检查: http://localhost:8080/actuator/health"
            log_info "应用日志: tail -f $LOG_FILE"
            return 0
        fi

        if ! ${CMD_KILL} -0 $pid 2>/dev/null; then
            log_error "应用启动失败，检查日志: $LOG_FILE"
            ${CMD_TAIL} -20 "$LOG_FILE"
            return 1
        fi

        ${CMD_SLEEP} 2
        count=$((count + 2))
        ${CMD_ECHO} -n "."
    done

    log_error "应用启动超时"
    return 1
}

# 停止应用
stop_app() {
    log_info "停止 $APP_NAME 应用..."

    if ! is_running; then
        log_warning "应用未在运行"
        return 0
    fi

    local pid=$(get_pid)
    log_info "停止进程 PID: $pid"

    # 优雅停止
    ${CMD_KILL} -TERM "$pid" 2>/dev/null || true

    # 等待最多30秒
    local count=0
    while [ $count -lt 30 ]; do
        if ! ${CMD_KILL} -0 "$pid" 2>/dev/null; then
            log_success "应用已停止"
            ${CMD_RM} -f "$PID_FILE"
            return 0
        fi
        ${CMD_SLEEP} 1
        count=$((count + 1))
        ${CMD_ECHO} -n "."
    done

    # 强制停止
    log_warning "应用未在30秒内停止，执行强制停止..."
    ${CMD_KILL} -KILL "$pid" 2>/dev/null || true
    ${CMD_SLEEP} 2

    if ${CMD_KILL} -0 "$pid" 2>/dev/null; then
        log_error "无法停止应用进程"
        return 1
    else
        log_success "应用已强制停止"
        ${CMD_RM} -f "$PID_FILE"
        return 0
    fi
}

# 重启应用
restart_app() {
    log_info "重启 $APP_NAME 应用..."

    stop_app
    ${CMD_SLEEP} 3
    start_app
}

# 查看应用状态
status_app() {
    log_info "$APP_NAME 应用状态:"

    if is_running; then
        local pid=$(get_pid)
        log_success "✅ 应用正在运行"
        ${CMD_ECHO} "   PID: $pid"
        ${CMD_ECHO} "   JAR文件: $JAR_FILE"
        ${CMD_ECHO} "   日志文件: $LOG_FILE"
        ${CMD_ECHO} "   启动时间: $(${CMD_PS} -p $pid -o lstart= 2>/dev/null || ${CMD_ECHO} '未知')"
        ${CMD_ECHO} "   内存使用: $(${CMD_PS} -p $pid -o rss= 2>/dev/null | ${CMD_AWK} '{print $1/1024 "MB"}' || ${CMD_ECHO} '未知')"

        # 检查端口
        if ${CMD_NETSTAT} -tlnp 2>/dev/null | ${CMD_GREP} -q ":8080 "; then
            ${CMD_ECHO} "   端口状态: ✅ 8080端口已监听"
        else
            ${CMD_ECHO} "   端口状态: ❌ 8080端口未监听"
        fi

        # 健康检查
        if ${CMD_CURL} -f -s --max-time 5 http://localhost:8080/actuator/health >/dev/null 2>&1; then
            ${CMD_ECHO} "   健康检查: ✅ 通过"
        else
            ${CMD_ECHO} "   健康检查: ❌ 失败"
        fi

    else
        log_warning "❌ 应用未在运行"
        if [ -f "$PID_FILE" ]; then
            log_info "PID文件存在但进程不存在，可能异常退出"
            ${CMD_RM} -f "$PID_FILE"
        fi
    fi
}

# 查看日志
logs_app() {
    local lines=${1:-50}
    local follow=${2:-false}

    if [ "$follow" = "true" ]; then
        log_info "实时查看日志 (按Ctrl+C退出):"
        ${CMD_TAIL} -f "$LOG_FILE"
    else
        log_info "显示最近 $lines 行日志:"
        if [ -f "$LOG_FILE" ]; then
            ${CMD_TAIL} -n "$lines" "$LOG_FILE"
        else
            log_error "日志文件不存在: $LOG_FILE"
        fi
    fi
}

# 查看系统资源使用情况
resources_app() {
    if ! is_running; then
        log_warning "应用未在运行"
        return 1
    fi

    local pid=$(get_pid)
    log_info "系统资源使用情况 (PID: $pid):"

    ${CMD_ECHO} "=== 进程信息 ==="
    ${CMD_PS} -p $pid -o pid,ppid,cmd,%cpu,%mem,etime 2>/dev/null || ${CMD_ECHO} "无法获取进程信息"

    ${CMD_ECHO} ""
    ${CMD_ECHO} "=== 内存使用 ==="
    if command -v pmap >/dev/null 2>&1; then
        ${CMD_ECHO} "私有内存: $(pmap -d $pid 2>/dev/null | ${CMD_TAIL} -1 | ${CMD_AWK} '{print $4}' || ${CMD_ECHO} '未知')"
    fi

    ${CMD_ECHO} ""
    ${CMD_ECHO} "=== 磁盘使用 ==="
    ${CMD_DU} -sh "$JAR_FILE" 2>/dev/null || ${CMD_ECHO} "无法获取JAR文件大小"
    ${CMD_DU} -sh "$(${CMD_DIRNAME} "$LOG_FILE")" 2>/dev/null || ${CMD_ECHO} "无法获取日志目录大小"

    ${CMD_ECHO} ""
    ${CMD_ECHO} "=== 网络连接 ==="
    ${CMD_NETSTAT} -tlnp 2>/dev/null | ${CMD_GREP} ":8080" || ${CMD_ECHO} "8080端口未监听"
}

# 清理日志文件
clean_logs() {
    log_info "清理日志文件..."

    if [ -f "$LOG_FILE" ]; then
        local size_before=$(${CMD_DU} -h "$LOG_FILE" 2>/dev/null | ${CMD_AWK} '{print $1}')
        ${CMD_ECHO} "" > "$LOG_FILE"
        local size_after=$(${CMD_DU} -h "$LOG_FILE" 2>/dev/null | ${CMD_AWK} '{print $1}')
        log_success "日志已清理: $size_before → $size_after"
    else
        log_warning "日志文件不存在"
    fi
}

# 解析命令行参数
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --jar-file=*)
                JAR_FILE="${1#*=}"
                shift
                ;;
            --app-dir=*)
                APP_DIR="${1#*=}"
                JAR_FILE="${APP_DIR}/${APP_NAME}.jar"
                PID_FILE="${APP_DIR}/${APP_NAME}.pid"
                LOG_DIR="${APP_DIR}/logs"
                LOG_FILE="${LOG_DIR}/${APP_NAME}.log"
                shift
                ;;
            --log-dir=*)
                LOG_DIR="${1#*=}"
                LOG_FILE="${LOG_DIR}/${APP_NAME}.log"
                shift
                ;;
            --app-name=*)
                APP_NAME="${1#*=}"
                JAR_FILE="${APP_DIR}/${APP_NAME}.jar"
                PID_FILE="${APP_DIR}/${APP_NAME}.pid"
                LOG_FILE="${LOG_DIR}/${APP_NAME}.log"
                shift
                ;;
            *)
                break
                ;;
        esac
    done

    COMMAND="$1"
    shift
    ARGS=("$@")
}

# 显示帮助信息
show_help() {
    ${CMD_ECHO} "iGreenProduct JAR包控制脚本"
    ${CMD_ECHO} "================================="
    ${CMD_ECHO} ""
    ${CMD_ECHO} "用法: $0 [选项] <命令> [参数]"
    ${CMD_ECHO} ""
    ${CMD_ECHO} "选项:"
    ${CMD_ECHO} "  --jar-file=PATH     指定JAR文件路径"
    ${CMD_ECHO} "  --app-dir=DIR       指定应用目录 (自动设置相关路径)"
    ${CMD_ECHO} "  --log-dir=DIR       指定日志目录"
    ${CMD_ECHO} "  --app-name=NAME     指定应用名称"
    ${CMD_ECHO} ""
    ${CMD_ECHO} "命令:"
    ${CMD_ECHO} "  start               启动应用"
    ${CMD_ECHO} "  stop                停止应用"
    ${CMD_ECHO} "  restart             重启应用"
    ${CMD_ECHO} "  status              查看应用状态"
    ${CMD_ECHO} "  logs [行数]         查看日志 (默认50行)"
    ${CMD_ECHO} "  logs-follow         实时查看日志"
    ${CMD_ECHO} "  resources           查看资源使用情况"
    ${CMD_ECHO} "  clean-logs          清理日志文件"
    ${CMD_ECHO} "  help                显示此帮助信息"
    ${CMD_ECHO} ""
    ${CMD_ECHO} "示例:"
    ${CMD_ECHO} "  $0 start                                        # 启动应用"
    ${CMD_ECHO} "  $0 --app-dir=/opt/myapp start                  # 指定应用目录启动"
    ${CMD_ECHO} "  $0 --jar-file=/path/to/app.jar start           # 指定JAR文件启动"
    ${CMD_ECHO} "  $0 status                                       # 查看状态"
    ${CMD_ECHO} "  $0 logs 100                                     # 查看最近100行日志"
    ${CMD_ECHO} "  $0 logs-follow                                  # 实时查看日志"
    ${CMD_ECHO} "  $0 restart                                      # 重启应用"
    ${CMD_ECHO} ""
    ${CMD_ECHO} "当前配置:"
    ${CMD_ECHO} "  应用名称: $APP_NAME"
    ${CMD_ECHO} "  JAR文件: $JAR_FILE"
    ${CMD_ECHO} "  PID文件: $PID_FILE"
    ${CMD_ECHO} "  日志文件: $LOG_FILE"
    ${CMD_ECHO} "  应用目录: $APP_DIR"
    ${CMD_ECHO} ""
    ${CMD_ECHO} "自动检测逻辑:"
    ${CMD_ECHO} "1. 如果脚本在 */scripts/ 目录下，应用目录为上级目录"
    ${CMD_ECHO} "2. 如果JAR文件在当前目录，自动使用当前目录"
    ${CMD_ECHO} "3. 支持环境变量: APP_NAME, APP_DIR, JAR_FILE, LOG_DIR"
}

# 主函数
main() {
    # 智能检测路径
    auto_detect_paths

    # 解析命令行参数 (可能覆盖自动检测的路径)
    parse_args "$@"

    check_permissions

    case "${COMMAND:-help}" in
        "start")
            start_app
            ;;
        "stop")
            stop_app
            ;;
        "restart")
            restart_app
            ;;
        "status")
            status_app
            ;;
        "logs")
            logs_app "${2:-50}"
            ;;
        "logs-follow")
            logs_app "50" "true"
            ;;
        "resources")
            resources_app
            ;;
        "clean-logs")
            clean_logs
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            if [ -n "$COMMAND" ]; then
                log_error "未知命令: $COMMAND"
            fi
            ${CMD_ECHO} ""
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
