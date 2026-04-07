#!/bin/bash
# ============================================================================
# 快速测试 - Problem Ticket Site 自动填充功能
# ============================================================================

echo "=========================================="
echo "快速测试指南"
echo "=========================================="
echo ""
echo "前置条件："
echo "1. 后端服务运行在 localhost:8080"
echo "2. 已有测试数据（corrective tickets, templates, groups）"
echo ""
echo "启动后端服务："
echo "  cd /Users/mac/workspace/iGreenProduct/igreen-backend"
echo "  mvn spring-boot:run"
echo ""
echo "或使用 Makefile："
echo "  make dev"
echo ""
echo "运行完整测试："
echo "  ./tests/backend/test-problem-ticket-autofill.sh"
echo ""
echo "=========================================="
echo "快速 curl 命令示例"
echo "=========================================="
echo ""

# 检查后端是否运行
echo "检查后端服务状态..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null || echo "000")

if [ "$HEALTH" == "200" ]; then
  echo "✓ 后端服务正常运行"
  echo ""
  echo "开始执行测试..."
  echo ""
  
  # 调用完整测试脚本
  ./tests/backend/test-problem-ticket-autofill.sh
else
  echo "✗ 后端服务未运行 (HTTP $HEALTH)"
  echo ""
  echo "请先启动后端服务，然后运行："
  echo "  ./tests/backend/test-problem-ticket-autofill.sh"
  echo ""
  echo "或使用以下快速 curl 命令手动测试："
  echo ""
  echo "# 1. 登录获取 Token"
  echo "curl -X POST http://localhost:8080/api/auth/login \\"
  echo "  -H 'Content-Type: application/json' \\"
  echo "  -d '{\"username\":\"admin\",\"password\":\"admin123\",\"platform\":\"admin\",\"country\":\"China\"}'"
  echo ""
  echo "# 2. 创建 Problem Ticket（自动填充 site）"
  echo "curl -X POST http://localhost:8080/api/tickets \\"
  echo "  -H 'Authorization: Bearer YOUR_TOKEN' \\"
  echo "  -H 'Content-Type: application/json' \\"
  echo "  -d '{"
  echo "    \"title\": \"测试问题工单\","
  echo "    \"type\": \"problem\","
  echo "    \"templateId\": \"TEMPLATE_ID\","
  echo "    \"assignedTo\": \"GROUP_ID\","
  echo "    \"dueDate\": \"2025-12-31T23:59:59\","
  echo "    \"problemType\": \"PROBLEM_TYPE_ID\","
  echo "    \"relatedTicketIds\": [\"CORRECTIVE_TICKET_ID\"],"
  echo "    \"siteId\": null"
  echo "  }'"
fi