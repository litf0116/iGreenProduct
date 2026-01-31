#!/bin/bash

# 枚举值测试脚本（修复版）

BASE_URL="http://180.188.45.250:8090/api"
TOKEN=""
TEMPLATE_ID=""

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

    if [ -z "$TOKEN" ]; then
        echo "❌ 登录失败"
        exit 1
    fi

    echo "✅ 登录成功"
}

# 测试函数
test_api() {
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

    if [ "$success" == "true" ]; then
        echo "  ✅ 通过"
    else
        echo "  ❌ 失败"
        echo "  响应: ${response}" | head -c 300
    fi
}

# 初始化
login

# 创建模板（后续测试需要）
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

# TicketType 测试
test_api "创建 PLANNED 工单" "POST" "/tickets" '{
    "title": "计划维护工单",
    "description": "定期维护计划",
    "type": "PLANNED",
    "priority": "P2",
    "templateId": "'${TEMPLATE_ID}'",
    "assignedTo": "'${ENGINEER_ID}'",
    "dueDate": "2026-02-01T00:00:00"
}'

test_api "创建 PREVENTIVE 工单" "POST" "/tickets" '{
    "title": "预防性维护工单",
    "description": "预防性检查",
    "type": "PREVENTIVE",
    "priority": "P3",
    "templateId": "'${TEMPLATE_ID}'",
    "assignedTo": "'${ENGINEER_ID}'",
    "dueDate": "2026-02-01T00:00:00"
}'

test_api "创建 CORRECTIVE 工单" "POST" "/tickets" '{
    "title": "纠正性维护工单",
    "description": "故障修复",
    "type": "CORRECTIVE",
    "priority": "P1",
    "templateId": "'${TEMPLATE_ID}'",
    "assignedTo": "'${ENGINEER_ID}'",
    "dueDate": "2026-02-01T00:00:00"
}'

test_api "创建 PROBLEM 工单" "POST" "/tickets" '{
    "title": "问题工单",
    "description": "发现新问题",
    "type": "PROBLEM",
    "priority": "P1",
    "templateId": "'${TEMPLATE_ID}'",
    "assignedTo": "'${ENGINEER_ID}'",
    "dueDate": "2026-02-01T00:00:00"
}'

# 创建一个工单用于状态更新测试
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
test_api "更新工单为 OPEN" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "OPEN"
}'

test_api "更新工单为 ASSIGNED" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "ASSIGNED"
}'

test_api "更新工单为 DEPARTED" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "DEPARTED"
}'

test_api "更新工单为 COMPLETED" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "COMPLETED"
}'

test_api "更新工单为 ON_HOLD" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "ON_HOLD"
}'

test_api "更新工单为 CANCELLED" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "CANCELLED"
}'

echo ""
echo "=========================================="
echo "测试用户相关枚举"
echo "=========================================="

test_api "创建 ADMIN 用户" "POST" "/users" '{
    "name": "管理员测试",
    "username": "test_admin_enum",
    "email": "test_admin@example.com",
    "password": "Test123456",
    "role": "ADMIN",
    "status": "ACTIVE"
}'

test_api "创建 MANAGER 用户" "POST" "/users" '{
    "name": "经理测试",
    "username": "test_manager_enum",
    "email": "test_manager@example.com",
    "password": "Test123456",
    "role": "MANAGER",
    "status": "ACTIVE"
}'

test_api "创建 ENGINEER 用户" "POST" "/users" '{
    "name": "工程师测试",
    "username": "test_engineer_enum",
    "email": "test_engineer@example.com",
    "password": "Test123456",
    "role": "ENGINEER",
    "status": "ACTIVE"
}'

test_api "创建 INACTIVE 用户" "POST" "/users" '{
    "name": "非活跃用户",
    "username": "test_inactive_enum",
    "email": "test_inactive@example.com",
    "password": "Test123456",
    "role": "ENGINEER",
    "status": "INACTIVE"
}'

echo ""
echo "=========================================="
echo "测试群组相关枚举"
echo "=========================================="

test_api "创建 ACTIVE 群组" "POST" "/groups" '{
    "name": "活跃群组",
    "description": "活跃测试群组",
    "status": "ACTIVE"
}'

test_api "创建 INACTIVE 群组" "POST" "/groups" '{
    "name": "非活跃群组",
    "description": "非活跃测试群组",
    "status": "INACTIVE"
}'

GROUP_RESPONSE=$(curl -s -X POST ${BASE_URL}/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "状态测试群组",
    "description": "测试状态变更",
    "status": "ACTIVE"
  }')

