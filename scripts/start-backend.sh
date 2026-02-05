#!/bin/bash

# =============================================
# iGreen 后端服务启动脚本
# 支持手动配置和系统服务两种方式
# =============================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
APP_DIR="/opt/igreen/backend"
JAR_FILE="$APP_DIR/target/igreen-backend-1.0.0-SNAPSHOT.jar"
LOG_FILE="/var/log/igreen/igreen-backend.log"
CONFIG_FILE="$APP_DIR/config/.env"

# JVM参数
HEAP_MEMORY="-Xmx2048m -Xms512m"
GC_PARAMS="-XX:+UseG1GC -XX:+UseContainerSupport -XX:MaxGCPauseMillis=200"

# 服务端口
SERVER_PORT="${SERVER_PORT:-8080}"

# 数据库配置
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-igreen_db}"
DB_USER="${DB_USER:-igreen_db}"
DB_PASS="${DB_PASS:-}"

# JWT配置
JWT_SECRET="${JWT_SECRET_KEY:-iGreenProduct2025SecureJWTKeyForProductionEnvironment}"
JWT_EXPIRATION="${JWT_EXPIRATION:-7200000}"
JWT_REFRESH="${JWT_REFRESH_EXPIRATION:-604800000}"

# 文件上传配置
UPLOAD_DIR="${UPLOAD_DIR:-/opt/igreen/uploads}"
MAX_FILE_SIZE="${MAX_FILE_SIZE:-52428800}"

# CORS配置
ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-*}"

# 日志函数
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

# 检查环境
check_environment() {
    log_info "检查运行环境..."

    # 检查Java
    if ! command -v java &> /dev/null; then
        log_error "Java未安装，请先安装Java 17+"
        exit 1
    fi

    JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 17 ]; then
        log_error "Java版本需要17+，当前版本: $JAVA_VERSION"
        exit 1
    fi

    log_success "Java版本: $JAVA_VERSION"

    # 检查JAR文件
    if [ ! -f "$JAR_FILE" ]; then
        log_error "JAR文件不存在: $JAR_FILE"
        log_info "请先构建项目: cd $APP_DIR && mvn clean package -DskipTests"
        exit 1
    fi

    log_success "JAR文件: $JAR_FILE"

    # 检查上传目录
    if [ ! -d "$UPLOAD_DIR" ]; then
        log_warn "上传目录不存在，创建: $UPLOAD_DIR"
        mkdir -p "$UPLOAD_DIR"
    fi

    # 检查日志目录
    LOG_DIR=$(dirname "$LOG_FILE")
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
    fi

    log_success "环境检查完成"
}

# 检查端口占用
check_port() {
    log_info "检查端口 $SERVER_PORT ..."

    if command -v netstat &> /dev/null; then
        if netstat -tlnp | grep -q ":$SERVER_PORT "; then
            log_warn "端口 $SERVER_PORT 已被占用"
            log_info "尝试查找占用端口的进程..."
            netstat -tlnp | grep ":$SERVER_PORT " | awk '{print $7}' | cut -d'/' -f1 | xargs ps -p 2>/dev/null || true
            return 1
        fi
    elif command -v ss &> /dev/null; then
        if ss -tlnp | grep -q ":$SERVER_PORT "; then
            log_warn "端口 $SERVER_PORT 已被占用"
            return 1
        fi
    fi

    log_success "端口 $SERVER_PORT 可用"
    return 0
}

# 停止已存在的进程
stop_existing() {
    log_info "检查已存在的进程..."

    # 查找进程
    PIDS=$(pgrep -f "igreen-backend" 2>/dev/null || true)

    if [ -n "$PIDS" ]; then
        log_warn "发现正在运行的进程: $PIDS"

        for PID in $PIDS; do
            log_info "停止进程: $PID"
            kill $PID 2>/dev/null || true
        done

        # 等待进程完全停止
        log_info "等待进程停止..."
        sleep 3

        # 检查是否还有残留
        REMAINING=$(pgrep -f "igreen-backend" 2>/dev/null || true)
        if [ -n "$REMAINING" ]; then
            log_warn "强制停止残留进程: $REMAINING"
            for PID in $REMAINING; do
                kill -9 $PID 2>/dev/null || true
            done
            sleep 1
        fi

        log_success "已停止所有已存在的进程"
    else
        log_info "没有发现已存在的进程"
    fi
}

# 启动服务
start_server() {
    log_info "启动后端服务..."

    # 检查端口
    check_port || {
        log_warn "端口被占用，尝试停止已存在的进程..."
        stop_existing
    }

    # 构建Java命令
    JAVA_CMD="java \
        $HEAP_MEMORY \
        $GC_PARAMS \
        -Dspring.profiles.active=prod \
        -Dserver.port=$SERVER_PORT \
        -Ddb.host=$DB_HOST \
        -Ddb.port=$DB_PORT \
        -Ddb.name=$DB_NAME \
        -Ddb.username=$DB_USER \
        -Ddb.password=$DB_PASS \
        -Dupload.dir=$UPLOAD_DIR \
        -DJWT_SECRET_KEY=$JWT_SECRET \
        -DJWT_EXPIRATION=$JWT_EXPIRATION \
        -DJWT_REFRESH_EXPIRATION=$JWT_REFRESH \
        -DMAX_FILE_SIZE=$MAX_FILE_SIZE \
        -DALLOWED_ORIGINS=$ALLOWED_ORIGINS \
        -Djava.security.egd=file:/dev/./urandom \
        -jar $JAR_FILE"

    # 启动服务
    log_info "执行启动命令..."
    log_info "日志文件: $LOG_FILE"

    # 使用nohup后台运行
    nohup $JAVA_CMD > "$LOG_FILE" 2>&1 &

    # 记录PID
    APP_PID=$!
    echo $APP_PID > "$APP_DIR/app.pid"

    log_success "服务启动中 (PID: $APP_PID)"

    # 等待服务启动
    log_info "等待服务启动..."
    sleep 8

    # 检查健康状态
    check_health
}

