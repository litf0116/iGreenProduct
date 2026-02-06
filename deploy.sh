#!/bin/bash

# =============================================
# iGreenProduct 系统一键部署脚本
# 用于CentOS/Ubuntu服务器
# =============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量 - 根据实际部署目录修改
PROJECT_DIR="${IGREEN_ROOT:-/home/igreen/app}"
BACKEND_DIR="$PROJECT_DIR/igreen-backend"
FRONTEND_APP_DIR="$PROJECT_DIR/iGreenApp"
FRONTEND_ADMIN_DIR="$PROJECT_DIR/igreen-front"
UPLOAD_DIR="$PROJECT_DIR/uploads"
LOG_DIR="$PROJECT_DIR/logs"
BACKUP_DIR="$PROJECT_DIR/backups"

# 数据库配置
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="igreen_db"
DB_USER="igreen_db"
DB_PASS=""

# JWT配置
JWT_SECRET_KEY="iGreenProduct2025SecureJWTKeyForProductionEnvironment"

# 域名配置
DOMAIN_NAME=""

# 安装日志
INSTALL_LOG="$LOG_DIR/install.log"

# =============================================
# 函数定义
# =============================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    mkdir -p "$LOG_DIR"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1" >> "$INSTALL_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    mkdir -p "$LOG_DIR"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $1" >> "$INSTALL_LOG"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    mkdir -p "$LOG_DIR"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $1" >> "$INSTALL_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    mkdir -p "$LOG_DIR"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1" >> "$INSTALL_LOG"
}

# 检查是否为root用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用root用户运行此脚本"
        exit 1
    fi
}

# 检查操作系统
check_os() {
    if [ -f /etc/redhat-release ]; then
        OS="centos"
        log_info "检测到 CentOS/RHEL 系统"
    elif [ -f /etc/debian_version ]; then
        OS="ubuntu"
        log_info "检测到 Ubuntu/Debian 系统"
    else
        log_error "不支持的操作系统"
        exit 1
    fi
}

# 创建必要目录
create_directories() {
    log_info "创建系统目录..."
    mkdir -p "$PROJECT_DIR"
    mkdir -p "$UPLOAD_DIR"
    mkdir -p "$LOG_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$PROJECT_DIR/ssl"
    log_success "目录创建完成"
}

# 安装Java 21
install_java() {
    log_info "检查Java环境..."

    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
        log_info "检测到Java版本: $JAVA_VERSION"
        if [ "$JAVA_VERSION" -ge 17 ]; then
            log_success "Java版本满足要求 (>=17)"
            return 0
        fi
    fi

    log_info "开始安装Java 21..."

    if [ "$OS" = "centos" ]; then
        # 安装OpenJDK 21 (CentOS)
        yum install -y java-21-openjdk-devel java-21-openjdk-headless

        # 设置JAVA_HOME
        export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
        if ! grep -q "JAVA_HOME" /etc/profile.d/java.sh 2>/dev/null; then
            echo "export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))" > /etc/profile.d/java.sh
            echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> /etc/profile.d/java.sh
            chmod +x /etc/profile.d/java.sh
        fi
    else
        # 安装OpenJDK 21 (Ubuntu)
        apt-get update
        apt-get install -y openjdk-21-jdk

        # 设置JAVA_HOME
        export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
        if ! grep -q "JAVA_HOME" /etc/environment; then
            echo "JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))" >> /etc/environment
        fi
    fi

    log_success "Java 21 安装完成"
}

# 安装Maven
install_maven() {
    log_info "检查Maven环境..."

    if command -v mvn &> /dev/null; then
        MVN_VERSION=$(mvn -version 2>&1 | head -1)
        log_info "检测到Maven: $MVN_VERSION"
        return 0
    fi

    log_info "开始安装Maven..."

    if [ "$OS" = "centos" ]; then
        yum install -y maven
    else
        apt-get install -y maven
    fi

    log_success "Maven 安装完成"
}

# 安装Node.js
install_node() {
    log_info "检查Node.js环境..."

    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log_info "检测到Node.js版本: $NODE_VERSION"
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_MAJOR" -ge 18 ]; then
            log_success "Node.js版本满足要求 (>=18)"
            return 0
        fi
    fi

    log_info "开始安装Node.js 20..."

    if [ "$OS" = "centos" ]; then
        # 使用NodeSource仓库安装Node.js 20
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    else
        # 使用NodeSource仓库安装Node.js 20
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi

    log_success "Node.js 20 安装完成"
}

