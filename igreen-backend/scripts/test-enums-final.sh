#!/bin/bash

# 枚举值测试脚本（支持Token刷新）

BASE_URL="http://180.188.45.250:8090/api"
TOKEN=""
REFRESH_TOKEN=""

# 登录函数
login() {
    echo "🔐 登录系统..."
    LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "username": "admin",
        "password": "password123",
        "country": "TH"
      }')

    TOKEN=$(echo ${LOGIN_RESPONSE} | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo ${LOGIN_RESPONSE} | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

    if [ -z "$TOKEN" ]; then
        echo "❌ 登录失败"
        exit 1
    fi

    echo "✅ 登录成功"
}

# Token刷新函数
refresh_token() {
    echo ""
    echo "🔄 Token已过期，正在刷新..."

    REFRESH_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/refresh \
      -H "Content-Type: application/json" \
      -d "{
        \"refreshToken\": \"${REFRESH_TOKEN}\"
      }")

    NEW_TOKEN=$(echo ${REFRESH_RESPONSE} | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    NEW_REFRESH=$(echo ${REFRESH_RESPONSE} | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

    if [ -z "$NEW_TOKEN" ]; then
        echo "❌ Token刷新失败"
        echo "响应: ${REFRESH_RESPONSE:0:200}"
        exit 1
    fi

    TOKEN=${NEW_TOKEN}
    REFRESH_TOKEN=${NEW_REFRESH}
    echo "✅ Token刷新成功"
}

# 带Token重试的API调用函数
call_api() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"

    echo ""
    echo "测试: $name"

    response=$(curl -s -X ${method} ${BASE_URL}${url} \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d "${data}")

    success=$(echo ${response} | grep -o '"success":[^,]*' | cut -d':' -f2)
    code=$(echo ${response} | grep -o '"code":"[^"]*"' | cut -d'"' -f4)

    if [ "$code" == "INVALID_TOKEN" ] || [ "$code" == "UNAUTHORIZED" ]; then
        echo "  ⚠️  Token已失效，尝试刷新..."
        refresh_token
        # 重试
        response=$(curl -s -X ${method} ${BASE_URL}${url} \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer ${TOKEN}" \
          -d "${data}")

        success=$(echo ${response} | grep -o '"success":[^,]*' | cut -d':' -f2)
    fi

    if [ "$success" == "true" ]; then
        echo "  ✅ 通过"
        return 0
    else
        echo "  ❌ 失败"
        echo "  响应: ${response}" | head -c 300
        return 1
    fi
}

# 初始化
login

# 创建模板
echo ""
echo "创建测试模板..."
TEMPLATE_RESPONSE=$(curl -s -X POST ${BASE_URL}/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "枚举测试模板",
    "description": "测试所有枚举值"
  }')

TEMPLATE_ID=$(echo ${TEMPLATE_RESPONSE} | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "模板ID: ${TEMPLATE_ID}"

if [ -z "$TEMPLATE_ID" ]; then
    echo "❌ 模板创建失败"
    exit 1
fi

# 获取工程师ID
ENGINEER_RESPONSE=$(curl -s -X GET "${BASE_URL}/users/engineers?size=1" \
  -H "Authorization: Bearer ${TOKEN}")
ENGINEER_ID=$(echo ${ENGINEER_RESPONSE} | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "工程师ID: ${ENGINEER_ID}"

echo ""
echo "=========================================="
echo "测试工单相关枚举"
echo "=========================================="

call_api "创建 PLANNED 工单" "POST" "/tickets" '{
    "title": "计划维护工单",
    "description": "定期维护计划",
    "type": "PLANNED",
    "priority": "P2",
    "templateId": "'${TEMPLATE_ID}'",
    "assignedTo": "'${ENGINEER_ID}'",
    "dueDate": "2026-02-01T00:00:00"
}'

call_api "创建 PREVENTIVE 工单" "POST" "/tickets" '{
    "title": "预防性维护工单",
    "description": "预防性检查",
    "type": "PREVENTIVE",
    "priority": "P3",
    "templateId": "'${TEMPLATE_ID}'",
    "assignedTo": "'${ENGINEER_ID}'",
    "dueDate": "2026-02-01T00:00:00"
}'

call_api "创建 CORRECTIVE 工单" "POST" "/tickets" '{
    "title": "纠正性维护工单",
    "description": "故障修复",
    "type": "CORRECTIVE",
    "priority": "P1",
    "templateId": "'${TEMPLATE_ID}'",
    "assignedTo": "'${ENGINEER_ID}'",
    "dueDate": "2026-02-01T00:00:00"
}'

call_api "创建 PROBLEM 工单" "POST" "/tickets" '{
    "title": "问题工单",
    "description": "发现新问题",
    "type": "PROBLEM",
    "priority": "P1",
    "templateId": "'${TEMPLATE_ID}'",
    "assignedTo": "'${ENGINEER_ID}'",
    "dueDate": "2026-02-01T00:00:00"
}'

# Priority 测试
for priority in "P1" "P2" "P3" "P4"; do
    call_api "创建 PRIORITY=${priority} 工单" "POST" "/tickets" "{
        \"title\": \"${priority}优先级工单\",
        \"description\": \"测试${priority}优先级\",
        \"type\": \"PLANNED\",
        \"priority\": \"${priority}\",
        \"templateId\": \"'${TEMPLATE_ID}'\",
        \"assignedTo\": \"'${ENGINEER_ID}'\",
        \"dueDate\": \"2026-02-01T00:00:00\"
    }"
done

# 创建工单用于状态测试
TICKET_RESPONSE=$(curl -s -X POST ${BASE_URL}/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "状态测试工单",
    "description": "测试状态变更",
    "type": "PLANNED",
    "priority": "P2",
    "templateId": "'${TEMPLATE_ID}'",
    "assignedTo": "'${ENGINEER_ID}'",
    "dueDate": "2026-02-01T00:00:00"
  }')

TICKET_ID=$(echo ${TICKET_RESPONSE} | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "工单ID: ${TICKET_ID}"

# TicketStatus 测试
call_api "更新工单为 OPEN" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "OPEN"
}'

call_api "更新工单为 ASSIGNED" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "ASSIGNED"
}'

call_api "更新工单为 DEPARTED" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "DEPARTED"
}'

call_api "更新工单为 COMPLETED" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "COMPLETED"
}'

call_api "更新工单为 ON_HOLD" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "ON_HOLD"
}'

call_api "更新工单为 CANCELLED" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "CANCELLED"
}'

echo ""
echo "=========================================="
echo "测试评论相关枚举"
echo "=========================================="

call_api "添加 GENERAL 评论" "POST" "/tickets/${TICKET_ID}/comments" '{
    "comment": "一般性评论",
    "type": "GENERAL"
}'

call_api "添加 COMMENT 评论" "POST" "/tickets/${TICKET_ID}/comments" '{
    "comment": "普通评论",
    "type": "COMMENT"
}'

call_api "添加 ACCEPT 评论" "POST" "/tickets/${TICKET_ID}/comments" '{
    "comment": "接受工单",
    "type": "ACCEPT"
}'

call_api "添加 DECLINE 评论" "POST" "/tickets/${TICKET_ID}/comments" '{
    "comment": "拒绝工单",
    "type": "DECLINE"
}'

call_api "添加 CANCEL 评论" "POST" "/tickets/${TICKET_ID}/comments" '{
    "comment": "取消工单",
    "type": "CANCEL"
}'

echo ""
echo "=========================================="
echo "测试完成！"
echo "Token刷新次数已自动处理"
echo "=========================================="
