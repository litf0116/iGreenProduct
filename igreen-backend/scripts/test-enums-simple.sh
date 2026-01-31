#!/bin/bash

BASE_URL="http://180.188.45.250:8090/api"
TOKEN=""

# 登录
echo "登录系统..."
LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123",
    "country": "TH"
  }')

TOKEN=$(echo ${LOGIN_RESPONSE} | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "登录失败"
    exit 1
fi

echo "登录成功"
echo ""

# 测试1: MANAGER用户
echo "测试1: 创建MANAGER用户"
RESPONSE=$(curl -s -X POST ${BASE_URL}/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "经理测试",
    "username": "test_manager_final",
    "email": "manager_final@example.com",
    "password": "Test123456",
    "role": "MANAGER",
    "status": "ACTIVE"
  }')

echo ${RESPONSE} | grep -o '"success":[^,]*' | cut -d':' -f2

# 测试2: 更新用户状态
echo ""
echo "测试2: 更新用户状态"
USER_ID="20973aa9-fcf5-4ad6-afac-37905acc5737"
RESPONSE=$(curl -s -X PUT ${BASE_URL}/users/${USER_ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"status": "ACTIVE"}')

echo ${RESPONSE} | grep -o '"success":[^,]*' | cut -d':' -f2

# 获取工程师ID
echo ""
echo "获取工程师ID..."
ENGINEER_RESPONSE=$(curl -s -X GET "${BASE_URL}/users/engineers?size=1" \
  -H "Authorization: Bearer ${TOKEN}")
ENGINEER_ID=$(echo ${ENGINEER_RESPONSE} | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "工程师ID: ${ENGINEER_ID}"

# 测试3-6: 工单类型和优先级
echo ""
echo "=========================================="
echo "工单枚举测试"
echo "=========================================="

for type in "PLANNED" "PREVENTIVE" "CORRECTIVE" "PROBLEM"; do
    echo ""
    echo "测试: 创建${type}工单"
    RESPONSE=$(curl -s -X POST ${BASE_URL}/tickets \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{
        "title": "'${type}'维护工单",
        "description": "测试",
        "type": "'${type}'",
        "priority": "P2",
        "site": "test",
        "assignedTo": "'${ENGINEER_ID}'",
        "dueDate": "2026-02-01T00:00:00"
      }')
    echo ${RESPONSE} | grep -o '"success":[^,]*' | cut -d':' -f2
done

# 测试7-12: 工单状态
echo ""
echo "工单状态测试"
TICKET_ID=$(curl -s -X POST ${BASE_URL}/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "状态测试",
    "description": "测试",
    "type": "PLANNED",
    "priority": "P2",
    "site": "test",
    "assignedTo": "'${ENGINEER_ID}'",
    "dueDate": "2026-02-01T00:00:00"
  }' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

echo "工单ID: ${TICKET_ID}"

for status in "OPEN" "ASSIGNED" "DEPARTED" "COMPLETED" "ON_HOLD" "CANCELLED"; do
    echo ""
    echo "测试: 更新为${status}"
    RESPONSE=$(curl -s -X PUT ${BASE_URL}/tickets/${TICKET_ID} \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d "{\"status\": \"${status}\"}")
    echo ${RESPONSE} | grep -o '"success":[^,]*' | cut -d':' -f2
done

# 测试13-17: 评论类型
echo ""
echo "=========================================="
echo "评论类型测试"
echo "=========================================="

for ctype in "GENERAL" "COMMENT" "ACCEPT" "DECLINE" "CANCEL"; do
    echo ""
    echo "测试: 添加${ctype}评论"
    RESPONSE=$(curl -s -X POST ${BASE_URL}/tickets/${TICKET_ID}/comments \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{
        "comment": "测试",
        "type": "'${ctype}'"
      }')
    echo ${RESPONSE} | grep -o '"success":[^,]*' | cut -d':' -f2
done

# 测试18-19: 群组状态
echo ""
echo "=========================================="
echo "群组状态测试"
echo "=========================================="

GROUP_RESPONSE=$(curl -s -X POST ${BASE_URL}/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "测试群组",
    "description": "测试",
    "status": "ACTIVE"
  }')

GROUP_ID=$(echo ${GROUP_RESPONSE} | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "群组ID: ${GROUP_ID}"

for gstatus in "ACTIVE" "INACTIVE"; do
    echo ""
    echo "测试: 更新群组为${gstatus}"
    RESPONSE=$(curl -s -X PUT ${BASE_URL}/groups/${GROUP_ID} \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d "{\"name\": \"更新\", \"description\": \"测试\", \"status\": \"${gstatus}\"}")
    echo ${RESPONSE} | grep -o '"success":[^,]*' | cut -d':' -f2
done

echo ""
echo "=========================================="
echo "测试完成"
echo "=========================================="
