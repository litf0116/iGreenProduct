#!/bin/bash
# ============================================================================
# 测试名称: 后端 API 接口测试
# 描述: 验证后端 API 核心接口的完整功能
# ============================================================================

BASE_URL="http://localhost:8080"
LOG_FILE="tests/logs/$(basename $0 .sh).log"

# 创建日志目录
mkdir -p tests/logs

# ============================================================================
# 测试函数
# ============================================================================

# 测试用户认证
test_auth() {
  echo ""
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 测试用户认证..." | tee -a "$LOG_FILE"

  # 测试1: 用户注册
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 测试1: 用户注册..." | tee -a "$LOG_FILE"
  REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "测试用户",
      "username": "authuser_'$(date +%s)'",
      "password": "Test1234",
      "confirmPassword": " "Test1234",
      "country": "China"
    }')

  REGISTER_SUCCESS=$(echo "$REGISTER_RESPONSE" | jq -r '.success // false')

  if [ "$REGISTER_SUCCESS" != "true" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 注册失败" | tee -a "$LOG_FILE"
    return 1
  fi

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 注册成功" | tee -a "$LOG_FILE"

  # 测试2: 用户登录
  echo ""
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 测试2: 用户登录..." | tee -a "$LOG_FILE"

  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "authuser_'$(date +%s)'",
      "password": "Test1234"
    }')

  LOGIN_SUCCESS=$(echo "$LOGIN_RESPONSE" | jq -r '.success // false')

  if [ "$LOGIN_SUCCESS" != "true" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 登录失败" | tee -a "$LOG_FILE"
    return 1
  fi

  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 登录成功, Token: ${TOKEN:0:50}..." | tee -a "$LOG_FILE"

  # 测试3: 获取用户信息
  echo ""
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 测试3: 获取用户信息..." | tee -a "$LOG_FILE"

  USER_INFO=$(curl -s -X GET "$BASE_URL/api/users/me" \
    -H "Authorization: Bearer $TOKEN")

  echo "$USER_INFO" | jq '.' | tee -a "$LOG_FILE"

  USERNAME=$(echo "$USER_INFO" | jq -r '.data.username // empty')
  USER_ROLE=$(echo "$USER_INFO" | jq -r '.data.role // empty')

  if [ -z "$USERNAME" ] || [ -z "$USER_ROLE" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 获取用户信息失败" | tee -a "$LOG_FILE"
    return 1
  fi

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 获取用户信息成功" | tee -a "$LOG_FILE"

  return 0
}

# 测试 API 文档访问
test_api_docs() {
  echo ""
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 测试 API 文档访问..." | tee -a "$LOG_FILE"

  # 测试 /api/doc.html
  DOC_HTML=$(curl -s -X GET "$BASE_URL/api/doc.html" \
    -w "HTTP Code: %{http_code}\n" | tee -a "$LOG_FILE")

  HTTP_CODE=$(echo "$DOC_HTML" | grep -o "HTTP Code:" | awk '{print $3}')

  if [ "$HTTP_CODE" = "200" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ API 文档可访问 (HTTP 200)" | tee -a "$LOG_FILE"
    return 0
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ API 文档访问失败 (HTTP $HTTP_CODE)" | tee -a "$LOG_FILE"
    return 1
  fi
}

# ============================================================================
# 主执行流程
# ============================================================================

echo ""
echo "========================================="
echo "开始后端 API 接口测试"
echo "========================================="
echo ""
echo "配置:"
echo "  后端地址: $BASE_URL"
echo "  日志文件: $LOG_FILE"
echo ""

# 执行所有测试
if test_auth && test_api_docs; then
  echo ""
  echo "========================================="
  echo "✅ 所有测试通过"
  echo "========================================="
  exit 0
else
  echo ""
  echo "========================================="
  echo "❌ 测试失败"
  echo "========================================="
  exit 1
fi