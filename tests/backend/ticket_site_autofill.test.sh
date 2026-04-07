#!/bin/bash
# ============================================================================
# 测试名称：Problem Ticket Site 自动推断
# 描述：验证创建 problem ticket 时，如果未提供 siteId，系统能从 relatedTicketIds 自动推断
# 依赖：后端服务运行在 8080 端口，数据库中有测试数据
# ============================================================================

BASE_URL="http://localhost:8080"
LOG_FILE="tests/logs/$(basename $0 .sh).log"
AUTH_TOKEN=""

# 创建日志目录
mkdir -p tests/logs

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 登录获取 token
login() {
  log "登录获取 token..."
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "admin",
      "password": "admin123"
    }')
  
  AUTH_TOKEN=$(echo "$RESPONSE" | jq -r '.data.token // empty')
  
  if [ -z "$AUTH_TOKEN" ]; then
    log "❌ 登录失败：$RESPONSE"
    return 1
  fi
  
  log "✅ 登录成功"
  return 0
}

# 测试 1: 创建 problem ticket 时不提供 siteId，但有 relatedTicketIds
test_problem_ticket_auto_fill_site() {
  log "测试 1: Problem ticket 自动推断 siteId..."
  
  # 首先创建一个基础 ticket 作为 related ticket
  log "创建基础 ticket..."
  FOUNDATION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/tickets" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "title": "基础工单 - 用于测试 site 推断",
      "description": "这是一个基础工单",
      "type": "MAINTENANCE",
      "siteId": "SITE_001",
      "priority": "MEDIUM",
      "templateId": "TPL_001",
      "assignedTo": "GROUP_001",
      "dueDate": "2026-12-31T23:59:59",
      "problemType": "ROUTINE"
    }')
  
  FOUNDATION_SUCCESS=$(echo "$FOUNDATION_RESPONSE" | jq -r '.success // false')
  if [ "$FOUNDATION_SUCCESS" != "true" ]; then
    log "❌ 创建基础工单失败：$FOUNDATION_RESPONSE"
    return 1
  fi
  
  FOUNDATION_TICKET_ID=$(echo "$FOUNDATION_RESPONSE" | jq -r '.data.id // empty')
  FOUNDATION_SITE_ID=$(echo "$FOUNDATION_RESPONSE" | jq -r '.data.siteId // empty')
  
  if [ -z "$FOUNDATION_TICKET_ID" ]; then
    log "❌ 基础工单 ID 为空"
    return 1
  fi
  
  log "✅ 基础工单创建成功，ID: $FOUNDATION_TICKET_ID, siteId: $FOUNDATION_SITE_ID"
  
  # 创建 problem ticket，不提供 siteId，但提供 relatedTicketIds
  log "创建 problem ticket（不提供 siteId，只提供 relatedTicketIds）..."
  PROBLEM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/tickets" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d "{
      \"title\": \"Problem ticket - 测试 site 自动推断\",
      \"description\": \"这是一个 problem ticket，应该自动推断 siteId\",
      \"type\": \"PROBLEM\",
      \"priority\": \"HIGH\",
      \"templateId\": \"TPL_001\",
      \"assignedTo\": \"GROUP_001\",
      \"dueDate\": \"2026-12-31T23:59:59\",
      \"problemType\": \"FAULT\",
      \"relatedTicketIds\": [\"$FOUNDATION_TICKET_ID\"]
    }")
  
  PROBLEM_SUCCESS=$(echo "$PROBLEM_RESPONSE" | jq -r '.success // false')
  if [ "$PROBLEM_SUCCESS" != "true" ]; then
    log "❌ 创建 problem ticket 失败：$PROBLEM_RESPONSE"
    return 1
  fi
  
  PROBLEM_SITE_ID=$(echo "$PROBLEM_RESPONSE" | jq -r '.data.siteId // empty')
  
  log "Problem ticket 响应 siteId: $PROBLEM_SITE_ID"
  log "基础 ticket siteId: $FOUNDATION_SITE_ID"
  
  if [ "$PROBLEM_SITE_ID" = "$FOUNDATION_SITE_ID" ]; then
    log "✅ Problem ticket 成功自动推断 siteId: $PROBLEM_SITE_ID"
    return 0
  else
    log "❌ Problem ticket siteId 推断失败。期望：$FOUNDATION_SITE_ID, 实际：$PROBLEM_SITE_ID"
    return 1
  fi
}