# 安装MySQL
install_mysql() {
    log_info "检查MySQL环境..."

    if command -v mysql &> /dev/null; then
        log_success "MySQL已安装"
        return 0
    fi

    log_info "开始安装MySQL 8.0..."

    if [ "$OS" = "centos" ]; then
        # 安装MySQL 8.0 (CentOS)
        yum localinstall -y https://dev.mysql.com/get/mysql80-community-release-el7-7.noarch.rpm
        yum install -y mysql-community-server mysql-community-client

        # 启动MySQL服务
        systemctl start mysqld
        systemctl enable mysqld
    else
        # 安装MySQL 8.0 (Ubuntu)
        apt-get install -y mysql-server mysql-client

        # 启动MySQL服务
        systemctl start mysql
        systemctl enable mysql
    fi

    log_success "MySQL 8.0 安装完成"
}

# 配置MySQL数据库
configure_mysql() {
    log_info "配置MySQL数据库..."

    # 读取或设置数据库密码
    if [ -z "$DB_PASS" ]; then
        DB_PASS=$(openssl rand -base64 12 | tr -d '=' | tr -d '/' | head -c 16)
        log_warn "生成的数据库密码: $DB_PASS"
        log_warn "请妥善保存此密码!"
    fi

    # 创建数据库和用户
    mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASS';
FLUSH PRIVILEGES;
EOF

    log_success "数据库配置完成"
    log_info "数据库: $DB_NAME"
    log_info "用户名: $DB_USER"
}

# 安装Nginx
install_nginx() {
    log_info "检查Nginx环境..."

    if command -v nginx &> /dev/null; then
        log_success "Nginx已安装"
        return 0
    fi

    log_info "开始安装Nginx..."

    if [ "$OS" = "centos" ]; then
        yum install -y epel-release
        yum install -y nginx
    else
        apt-get install -y nginx
    fi

    # 启动Nginx服务
    systemctl start nginx
    systemctl enable nginx

    log_success "Nginx 安装完成"
}

# 安装Git
install_git() {
    log_info "检查Git环境..."

    if ! command -v git &> /dev/null; then
        log_info "开始安装Git..."

        if [ "$OS" = "centos" ]; then
            yum install -y git
        else
            apt-get install -y git
        fi

        log_success "Git 安装完成"
    else
        log_success "Git已安装"
    fi
}

# 安装其他依赖
install_dependencies() {
    log_info "安装其他必要依赖..."

    if [ "$OS" = "centos" ]; then
        yum install -y curl wget unzip vim openssl
    else
        apt-get install -y curl wget unzip vim openssl
    fi

    log_success "依赖安装完成"
}

