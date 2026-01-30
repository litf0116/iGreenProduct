#!/bin/bash

# iGreenProduct 完整部署脚本
# 在服务器上执行完整的应用部署

set -e

echo "🚀 开始iGreenProduct完整部署..."

# 检查系统环境
echo "📦 检查系统环境..."
if ! command -v java &> /dev/null; then
    echo "❌ 需要安装Java环境"
    exit 1
fi

if ! command -v mvn &> /dev/null; then
    echo "❌ 需要安装Maven"
    exit 1
fi

if ! command -v nginx &> /dev/null; then
    echo "❌ 需要安装Nginx"
    exit 1
fi

echo "✅ 系统环境检查通过"

# 创建应用目录
echo "📁 创建应用目录..."
sudo mkdir -p /opt/igreen
sudo mkdir -p /opt/igreen/uploads
sudo mkdir -p /opt/igreen/logs
sudo mkdir -p /www/wwwroot/igreen.yourdomain.com

# 设置权限
sudo chown -R www:www /opt/igreen/uploads
sudo chown -R www:www /www/wwwroot/igreen.yourdomain.com
sudo chmod -R 755 /opt/igreen

echo "✅ 目录创建完成"

# 检查数据库连接
echo "💾 检查数据库连接..."
if mysql -u igreen_db -p'knS8jexaAnByhpj4' -e "SELECT 1;" igreen_db &> /dev/null; then
    echo "✅ 数据库连接正常"
else
    echo "❌ 数据库连接失败"
    exit 1
fi

# 编译应用
echo "🔨 编译Spring Boot应用..."
cd /root/iGreenProduct/igreen-backend

# 确保依赖已下载
mvn dependency:go-offline -q

# 编译并打包
mvn clean package -DskipTests -q

if [ ! -f "target/igreen-backend-1.0.0-SNAPSHOT.jar" ]; then
    echo "❌ 应用打包失败"
    exit 1
fi

echo "✅ 应用编译完成"

# 停止现有应用
echo "🛑 停止现有应用..."
sudo systemctl stop igreen-backend 2>/dev/null || true
pkill -f "igreen-backend" || true
sleep 3

# 启动应用
echo "🚀 启动Spring Boot应用..."
sudo cp target/igreen-backend-1.0.0-SNAPSHOT.jar /opt/igreen/igreen-backend.jar

# 创建systemd服务文件
sudo tee /etc/systemd/system/igreen-backend.service > /dev/null << 'EOF'
[Unit]
Description=iGreen Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=root
ExecStart=/usr/bin/java -Dspring.profiles.active=prod -Dserver.port=8080 -jar /opt/igreen/igreen-backend.jar
Restart=always
RestartSec=10
Environment=JAVA_OPTS=-Xmx1024m -Xms512m
Environment=DB_HOST=localhost
Environment=DB_PORT=3306
Environment=DB_NAME=igreen_db
Environment=DB_USERNAME=igreen_db
Environment=DB_PASSWORD=knS8jexaAnByhpj4
Environment=UPLOAD_DIR=/opt/igreen/uploads
Environment=JWT_SECRET_KEY=iGreenProduct2025SecureJWTKeyForProductionEnvironment

[Install]
WantedBy=multi-user.target
EOF

# 重新加载systemd配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start igreen-backend
sudo systemctl enable igreen-backend

# 等待应用启动
echo "⏳ 等待应用启动..."
for i in {1..30}; do
    if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo "✅ Spring Boot应用启动成功"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Spring Boot应用启动失败"
        sudo systemctl status igreen-backend
        exit 1
    fi
    sleep 2
done

# 配置宝塔面板站点
echo "🌐 配置宝塔面板站点..."

# 宝塔面板API调用 (如果可用)
# 这里需要根据实际的宝塔面板API进行配置

echo "📋 宝塔面板手动配置步骤:"
echo "1. 登录宝塔面板: https://180.188.45.250:13189/7d423390"
echo "2. 网站 → 添加站点"
echo "3. 域名: igreen.yourdomain.com"
echo "4. 根目录: /www/wwwroot/igreen.yourdomain.com"
echo "5. PHP版本: 纯静态"
echo "6. 设置 → 配置文件"
echo "7. 替换为 nginx-igreen.conf 的内容"
echo "8. 保存并重载"

# 创建Nginx配置文件
sudo tee /www/server/panel/vhost/nginx/igreen.yourdomain.com.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name igreen.yourdomain.com;

    root /www/wwwroot/igreen.yourdomain.com;
    index index.html index.htm;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;

        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;

        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;

        client_max_body_size 50m;
    }

    location /actuator/health {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        access_log off;
    }

    location /uploads/ {
        alias /opt/igreen/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable" always;
        access_log /www/wwwlogs/igreen.uploads.log;
    }

    location ~* ^/uploads/.*\.(php|jsp|asp|exe|bat|cmd|com|phtml|shtml)$ {
        deny all;
        return 403;
    }

    location ~* ^/uploads/.*\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar)$ {
        alias /opt/igreen/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable" always;
        add_header Content-Type $content_type;
        try_files $uri =404;
        access_log /www/wwwlogs/igreen.uploads.log;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$ {
        expires 1y;
        add_header Cache-Control "public, immutable" always;
        add_header X-Content-Type-Options "nosniff" always;
        gzip on;
        gzip_types text/css application/javascript application/json image/svg+xml;
        gzip_min_length 1024;
    }

    location ~* \.(html|htm)$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/atom+xml image/svg+xml;

    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    access_log /www/wwwlogs/igreen.yourdomain.com.log;
    error_log /www/wwwlogs/igreen.yourdomain.com.error.log;

    client_max_body_size 50m;
    client_body_timeout 60s;
    client_header_timeout 60s;

    server_tokens off;
}
EOF

# 重载Nginx配置
echo "🔄 重载Nginx配置..."
sudo nginx -t
sudo nginx -s reload

# 最终测试
echo "🧪 最终功能测试..."

# 测试健康检查
if curl -f http://localhost/actuator/health > /dev/null 2>&1; then
    echo "✅ 健康检查通过"
else
    echo "❌ 健康检查失败"
fi

# 测试API文档 (如果启用)
if curl -f http://localhost/api/docs > /dev/null 2>&1; then
    echo "✅ API文档访问正常"
else
    echo "⚠️  API文档未启用或访问异常"
fi

# 检查服务状态
echo "📊 服务状态:"
sudo systemctl status igreen-backend --no-pager -l | head -10

echo ""
echo "🎉 iGreenProduct部署完成！"
echo ""
echo "📋 部署信息:"
echo "- 应用地址: http://igreen.yourdomain.com"
echo "- API文档: http://igreen.yourdomain.com/api/docs"
echo "- 健康检查: http://igreen.yourdomain.com/actuator/health"
echo "- 文件上传: 支持 /api/files/upload"
echo "- 文件访问: http://igreen.yourdomain.com/uploads/"
echo ""
echo "📋 宝塔面板访问: https://180.188.45.250:13189/7d423390"
echo "- 用户名: jappznw5"
echo "- 密码: abbc8b56"