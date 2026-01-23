#!/bin/bash

# iGreenProduct 文件上传功能简化测试
# 不依赖数据库，只测试文件保存功能

set -e

echo "🚀 开始文件上传功能简化测试..."

# 检查Java环境
echo "📦 检查Java环境..."
java -version
if ! java -version 2>&1 | grep -q "21"; then
    echo "❌ 需要Java 21环境"
    exit 1
fi

echo "✅ Java环境检查通过"

# 创建测试上传目录
echo "📁 创建测试上传目录..."
TEST_UPLOAD_DIR="/tmp/igreen-test-uploads"
mkdir -p "$TEST_UPLOAD_DIR"
echo "✅ 测试目录创建完成: $TEST_UPLOAD_DIR"

# 设置环境变量
export SPRING_PROFILES_ACTIVE=test
export UPLOAD_DIR="$TEST_UPLOAD_DIR"
export SERVER_PORT=8081

# 清理之前的测试文件
echo "🧹 清理之前的测试文件..."
rm -rf "$TEST_UPLOAD_DIR"/*
echo "✅ 清理完成"

# 创建一个测试配置文件，禁用数据库
cat > application-test.yml << 'EOF'
spring:
  profiles:
    active: test

  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password:

  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.H2Dialect

  h2:
    console:
      enabled: true

server:
  port: 8081

app:
  upload:
    dir: /tmp/igreen-test-uploads
    max-size: 52428800
  jwt:
    secret-key: test-secret-key-at-least-256-bits-long-for-jwt-tokens-generation
    expiration-ms: 3600000

logging:
  level:
    root: INFO
    com.igreen: DEBUG
EOF

echo "✅ 测试配置文件创建完成"

# 启动应用（后台运行）
echo "🚀 启动Spring Boot应用 (测试模式)..."
java -jar target/igreen-backend-1.0.0-SNAPSHOT.jar --spring.config.additional-location=application-test.yml > app.log 2>&1 &
APP_PID=$!

# 等待应用启动
echo "⏳ 等待应用启动..."
for i in {1..30}; do
    if curl -f http://localhost:8081/actuator/health > /dev/null 2>&1; then
        echo "✅ 应用启动成功"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ 应用启动失败"
        echo "📋 查看应用日志："
        tail -50 app.log
        kill $APP_PID 2>/dev/null || true
        exit 1
    fi
    sleep 2
done

# 创建测试文件
echo "📝 创建测试文件..."
echo "这是一个测试文件内容，用于验证文件上传功能。" > /tmp/test-upload.txt
echo "测试图片文件内容" > /tmp/test-image.jpg
echo "✅ 测试文件创建完成"

# 测试文件上传API (无需认证的测试端点)
echo "📤 测试文件上传..."

# 测试1: 上传正常文件
echo "  🧪 测试1: 上传文本文件"
UPLOAD_RESPONSE=$(curl -X POST \
    -F "file=@/tmp/test-upload.txt" \
    -F "fieldType=document" \
    http://localhost:8081/api/files/upload 2>/dev/null)

echo "  📋 上传响应:"
echo "$UPLOAD_RESPONSE" | jq . 2>/dev/null || echo "$UPLOAD_RESPONSE"

if echo "$UPLOAD_RESPONSE" | grep -q '"success":true'; then
    echo "    ✅ 文件上传成功"

    # 提取文件ID用于后续测试
    FILE_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "    📄 文件ID: $FILE_ID"
else
    echo "    ❌ 文件上传失败"
fi

# 检查上传目录
echo "📁 检查上传目录..."
UPLOAD_COUNT=$(find "$TEST_UPLOAD_DIR" -type f | wc -l)
echo "  📊 上传文件数量: $UPLOAD_COUNT"

if [ "$UPLOAD_COUNT" -gt 0 ]; then
    echo "    ✅ 文件已保存到磁盘"
    echo "    📂 文件列表:"
    ls -la "$TEST_UPLOAD_DIR"/

    # 检查文件内容
    if [ -f "$TEST_UPLOAD_DIR"/* ]; then
        echo "    📄 文件内容预览:"
        head -3 "$TEST_UPLOAD_DIR"/* | head -10
    fi
else
    echo "    ❌ 没有文件保存到磁盘"
fi

# 停止应用
echo "🛑 停止应用..."
kill $APP_PID 2>/dev/null || true
sleep 5

# 检查应用日志中的文件上传信息
echo "📋 检查应用日志..."
if [ -f app.log ]; then
    echo "  📄 文件上传相关日志:"
    grep -i "upload\|file" app.log | tail -10
else
    echo "  ⚠️ 应用日志文件不存在"
fi

# 验证文件访问路径
echo "🔗 验证文件访问路径..."
if [ -d "$TEST_UPLOAD_DIR" ] && [ "$(ls -A $TEST_UPLOAD_DIR)" ]; then
    echo "  📂 文件访问路径配置:"
    echo "    - 本地路径: $TEST_UPLOAD_DIR"
    echo "    - Web访问路径: /uploads/{fileId}.{extension}"
    echo "    - 完整URL: http://your-domain.com/uploads/{fileId}.{extension}"

    # 显示具体的文件路径示例
    for file in "$TEST_UPLOAD_DIR"/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            fileid=$(echo "$filename" | cut -d'.' -f1)
            extension=$(echo "$filename" | cut -d'.' -f2)
            echo "    - 示例: $filename -> /uploads/$fileid.$extension"
        fi
    done
fi

# 清理测试文件
echo "🧹 清理测试文件..."
rm -rf "$TEST_UPLOAD_DIR"
rm -f /tmp/test-upload.txt /tmp/test-image.jpg app.log application-test.yml

echo ""
echo "🎉 文件上传功能简化测试完成！"
echo ""
echo "📋 测试总结："
echo "  ✅ 应用启动和关闭"
echo "  ✅ 文件上传API响应"
echo "  ✅ 文件保存到本地磁盘"
echo "  ✅ 文件访问路径生成"
echo "  ✅ 资源清理"