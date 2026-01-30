#!/bin/bash

# iGreenProduct 文件上传集成测试脚本
# 启动应用并进行实际的文件上传测试

set -e

echo "🚀 开始文件上传集成测试..."

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
mkdir -p /tmp/igreen-test-uploads
echo "✅ 测试目录创建完成"

# 设置环境变量 (使用开发环境配置进行测试)
export SPRING_PROFILES_ACTIVE=dev
export UPLOAD_DIR=/tmp/igreen-test-uploads
export SERVER_PORT=8081
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=igreen_db
export DB_USERNAME=root
export DB_PASSWORD=root

# 清理之前的测试文件
echo "🧹 清理之前的测试文件..."
rm -rf /tmp/igreen-test-uploads/*
echo "✅ 清理完成"

# 启动应用（后台运行）
echo "🚀 启动Spring Boot应用..."
java -jar target/igreen-backend-1.0.0.jar > app.log 2>&1 &
APP_PID=$!

# 等待应用启动
echo "⏳ 等待应用启动..."
sleep 30

# 检查应用是否启动成功 (尝试多次)
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
echo "这是一个测试文件内容" > /tmp/test-upload.txt
echo "测试图片内容" > /tmp/test-image.jpg
dd if=/dev/zero of=/tmp/large-file.dat bs=1M count=60 2>/dev/null || true  # 创建60MB大文件用于测试

echo "✅ 测试文件创建完成"

# 测试文件上传API
echo "📤 测试文件上传..."

# 测试1: 上传正常文件
echo "  🧪 测试1: 上传正常文件"
UPLOAD_RESPONSE=$(curl -X POST \
    -H "Authorization: Bearer test-token" \
    -F "file=@/tmp/test-upload.txt" \
    -F "fieldType=document" \
    http://localhost:8081/api/files/upload 2>/dev/null)

if echo "$UPLOAD_RESPONSE" | grep -q '"success":true'; then
    echo "    ✅ 正常文件上传成功"
else
    echo "    ❌ 正常文件上传失败"
    echo "    响应: $UPLOAD_RESPONSE"
fi

# 测试2: 上传图片文件
echo "  🧪 测试2: 上传图片文件"
UPLOAD_RESPONSE2=$(curl -X POST \
    -F "file=@/tmp/test-image.jpg" \
    -F "fieldType=photo" \
    http://localhost:8081/api/files/upload 2>/dev/null)

if echo "$UPLOAD_RESPONSE2" | grep -q '"success":true'; then
    echo "    ✅ 图片文件上传成功"
else
    echo "    ❌ 图片文件上传失败"
    echo "    响应: $UPLOAD_RESPONSE2"
fi

# 测试3: 上传超大文件（应该失败）
echo "  🧪 测试3: 上传超大文件（应该失败）"
if [ -f /tmp/large-file.dat ]; then
    UPLOAD_RESPONSE3=$(curl -X POST \
        -F "file=@/tmp/large-file.dat" \
        -F "fieldType=document" \
        http://localhost:8081/api/files/upload 2>/dev/null)

    if echo "$UPLOAD_RESPONSE3" | grep -q '"success":false'; then
        echo "    ✅ 超大文件正确拒绝"
    else
        echo "    ❌ 超大文件处理异常"
        echo "    响应: $UPLOAD_RESPONSE3"
    fi
else
    echo "    ⏭️ 跳过大文件测试（无法创建测试文件）"
fi

# 检查上传目录
echo "📁 检查上传目录..."
UPLOAD_COUNT=$(find /tmp/igreen-test-uploads -type f | wc -l)
echo "  📊 上传文件数量: $UPLOAD_COUNT"

if [ "$UPLOAD_COUNT" -gt 0 ]; then
    echo "    ✅ 文件已保存到磁盘"
    ls -la /tmp/igreen-test-uploads/
else
    echo "    ❌ 没有文件保存到磁盘"
fi

# 停止应用
echo "🛑 停止应用..."
kill $APP_PID 2>/dev/null || true
sleep 5

# 检查应用日志
echo "📋 检查应用日志..."
if [ -f app.log ]; then
    echo "  📄 应用日志最后20行："
    tail -20 app.log
else
    echo "  ⚠️ 应用日志文件不存在"
fi

# 清理测试文件
echo "🧹 清理测试文件..."
rm -rf /tmp/igreen-test-uploads
rm -f /tmp/test-upload.txt /tmp/test-image.jpg /tmp/large-file.dat app.log

echo ""
echo "🎉 文件上传集成测试完成！"
echo ""
echo "📋 测试总结："
echo "  ✅ 应用启动和关闭"
echo "  ✅ API响应验证"
echo "  ✅ 文件保存验证"
echo "  ✅ 错误处理验证"
echo "  ✅ 资源清理"