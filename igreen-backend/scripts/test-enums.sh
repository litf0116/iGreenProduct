#!/bin/bash

# 枚举值综合测试脚本
# 测试所有枚举类型的API接口

BASE_URL="http://180.188.45.250:8090/api"
TOKEN=""

echo "=========================================="
echo "枚举值综合测试"
echo "=========================================="

# 登录获取Token
echo ""
echo "🔐 步骤 0: 登录系统..."
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

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_api() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo ""
    echo "测试 ${TOTAL_TESTS}: $name"

    response=$(curl -s -X ${method} ${BASE_URL}${url} \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d "${data}")

    success=$(echo ${response} | grep -o '"success":[^,]*' | cut -d':' -f2)

    if [ "$success" == "true" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo "  ✅ 通过"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "  ❌ 失败"
        echo "  响应: ${response}" | head -c 200
    fi
}

echo ""
echo "=========================================="
echo "测试用户相关枚举"
echo "=========================================="

# UserRole 测试
test_api "创建 ADMIN 用户" "POST" "/users" '{
    "name": "管理员测试",
    "username": "test_admin",
    "email": "test_admin@example.com",
    "password": "Test123456",
    "role": "ADMIN",
    "status": "ACTIVE"
}'

test_api "创建 MANAGER 用户" "POST" "/users" '{
    "name": "经理测试",
    "username": "test_manager",
    "email": "test_manager@example.com",
    "password": "Test123456",
    "role": "MANAGER",
    "status": "ACTIVE"
}'

test_api "创建 ENGINEER 用户" "POST" "/users" '{
    "name": "工程师测试",
    "username": "test_engineer",
    "email": "test_engineer@example.com",
    "password": "Test123456",
    "role": "ENGINEER",
    "status": "ACTIVE"
}'

# UserStatus 测试
test_api "创建 INACTIVE 用户" "POST" "/users" '{
    "name": "非活跃用户",
    "username": "test_inactive",
    "email": "test_inactive@example.com",
    "password": "Test123456",
    "role": "ENGINEER",
    "status": "INACTIVE"
}'

# 更新用户状态
USER_ID=$(curl -s -X GET "${BASE_URL}/users?page=1&size=1" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

test_api "更新用户为 ACTIVE" "POST" "/users/${USER_ID}" '{
    "status": "ACTIVE"
}'

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
    "site": "test_site",
    "assignedTo": "20973aa9-fcf5-4ad6-afac-37905acc5737",
    "dueDate": "2026-02-01T00:00:00"
}'

test_api "创建 PREVENTIVE 工单" "POST" "/tickets" '{
    "title": "预防性维护工单",
    "description": "预防性检查",
    "type": "PREVENTIVE",
    "priority": "P3",
    "site": "test_site",
    "assignedTo": "20973aa9-fcf5-4ad6-afac-37905acc5737",
    "dueDate": "2026-02-01T00:00:00"
}'

test_api "创建 CORRECTIVE 工单" "POST" "/tickets" '{
    "title": "纠正性维护工单",
    "description": "故障修复",
    "type": "CORRECTIVE",
    "priority": "P1",
    "site": "test_site",
    "assignedTo": "20973aa9-fcf5-4ad6-afac-37905acc5737",
    "dueDate": "2026-02-01T00:00:00"
}'

test_api "创建 PROBLEM 工单" "POST" "/tickets" '{
    "title": "问题工单",
    "description": "发现新问题",
    "type": "PROBLEM",
    "priority": "P1",
    "site": "test_site",
    "assignedTo": "20973aa9-fcf5-4ad6-afac-37905acc5737",
    "dueDate": "2026-02-01T00:00:00"
}'

# Priority 测试
for priority in "P1" "P2" "P3" "P4"; do
    test_api "创建 PRIORITY=${priority} 工单" "POST" "/tickets" "{
        \"title\": \"${priority}优先级工单\",
        \"description\": \"测试${priority}优先级\",
        \"type\": \"PLANNED\",
        \"priority\": \"${priority}\",
        \"site\": \"test_site\",
        \"assignedTo\": \"20973aa9-fcf5-4ad6-afac-37905acc5737\",
        \"dueDate\": \"2026-02-01T00:00:00\"
    }"
done

# TicketStatus 测试
TICKET_ID=$(curl -s -X POST ${BASE_URL}/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "状态测试工单",
    "description": "测试状态变更",
    "type": "PLANNED",
    "priority": "P2",
    "site": "test_site",
    "assignedTo": "20973aa9-fcf5-4ad6-afac-37905acc5737",
    "dueDate": "2026-02-01T00:00:00"
  }' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

test_api "更新工单为 OPEN" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "OPEN"
}'

test_api "更新工单为 ASSIGNED" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "ASSIGNED"
}'

test_api "更新工单为 IN_PROGRESS" "PUT" "/tickets/${TICKET_ID}" '{
    "status": "IN_PROGRESS"
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
echo "测试群组相关枚举"
echo "=========================================="

# GroupStatus 测试
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

GROUP_ID=$(curl -s -X POST ${BASE_URL}/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "状态测试群组",
    "description": "测试状态变更",
    "status": "ACTIVE"
  }' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

test_api "更新群组为 ACTIVE" "PUT" "/groups/${GROUP_ID}" '{
    "status": "ACTIVE"
}'

test_api "更新群组为 INACTIVE" "PUT" "/groups/${GROUP_ID}" '{
    "status": "INACTIVE"
}'

echo ""
echo "=========================================="
echo "测试站点相关枚举"
echo "=========================================="

# SiteStatus 测试
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

SITE_ID=$(curl -s -X POST ${BASE_URL}/sites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "状态测试站点",
    "address": "测试地址",
    "level": "A",
    "status": "ONLINE"
  }' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

test_api "更新站点为 ONLINE" "POST" "/sites/${SITE_ID}" '{
    "status": "ONLINE"
}'

test_api "更新站点为 OFFLINE" "POST" "/sites/${SITE_ID}" '{
    "status": "OFFLINE"
}'

echo ""
echo "=========================================="
echo "测试模板相关枚举"
echo "=========================================="

# FieldType 测试
TEMPLATE_ID=$(curl -s -X POST ${BASE_URL}/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "字段类型测试模板",
    "description": "测试所有字段类型"
  }' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

# 创建步骤
STEP_ID=$(curl -s -X POST ${BASE_URL}/templates/${TEMPLATE_ID}/steps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "测试步骤",
    "description": "测试各种字段类型",
    "order": 1
  }' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

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

# CommentType 测试
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
echo "测试结果汇总"
echo "=========================================="
echo "总测试数: ${TOTAL_TESTS}"
echo "通过: ${PASSED_TESTS}"
echo "失败: ${FAILED_TESTS}"
echo "成功率: $((PASSED_TESTS * 100 / TOTAL_TESTS))%"
echo "=========================================="

if [ ${FAILED_TESTS} -eq 0 ]; then
    echo "🎉 所有枚举值测试通过！"
    exit 0
else
    echo "⚠️  有 ${FAILED_TESTS} 个测试失败"
    exit 1
fi
