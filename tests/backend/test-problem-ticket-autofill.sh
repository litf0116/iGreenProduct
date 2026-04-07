#!/bin/bash
# ============================================================================
# 测试名称: Problem Ticket Site 自动填充功能测试
# 描述: 使用 curl 测试创建 problem ticket 时 site 自动填充功能
# 依赖: 后端服务运行在 8080 端口，已有测试数据
# ============================================================================

BASE_URL="http://localhost:8080"
LOG_FILE="tests/logs/problem-ticket-autofill-$(date +%Y%m%d_%H%M%S).log"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 创建日志目录
mkdir -p tests/logs

echo "========================================" | tee -a "$LOG_FILE"
echo "Problem Ticket Site 自动填充功能测试" | tee -a "$LOG_FILE"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# ============================================================================
# 步骤 1: 登录获取 Token
# ============================================================================
echo -e "${BLUE}[步骤 1] 登录获取 JWT Token${NC}" | tee -a "$LOG_FILE"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "platform": "admin",
    "country": "China"
  }')

echo "登录响应: $LOGIN_RESPONSE" | tee -a "$LOG_FILE"

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo -e "${RED}✗ 登录失败，无法获取 Token${NC}" | tee -a "$LOG_FILE"
  exit 1
fi

echo -e "${GREEN}✓ 登录成功${NC}" | tee -a "$LOG_FILE"
echo "Token: ${TOKEN:0:50}..." | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# ============================================================================
# 步骤 2: 获取必要的数据
# ============================================================================
echo -e "${BLUE}[步骤 2] 获取测试数据${NC}" | tee -a "$LOG_FILE"