# 测试 2: 创建 problem ticket 时已提供 siteId，不应该被覆盖
test_problem_ticket_with_existing_site() {
  log "测试 2: Problem ticket 已有 siteId，不应被覆盖..."
  
  # 创建一个基础 ticket
  FOUNDATION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/tickets" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "title": "基础工单 - 用于测试 site 不覆盖",
      "description": "这是一个基础工单",
      "type": "MAINTENANCE",
      "siteId": "SITE_001",
      "priority": "MEDIUM",
      "templateId": "TPL_001",
      "assignedTo": "GROUP_001",
      "dueDate": "2026-12-31T23:59:59",
      "problemType": "ROUTINE"
    }')
  
  FOUNDATION_TICKET_ID=$(echo "$FOUNDATION_RESPONSE" | jq -r '.data.id // empty')
  
  # 创建 problem ticket，提供不同的 siteId
  CUSTOM_SITE_ID="SITE_002"
  PROBLEM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/tickets" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d "{
      \"title\": \"Problem ticket - 测试 site 不覆盖\",
      \"description\": \"这是一个 problem ticket，已有 siteId\",
      \"type\": \"PROBLEM\",
      \"siteId\": \"$CUSTOM_SITE_ID\",
      \"priority\": \"HIGH\",
      \"templateId\": \"TPL_001\",
      \"assignedTo\": \"GROUP_001\",
      \"dueDate\": \"2026-12-31T23:59:59\",
      \"problemType\": \"FAULT\",
      \"relatedTicketIds\": [\"$FOUNDATION_TICKET_ID\"]
    }")
  
  PROBLEM_SUCCESS=$(echo "$PROBLEM_RESPONSE" | jq -r '.success // false')
  if [ "$PROBLEM_SUCCESS" != "true" ]; then
    log "❌ 创建 problem ticket 失败：$PROBLEM_RESPONSE"
    return 1
  fi
  
  PROBLEM_SITE_ID=$(echo "$PROBLEM_RESPONSE" | jq -r '.data.siteId // empty')
  
  if [ "$PROBLEM_SITE_ID" = "$CUSTOM_SITE_ID" ]; then
    log "✅ Problem ticket 保留了用户提供的 siteId: $PROBLEM_SITE_ID"
    return 0
  else
    log "❌ Problem ticket siteId 被错误覆盖。期望：$CUSTOM_SITE_ID, 实际：$PROBLEM_SITE_ID"
    return 1
  fi
}

# 测试 3: 创建非 problem ticket，不提供 siteId，应该失败
test_non_problem_ticket_requires_site() {
  log "测试 3: 非 Problem ticket 必须提供 siteId..."
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/tickets" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "title": "Maintenance ticket - 测试 siteId 必填",
      "description": "这是一个 maintenance ticket",
      "type": "MAINTENANCE",
      "priority": "MEDIUM",
      "templateId": "TPL_001",
      "assignedTo": "GROUP_001",
      "dueDate": "2026-12-31T23:59:59"
    }')
  
  SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')
  
  if [ "$SUCCESS" = "false" ]; then
    log "✅ 非 problem ticket 正确拒绝了缺少 siteId 的请求"
    return 0
  else
    log "❌ 非 problem ticket 应该要求 siteId"
    return 1
  fi
}

# 主测试流程
main() {
  log "========================================"
  log "开始测试：Problem Ticket Site 自动推断"
  log "========================================"
  
  # 登录
  if ! login; then
    log "无法登录，退出测试"
    exit 1
  fi
  
  # 执行测试
  TEST1_PASSED=false
  TEST2_PASSED=false
  TEST3_PASSED=false
  
  if test_problem_ticket_auto_fill_site; then
    TEST1_PASSED=true
  fi
  
  if test_problem_ticket_with_existing_site; then
    TEST2_PASSED=true
  fi
  
  if test_non_problem_ticket_requires_site; then
    TEST3_PASSED=true
  fi
  
  # 总结
  log "========================================"
  log "测试总结"
  log "========================================"
  log "测试 1 (自动推断 siteId): $([ "$TEST1_PASSED" = true ] && echo "✅ 通过" || echo "❌ 失败")"
  log "测试 2 (不覆盖已有 siteId): $([ "$TEST2_PASSED" = true ] && echo "✅ 通过" || echo "❌ 失败")"
  log "测试 3 (非 problem ticket 要求 siteId): $([ "$TEST3_PASSED" = true ] && echo "✅ 通过" || echo "❌ 失败")"
  
  if [ "$TEST1_PASSED" = true ] && [ "$TEST2_PASSED" = true ] && [ "$TEST3_PASSED" = true ]; then
    log "========================================"
    log "所有测试通过 ✓"
    log "========================================"
    exit 0
  else
    log "========================================"
    log "部分测试失败 ✗"
    log "========================================"
    exit 1
  fi
}

# 执行测试
main