# 检查健康状态
check_health() {
    log_info "检查服务健康状态..."

    MAX_RETRIES=12
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -s -f "http://localhost:$SERVER_PORT/actuator/health" > /dev/null 2>&1; then
            log_success "服务启动成功!"

            # 获取详细状态
            STATUS=$(curl -s "http://localhost:$SERVER_PORT/actuator/health" 2>/dev/null)
            echo -e "\n${GREEN}=============================================${NC}"
            echo -e "${GREEN}  服务状态: UP${NC}"
            echo -e "${GREEN}=============================================${NC}"
            echo -e "  API地址: http://localhost:$SERVER_PORT"
            echo -e "  健康检查: http://localhost:$SERVER_PORT/actuator/health"
            echo -e "  Swagger文档: http://localhost:$SERVER_PORT/swagger-ui.html"
            echo -e "  日志文件: $LOG_FILE"
            echo -e "=============================================\n"

            return 0
        fi

        RETRY_COUNT=$((RETRY_COUNT + 1))
        log_info "等待服务启动... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 2
    done

    log_error "服务启动失败!"
    log_error "请查看日志: tail -f $LOG_FILE"
    return 1
}

# 显示使用说明
show_usage() {
    echo ""
    echo "============================================="
    echo "        iGreen 后端服务控制脚本"
    echo "============================================="
    echo ""
    echo "使用方法:"
    echo "  ./start-backend.sh           启动服务"
    echo "  ./start-backend.sh status   查看状态"
    echo "  ./start-backend.sh stop     停止服务"
    echo "  ./start-backend.sh restart  重启服务"
    echo "  ./start-backend.sh log      查看日志"
    echo ""
    echo "环境变量配置:"
    echo "  SERVER_PORT     服务端口 (默认: 8080)"
    echo "  DB_HOST         数据库地址 (默认: localhost)"
    echo "  DB_PORT         数据库端口 (默认: 3306)"
    echo "  DB_NAME         数据库名 (默认: igreen_db)"
    echo "  DB_USER         数据库用户 (默认: igreen_db)"
    echo "  DB_PASS         数据库密码 (必填)"
    echo "  JWT_SECRET_KEY  JWT密钥"
    echo "  UPLOAD_DIR      上传目录 (默认: /opt/igreen/uploads)"
    echo ""
    echo "示例:"
    echo "  DB_PASS=your_password ./start-backend.sh start"
    echo ""
}

# 查看状态
show_status() {
    echo ""
    echo "=== 服务状态 ==="
    echo ""

    # 检查进程
    if pgrep -f "igreen-backend" > /dev/null; then
        echo -e "${GREEN}✅ 服务状态: 运行中${NC}"
        PID=$(pgrep -f "igreen-backend" | head -1)
        echo "   PID: $PID"
        echo "   JAR: $JAR_FILE"
    else
        echo -e "${RED}❌ 服务状态: 未运行${NC}"
    fi

    echo ""

    # 检查端口
    if command -v netstat &> /dev/null; then
        PORT_INFO=$(netstat -tlnp 2>/dev/null | grep ":$SERVER_PORT " || echo "")
        if [ -n "$PORT_INFO" ]; then
            echo -e "${GREEN}✅ 端口 $SERVER_PORT: 监听中${NC}"
        else
            echo -e "${RED}❌ 端口 $SERVER_PORT: 未监听${NC}"
        fi
    fi

    echo ""

    # 检查健康端点
    if curl -s -f "http://localhost:$SERVER_PORT/actuator/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 健康检查: 通过${NC}"
        HEALTH=$(curl -s "http://localhost:$SERVER_PORT/actuator/health" 2>/dev/null)
        echo "   $HEALTH"
    else
        echo -e "${RED}❌ 健康检查: 失败${NC}"
    fi

    echo ""
}

# 查看日志
show_log() {
    if [ -f "$LOG_FILE" ]; then
        tail -f "$LOG_FILE"
    else
        log_error "日志文件不存在: $LOG_FILE"
    fi
}

# 停止服务
stop_server() {
    log_info "停止服务..."

    PIDS=$(pgrep -f "igreen-backend" 2>/dev/null || true)

    if [ -n "$PIDS" ]; then
        for PID in $PIDS; do
            log_info "停止进程: $PID"
            kill $PID 2>/dev/null || true
        done

        sleep 3

        # 检查是否停止
        REMAINING=$(pgrep -f "igreen-backend" 2>/dev/null || true)
        if [ -n "$REMAINING" ]; then
            log_warn "强制停止: $REMAINING"
            kill -9 $REMAINING 2>/dev/null || true
        fi

        log_success "服务已停止"
    else
        log_info "服务未运行"
    fi
}

# 重启服务
restart_server() {
    log_info "重启服务..."
    stop_server
    sleep 2
    start_server
}

# 主入口
main() {
    case "${1:-start}" in
        start)
            check_environment
            start_server
            ;;
        status)
            show_status
            ;;
        stop)
            stop_server
            ;;
        restart)
            restart_server
            ;;
        log)
            show_log
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            log_error "未知参数: $1"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
