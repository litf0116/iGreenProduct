#!/bin/bash

# 简化的Nginx配置语法检查

echo "🔍 简化Nginx配置语法检查..."

# 检查配置文件基本结构
echo "📋 检查基本结构..."

# 检查server块
SERVER_BLOCKS=$(grep -c "^server {" nginx-igreen.conf)
echo "📊 Server块数量: $SERVER_BLOCKS"

if [ "$SERVER_BLOCKS" -ne 2 ]; then
    echo "❌ Server块数量不正确，应为2个 (HTTP + HTTPS)"
    exit 1
fi

# 检查location块
LOCATION_BLOCKS=$(grep -c "^    location " nginx-igreen.conf)
echo "📊 Location块数量: $LOCATION_BLOCKS"

# 检查括号匹配
OPEN_BRACES=$(grep -o '{' nginx-igreen.conf | wc -l)
CLOSE_BRACES=$(grep -o '}' nginx-igreen.conf | wc -l)
echo "📊 左括号数量: $OPEN_BRACES"
echo "📊 右括号数量: $CLOSE_BRACES"

if [ "$OPEN_BRACES" -ne "$CLOSE_BRACES" ]; then
    echo "❌ 括号不匹配: $OPEN_BRACES 个 '{' vs $CLOSE_BRACES 个 '}'"
    exit 1
fi

# 检查是否有嵌套location块 (这是不允许的)
if grep -A10 "^    location " nginx-igreen.conf | grep -q "^        location "; then
    echo "❌ 发现嵌套的location块 (不允许)"
    exit 1
else
    echo "✅ 没有嵌套的location块"
fi

# 检查关键配置是否存在
echo ""
echo "🔍 检查关键配置..."

CHECKS=(
    "proxy_pass http://127.0.0.1:8080"
    "alias /opt/igreen/uploads/"
    "ssl_certificate"
    "add_header X-Frame-Options"
    "gzip on"
)

for check in "${CHECKS[@]}"; do
    if grep -q "$check" nginx-igreen.conf; then
        echo "✅ $check"
    else
        echo "❌ 缺失: $check"
    fi
done

# 检查正则表达式语法
echo ""
echo "🔍 检查正则表达式..."
REGEX_PATTERNS=(
    "~* ^/uploads/.*\\.(php|jsp|asp|exe|bat|cmd|com|phtml|shtml)$"
    "~* ^/uploads/.*\\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar)$"
    "~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$"
    "~* \\.(html|htm)$"
)

for pattern in "${REGEX_PATTERNS[@]}"; do
    if grep -q "$pattern" nginx-igreen.conf; then
        echo "✅ 正则表达式: $pattern"
    else
        echo "⚠️  未找到正则表达式: $pattern"
    fi
done

echo ""
echo "🎯 语法检查完成!"

# 最终判断
if [ "$SERVER_BLOCKS" -eq 2 ] && [ "$OPEN_BRACES" -eq "$CLOSE_BRACES" ]; then
    echo "✅ 配置文件结构正确"
    echo ""
    echo "📋 使用建议:"
    echo "1. 将 nginx-igreen.conf 内容复制到宝塔面板"
    echo "2. 替换域名: igreen.yourdomain.com -> 你的实际域名"
    echo "3. 保存配置并重载Nginx"
    echo "4. 测试访问: curl http://your-domain/actuator/health"
else
    echo "❌ 配置文件存在结构问题"
    exit 1
fi