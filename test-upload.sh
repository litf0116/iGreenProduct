#!/bin/bash

# 测试文件上传接口
# 使用 curl 命令

BASE_URL="http://43.255.212.68:8080"
USERNAME="lisi"
PASSWORD="password123"
COUNTRY="CN"
TEST_FILE="/tmp/test-upload-$(date +%s).txt"

# 创建测试文件
echo "Test file for upload verification - $(date)" > "$TEST_FILE"
echo "Content line 2" >> "$TEST_FILE"
echo "Content line 3" >> "$TEST_FILE"

echo "=========================================="
echo "文件上传接口测试"
echo "=========================================="
echo ""

# 1. 登录获取 token
echo "1. 登录获取 token..."
echo "curl -X POST $BASE_URL/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\",\"country\":\"$COUNTRY\"}'"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\",\"country\":\"$COUNTRY\"}")

echo "登录响应: $LOGIN_RESPONSE"

# 提取 token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('accessToken', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ 登录失败"
    rm -f "$TEST_FILE"
    exit 1
fi

echo "✅ 登录成功"
echo ""

# 2. 上传文件
echo "2. 上传文件..."
echo "curl -X POST $BASE_URL/api/files/upload -H 'Authorization: Bearer <token>' -F 'file=@$TEST_FILE' -F 'fieldType=photo'"

UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/files/upload" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@$TEST_FILE" \
    -F "fieldType=photo")

echo "上传响应: $UPLOAD_RESPONSE"

# 解析上传结果
UPLOAD_SUCCESS=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)

if [ "$UPLOAD_SUCCESS" = "True" ]; then
    echo ""
    echo "✅ 文件上传成功！"

    # 提取文件 URL
    FILE_URL=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('url', ''))" 2>/dev/null)
    echo "文件URL: $BASE_URL$FILE_URL"

    # 验证文件是否可访问
    echo ""
    echo "3. 验证文件访问..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$FILE_URL")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ 文件可访问 (HTTP $HTTP_CODE)"
    else
        echo "⚠️ 文件访问返回 HTTP $HTTP_CODE"
    fi
else
    echo "❌ 文件上传失败"
fi

# 清理测试文件
rm -f "$TEST_FILE"

echo ""
echo "=========================================="
echo "测试完成"
echo "=========================================="
