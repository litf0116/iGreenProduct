#!/bin/bash

# 部署脚本：将 JAR 文件和控制脚本上传到远程服务器

set -e

# 配置变量
REMOTE_HOST="180.188.45.250"
REMOTE_USER="root"
REMOTE_DIR="/data/igreen-backend"
LOCAL_JAR="./target/igreen-backend-1.0.0-SNAPSHOT.jar"
LOCAL_SCRIPT="./scripts/jar-control-fixed.sh"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查本地文件
check_local_files() {
    log_info "检查本地文件..."
    
    if [ ! -f "$LOCAL_JAR" ]; then
        log_error "JAR 文件不存在: $LOCAL_JAR"
        log_info "请先运行: mvn clean package"
        exit 1
    fi
    
    if [ ! -f "$LOCAL_SCRIPT" ]; then
        log_error "控制脚本不存在: $LOCAL_SCRIPT"
        exit 1
    fi
    
    log_success "本地文件检查完成"
}

# 上传文件到远程服务器
upload_files() {
    log_info "上传文件到远程服务器 $REMOTE_HOST..."
    
    # 创建远程目录
    ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_DIR}/logs"
    
    # 上传 JAR 文件
    log_info "上传 JAR 文件..."
    scp "$LOCAL_JAR" ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/igreen-backend.jar
    
    # 上传控制脚本
    log_info "上传控制脚本..."
    scp "$LOCAL_SCRIPT" ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/jar-control.sh
    
    # 设置执行权限
    ssh ${REMOTE_USER}@${REMOTE_HOST} "chmod +x ${REMOTE_DIR}/jar-control.sh"
    
    log_success "文件上传完成"
}

# 在远程服务器上启动应用
start_remote_app() {
    log_info "在远程服务器上启动应用..."
    
    ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && ./jar-control.sh start"
    
    log_success "远程应用启动完成"
}

# 查看远程应用状态
check_remote_status() {
    log_info "查看远程应用状态..."
    
    ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && ./jar-control.sh status"
}

# 显示帮助
show_help() {
    echo "部署脚本：将 JAR 文件和控制脚本上传到远程服务器"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  upload     上传文件到远程服务器"
    echo "  start       上传并启动应用"
    echo "  status      查看远程应用状态"
    echo "  stop        停止远程应用"
    echo "  restart     重启远程应用"
    echo "  logs        查看远程应用日志"
    echo "  help        显示此帮助信息"
    echo ""
    echo "配置:"
    echo "  远程主机: $REMOTE_HOST"
    echo "  远程用户: $REMOTE_USER"
    echo "  远程目录: $REMOTE_DIR"
}

# 主函数
main() {
    case "${1:-help}" in
        "upload")
            check_local_files
            upload_files
            ;;
        "start")
            check_local_files
            upload_files
            start_remote_app
            check_remote_status
            ;;
        "status")
            check_remote_status
            ;;
        "stop")
            log_info "停止远程应用..."
            ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && ./jar-control.sh stop"
            log_success "远程应用已停止"
            ;;
        "restart")
            log_info "重启远程应用..."
            ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && ./jar-control.sh restart"
            log_success "远程应用已重启"
            check_remote_status
            ;;
        "logs")
            log_info "查看远程应用日志..."
            ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && ./jar-control.sh logs"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
