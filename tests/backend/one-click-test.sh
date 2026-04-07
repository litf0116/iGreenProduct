#!/bin/bash

echo "=========================================="
echo "Problem Ticket Site 自动填充 - 快速测试"
echo "=========================================="
echo ""

BASE_URL="http://localhost:8080"

echo "步骤 1/5: 登录..."
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","platform":"admin","country":"China"}' \
  | jq -r '.data.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "✗ 登录失败"
  echo "请确保后端服务运行在 http://localhost:8080"
  exit 1
fi
echo "✓ 登录成功"
echo ""

echo "步骤 2/5: 获取 Corrective Ticket..."
CORRECTIVE_DATA=$(curl -s -X GET "$BASE_URL/api/tickets?type=corrective&page=1&size=1" \
  -H "Authorization: Bearer $TOKEN")

CORRECTIVE_ID=$(echo "$CORRECTIVE_DATA" | jq -r '.data.records[0].id')
SITE_ID=$(echo "$CORRECTIVE_DATA" | jq -r '.data.records[0].siteId')
SITE_NAME=$(echo "$CORRECTIVE_DATA" | jq -r '.data.records[0].siteName')

if [ -z "$CORRECTIVE_ID" ] || [ "$CORRECTIVE_ID" == "null" ]; then
  echo "✗ 没有找到 Corrective Ticket"
  exit 1
fi
echo "✓ Corrective ID: $CORRECTIVE_ID"
echo "✓ Site: $SITE_NAME (ID: $SITE_ID)"
echo ""

echo "步骤 3/5: 获取其他必要 ID..."
TEMPLATE_ID=$(curl -s -X GET "$BASE_URL/api/templates" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data.records[] | select(.type == "problem") | .id' | head -1)

GROUP_ID=$(curl -s -X GET "$BASE_URL/api/groups" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data.records[0].id')

PROBLEM_TYPE_ID=$(curl -s -X GET "$BASE_URL/api/problem-types" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data[0].id')

echo "✓ Template: $TEMPLATE_ID"
echo "✓ Group: $GROUP_ID"
echo "✓ Problem Type: $PROBLEM_TYPE_ID"
echo ""

echo "步骤 4/5: 创建 Problem Ticket（自动填充 Site）..."
RESULT=$(curl -s -X POST "$BASE_URL/api/tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试问题工单 - Site 自动填充",
    "description": "测试从 relatedTicketIds 自动推断 siteId",
    "type": "problem",
    "templateId": "'"$TEMPLATE_ID"'",
    "assignedTo": "'"$GROUP_ID"'",
    "dueDate": "'$(date -u +"%Y-%m-%dT%H:%M:%S" -d "+7 days")'",
    "problemType": "'"$PROBLEM_TYPE_ID"'",
    "relatedTicketIds": ["'"$CORRECTIVE_ID"'"],
    "siteId": null
  }')

echo "$RESULT" | jq
echo ""

echo "步骤 5/5: 验证结果..."
SUCCESS=$(echo "$RESULT" | jq -r '.success')
RESULT_SITE_ID=$(echo "$RESULT" | jq -r '.data.siteId')
RESULT_SITE_NAME=$(echo "$RESULT" | jq -r '.data.siteName')

if [ "$SUCCESS" == "true" ]; then
  echo "✓ Problem Ticket 创建成功"
  echo ""
  
  if [ "$RESULT_SITE_ID" == "$SITE_ID" ]; then
    echo "✓✓ 测试通过！Site 自动填充正确"
    echo ""
    echo "期望 Site ID: $SITE_ID"
    echo "实际 Site ID: $RESULT_SITE_ID"
    echo "Site Name: $RESULT_SITE_NAME"
    echo ""
    echo "=========================================="
    echo "🎉 功能验证成功！"
    echo "=========================================="
  else
    echo "✗ 测试失败：Site 未正确填充"
    echo "期望 Site ID: $SITE_ID"
    echo "实际 Site ID: $RESULT_SITE_ID"
  fi
else
  echo "✗ 创建失败"
  ERROR_MSG=$(echo "$RESULT" | jq -r '.message')
  echo "错误: $ERROR_MSG"
fi