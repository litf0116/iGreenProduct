#!/bin/bash

# Nginx 配置文件语法验证脚本

echo "🔍 验证Nginx配置文件语法..."

# 检查nginx命令是否存在
if ! command -v nginx &> /dev/null; then
    echo "❌ nginx命令不存在，请确保nginx已安装"
    exit 1
fi

# 备份当前nginx配置
echo "📋 备份当前nginx配置..."
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "⚠️  无法备份系统nginx配置，可能是权限问题"

# 创建测试配置文件
TEST_CONFIG="/tmp/nginx-test.conf"
cat > "$TEST_CONFIG" << 'EOF'
# 测试用基础配置
events {
    worker_connections 1024;
}

http {
    # 基础MIME类型
    types {
        text/html html;
        text/css css;
        application/javascript js;
        application/json json;
        image/jpeg jpg jpeg;
        image/png png;
        image/gif gif;
    }
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    # 基本设置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    # Gzip 压缩
    gzip on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;

EOF

# 添加我们的配置文件内容
echo "" >> "$TEST_CONFIG"
echo "# 包含测试的iGreen配置" >> "$TEST_CONFIG"
cat nginx-igreen.conf >> "$TEST_CONFIG"

# 关闭http块
echo "}" >> "$TEST_CONFIG"

echo "📝 已生成测试配置文件: $TEST_CONFIG"

# 验证配置文件语法
echo "🔍 验证配置文件语法..."
if nginx -t -c "$TEST_CONFIG" 2>/dev/null; then
    echo "✅ Nginx配置文件语法正确！"
    SYNTAX_OK=true
else
    echo "❌ Nginx配置文件语法错误！"
    SYNTAX_OK=false
fi

# 显示配置文件验证详情
echo ""
echo "📋 详细验证信息:"
nginx -T -c "$TEST_CONFIG" 2>&1 | grep -E "(test is successful|syntax is ok|configuration file.*test)" || true

# 检查关键配置项
echo ""
echo "🔍 检查关键配置项..."

# 检查server块数量
SERVER_COUNT=$(grep -c "^server {" nginx-igreen.conf)
echo "📊 Server块数量: $SERVER_COUNT (应为2个: HTTP + HTTPS)"

# 检查location块
API_LOCATIONS=$(grep -c "location /api/" nginx-igreen.conf)
UPLOAD_LOCATIONS=$(grep -c "location /uploads/" nginx-igreen.conf)
echo "📊 API location块: $API_LOCATIONS"
echo "📊 Uploads location块: $UPLOAD_LOCATIONS"

# 检查关键指令
if grep -q "proxy_pass http://127.0.0.1:8080" nginx-igreen.conf; then
    echo "✅ 反向代理配置正确"
else
    echo "❌ 反向代理配置缺失"
fi

if grep -q "alias /opt/igreen/uploads/" nginx-igreen.conf; then
    echo "✅ 文件上传路径配置正确"
else
    echo "❌ 文件上传路径配置缺失"
fi

if grep -q "ssl_certificate" nginx-igreen.conf; then
    echo "✅ SSL证书配置存在"
else
    echo "⚠️  SSL证书配置为注释状态"
fi

# 检查安全配置
if grep -q "add_header X-Frame-Options" nginx-igreen.conf; then
    echo "✅ 安全头配置存在"
else
    echo "⚠️  安全头配置缺失"
fi

# 清理测试文件
echo ""
echo "🧹 清理测试文件..."
rm -f "$TEST_CONFIG"

echo ""
echo "🎯 配置文件验证完成!"

if [ "$SYNTAX_OK" = true ]; then
    echo "✅ 配置文件可以安全使用"
    echo ""
    echo "📋 宝塔面板配置步骤提醒:"
    echo "1. 网站 → 添加站点"
    echo "2. 设置 → 配置文件"
    echo "3. 替换配置内容"
    echo "4. 保存并重载"
else
    echo "❌ 请检查并修复配置文件语法错误"
    exit 1
fi