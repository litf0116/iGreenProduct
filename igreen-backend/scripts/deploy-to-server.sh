#!/bin/bash

# iGreenProduct 一键部署脚本
# 自动部署Spring Boot应用到生产环境

set -e  # 遇到错误立即退出

# 配置变量
APP_NAME="igreen-backend"
APP_PORT=8080
DB_HOST="localhost"
DB_PORT=3306
DB_NAME="igreen_db"
DB_USERNAME="igreen_db"
DB_PASSWORD="knS8jexaAnByhpj4"
UPLOAD_DIR="/opt/igreen/uploads"
LOG_DIR="/opt/igreen/logs"
DEPLOY_DIR="/opt/igreen"
BACKUP_DIR="/opt/igreen/backups"
JWT_SECRET="iGreenProduct2025SecureJWTKeyForProductionEnvironment"

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

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否以root用户运行
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请以root用户运行此脚本"
        log_info "使用: sudo $0"
        exit 1
    fi
}

# 检查系统环境
check_environment() {
    log_info "检查系统环境..."

    # 检查Java
    if ! command -v java &> /dev/null; then
        log_error "Java未安装"
        exit 1
    fi

    JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 17 ]; then
        log_error "需要Java 17或更高版本"
        exit 1
    fi
    log_success "Java版本: $(java -version 2>&1 | head -1)"

    # 检查Maven
    if ! command -v mvn &> /dev/null; then
        log_error "Maven未安装"
        exit 1
    fi
    log_success "Maven版本: $(mvn -version | head -1)"

    # 检查MySQL
    if ! command -v mysql &> /dev/null; then
        log_error "MySQL客户端未安装"
        exit 1
    fi
    log_success "MySQL客户端可用"

    # 检查Nginx
    if ! command -v nginx &> /dev/null; then
        log_warning "Nginx未安装，将跳过Nginx配置"
        SKIP_NGINX=true
    else
        log_success "Nginx可用"
        SKIP_NGINX=false
    fi
}

# 检查数据库连接
check_database() {
    log_info "检查数据库连接..."

    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USERNAME" -p"$DB_PASSWORD" -e "USE $DB_NAME; SELECT 1;" &> /dev/null; then
        log_success "数据库连接正常"
    else
        log_error "数据库连接失败"
        log_info "请检查数据库配置:"
        log_info "- 主机: $DB_HOST:$DB_PORT"
        log_info "- 数据库: $DB_NAME"
        log_info "- 用户名: $DB_USERNAME"
        exit 1
    fi
}

# 创建部署目录
create_directories() {
    log_info "创建部署目录..."

    mkdir -p "$DEPLOY_DIR"
    mkdir -p "$UPLOAD_DIR"
    mkdir -p "$LOG_DIR"
    mkdir -p "$BACKUP_DIR"

    # 设置权限
    chown -R root:root "$DEPLOY_DIR"
    chmod -R 755 "$UPLOAD_DIR"
    chmod -R 755 "$LOG_DIR"

    log_success "目录创建完成"
}

# 备份现有应用
backup_existing() {
    if [ -f "$DEPLOY_DIR/$APP_NAME.jar" ]; then
        log_info "备份现有应用..."
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$DEPLOY_DIR/$APP_NAME.jar" "$BACKUP_DIR/$APP_NAME-$TIMESTAMP.jar"
        log_success "备份文件: $BACKUP_DIR/$APP_NAME-$TIMESTAMP.jar"
    fi
}

# 编译应用
build_application() {
    log_info "编译Spring Boot应用..."

    # 检查源码目录
    if [ ! -d ".." ]; then
        log_error "找不到项目根目录"
        log_info "请确保在项目根目录运行此脚本"
        exit 1
    fi

    cd ..

    # 清理和编译
    log_info "执行Maven编译..."
    if ! mvn clean package -DskipTests -q; then
        log_error "Maven编译失败"
        exit 1
    fi

    # 检查JAR文件
    if [ ! -f "target/$APP_NAME-1.0.0-SNAPSHOT.jar" ]; then
        log_error "找不到编译后的JAR文件"
        exit 1
    fi

    log_success "应用编译完成"
    cd ..
}

