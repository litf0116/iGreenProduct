#!/bin/bash

BASE_URL="http://180.188.45.250:8090/api"
TOKEN=""
REFRESH_TOKEN=""

# 登录
login() {
    echo "登录系统..."
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
        echo "登录失败"
        exit 1
    fi

    echo "登录成功"
}

# Token刷新
refresh_token() {
    echo ""
    echo "Token过期，正在刷新..."
    REFRESH_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/refresh \
      -H "Content-Type: application/json" \
      -d "{\"refreshToken\": \"${REFRESH_TOKEN}\"}")

    NEW_TOKEN=$(echo ${REFRESH_RESPONSE} | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    NEW_REFRESH=$(echo ${REFRESH_RESPONSE} | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

    if [ -z "$NEW_TOKEN" ]; then
        echo "Token刷新失败，重新登录..."
        login
        return 1
    fi

    TOKEN=${NEW_TOKEN}
    REFRESH_TOKEN=${NEW_REFRESH}
    echo "Token刷新成功"
}

# 带重试的API调用
call_api() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"

    echo ""
    echo "测试: $name"

    RESPONSE=$(curl -s -X ${method} ${BASE_URL}${url} \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d "${data}")

    SUCCESS=$(echo ${RESPONSE} | grep -o '"success":[^,]*' | cut -d':' -f2)
    CODE=$(echo ${RESPONSE} | grep -o '"code":"[^"]*"' | cut -d'"' -f4)

    if [ "$CODE" == "INVALID_TOKEN" ] || [ "$CODE" == "UNAUTHORIZED" ]; then
        echo "Token失效，刷新后重试..."
        refresh_token
        RESPONSE=$(curl -s -X ${method} ${BASE_URL}${url} \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer ${TOKEN}" \
          -d "${data}")
        SUCCESS=$(echo ${RESPONSE} | grep -o '"success":[^,]*' | cut -d':' -f2)
    fi

    if [ "$SUCCESS" == "true" ]; then
        echo "  ✅ 通过"
        return 0
    else
        echo "  ❌ 失败"
        echo "  错误码: $CODE"
        echo "  响应: ${RESPONSE}" | head -c 200
        return 1
    fi
}

login

# 获取工程师ID
echo ""
echo "获取工程师ID..."
ENGINEER_RESPONSE=$(curl -s -X GET "${BASE_URL}/users/engineers?size=1" \
  -H "Authorization: Bearer ${TOKEN}")
ENGINEER_ID=$(echo ${ENGINEER_RESPONSE} | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "工程师ID: ${ENGINEER_ID}"

# 测试1: MANAGER用户
echo ""
echo "=========================================="
echo "用户枚举测试"
echo "=========================================="
call_api "创建MANAGER用户" "POST" "/users" '{
    "name": "经理测试",
    "username": "test_manager_final",
    "email": "manager_final@example.com",
    "password": "Test123456",
    "role": "MANAGER",
    "status": "ACTIVE"
}'

# 测试2: 更新用户状态
echo ""
USER_ID="20973aa9-fcf5-4ad6-afac-37905acc5737"
call_api "更新用户状态为ACTIVE" "PUT" "/users/${USER_ID}" '{"status": "ACTIVE"}'

# 测试工单类型
echo ""
echo "=========================================="
echo "工单类型测试"
echo "=========================================="

for type in "PLANNED" "PREVENTIVE" "CORRECTIVE" "PROBLEM"; do
    call_api "创建${type}工单" "POST" "/tickets" "{
        "title": "'${type}'工单",
        "description": "测试",
        "type": "'${type}'",
        "priority": "P2",
        "site": "test_site",
        "assignedTo": "'${ENGINEER_ID}'",
        "dueDate": "2026-02-01T00:00:00"
    }"
done

# 测试优先级
for priority in "P1" "P2" "P3" "P4"; do
    call_api "创建P${priority}工单" "POST" "/tickets" "{
        \"title\": \"${priority}工单\",
        \"description\": \"测试\",
        \"type\": \"PLANNED\",
        \"priority\": \"${priority}\",
        \"site\": \"test\",
        \"assignedTo\": \"'${ENGINEER_ID}'\",
        \"dueDate\": \"2026-02-01T00:00:00\"
    }"
done

# 创建工单用于状态和评论测试
echo ""
TICKET_RESPONSE=$(curl -s -X POST ${BASE_URL}/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "测试工单",
    "description": "测试",
    "type": "PLANNED",
    "priority": "P2",
    "site": "test",
    "assignedTo": "'${ENGINEER_ID}'",
    "dueDate": "2026-02-01T00:00:00"
  }')

TICKET_ID=$(echo ${TICKET_RESPONSE} | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "工单ID: ${TICKET_ID}"

# 测试工单状态
echo ""
echo "=========================================="
echo "工单状态测试"
echo "=========================================="

for status in "OPEN" "ASSIGNED" "DEPARTED" "COMPLETED" "ON_HOLD" "CANCELLED"; do
    call_api "更新工单为${status}" "PUT" "/tickets/${TICKET_ID}" "{\"status\": \"${status}\"}"
done

# 测试评论类型
echo ""
echo "=========================================="
echo "评论类型测试"
echo "=========================================="

for ctype in "GENERAL" "COMMENT" "ACCEPT" "DECLINE" "CANCEL"; do
    call_api "添加${ctype}评论" "POST" "/tickets/${TICKET_ID}/comments" "{
        \"comment\": \"测试\",
        \"type\": \"${ctype}\"
    }"
done

# 测试群组状态
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
    call_api "更新群组为${gstatus}" "PUT" "/groups/${GROUP_ID}" "{
        \"name\": \"更新\",
        \"description\": \"测试\",
        \"status\": \"${gstatus}\"
    }"
done

# 测试站点状态
echo ""
echo "=========================================="
echo "站点状态测试"
echo "=========================================="

for sstatus in "ONLINE" "OFFLINE" "UNDER_CONSTRUCTION"; do
    call_api "创建${sstatus}站点" "POST" "/sites" "{
        \"name\": \"${sstatus}站点\",
        \"address\": \"测试地址\",
        \"level\": \"A\",
        \"status\": \"${sstatus}\"
    }"
done

echo ""
echo "=========================================="
echo "测试完成！"
echo "=========================================="
