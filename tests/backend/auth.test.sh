#!/bin/bash
# ============================================================================
# 测试名称: 用户注册和登录
# 描述: 验证用户注册流程和登录功能
# 依赖: 后端服务运行在 8080 端口
# ============================================================================

BASE_URL="http://localhost:8080"
LOG_FILE="tests/logs/$(basename $0 .sh).log"

# 创建日志目录
mkdir -p tests/logs

# ============================================================================
# 测试函数
# ============================================================================

test_user_registration() {
  echo ""
  echo "========================================="
  echo "测试: 用户注册"
  echo "========================================="
  echo "目的: 验证新用户注册功能"
  echo ""

  # 生成唯一的用户名
  TIMESTAMP=$(date +%s)
  USERNAME="testuser_${TIMESTAMP}"
  EMAIL="${USERNAME}@igreen.com"

  echo "测试数据:"
  echo "  用户名: $USERNAME"
  echo "  邮箱: $EMAIL (自动生成)"
  echo "  姓名: 测试用户_$TIMESTAMP"
  echo "  密码: Test1234"
  echo "  国家: China"
  echo ""

  # 步骤 1: 注册用户
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 步骤1: 注册用户..." | tee -a "$LOG_FILE"

  REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"测试用户_$TIMESTAMP\",
      \"username\": \"$USERNAME\",
      \"password\": \"Test1234\",
      \"confirmPassword\": \"Test1234\",
      \"country\": \"China\"
    }")

  REGISTER_SUCCESS=$(echo "$REGISTER_RESPONSE" | jq -r '.success // false')

  if [ "$REGISTER_SUCCESS" != "true" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 注册失败" | tee -a "$LOG_FILE"
    echo "响应: $REGISTER_RESPONSE" | tee -a "$LOG_FILE"
    return 1
  fi

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 注册成功" | tee -a "$LOG_FILE"

  # 验证自动生成的邮箱
  REGISTERED_EMAIL=$(echo "$REGISTER_RESPONSE" | jq -r '.data.email // empty')
  if [ "$REGISTERED_EMAIL" != "$EMAIL" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  邮箱不匹配: 期望 $EMAIL, 实际 $REGISTERED_EMAIL" | tee -a "$LOG_FILE"
  fi

  # 步骤 2: 登录
  echo ""
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 步骤2: 用户登录..." | tee -a "$LOG_FILE"

  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"$USERNAME\",
      \"password\": \"Test1234\"
    }")

  LOGIN_SUCCESS=$(echo "$LOGIN_RESPONSE" | jq -r '.success // false')

  if [ "$LOGIN_SUCCESS" != "true" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 登录失败" | tee -a "$LOG_FILE"
    echo "响应: $LOGIN_RESPONSE" | tee -a "$LOG_FILE"
    return 1
  fi

  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 登录成功, Token: ${TOKEN:0:50}..." | tee -a "$LOG_FILE"

  # 步骤 3: 获取用户信息
  echo ""
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 步骤3: 获取用户信息..." | tee -a "$LOG_FILE"

  USER_INFO=$(curl -s -X GET "$BASE_URL/api/users/me" \
    -H "Authorization: Bearer $TOKEN")

  echo "$USER_INFO" | jq '.' | tee -a "$LOG_FILE"

  # 验证用户信息
  INFO_USERNAME=$(echo "$USER_INFO" | jq -r '.data.username // empty')
  INFO_EMAIL=$(echo "$USER_INFO" | jq -r '.data.email // empty')
  INFO_ROLE=$(echo "$USER_INFO" | jq -r '.data.role // empty')

  echo ""
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 验证用户信息:" | tee -a "$LOG_FILE"
  echo "  用户名: $INFO_USERNAME" | tee -a "$LOG_FILE"
  echo "  邮箱: $INFO_EMAIL" | tee -a "$LOG_FILE"
  echo "  角色: $INFO_ROLE" | tee -a "$LOG_FILE"

  if [ "$INFO_USERNAME" != "$USERNAME" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 用户名不匹配" | tee -a "$LOG_FILE"
    return 1
  fi

  if [ "$INFO_EMAIL" != "$EMAIL" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 邮箱不匹配" | tee -a "$LOG_FILE"
    return 1
  fi

  if [ "$INFO_ROLE" != "engineer" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 角色不匹配" | tee -a "$LOG_FILE"
    return 1
  fi

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 所有验证通过" | tee -a "$LOG_FILE"

  return 0
}

# ============================================================================
# 主执行流程
# ============================================================================

echo ""
echo "========================================="
echo "开始用户注册和登录测试"
echo "========================================="
echo ""
echo "配置:"
echo "  后端地址: $BASE_URL"
echo "  日志文件: $LOG_FILE"
echo ""

# 执行测试
if test_user_registration; then
  echo ""
  echo "========================================="
  echo "✅ 测试完成 - 所有步骤通过"
  echo "========================================="
  exit 0
else
  echo ""
  echo "========================================="
  echo "❌ 测试失败"
  echo "========================================="
  exit 1
fi
