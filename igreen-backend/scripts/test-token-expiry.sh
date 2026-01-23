#!/bin/bash

# Token过期时间测试脚本

echo "=========================================="
echo "Token过期时间测试"
echo "=========================================="

# 登录获取token
echo ""
echo "步骤1: 登录系统..."
LOGIN_RESPONSE=$(curl -s -X POST http://180.188.45.250:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123",
    "country": "TH"
  }')

TOKEN=$(echo ${LOGIN_RESPONSE} | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo ${LOGIN_RESPONSE} | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
EXPIRES_IN=$(echo ${LOGIN_RESPONSE} | grep -o '"expiresIn":[0-9]*' | cut -d':' -f2)

echo "AccessToken: ${TOKEN:0:50}..."
echo "RefreshToken: ${REFRESH_TOKEN:0:50}..."
echo "过期时间: ${EXPIRES_IN} 秒 ($((EXPIRES_IN / 3600)) 小时)"

# 解析JWT token查看过期时间
echo ""
echo "步骤2: 解析JWT Token..."
TOKEN_PAYLOAD=$(echo ${TOKEN} | cut -d'.' -f2)
echo "Token Payload: ${TOKEN_PAYLOAD:0:100}..."

# 测试token在不同时间点的有效性
echo ""
echo "步骤3: 测试token时效性..."

test_token_time() {
    local time_label="$1"
    local delay_seconds="$2"

    echo "测试 $time_label (延迟 ${delay_seconds}秒)..."
    sleep ${delay_seconds}

    response=$(curl -s -X GET http://180.188.45.250:8090/api/auth/me \
      -H "Authorization: Bearer ${TOKEN}")

    success=$(echo ${response} | grep -o '"success":[^,]*' | cut -d':' -f2)

    if [ "$success" == "true" ]; then
        echo "  ✅ Token有效"
    else
        echo "  ❌ Token已失效: ${response:0:100}"
    fi
}

# 立即测试
test_token_time "立即" 0

# 1分钟后测试
test_token_time "1分钟后" 60

# 刷新token
echo ""
echo "步骤4: 测试Token刷新机制..."

REFRESH_RESPONSE=$(curl -s -X POST http://180.188.45.250:8090/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"${REFRESH_TOKEN}\"
  }")

echo "刷新响应: ${REFRESH_RESPONSE:0:200}"

NEW_TOKEN=$(echo ${REFRESH_RESPONSE} | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$NEW_TOKEN" ]; then
    echo "✅ Token刷新成功"
    echo "新Token: ${NEW_TOKEN:0:50}..."

    # 使用新token测试
    response=$(curl -s -X GET http://180.188.45.250:8090/api/auth/me \
      -H "Authorization: Bearer ${NEW_TOKEN}")

    success=$(echo ${response} | grep -o '"success":[^,]*' | cut -d':' -f2)

    if [ "$success" == "true" ]; then
        echo "  ✅ 新Token有效"
    else
        echo "  ❌ 新Token无效: ${response:0:100}"
    fi
else
    echo "❌ Token刷新失败"
fi

echo ""
echo "=========================================="
echo "结论："
echo "1. Access Token过期时间: ${EXPIRES_IN} 秒"
echo "2. Refresh Token有效期: 7天 (604800000秒)"
echo "3. 如果测试执行超过${EXPIRES_IN}秒，token会过期"
echo "=========================================="