# 部署后端
deploy_backend() {
    log_info "开始部署后端服务..."

    # 拉取或复制后端代码
    if [ -d "$BACKEND_DIR" ]; then
        log_info "更新后端代码..."
        cd "$BACKEND_DIR"
        git pull origin main 2>/dev/null || log_warn "无法更新代码，请手动拉取"
    else
        log_info "克隆后端代码..."
        git clone <your-repo-url> "$BACKEND_DIR" || {
            log_warn "无法克隆代码，尝试使用本地代码..."
        }
    fi

    # 复制后端代码到部署目录
    if [ -d "/var/folders/1x/qcplfbgn4430v6l9gltk_7v00000gn/T/vibe-kanban/worktrees/d2e1-/iGreenProduct/igreen-backend" ]; then
        log_info "复制后端代码到部署目录..."
        cp -r /var/folders/1x/qcplfbgn4430v6l9gltk_7v00000gn/T/vibe-kanban/worktrees/d2e1-/iGreenProduct/igreen-backend/* "$BACKEND_DIR/"
    fi

    # 构建后端
    cd "$BACKEND_DIR"
    log_info "构建后端JAR包..."
    mvn clean package -DskipTests -q

    # 创建生产配置文件
    cat > "$BACKEND_DIR/src/main/resources/application-prod.yml" << EOF
spring:
  profiles:
    active: prod
  threads:
    virtual:
      enabled: true
  servlet:
    multipart:
      enabled: true
      max-file-size: 50MB
      max-request-size: 50MB
  datasource:
    url: jdbc:mysql://$DB_HOST:$DB_PORT/$DB_NAME?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: $DB_USER
    password: $DB_PASS
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
      idle-timeout: 300000
      connection-timeout: 30000

  jackson:
    serialization:
      write-dates-as-timestamps: false
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: Asia/Shanghai

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false

server:
  port: 8080

app:
  jwt:
    secret-key: $JWT_SECRET_KEY
    expiration-ms: 7200000
    refresh-expiration-ms: 604800000
  upload:
    dir: $UPLOAD_DIR
    max-size: 52428800
  cors:
    allowed-origins: http://localhost:3000,http://localhost:5173,$DOMAIN_NAME

springdoc:
  api-docs:
    enabled: true
    path: /v3/api-docs
  swagger-ui:
    enabled: true
    path: /swagger-ui.html

knife4j:
  enable: true
  setting:
    language: zh_CN

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: always

logging:
  level:
    root: INFO
    com.igreen: INFO
  file:
    name: $LOG_DIR/igreen-backend.log
EOF

    log_success "后端部署完成"
}

# 部署前端APP
deploy_frontend_app() {
    log_info "开始部署iGreenApp前端..."

    # 复制前端代码
    if [ -d "/var/folders/1x/qcplfbgn4430v6l9gltk_7v00000gn/T/vibe-kanban/worktrees/d2e1-/iGreenProduct/iGreenApp" ]; then
        log_info "复制iGreenApp代码..."
        cp -r /var/folders/1x/qcplfbgn4430v6l9gltk_7v00000gn/T/vibe-kanban/worktrees/d2e1-/iGreenProduct/iGreenApp/* "$FRONTEND_APP_DIR/"
    fi

    # 创建环境配置文件
    cat > "$FRONTEND_APP_DIR/.env.production" << EOF
VITE_API_URL=http://$DOMAIN_NAME/api
VITE_APP_VERSION=1.0.0
EOF

    # 安装依赖并构建
    cd "$FRONTEND_APP_DIR"
    log_info "安装iGreenApp依赖..."
    npm install --legacy-peer-deps

    log_info "构建iGreenApp..."
    npm run build

    log_success "iGreenApp部署完成"
}

# 部署管理后台前端
deploy_frontend_admin() {
    log_info "开始部署管理后台前端..."

    # 复制前端代码
    if [ -d "/var/folders/1x/qcplfbgn4430v6l9gltk_7v00000gn/T/vibe-kanban/worktrees/d2e1-/iGreenProduct/igreen-front" ]; then
        log_info "复制管理后台代码..."
        cp -r /var/folders/1x/qcplfbgn4430v6l9gltk_7v00000gn/T/vibe-kanban/worktrees/d2e1-/iGreenProduct/igreen-front/* "$FRONTEND_ADMIN_DIR/"
    fi

    # 创建环境配置文件
    cat > "$FRONTEND_ADMIN_DIR/.env.production" << EOF
VITE_API_URL=http://$DOMAIN_NAME/api
VITE_APP_VERSION=1.0.0
EOF

    # 安装依赖并构建
    cd "$FRONTEND_ADMIN_DIR"
    log_info "安装管理后台依赖..."
    npm install --legacy-peer-deps

    log_info "构建管理后台..."
    npm run build

    log_success "管理后台部署完成"
}

# 配置Nginx
configure_nginx() {
    log_info "配置Nginx..."

    # 创建Nginx配置文件
    cat > /etc/nginx/conf.d/igreen.conf << EOF
# iGreenProduct Nginx 配置文件

# 上游后端服务器
upstream igreen_backend {
    server 127.0.0.1:8080;
    keepalive 32;
}

# HTTP 服务器配置
server {
    listen 80;
    server_name $DOMAIN_NAME;

    # 重定向到HTTPS (如果需要SSL)
    # return 301 https://\$host\$request_uri;

    # 根目录
    root $FRONTEND_APP_DIR/dist;
    index index.html;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API 请求代理
    location /api/ {
        proxy_pass http://igreen_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;

        # 大文件上传支持
        client_max_body_size 50m;
    }

    # 健康检查端点
    location /actuator/health {
        proxy_pass http://igreen_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        access_log off;
    }

    # Swagger UI
    location /swagger-ui.html {
        proxy_pass http://igreen_backend;
    }

    location /v3/api-docs {
        proxy_pass http://igreen_backend;
    }

    # 静态文件上传目录
    location /uploads/ {
        alias $UPLOAD_DIR/;
        expires 30d;
        add_header Cache-Control "public, immutable";

        # 允许的文件类型
        location ~* ^/uploads/.*\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar)$ {
            add_header Content-Type \$content_type;
        }

        # 禁止执行脚本
        location ~* ^/uploads/.*\.(php|jsp|asp|exe|bat|cmd|com|phtml|shtml)$ {
            deny all;
        }
    }

    # 前端静态文件 - SPA支持
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
    }

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;

    # 日志
    access_log $LOG_DIR/nginx-access.log;
    error_log $LOG_DIR/nginx-error.log;

    # 文件上传限制
    client_max_body_size 50m;
    client_body_timeout 60s;

    server_tokens off;
}

# HTTPS 配置 (SSL证书申请后启用)
# server {
#     listen 443 ssl http2;
#     server_name $DOMAIN_NAME;
#
#     ssl_certificate /etc/nginx/ssl/igreen.crt;
#     ssl_certificate_key /etc/nginx/ssl/igreen.key;
#
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5;
#     ssl_prefer_server_ciphers off;
#
#     add_header Strict-Transport-Security "max-age=31536000" always;
#
#     # 包含上述HTTP配置的所有location块...
# }
EOF

    # 测试Nginx配置
    nginx -t

    # 重载Nginx
    systemctl reload nginx

    log_success "Nginx配置完成"
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."

    if [ "$OS" = "centos" ]; then
        # 开放端口
        firewall-cmd --permanent --add-port=80/tcp
        firewall-cmd --permanent --add-port=443/tcp
        firewall-cmd --permanent --add-port=8080/tcp
        firewall-cmd --reload

        # 如果使用宝塔面板
        if command -v bt &> /dev/null; then
            log_info "检测到宝塔面板，请手动在面板中开放端口"
        fi
    else
        # Ubuntu UFW
        if command -v ufw &> /dev/null; then
            ufw allow 80/tcp
            ufw allow 443/tcp
            ufw allow 8080/tcp
            ufw reload
        fi
    fi

    log_success "防火墙配置完成"
}

# 创建系统服务
create_systemd_services() {
    log_info "创建系统服务..."

    # 后端服务
    cat > /etc/systemd/system/igreen-backend.service << EOF
[Unit]
Description=iGreen Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=$BACKEND_DIR
ExecStart=/usr/bin/java -Xmx1024m -Xms512m -XX:+UseG1GC -Dspring.profiles.active=prod -Dserver.port=8080 -jar $BACKEND_DIR/target/igreen-backend-1.0.0-SNAPSHOT.jar
Restart=always
RestartSec=10

Environment=JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
Environment=SPRING_PROFILES_ACTIVE=prod

# 日志
StandardOutput=append:$LOG_DIR/igreen-backend.out.log
StandardError=append:$LOG_DIR/igreen-backend.error.log

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable igreen-backend.service

    log_success "系统服务创建完成"
}

# 创建快捷操作脚本
create_scripts() {
    log_info "创建快捷操作脚本..."

    # 部署目录下创建控制脚本
    cat > "$PROJECT_DIR/start.sh" << 'SCRIPT'
#!/bin/bash

# 启动后端服务
cd /opt/igreen/backend

# 检查是否已运行
if pgrep -f "igreen-backend" > /dev/null; then
    echo "后端服务已在运行中"
    exit 0
fi

# 启动服务
nohup java -Xmx1024m -Xms512m -XX:+UseG1GC -Dspring.profiles.active=prod -Dserver.port=8080 \
    -jar target/igreen-backend-1.0.0-SNAPSHOT.jar > /var/log/igreen/igreen-backend.log 2>&1 &

echo "后端服务启动中..."
sleep 5

# 检查启动状态
if curl -s http://localhost:8080/actuator/health > /dev/null; then
    echo "后端服务启动成功"
else
    echo "后端服务启动失败，请查看日志: /var/log/igreen/igreen-backend.log"
fi
SCRIPT

    cat > "$PROJECT_DIR/stop.sh" << 'SCRIPT'
#!/bin/bash

echo "停止后端服务..."

# 查找并停止进程
PIDS=$(pgrep -f "igreen-backend")

if [ -n "$PIDS" ]; then
    for PID in $PIDS; do
        echo "停止进程: $PID"
        kill $PID 2>/dev/null || true
    done

    # 等待进程完全停止
    sleep 3

    # 强制杀死残留进程
    pkill -f "igreen-backend" 2>/dev/null || true

    echo "后端服务已停止"
else
    echo "后端服务未运行"
fi
SCRIPT

    cat > "$PROJECT_DIR/restart.sh" << 'SCRIPT'
#!/bin/bash

echo "重启后端服务..."

# 停止服务
$PROJECT_DIR/stop.sh

# 等待服务完全停止
sleep 3

# 启动服务
$PROJECT_DIR/start.sh

echo "后端服务重启完成"
SCRIPT

    cat > "$PROJECT_DIR/status.sh" << 'SCRIPT'
#!/bin/bash

echo "=== iGreen 系统状态 ==="

# 检查后端服务
echo ""
echo "--- 后端服务 ---"
if pgrep -f "igreen-backend" > /dev/null; then
    echo "✅ 后端服务: 运行中"
    curl -s http://localhost:8080/actuator/health | jq '.status' 2>/dev/null || echo "状态检查失败"
else
    echo "❌ 后端服务: 未运行"
fi

# 检查Nginx
echo ""
echo "--- Nginx ---"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: 运行中"
else
    echo "❌ Nginx: 未运行"
fi

# 检查MySQL
echo ""
echo "--- MySQL ---"
if systemctl is-active --quiet mysql || systemctl is-active --quiet mysqld; then
    echo "✅ MySQL: 运行中"
else
    echo "❌ MySQL: 未运行"
fi

# 检查端口监听
echo ""
echo "--- 端口监听 ---"
netstat -tlnp | grep -E ':(80|443|8080)' || echo "未检测到监听端口"
SCRIPT

    # 设置执行权限
    chmod +x "$PROJECT_DIR/"*.sh

    log_success "快捷操作脚本创建完成"
}

# 生成部署报告
generate_report() {
    log_info "生成部署报告..."

    cat > "$PROJECT_DIR/DEPLOYMENT_REPORT.md" << EOF
# iGreenProduct 部署报告

## 部署信息
- **部署时间**: $(date '+%Y-%m-%d %H:%M:%S')
- **部署目录**: $PROJECT_DIR
- **域名**: $DOMAIN_NAME

## 服务配置

### 后端服务
- **地址**: http://$DOMAIN_NAME:8080
- **API文档**: http://$DOMAIN_NAME:8080/swagger-ui.html
- **健康检查**: http://$DOMAIN_NAME:8080/actuator/health

### iGreenApp (工程师APP)
- **地址**: http://$DOMAIN_NAME
- **构建目录**: $FRONTEND_APP_DIR/dist

### 管理后台
- **地址**: http://$DOMAIN_NAME/admin
- **构建目录**: $FRONTEND_ADMIN_DIR/dist

## 数据库配置
- **数据库**: $DB_NAME
- **用户名**: $DB_USER
- **密码**: $DB_PASS (请妥善保存!)

## 文件目录
- **上传文件目录**: $UPLOAD_DIR
- **日志目录**: $LOG_DIR
- **备份目录**: $BACKUP_DIR

## 快捷命令
- 启动: $PROJECT_DIR/start.sh
- 停止: $PROJECT_DIR/stop.sh
- 重启: $PROJECT_DIR/restart.sh
- 状态: $PROJECT_DIR/status.sh

## 系统服务
- 后端服务: systemctl status igreen-backend
- Nginx服务: systemctl status nginx
- MySQL服务: systemctl status mysql

## 日志查看
- 后端日志: tail -f $LOG_DIR/igreen-backend.log
- Nginx访问日志: tail -f $LOG_DIR/nginx-access.log
- Nginx错误日志: tail -f $LOG_DIR/nginx-error.log

## 后续操作
1. 申请SSL证书并配置HTTPS
2. 配置域名解析
3. 设置定期备份任务
4. 配置监控告警
EOF

    log_success "部署报告已生成"
}

# 打印使用说明
print_usage() {
    echo ""
    echo "============================================="
    echo "        iGreenProduct 部署完成!"
    echo "============================================="
    echo ""
    echo "📖 使用说明:"
    echo ""
    echo "启动服务:"
    echo "  $PROJECT_DIR/start.sh"
    echo ""
    echo "停止服务:"
    echo "  $PROJECT_DIR/stop.sh"
    echo ""
    echo "重启服务:"
    echo "  $PROJECT_DIR/restart.sh"
    echo ""
    echo "查看状态:"
    echo "  $PROJECT_DIR/status.sh"
    echo ""
    echo "查看后端日志:"
    echo "  tail -f $LOG_DIR/igreen-backend.log"
    echo ""
    echo "============================================="
    echo ""
    echo "🌐 访问地址:"
    echo "  - 应用首页: http://$DOMAIN_NAME"
    echo "  - API文档: http://$DOMAIN_NAME/swagger-ui.html"
    echo ""
}

# 主函数
main() {
    echo "============================================="
    echo "    iGreenProduct 一键部署脚本"
    echo "============================================="
    echo ""

    # 检查root权限
    check_root

    # 检查操作系统
    check_os

    # 设置域名
    if [ -z "$DOMAIN_NAME" ]; then
        read -p "请输入您的域名 (例如: igreen.yourdomain.com): " DOMAIN_NAME
        if [ -z "$DOMAIN_NAME" ]; then
            DOMAIN_NAME="localhost"
        fi
    fi

    # 创建日志目录
    mkdir -p "$LOG_DIR"
    touch "$INSTALL_LOG"

    log_info "开始部署 iGreenProduct..."
    log_info "部署目录: $PROJECT_DIR"
    log_info "域名: $DOMAIN_NAME"

    # 1. 创建必要目录
    create_directories

    # 2. 安装系统依赖
    log_info "步骤1/7: 安装系统依赖..."
    install_git
    install_dependencies
    log_success "系统依赖安装完成"

    # 3. 安装Java
    log_info "步骤2/7: 安装Java 21..."
    install_java
    log_success "Java安装完成"

    # 4. 安装Maven
    log_info "步骤3/7: 安装Maven..."
    install_maven
    log_success "Maven安装完成"

    # 5. 安装Node.js
    log_info "步骤4/7: 安装Node.js 20..."
    install_node
    log_success "Node.js安装完成"

    # 6. 安装MySQL
    log_info "步骤5/7: 安装并配置MySQL..."
    install_mysql
    configure_mysql
    log_success "MySQL安装完成"

    # 7. 安装Nginx
    log_info "步骤6/7: 安装并配置Nginx..."
    install_nginx
    configure_nginx
    configure_firewall
    log_success "Nginx安装完成"

    # 8. 部署应用
    log_info "步骤7/7: 部署应用..."

    # 检查是否有项目代码
    if [ -d "/var/folders/1x/qcplfbgn4430v6l9gltk_7v00000gn/T/vibe-kanban/worktrees/d2e1-/iGreenProduct/igreen-backend" ]; then
        deploy_backend
    else
        log_warn "未找到后端代码，请手动部署"
    fi

    if [ -d "/var/folders/1x/qcplfbgn4430v6l9gltk_7v00000gn/T/vibe-kanban/worktrees/d2e1-/iGreenProduct/iGreenApp" ]; then
        deploy_frontend_app
    else
        log_warn "未找到iGreenApp前端代码，请手动部署"
    fi

    if [ -d "/var/folders/1x/qcplfbgn4430v6l9gltk_7v00000gn/T/vibe-kanban/worktrees/d2e1-/iGreenProduct/igreen-front" ]; then
        deploy_frontend_admin
    else
        log_warn "未找到管理后台前端代码，请手动部署"
    fi

    # 9. 创建系统服务和脚本
    create_systemd_services
    create_scripts

    # 10. 生成报告
    generate_report

    # 打印使用说明
    print_usage

    log_success "所有部署步骤完成!"
}

# 运行主函数
main "$@"
