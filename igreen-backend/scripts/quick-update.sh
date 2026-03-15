#!/bin/bash

# iGreenProduct JAR包快速更新脚本
# 只更新JAR包，不重新配置环境

set -e

# 配置
APP_NAME="igreen-backend"
REMOTE_HOST="180.188.45.250"
REMOTE_USER="root"
REMOTE_PATH="/opt/igreen"
LOCAL_JAR="target/igreen-backend-1.0.0-SNAPSHOT.jar"
REMOTE_JAR="$REMOTE_PATH/$APP_NAME.jar"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# 编译JAR包
build_jar() {
    log_info "编译Spring Boot应用..."

    if [ ! -d ".." ]; then
        log_error "找不到项目根目录"
        exit 1
    fi

    cd ..

    # 快速编译（跳过测试）
    mvn clean package -DskipTests -q

    if [ ! -f "target/igreen-backend-1.0.0-SNAPSHOT.jar" ]; then
        log_error "JAR文件编译失败"
        exit 1
    fi

    log_success "JAR包编译完成"
}

# 上传JAR包到服务器
upload_jar() {
    log_info "上传JAR包到服务器..."

    scp "$LOCAL_JAR" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_JAR"

    log_success "JAR包上传完成"
}

# 重启远程服务
restart_service() {
    log_info "重启远程服务..."

    ssh "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
        # 停止现有服务
        echo "停止现有服务..."
        sudo systemctl stop igreen-backend 2>/dev/null || true

        # 等待一下
        sleep 2

        # 启动新服务
        echo "启动新服务..."
        sudo systemctl start igreen-backend

        # 检查服务状态
        echo "检查服务状态..."
        sudo systemctl status igreen-backend --no-pager

        # 等待应用启动
        echo "等待应用启动..."
        sleep 10

        # 测试健康检查
        if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
            echo "✅ 应用启动成功"
        else
            echo "❌ 应用启动失败"
            echo "查看日志: sudo journalctl -u igreen-backend -f"
        fi
EOF

    log_success "服务重启完成"
}

# 验证部署
verify_deployment() {
    log_info "验证部署结果..."

    # 测试远程服务
    if ssh "$REMOTE_USER@$REMOTE_HOST" "curl -f http://localhost:8080/actuator/health >/dev/null 2>&1"; then
        log_success "远程服务运行正常"
    else
        log_error "远程服务异常"
        exit 1
    fi

    # 显示部署信息
    echo ""
    echo "=== 部署信息 ==="
    echo "应用名称: $APP_NAME"
    echo "服务器: $REMOTE_HOST"
    echo "部署路径: $REMOTE_PATH"
    echo "访问地址: http://$REMOTE_HOST:8080"
    echo "健康检查: http://$REMOTE_HOST:8080/actuator/health"
    echo ""
    echo "管理命令:"
    echo "ssh $REMOTE_USER@$REMOTE_HOST 'sudo systemctl status igreen-backend'"
    echo "ssh $REMOTE_USER@$REMOTE_HOST 'sudo systemctl restart igreen-backend'"
    echo "ssh $REMOTE_USER@$REMOTE_HOST 'sudo journalctl -u igreen-backend -f'"
}

# 主函数
main() {
    echo "🚀 iGreenProduct JAR包快速更新脚本"
    echo "==================================="

    # 检查本地环境
    if ! command -v mvn &> /dev/null; then
        log_error "本地需要安装Maven"
        exit 1
    fi

    if ! command -v scp &> /dev/null; then
        log_error "需要scp命令进行文件传输"
        exit 1
    fi

    # 执行更新步骤
    build_jar
    upload_jar
    restart_service
    verify_deployment

    log_success "🎉 JAR包更新完成！"
}

# 参数处理
case "$1" in
    "build-only")
        build_jar
        log_success "仅编译完成"
        ;;
    "upload-only")
        build_jar
        upload_jar
        log_success "仅上传完成"
        ;;
    "restart-only")
        restart_service
        log_success "仅重启完成"
        ;;
    ""|"full")
        main
        ;;
    "--help"|"-h")
        echo "iGreenProduct JAR包快速更新脚本"
        echo "==================================="
        echo ""
        echo "使用方法:"
        echo "  ./quick-update.sh              # 完整更新 (编译+上传+重启)"
        echo "  ./quick-update.sh build-only   # 仅编译JAR包"
        echo "  ./quick-update.sh upload-only  # 编译并上传JAR包"
        echo "  ./quick-update.sh restart-only # 仅重启远程服务"
        echo "  ./quick-update.sh --help       # 显示此帮助信息"
        echo ""
        echo "配置说明:"
        echo "  服务器: $REMOTE_HOST"
        echo "  用户: $REMOTE_USER"
        echo "  部署路径: $REMOTE_PATH"
        exit 0
        ;;
    *)
        echo "未知参数: $1"
        echo "使用 ./quick-update.sh --help 查看帮助信息"
        exit 1
        ;;
esac