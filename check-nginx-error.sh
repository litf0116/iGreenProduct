#!/bin/bash

# 获取详细的Nginx配置错误信息

echo "🔍 获取Nginx配置错误详情..."

# 创建测试配置文件
TEST_CONFIG="/tmp/nginx-test.conf"
cat > "$TEST_CONFIG" << 'EOF'
# 测试用基础配置
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 基本设置
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
EOF

# 添加我们的配置文件内容
echo "" >> "$TEST_CONFIG"
echo "# 包含测试的iGreen配置" >> "$TEST_CONFIG"
cat nginx-igreen.conf >> "$TEST_CONFIG"

# 关闭http块
echo "}" >> "$TEST_CONFIG"

# 获取详细错误信息
echo "📋 详细错误信息:"
nginx -c "$TEST_CONFIG" 2>&1 | head -20

# 清理
rm -f "$TEST_CONFIG"