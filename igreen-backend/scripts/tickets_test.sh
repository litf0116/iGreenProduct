#!/bin/bash
# ============================================
# 工单管理模块测试脚本 (管理员操作)
# 测试工单的创建、更新、查询等管理操作
# 操作用户：管理员 (Admin)
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
TEMPLATE_ID=""
ENGINEER_ID=""
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
    print_header "管理员登录"

    print_step "管理员登录..."
    local login_response=$(curl -s -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"password123","country":"Thailand"}')

    ADMIN_TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

    if [ -n "$ADMIN_TOKEN" ]; then
        print_pass "管理员登录成功"
        echo "  Token: ${ADMIN_TOKEN:0:50}..."
    else
        print_fail "管理员登录失败" "$login_response"
    fi
}

# ============================================
# 工单 CRUD 测试
# ============================================

test_tickets_crud() {
    print_header "工单管理 CRUD 测试"

    # 1. 查询工单列表
    print_step "1. 查询工单列表"
    local list_response=$(curl -s "${API_URL}/tickets?page=0&size=10" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$list_response" | grep -q '"success":true'; then
        local ticket_count=$(echo "$list_response" | grep -o '"id":"[^"]*"' | wc -l)
        print_pass "获取工单列表成功，当前有 $ticket_count 个工单"
        echo "  Response: $(echo "$list_response" | head -c 200)"
    else
        print_fail "获取工单列表失败" "$list_response"
    fi

    # 2. 查询工单统计
    print_step "2. 查询工单统计"
    local stats_response=$(curl -s "${API_URL}/tickets/stats" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$stats_response" | grep -q '"success":true'; then
        local total=$(echo "$stats_response" | grep -o '"total":[0-9]*' | cut -d':' -f2 | head -1)
        local open=$(echo "$stats_response" | grep -o '"open":[0-9]*' | cut -d':' -f2 | head -1)
        local assigned=$(echo "$stats_response" | grep -o '"assigned":[0-9]*' | cut -d':' -f2 | head -1)
        local departed=$(echo "$stats_response" | grep -o '"departed":[0-9]*' | cut -d':' -f2 | head -1)
        local arrived=$(echo "$stats_response" | grep -o '"arrived":[0-9]*' | cut -d':' -f2 | head -1)
        local review=$(echo "$stats_response" | grep -o '"review":[0-9]*' | cut -d':' -f2 | head -1)
        local completed=$(echo "$stats_response" | grep -o '"completed":[0-9]*' | cut -d':' -f2 | head -1)
        print_pass "获取工单统计成功"
        echo "  总数: $total, 开放: $open, 已分配: $assigned, 已出发: $departed"
        echo "  已到达: $arrived, 待审核: $review, 已完成: $completed"
    else
        print_fail "获取工单统计失败" "$stats_response"
    fi

    # 3. 获取模板列表
    print_step "3. 获取模板列表"
    local templates_response=$(curl -s "${API_URL}/templates" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$templates_response" | grep -q '"success":true'; then
        TEMPLATE_ID=$(echo "$templates_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        print_pass "获取模板列表成功，使用模板: $TEMPLATE_ID"
    else
        print_fail "获取模板列表失败" "$templates_response"
        TEMPLATE_ID=""
    fi

    # 4. 获取工程师列表
    print_step "4. 获取工程师列表"
    local engineers_response=$(curl -s "${API_URL}/users/engineers" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$engineers_response" | grep -q '"success":true'; then
        ENGINEER_ID=$(echo "$engineers_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        print_pass "获取工程师列表成功，将分配给: $ENGINEER_ID"
    else
        print_fail "获取工程师列表失败" "$engineers_response"
        ENGINEER_ID=""
    fi

    # 5. 创建工单
    if [ -n "$TEMPLATE_ID" ] && [ -n "$ENGINEER_ID" ]; then
        print_step "5. 创建新工单"
        local create_data="{
            \"title\": \"测试工单_$(date +%s)\",
            \"description\": \"管理员创建的测试工单 - $(date)\",
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
            local created_title=$(echo "$create_response" | grep -o '"title":"[^"]*"' | head -1 | cut -d'"' -f4)
            print_pass "创建工单成功: $created_title (ID: $TICKET_ID)"
            echo "  Response: $(echo "$create_response" | head -c 300)"
        else
            print_fail "创建工单失败" "$create_response"
            TICKET_ID=""
        fi
    else
        print_info "跳过创建工单（缺少模板或工程师）"
    fi

    # 6. 获取单个工单详情
    if [ -n "$TICKET_ID" ]; then
        print_step "6. 获取工单详情"
        local detail_response=$(curl -s "${API_URL}/tickets/${TICKET_ID}" \
            -H "Authorization: Bearer $ADMIN_TOKEN")

        if echo "$detail_response" | grep -q '"success":true'; then
            local title=$(echo "$detail_response" | grep -o '"title":"[^"]*"' | head -1 | cut -d'"' -f4)
            local status=$(echo "$detail_response" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
            print_pass "获取工单详情成功: $title (状态: $status)"
        else
            print_fail "获取工单详情失败" "$detail_response"
        fi
    else
        print_info "跳过获取工单详情（创建失败）"
    fi

    # 7. 搜索工单
    print_step "7. 搜索工单"
    local search_response=$(curl -s "${API_URL}/tickets?keyword=测试&page=0&size=10" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$search_response" | grep -q '"success":true'; then
        print_pass "搜索工单成功"
    else
        print_fail "搜索工单失败" "$search_response"
    fi

    # 8. 分页查询
    print_step "8. 分页查询工单"
    local page_response=$(curl -s "${API_URL}/tickets?page=0&size=5" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$page_response" | grep -q '"success":true'; then
        print_pass "分页查询成功"
        echo "  Response: $(echo "$page_response" | head -c 200)"
    else
        print_fail "分页查询失败" "$page_response"
    fi

    # 9. 更新工单
    if [ -n "$TICKET_ID" ]; then
        print_step "9. 更新工单"
        local update_data="{
            \"title\": \"更新后的工单标题\",
            \"description\": \"这是更新后的描述\",
            \"priority\": \"P1\"
        }"

        local update_response=$(curl -s -X PUT "${API_URL}/tickets/${TICKET_ID}" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -d "$update_data")

        if echo "$update_response" | grep -q '"success":true'; then
            print_pass "更新工单成功"
        else
            print_fail "更新工单失败" "$update_response"
        fi
    else
        print_info "跳过更新工单（创建失败）"
    fi

    # 10. 获取我的工单（管理员）
    print_step "10. 获取我的工单"
    local my_tickets_response=$(curl -s "${API_URL}/tickets/my?page=0&size=10" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$my_tickets_response" | grep -q '"success":true'; then
        print_pass "获取我的工单成功"
    else
        print_fail "获取我的工单失败" "$my_tickets_response"
    fi
}

# ============================================
# 管理员审核操作测试
# ============================================

test_admin_review() {
    print_header "管理员审核操作测试"

    if [ -z "$TICKET_ID" ]; then
        print_info "没有可用的工单，跳过审核测试"
        return
    fi

    # 获取当前工单状态
    local current_status=$(curl -s "${API_URL}/tickets/${TICKET_ID}" \
        -H "Authorization: Bearer $ADMIN_TOKEN" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)

    print_info "工单 $TICKET_ID 当前状态: $current_status"

    # 只有当工单处于 review 状态时才能审核
    if [ "$current_status" = "review" ]; then
        print_step "11. 审核通过"
        local review_response=$(curl -s -X POST "${API_URL}/tickets/${TICKET_ID}/review" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -d '{"approved": true, "comment": "审核通过，工作质量良好"}')

        if echo "$review_response" | grep -q '"success":true'; then
            print_pass "审核通过成功"
        else
            print_fail "审核失败" "$review_response"
        fi

        # 验证最终状态
        print_step "12. 验证工单最终状态"
        local final_response=$(curl -s "${API_URL}/tickets/${TICKET_ID}" \
            -H "Authorization: Bearer $ADMIN_TOKEN")

        if echo "$final_response" | grep -q '"success":true'; then
            local final_status=$(echo "$final_response" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
            print_pass "工单最终状态: $final_status"
        else
            print_fail "验证失败" "$final_response"
        fi
    else
        print_info "跳过审核测试（工单不在 review 状态，需要工程师完成状态流转）"
        print_info "请先运行 engineer_test.sh 完成状态流转后再测试审核功能"
    fi
}

# ============================================
# 异常场景测试
# ============================================

test_tickets_edge_cases() {
    print_header "工单异常场景测试"

    # 1. 查询不存在的工单
    print_step "1. 查询不存在的工单"
    local not_found_response=$(curl -s "${API_URL}/tickets/non-existent-id" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$not_found_response" | grep -q '"success":false'; then
        print_pass "不存在的工单被正确拒绝"
    else
        print_fail "不存在的工单应该返回失败" "$not_found_response"
    fi

    # 2. 无 Token 访问
    print_step "2. 无 Token 访问工单列表"
    local no_token_response=$(curl -s "${API_URL}/tickets?page=0&size=10")

    if echo "$no_token_response" | grep -q '"success":false'; then
        print_pass "无 Token 访问被正确拒绝"
    else
        print_fail "无 Token 应该被拒绝" "$no_token_response"
    fi

    # 3. 无效 Token 访问
    print_step "3. 无效 Token 访问"
    local invalid_token_response=$(curl -s "${API_URL}/tickets?page=0&size=10" \
        -H "Authorization: Bearer invalid-token-12345")

    if echo "$invalid_token_response" | grep -q '"success":false'; then
        print_pass "无效 Token 被正确拒绝"
    else
        print_fail "无效 Token 应该被拒绝" "$invalid_token_response"
    fi

    # 4. 创建工单 - 空标题
    if [ -n "$ENGINEER_ID" ]; then
        print_step "4. 创建工单 - 空标题"
        local empty_title_response=$(curl -s -X POST "${API_URL}/tickets" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -d '{"title":"","description":"测试","type":"CORRECTIVE","priority":"P2","assignedTo":"'"$ENGINEER_ID"'","dueDate":"2026-02-01T00:00:00"}')

        if echo "$empty_title_response" | grep -q '"success":false'; then
            print_pass "空标题被正确拒绝"
        else
            print_fail "空标题应该被拒绝" "$empty_title_response"
        fi
    fi

    # 5. 接受无效工单
    print_step "5. 接受无效工单"
    local invalid_accept=$(curl -s -X POST "${API_URL}/tickets/invalid-id/accept" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$invalid_accept" | grep -q '"success":false'; then
        print_pass "无效工单接受被正确拒绝"
    else
        print_fail "无效工单接受应该失败" "$invalid_accept"
    fi

    # 6. 未授权访问其他用户工单
    print_step "6. 越权访问测试"
    local unauthorized_response=$(curl -s "${API_URL}/tickets/${TICKET_ID}" \
        -H "Authorization: Bearer invalid-token")

    if echo "$unauthorized_response" | grep -q '"success":false'; then
        print_pass "越权访问被正确拒绝"
    else
        print_fail "越权访问应该被拒绝" "$unauthorized_response"
    fi
}

# ============================================
# 主流程
# ============================================

main() {
    echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║       工单管理模块测试脚本 v1.0 (管理员)       ║${NC}"
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

    # 管理员登录
    admin_login

    if [ -z "$ADMIN_TOKEN" ]; then
        print_fail "无法获取管理员 Token，测试终止"
        exit 1
    fi

    # 运行测试
    test_tickets_crud
    test_admin_review
    test_tickets_edge_cases

    # 结果汇总
    print_header "测试结果汇总"

    echo -e "总测试数: ${TOTAL}"
    echo -e "${GREEN}通过: ${PASSED}${NC}"
    echo -e "${RED}失败: ${FAILED}${NC}"
    echo ""

    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}所有测试通过!${NC}"
        exit 0
    else
        echo -e "${RED}有 ${FAILED} 个测试失败${NC}"
        exit 1
    fi
}

main "$@"