# 2.1 获取 Corrective Tickets
echo "获取 Corrective Tickets..." | tee -a "$LOG_FILE"
CORRECTIVE_TICKETS=$(curl -s -X GET "$BASE_URL/api/tickets?type=corrective&page=1&size=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Corrective Tickets 响应: $CORRECTIVE_TICKETS" >> "$LOG_FILE"

# 提取第一个 corrective ticket 的 ID 和 siteId
CORRECTIVE_ID_1=$(echo "$CORRECTIVE_TICKETS" | jq -r '.data.records[0].id // empty')
CORRECTIVE_SITE_ID=$(echo "$CORRECTIVE_TICKETS" | jq -r '.data.records[0].siteId // empty')
CORRECTIVE_SITE_NAME=$(echo "$CORRECTIVE_TICKETS" | jq -r '.data.records[0].siteName // empty')

if [ -z "$CORRECTIVE_ID_1" ] || [ "$CORRECTIVE_ID_1" == "null" ]; then
  echo -e "${RED}✗ 没有找到 Corrective Ticket，请先创建测试数据${NC}" | tee -a "$LOG_FILE"
  exit 1
fi

echo -e "${GREEN}✓ 找到 Corrective Ticket${NC}" | tee -a "$LOG_FILE"
echo "  ID: $CORRECTIVE_ID_1" | tee -a "$LOG_FILE"
echo "  Site ID: $CORRECTIVE_SITE_ID" | tee -a "$LOG_FILE"
echo "  Site Name: $CORRECTIVE_SITE_NAME" | tee -a "$LOG_FILE"

# 提取第二个 corrective ticket（如果有）
CORRECTIVE_ID_2=$(echo "$CORRECTIVE_TICKETS" | jq -r '.data.records[1].id // empty')
if [ -n "$CORRECTIVE_ID_2" ] && [ "$CORRECTIVE_ID_2" != "null" ]; then
  echo "  第二个 Corrective ID: $CORRECTIVE_ID_2" | tee -a "$LOG_FILE"
fi
echo "" | tee -a "$LOG_FILE"

# 2.2 获取 Problem Type
echo "获取 Problem Types..." | tee -a "$LOG_FILE"
PROBLEM_TYPES=$(curl -s -X GET "$BASE_URL/api/problem-types" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Problem Types 响应: $PROBLEM_TYPES" >> "$LOG_FILE"

PROBLEM_TYPE_ID=$(echo "$PROBLEM_TYPES" | jq -r '.data[0].id // empty')

if [ -z "$PROBLEM_TYPE_ID" ] || [ "$PROBLEM_TYPE_ID" == "null" ]; then
  echo -e "${YELLOW}⚠ 没有找到 Problem Type，将使用默认值${NC}" | tee -a "$LOG_FILE"
  PROBLEM_TYPE_ID="equipment-failure"
fi

echo -e "${GREEN}✓ 找到 Problem Type ID: $PROBLEM_TYPE_ID${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# 2.3 获取 Template
echo "获取 Templates..." | tee -a "$LOG_FILE"
TEMPLATES=$(curl -s -X GET "$BASE_URL/api/templates?page=1&size=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Templates 响应: $TEMPLATES" >> "$LOG_FILE"

# 查找 problem 类型的模板
TEMPLATE_ID=$(echo "$TEMPLATES" | jq -r '.data.records[] | select(.type == "problem") | .id' | head -1)

if [ -z "$TEMPLATE_ID" ] || [ "$TEMPLATE_ID" == "null" ]; then
  echo -e "${YELLOW}⚠ 没有找到 Problem 模板，使用第一个模板${NC}" | tee -a "$LOG_FILE"
  TEMPLATE_ID=$(echo "$TEMPLATES" | jq -r '.data.records[0].id // empty')
fi

if [ -z "$TEMPLATE_ID" ] || [ "$TEMPLATE_ID" == "null" ]; then
  echo -e "${RED}✗ 没有找到任何模板${NC}" | tee -a "$LOG_FILE"
  exit 1
fi

echo -e "${GREEN}✓ 找到 Template ID: $TEMPLATE_ID${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# 2.4 获取 Group
echo "获取 Groups..." | tee -a "$LOG_FILE"
GROUPS=$(curl -s -X GET "$BASE_URL/api/groups?page=1&size=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Groups 响应: $GROUPS" >> "$LOG_FILE"

GROUP_ID=$(echo "$GROUPS" | jq -r '.data.records[0].id // empty')

if [ -z "$GROUP_ID" ] || [ "$GROUP_ID" == "null" ]; then
  echo -e "${RED}✗ 没有找到 Group${NC}" | tee -a "$LOG_FILE"
  exit 1
fi

echo -e "${GREEN}✓ 找到 Group ID: $GROUP_ID${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# ============================================================================
# 测试场景 1: 创建 Problem Ticket（自动填充 site）
# ============================================================================
echo -e "${YELLOW}[测试 1] 创建 Problem Ticket - 自动填充 site${NC}" | tee -a "$LOG_FILE"
echo "期望: siteId 从 relatedTicketIds 自动推断" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# 准备 relatedTicketIds 数组
if [ -n "$CORRECTIVE_ID_2" ] && [ "$CORRECTIVE_ID_2" != "null" ]; then
  RELATED_IDS="[\"$CORRECTIVE_ID_1\", \"$CORRECTIVE_ID_2\"]"
else
  RELATED_IDS="[\"$CORRECTIVE_ID_1\"]"
fi

echo "Related Ticket IDs: $RELATED_IDS" | tee -a "$LOG_FILE"

CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试问题工单 - Site 自动填充",
    "description": "测试创建 problem ticket 时从 relatedTicketIds 自动填充 site 功能",
    "type": "problem",
    "templateId": "'"$TEMPLATE_ID"'",
    "assignedTo": "'"$GROUP_ID"'",
    "dueDate": "'$(date -u +"%Y-%m-%dT%H:%M:%S" -d "+7 days")'",
    "problemType": "'"$PROBLEM_TYPE_ID"'",
    "relatedTicketIds": '"$RELATED_IDS"',
    "siteId": null
  }')

echo "创建响应: $CREATE_RESPONSE" | tee -a "$LOG_FILE"

# 验证创建是否成功
SUCCESS=$(echo "$CREATE_RESPONSE" | jq -r '.success // false')
CREATED_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id // empty')
CREATED_SITE_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.siteId // empty')
CREATED_SITE_NAME=$(echo "$CREATE_RESPONSE" | jq -r '.data.siteName // empty')

if [ "$SUCCESS" == "true" ]; then
  echo -e "${GREEN}✓ Problem Ticket 创建成功${NC}" | tee -a "$LOG_FILE"
  echo "  Ticket ID: $CREATED_ID" | tee -a "$LOG_FILE"
  echo "  Site ID: $CREATED_SITE_ID" | tee -a "$LOG_FILE"
  echo "  Site Name: $CREATED_SITE_NAME" | tee -a "$LOG_FILE"
  
  # 验证 site 是否正确填充
  if [ "$CREATED_SITE_ID" == "$CORRECTIVE_SITE_ID" ]; then
    echo -e "${GREEN}✓✓ Site 自动填充正确！${NC}" | tee -a "$LOG_FILE"
    echo "  期望 Site ID: $CORRECTIVE_SITE_ID" | tee -a "$LOG_FILE"
    echo "  实际 Site ID: $CREATED_SITE_ID" | tee -a "$LOG_FILE"
  else
    echo -e "${RED}✗ Site 自动填充不匹配${NC}" | tee -a "$LOG_FILE"
    echo "  期望 Site ID: $CORRECTIVE_SITE_ID" | tee -a "$LOG_FILE"
    echo "  实际 Site ID: $CREATED_SITE_ID" | tee -a "$LOG_FILE"
  fi
else
  ERROR_MSG=$(echo "$CREATE_RESPONSE" | jq -r '.message // "Unknown error"')
  echo -e "${RED}✗ Problem Ticket 创建失败: $ERROR_MSG${NC}" | tee -a "$LOG_FILE"
fi
echo "" | tee -a "$LOG_FILE"

# ============================================================================
# 测试场景 2: 创建 Problem Ticket（手动指定 site）
# ============================================================================
echo -e "${YELLOW}[测试 2] 创建 Problem Ticket - 手动指定 site${NC}" | tee -a "$LOG_FILE"
echo "期望: 保留用户指定的 site，不被覆盖" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# 使用不同的 site（如果有第二个 corrective ticket）
if [ -n "$CORRECTIVE_ID_2" ] && [ "$CORRECTIVE_ID_2" != "null" ]; then
  CORRECTIVE_SITE_ID_2=$(echo "$CORRECTIVE_TICKETS" | jq -r '.data.records[1].siteId // empty')
  MANUAL_SITE_ID="$CORRECTIVE_SITE_ID_2"
else
  MANUAL_SITE_ID="$CORRECTIVE_SITE_ID"
fi

echo "手动指定的 Site ID: $MANUAL_SITE_ID" | tee -a "$LOG_FILE"

CREATE_RESPONSE_2=$(curl -s -X POST "$BASE_URL/api/tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试问题工单 - 手动指定 site",
    "description": "测试创建 problem ticket 时保留用户指定的 site",
    "type": "problem",
    "templateId": "'"$TEMPLATE_ID"'",
    "assignedTo": "'"$GROUP_ID"'",
    "dueDate": "'$(date -u +"%Y-%m-%dT%H:%M:%S" -d "+7 days")'",
    "problemType": "'"$PROBLEM_TYPE_ID"'",
    "relatedTicketIds": '"$RELATED_IDS"',
    "siteId": "'"$MANUAL_SITE_ID"'"
  }')

echo "创建响应: $CREATE_RESPONSE_2" | tee -a "$LOG_FILE"

SUCCESS_2=$(echo "$CREATE_RESPONSE_2" | jq -r '.success // false')
CREATED_SITE_ID_2=$(echo "$CREATE_RESPONSE_2" | jq -r '.data.siteId // empty')

if [ "$SUCCESS_2" == "true" ]; then
  echo -e "${GREEN}✓ Problem Ticket 创建成功${NC}" | tee -a "$LOG_FILE"
  
  if [ "$CREATED_SITE_ID_2" == "$MANUAL_SITE_ID" ]; then
    echo -e "${GREEN}✓✓ 用户指定的 site 正确保留！${NC}" | tee -a "$LOG_FILE"
    echo "  指定 Site ID: $MANUAL_SITE_ID" | tee -a "$LOG_FILE"
    echo "  实际 Site ID: $CREATED_SITE_ID_2" | tee -a "$LOG_FILE"
  else
    echo -e "${RED}✗ Site 被错误覆盖${NC}" | tee -a "$LOG_FILE"
    echo "  指定 Site ID: $MANUAL_SITE_ID" | tee -a "$LOG_FILE"
    echo "  实际 Site ID: $CREATED_SITE_ID_2" | tee -a "$LOG_FILE"
  fi
else
  ERROR_MSG_2=$(echo "$CREATE_RESPONSE_2" | jq -r '.message // "Unknown error"')
  echo -e "${RED}✗ Problem Ticket 创建失败: $ERROR_MSG_2${NC}" | tee -a "$LOG_FILE"
fi
echo "" | tee -a "$LOG_FILE"

# ============================================================================
# 测试场景 3: 创建 Problem Ticket（不提供 relatedTicketIds）
# ============================================================================
echo -e "${YELLOW}[测试 3] 创建 Problem Ticket - 不提供 relatedTicketIds${NC}" | tee -a "$LOG_FILE"
echo "期望: siteId 为空，创建成功" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

CREATE_RESPONSE_3=$(curl -s -X POST "$BASE_URL/api/tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试问题工单 - 无 relatedTicketIds",
    "description": "测试创建 problem ticket 时没有 relatedTicketIds 的情况",
    "type": "problem",
    "templateId": "'"$TEMPLATE_ID"'",
    "assignedTo": "'"$GROUP_ID"'",
    "dueDate": "'$(date -u +"%Y-%m-%dT%H:%M:%S" -d "+7 days")'",
    "problemType": "'"$PROBLEM_TYPE_ID"'",
    "relatedTicketIds": [],
    "siteId": null
  }')

echo "创建响应: $CREATE_RESPONSE_3" | tee -a "$LOG_FILE"

SUCCESS_3=$(echo "$CREATE_RESPONSE_3" | jq -r '.success // false')
CREATED_SITE_ID_3=$(echo "$CREATE_RESPONSE_3" | jq -r '.data.siteId // empty')

if [ "$SUCCESS_3" == "true" ]; then
  echo -e "${GREEN}✓ Problem Ticket 创建成功${NC}" | tee -a "$LOG_FILE"
  
  if [ -z "$CREATED_SITE_ID_3" ] || [ "$CREATED_SITE_ID_3" == "null" ]; then
    echo -e "${GREEN}✓✓ Site ID 正确为空${NC}" | tee -a "$LOG_FILE"
  else
    echo -e "${YELLOW}⚠ Site ID 不为空: $CREATED_SITE_ID_3${NC}" | tee -a "$LOG_FILE"
  fi
else
  ERROR_MSG_3=$(echo "$CREATE_RESPONSE_3" | jq -r '.message // "Unknown error"')
  echo -e "${RED}✗ Problem Ticket 创建失败: $ERROR_MSG_3${NC}" | tee -a "$LOG_FILE"
fi
echo "" | tee -a "$LOG_FILE"

# ============================================================================
# 测试场景 4: 创建非 Problem Ticket（必须提供 site）
# ============================================================================
echo -e "${YELLOW}[测试 4] 创建 Corrective Ticket - 不提供 site${NC}" | tee -a "$LOG_FILE"
echo "期望: 创建失败，提示 siteId 必填" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

CREATE_RESPONSE_4=$(curl -s -X POST "$BASE_URL/api/tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试纠错工单 - 无 site",
    "description": "测试创建 corrective ticket 时没有 site 的情况",
    "type": "corrective",
    "templateId": "'"$TEMPLATE_ID"'",
    "assignedTo": "'"$GROUP_ID"'",
    "dueDate": "'$(date -u +"%Y-%m-%dT%H:%M:%S" -d "+7 days")'",
    "siteId": null
  }')

echo "创建响应: $CREATE_RESPONSE_4" | tee -a "$LOG_FILE"

SUCCESS_4=$(echo "$CREATE_RESPONSE_4" | jq -r '.success // false')

if [ "$SUCCESS_4" == "false" ]; then
  ERROR_CODE=$(echo "$CREATE_RESPONSE_4" | jq -r '.code // empty')
  if [ "$ERROR_CODE" == "SITE_NOT_FOUND" ]; then
    echo -e "${GREEN}✓✓ 正确拒绝创建，siteId 必填${NC}" | tee -a "$LOG_FILE"
  else
    echo -e "${YELLOW}⚠ 创建失败，但错误码不是 SITE_NOT_FOUND${NC}" | tee -a "$LOG_FILE"
  fi
else
  echo -e "${RED}✗ 错误：没有 site 的 corrective ticket 创建成功了${NC}" | tee -a "$LOG_FILE"
fi
echo "" | tee -a "$LOG_FILE"

# ============================================================================
# 测试总结
# ============================================================================
echo "========================================" | tee -a "$LOG_FILE"
echo "测试完成" | tee -a "$LOG_FILE"
echo "日志文件: $LOG_FILE" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

echo ""
echo -e "${GREEN}测试场景总结:${NC}"
echo "  1. 自动填充 site: 已测试"
echo "  2. 保留手动指定 site: 已测试"
echo "  3. 无 relatedTicketIds: 已测试"
echo "  4. 非 Problem 类型验证: 已测试"
echo ""
echo "详细日志请查看: $LOG_FILE"