GROUP_ID=$(echo ${GROUP_RESPONSE} | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "群组ID: ${GROUP_ID}"

test_api "更新群组为 ACTIVE" "PUT" "/groups/${GROUP_ID}" '{
    "name": "更新群组",
    "description": "测试更新",
    "status": "ACTIVE"
}'

test_api "更新群组为 INACTIVE" "PUT" "/groups/${GROUP_ID}" '{
    "name": "更新群组",
    "description": "测试更新",
    "status": "INACTIVE"
}'

echo ""
echo "=========================================="
echo "测试站点相关枚举"
echo "=========================================="

test_api "创建 ONLINE 站点" "POST" "/sites" '{
    "name": "在线站点",
    "address": "测试地址1",
    "level": "A",
    "status": "ONLINE"
}'

test_api "创建 OFFLINE 站点" "POST" "/sites" '{
    "name": "离线站点",
    "address": "测试地址2",
    "level": "B",
    "status": "OFFLINE"
}'

test_api "创建 UNDER_CONSTRUCTION 站点" "POST" "/sites" '{
    "name": "建设中站点",
    "address": "测试地址3",
    "level": "C",
    "status": "UNDER_CONSTRUCTION"
}'

SITE_RESPONSE=$(curl -s -X POST ${BASE_URL}/sites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "状态测试站点",
    "address": "测试地址",
    "level": "A",
    "status": "ONLINE"
  }')

SITE_ID=$(echo ${SITE_RESPONSE} | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "站点ID: ${SITE_ID}"

test_api "更新站点为 ONLINE" "PUT" "/sites/${SITE_ID}" '{
    "name": "更新站点",
    "address": "测试地址",
    "level": "A",
    "status": "ONLINE"
}'

test_api "更新站点为 OFFLINE" "PUT" "/sites/${SITE_ID}" '{
    "name": "更新站点",
    "address": "测试地址",
    "level": "A",
    "status": "OFFLINE"
}'

echo ""
echo "=========================================="
echo "测试模板字段相关枚举"
echo "=========================================="

# 创建步骤
STEP_RESPONSE=$(curl -s -X POST ${BASE_URL}/templates/${TEMPLATE_ID}/steps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "测试步骤",
    "description": "测试各种字段类型",
    "order": 1
  }')

STEP_ID=$(echo ${STEP_RESPONSE} | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "步骤ID: ${STEP_ID}"

test_api "添加 TEXT 字段" "POST" "/templates/${TEMPLATE_ID}/steps/${STEP_ID}/fields" '{
    "name": "文本字段",
    "type": "TEXT",
    "required": true
}'

test_api "添加 NUMBER 字段" "POST" "/templates/${TEMPLATE_ID}/steps/${STEP_ID}/fields" '{
    "name": "数字字段",
    "type": "NUMBER",
    "required": true
}'

test_api "添加 DATE 字段" "POST" "/templates/${TEMPLATE_ID}/steps/${STEP_ID}/fields" '{
    "name": "日期字段",
    "type": "DATE",
    "required": true
}'

test_api "添加 LOCATION 字段" "POST" "/templates/${TEMPLATE_ID}/steps/${STEP_ID}/fields" '{
    "name": "位置字段",
    "type": "LOCATION",
    "required": false
}'

test_api "添加 PHOTO 字段" "POST" "/templates/${TEMPLATE_ID}/steps/${STEP_ID}/fields" '{
    "name": "照片字段",
    "type": "PHOTO",
    "required": false
}'

test_api "添加 SIGNATURE 字段" "POST" "/templates/${TEMPLATE_ID}/steps/${STEP_ID}/fields" '{
    "name": "签名字段",
    "type": "SIGNATURE",
    "required": false
}'

echo ""
echo "=========================================="
echo "测试评论相关枚举"
echo "=========================================="

test_api "添加 GENERAL 评论" "POST" "/tickets/${TICKET_ID}/comments" '{
    "comment": "一般性评论",
    "type": "GENERAL"
}'

test_api "添加 COMMENT 评论" "POST" "/tickets/${TICKET_ID}/comments" '{
    "comment": "普通评论",
    "type": "COMMENT"
}'

test_api "添加 ACCEPT 评论" "POST" "/tickets/${TICKET_ID}/comments" '{
    "comment": "接受工单",
    "type": "ACCEPT"
}'

test_api "添加 DECLINE 评论" "POST" "/tickets/${TICKET_ID}/comments" '{
    "comment": "拒绝工单",
    "type": "DECLINE"
}'

test_api "添加 CANCEL 评论" "POST" "/tickets/${TICKET_ID}/comments" '{
    "comment": "取消工单",
    "type": "CANCEL"
}'

echo ""
echo "=========================================="
echo "测试完成！"
echo "=========================================="