# 部署应用
deploy_application() {
    log_info "部署Spring Boot应用..."

    # 停止现有服务
    if systemctl is-active --quiet "$APP_NAME" 2>/dev/null; then
        log_info "停止现有服务..."
        systemctl stop "$APP_NAME"
    fi

    # 复制新版本
    cp "../target/$APP_NAME-1.0.0-SNAPSHOT.jar" "$DEPLOY_DIR/$APP_NAME.jar"

    # 创建systemd服务文件
    create_service_file

    # 重新加载systemd
    systemctl daemon-reload

    # 启动服务
    log_info "启动应用服务..."
    systemctl start "$APP_NAME"
    systemctl enable "$APP_NAME"

    log_success "应用部署完成"
}

# 创建systemd服务文件
create_service_file() {
    log_info "创建systemd服务文件..."

    cat > "/etc/systemd/system/$APP_NAME.service" << EOF
[Unit]
Description=iGreen Backend Service
After=network.target mysql.service
Requires=mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/bin/java \$JAVA_OPTS -Dspring.profiles.active=prod \\
    -Dserver.port=$APP_PORT \\
    -jar $DEPLOY_DIR/$APP_NAME.jar
Restart=always
RestartSec=10
TimeoutStartSec=300
TimeoutStopSec=30

# 环境变量
Environment=JAVA_OPTS=-Xmx1024m -Xms512m -XX:+UseG1GC -XX:+UseContainerSupport
Environment=DB_HOST=$DB_HOST
Environment=DB_PORT=$DB_PORT
Environment=DB_NAME=$DB_NAME
Environment=DB_USERNAME=$DB_USERNAME
Environment=DB_PASSWORD=$DB_PASSWORD
Environment=UPLOAD_DIR=$UPLOAD_DIR
Environment=JWT_SECRET_KEY=$JWT_SECRET
Environment=SERVER_PORT=$APP_PORT
Environment=SPRING_PROFILES_ACTIVE=prod

# 日志
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$APP_NAME

[Install]
WantedBy=multi-user.target
EOF

    log_success "systemd服务文件创建完成"
}

