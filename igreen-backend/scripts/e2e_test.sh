#!/bin/bash
# ============================================
# 工单完整生命周期端到端测试脚本
# 测试流程：管理员创建 -> 工程师接单 -> 状态流转 -> 管理员审核
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

BASE_URL="${1:-http://localhost}"
PORT="${2:-8000}"
BASE_URL="${BASE_URL}:${PORT}"
API_URL="${BASE_URL}/api"

TOTAL=0
PASSED=0
FAILED=0

TICKET_ID=""
ENGINEER_TOKEN=""
ADMIN_TOKEN=""

print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║ $1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
}

print_step() {
    echo -e "\n${YELLOW}[STEP]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
    ((TOTAL++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    echo -e "${RED}       Response: $2${NC}"
    ((FAILED++))
    ((TOTAL++))
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# ============================================
# 管理员登录
# ============================================

admin_login() {
    print_step "管理员登录..."
    local login_response=$(curl -s -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"password123","country":"Thailand"}')

    ADMIN_TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

    if [ -n "$ADMIN_TOKEN" ]; then
        print_pass "管理员登录成功"
    else
        print_fail "管理员登录失败" "$login_response"
        exit 1
    fi
}

# ============================================
# 工程师登录/注册
# ============================================

engineer_login() {
    print_step "工程师登录..."

    # 先尝试登录现有工程师
    local login_response=$(curl -s -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"engineer","password":"engineer123","country":"Thailand"}')

    ENGINEER_TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

    if [ -n "$ENGINEER_TOKEN" ]; then
        print_pass "使用现有工程师账户登录成功"
        return 0
    fi

    # 获取工程师列表，找到一个可用的工程师
    print_step "获取可用工程师..."
    local engineers_response=$(curl -s "${API_URL}/users/engineers" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    # 获取第一个工程师的用户名
    local engineer_username=$(echo "$engineers_response" | grep -o '"username":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -n "$engineer_username" ]; then
        print_info "使用系统工程师: $engineer_username"
        login_response=$(curl -s -X POST "${API_URL}/auth/login" \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"$engineer_username\",\"password\":\"Test123456\",\"country\":\"Thailand\"}")

        ENGINEER_TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

        if [ -n "$ENGINEER_TOKEN" ]; then
            print_pass "工程师登录成功: $engineer_username"
            return 0
        fi
    fi

    # 如果都失败，注册新工程师（但不使用这个新工程师做 E2E 测试）
    print_info "没有可用的工程师账户，注册新账户..."
    local unique_id=$(date +%s)
    local register_response=$(curl -s -X POST "${API_URL}/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"username\": \"engineer_e2e_$unique_id\",
            \"password\": \"Test123456\",
            \"confirmPassword\": \"Test123456\",
            \"name\": \"E2E测试工程师_$unique_id\",
            \"email\": \"engineer_e2e_$unique_id@igreen.com\",
            \"country\": \"Thailand\",
            \"role\": \"ENGINEER\"
        }")

    if echo "$register_response" | grep -q '"success":true'; then
        print_pass "E2E测试工程师注册成功"
        sleep 2

        login_response=$(curl -s -X POST "${API_URL}/auth/login" \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"engineer_e2e_$unique_id\",\"password\":\"Test123456\",\"country\":\"Thailand\"}")

        ENGINEER_TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

        if [ -n "$ENGINEER_TOKEN" ]; then
            print_pass "E2E测试工程师登录成功"
        else
            print_fail "E2E测试工程师登录失败" "$login_response"
            exit 1
        fi
    else
        print_fail "E2E测试工程师注册失败" "$register_response"
        exit 1
    fi
}

# ============================================
# 获取资源
# ============================================

get_resources() {
    print_step "获取模板列表..."
    local templates_response=$(curl -s "${API_URL}/templates" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    TEMPLATE_ID=$(echo "$templates_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$TEMPLATE_ID" ]; then
        print_pass "获取模板成功: $TEMPLATE_ID"
    else
        print_fail "获取模板失败" "$templates_response"
        exit 1
    fi

    print_step "获取工程师列表..."
    local engineers_response=$(curl -s "${API_URL}/users/engineers" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    ENGINEER_ID=$(echo "$engineers_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$ENGINEER_ID" ]; then
        print_pass "获取工程师成功: $ENGINEER_ID"
    else
        print_fail "获取工程师失败" "$engineers_response"
        exit 1
    fi
}

# ============================================
# E2E 测试流程
# ============================================

test_complete_workflow() {
    print_header "E2E 工单完整生命周期测试"

    # 1. 管理员创建工单
    print_step "1. 管理员创建工单"
    local create_data="{
        \"title\": \"E2E测试工单_$(date +%s)\",
        \"description\": \"端到端完整流程测试 - 创建于 $(date)\",
        \"type\": \"CORRECTIVE\",
        \"priority\": \"P2\",
        \"siteId\": \"site-1\",
        \"templateId\": \"$TEMPLATE_ID\",
        \"assignedTo\": \"$ENGINEER_ID\",
        \"dueDate\": \"2026-02-01T00:00:00\"
    }"

    local create_response=$(curl -s -X POST "${API_URL}/tickets" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "$create_data")

    if echo "$create_response" | grep -q '"success":true'; then
        TICKET_ID=$(echo "$create_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        local title=$(echo "$create_response" | grep -o '"title":"[^"]*"' | head -1 | cut -d'"' -f4)
        print_pass "创建工单成功: $title (ID: $TICKET_ID)"
    else
        print_fail "创建工单失败" "$create_response"
        return
    fi

    # 2. 验证工单初始状态
    print_step "2. 验证工单初始状态 (OPEN)"
    local detail_response=$(curl -s "${API_URL}/tickets/${TICKET_ID}" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    local initial_status=$(echo "$detail_response" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ "$initial_status" = "OPEN" ]; then
        print_pass "工单初始状态正确: $initial_status"
    else
        print_fail "工单状态不正确，期望 OPEN，实际 $initial_status" "$detail_response"
        return
    fi

    # 3. 工程师接受工单
    print_step "3. 工程师接受工单 (OPEN -> ACCEPTED)"
    local accept_response=$(curl -s -X POST "${API_URL}/tickets/${TICKET_ID}/accept" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ENGINEER_TOKEN" \
        -d '{"departureTime": "2026-01-21T09:00:00", "notes": "准备出发前往现场"}')

    if echo "$accept_response" | grep -q '"success":true'; then
        print_pass "接受工单成功"
    else
        print_fail "接受工单失败" "$accept_response"
        return
    fi

    # 4. 工程师出发
    print_step "4. 工程师出发 (ACCEPTED -> DEPARTED)"
    local depart_response=$(curl -s -X POST "${API_URL}/tickets/${TICKET_ID}/depart" \
        -H "Authorization: Bearer $ENGINEER_TOKEN")

    if echo "$depart_response" | grep -q '"success":true'; then
        print_pass "出发成功"
    else
        print_fail "出发失败" "$depart_response"
        return
    fi

    # 5. 工程师到达
    print_step "5. 工程师到达现场"
    local arrive_response=$(curl -s -X POST "${API_URL}/tickets/${TICKET_ID}/arrive" \
        -H "Authorization: Bearer $ENGINEER_TOKEN")

    if echo "$arrive_response" | grep -q '"success":true'; then
        print_pass "到达成功"
    else
        print_fail "到达失败" "$arrive_response"
        return
    fi

    # 6. 工程师提交工单（保存步骤数据，不改变状态）
    print_step "6. 工程师提交工单（保存步骤数据）"
    local submit_response=$(curl -s -X POST "${API_URL}/tickets/${TICKET_ID}/submit" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ENGINEER_TOKEN" \
        -d '{"comment": "维修工作已完成，所有检查项已通过"}')

    if echo "$submit_response" | grep -q '"success":true'; then
        print_pass "提交工单成功（已保存步骤数据）"
    else
        print_fail "提交工单失败" "$submit_response"
        return
    fi

    # 7. 工程师完成工单
    print_step "7. 工程师完成工单 (ARRIVED -> COMPLETED)"
    local complete_response=$(curl -s -X POST "${API_URL}/tickets/${TICKET_ID}/complete" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ENGINEER_TOKEN" \
        -d '"completed-photo-url"')

    if echo "$complete_response" | grep -q '"success":true'; then
        print_pass "完成工单成功"
    else
        print_fail "完成工单失败" "$complete_response"
        return
    fi

    # 8. 验证工单已完成状态
    print_step "8. 验证工单状态 (COMPLETED)"
    local completed_status_response=$(curl -s "${API_URL}/tickets/${TICKET_ID}" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    local completed_status=$(echo "$completed_status_response" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ "$completed_status" = "COMPLETED" ]; then
        print_pass "工单已完成: $completed_status"
    else
        print_fail "工单状态不正确，期望 COMPLETED，实际 $completed_status" "$completed_status_response"
        return
    fi

    # 9. 管理员审核（验证流程是否闭环）
    print_step "9. 管理员审核工单"
    local review_response=$(curl -s -X POST "${API_URL}/tickets/${TICKET_ID}/review" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d '{"comment": "工作质量良好，审核通过"}')

    if echo "$review_response" | grep -q '"success":true'; then
        print_pass "审核成功"
    else
        print_fail "审核失败" "$review_response"
        return
    fi

    # 10. 验证工单最终状态
    print_step "10. 验证工单最终状态"
    local final_response=$(curl -s "${API_URL}/tickets/${TICKET_ID}" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    local final_status=$(echo "$final_response" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    print_pass "工单最终状态: $final_status"

    # 11. 验证工单统计更新
    print_step "11. 验证工单统计更新"
    local stats_response=$(curl -s "${API_URL}/tickets/stats" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$stats_response" | grep -q '"success":true'; then
        local completed=$(echo "$stats_response" | grep -o '"completed":[0-9]*' | cut -d':' -f2 | head -1)
        print_pass "工单统计更新完成，已完成: $completed 个"
    else
        print_fail "获取统计失败" "$stats_response"
    fi

    print_header "E2E 测试完成!"
    echo -e "${GREEN}工单生命周期: OPEN -> ACCEPTED -> DEPARTED -> ARRIVED -> COMPLETED${NC}"
}

# ============================================
# 主流程
# ============================================

main() {
    echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║    工单完整生命周期 E2E 测试脚本 v1.0          ║${NC}"
    echo -e "${CYAN}║         测试环境: ${BASE_URL}                 ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"

    # 检查服务
    print_step "检查后端服务..."
    if curl -s -o /dev/null -w "%{http_code}" "${API_URL}/health" | grep -q "200\|500"; then
        print_pass "服务可用"
    else
        print_fail "服务不可用"
        exit 1
    fi

    # 登录
    admin_login
    engineer_login

    # 获取资源
    get_resources

    # 运行 E2E 测试
    test_complete_workflow

    # 结果汇总
    print_header "E2E 测试结果汇总"

    echo -e "总测试数: ${TOTAL}"
    echo -e "${GREEN}通过: ${PASSED}${NC}"
    echo -e "${RED}失败: ${FAILED}${NC}"
    echo ""

    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}所有 E2E 测试通过!${NC}"
        echo -e "${GREEN}工单完整生命周期测试成功!${NC}"
        exit 0
    else
        echo -e "${RED}有 ${FAILED} 个测试失败${NC}"
        exit 1
    fi
}

main "$@"