# 配置Nginx
configure_nginx() {
    if [ "$SKIP_NGINX" = true ]; then
        log_warning "跳过Nginx配置"
        return
    fi

    log_info "配置Nginx反向代理..."

    # 创建Nginx配置
    cat > "/etc/nginx/sites-available/$APP_NAME" << EOF
# iGreenProduct Nginx配置
upstream $APP_NAME {
    server 127.0.0.1:$APP_PORT max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name _;  # 接受所有域名，可根据需要修改

    # 客户端最大请求体大小
    client_max_body_size 50m;

    # API请求代理
    location /api/ {
        proxy_pass http://$APP_NAME;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;

        # API不缓存
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;

        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Actuator监控端点
    location /actuator/ {
        proxy_pass http://$APP_NAME;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;

        # 监控端点不记录访问日志
        access_log off;

        # 限制访问IP (可选)
        # allow 127.0.0.1;
        # allow 192.168.1.0/24;
        # deny all;
    }

    # 静态文件访问
    location /uploads/ {
        alias $UPLOAD_DIR/;
        expires 30d;
        add_header Cache-Control "public, immutable" always;

        # 安全限制
        location ~* \\.(php|jsp|asp|exe|bat|cmd|com|phtml|shtml)$ {
            deny all;
            return 403;
        }

        # 记录文件访问日志
        access_log /var/log/nginx/${APP_NAME}_uploads.access.log;
    }

    # 健康检查
    location /health {
        proxy_pass http://$APP_NAME/actuator/health;
        access_log off;
    }

    # 默认页面
    location / {
        return 200 "iGreen Backend API Server\\n";
        add_header Content-Type text/plain;
    }

    # 日志配置
    access_log /var/log/nginx/${APP_NAME}.access.log;
    error_log /var/log/nginx/${APP_NAME}.error.log;

    # 隐藏Nginx版本
    server_tokens off;
}
EOF

    # 启用站点
    ln -sf "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/"

    # 删除默认站点（可选）
    rm -f "/etc/nginx/sites-enabled/default"

    # 测试配置
    if nginx -t; then
        systemctl reload nginx
        log_success "Nginx配置完成"
    else
        log_error "Nginx配置有误"
        exit 1
    fi
}

# 验证部署
verify_deployment() {
    log_info "验证部署结果..."

    # 等待应用启动
    log_info "等待应用启动..."
    for i in {1..30}; do
        if curl -f -s "http://localhost:$APP_PORT/actuator/health" > /dev/null; then
            log_success "应用启动成功"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "应用启动失败"
            log_info "查看应用日志: sudo journalctl -u $APP_NAME -f"
            exit 1
        fi
        sleep 2
    done

    # 测试API端点
    log_info "测试API端点..."

    # 健康检查
    if curl -f -s "http://localhost:$APP_PORT/actuator/health" | grep -q '"status":"UP"'; then
        log_success "健康检查通过"
    else
        log_warning "健康检查异常"
    fi

    # API文档（如果启用）
    if curl -f -s "http://localhost:$APP_PORT/api/docs" > /dev/null 2>&1; then
        log_success "API文档可访问"
    else
        log_info "API文档未启用（生产环境正常）"
    fi

    # 测试数据库连接
    if curl -f -s "http://localhost:$APP_PORT/api/users" > /dev/null 2>&1; then
        log_success "数据库连接正常"
    else
        log_warning "API访问异常，可能需要认证"
    fi

    # 如果配置了Nginx，测试反向代理
    if [ "$SKIP_NGINX" = false ]; then
        if curl -f -s "http://localhost/actuator/health" > /dev/null; then
            log_success "Nginx反向代理正常"
        else
            log_warning "Nginx反向代理异常"
        fi
    fi
}

# 显示部署信息
show_deployment_info() {
    log_success "🎉 部署完成！"
    echo ""
    echo "=== 部署信息 ==="
    echo "应用名称: $APP_NAME"
    echo "运行端口: $APP_PORT"
    echo "部署目录: $DEPLOY_DIR"
    echo "上传目录: $UPLOAD_DIR"
    echo "日志目录: $LOG_DIR"
    echo "备份目录: $BACKUP_DIR"
    echo ""
    echo "=== 访问地址 ==="
    echo "直接访问: http://localhost:$APP_PORT"
    if [ "$SKIP_NGINX" = false ]; then
        echo "Nginx代理: http://localhost"
        echo "健康检查: http://localhost/health"
    fi
    echo "API文档: http://localhost:$APP_PORT/api/docs (如果启用)"
    echo ""
    echo "=== 管理命令 ==="
    echo "查看状态: sudo systemctl status $APP_NAME"
    echo "重启服务: sudo systemctl restart $APP_NAME"
    echo "查看日志: sudo journalctl -u $APP_NAME -f"
    echo "停止服务: sudo systemctl stop $APP_NAME"
    echo ""
    echo "=== 宝塔面板 ==="
    echo "面板地址: https://180.188.45.250:13189/7d423390"
    echo "用户名: jappznw5"
    echo "密码: abbc8b56"
}

# 清理函数
cleanup() {
    log_info "清理临时文件..."
    # 这里可以添加清理逻辑
}

# 主函数
main() {
    echo "🚀 iGreenProduct 一键部署脚本"
    echo "================================="

    # 错误处理
    trap cleanup EXIT

    # 执行部署步骤
    check_root
    check_environment
    check_database
    create_directories
    backup_existing
    build_application
    deploy_application
    configure_nginx
    verify_deployment
    show_deployment_info

    log_success "部署脚本执行完成！"
}

# 执行主函数
main "$@"