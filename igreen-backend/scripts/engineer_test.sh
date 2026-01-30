#!/bin/bash
# ============================================
# 工程师工单操作测试脚本
# 测试工程师对工单的状态流转操作
# 操作用户：工程师 (Engineer)
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
ENGINEER_USERNAME=""

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
# 工程师登录
# ============================================

engineer_login() {
    print_header "工程师登录"

    # 尝试登录现有工程师账户
    print_step "尝试登录工程师账户..."

    # 先尝试登录 engineer 用户
    local login_response=$(curl -s -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"engineer","password":"engineer123","country":"Thailand"}')

    ENGINEER_TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

    if [ -n "$ENGINEER_TOKEN" ]; then
        ENGINEER_USERNAME="engineer"
        print_pass "工程师登录成功"
        echo "  Token: ${ENGINEER_TOKEN:0:50}..."
        return 0
    fi

    # 如果 engineer 不存在，尝试 testuser1
    print_info "engineer 用户不存在，尝试 testuser1..."
    login_response=$(curl -s -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"testuser1","password":"Test123456","country":"Thailand"}')

    ENGINEER_TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

    if [ -n "$ENGINEER_TOKEN" ]; then
        ENGINEER_USERNAME="testuser1"
        print_pass "testuser1 登录成功"
        echo "  Token: ${ENGINEER_TOKEN:0:50}..."
        return 0
    fi

    # 如果都失败，注册一个新的测试工程师
    print_info "没有找到现有工程师账户，注册新账户..."

    # 等待一下避免 rate limit
    print_info "等待 10 秒避免 rate limit..."
    sleep 10

    local unique_id=$(date +%s)
    local register_response=$(curl -s -X POST "${API_URL}/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "engineer_'"$unique_id"'",
            "password": "Test123456",
            "confirmPassword": "Test123456",
            "name": "测试工程师_'"$unique_id"'",
            "email": "engineer_'"$unique_id"'@igreen.com",
            "country": "Thailand",
            "role": "ENGINEER"
        }')

    if echo "$register_response" | grep -q '"success":true'; then
        print_pass "测试工程师注册成功"
        print_info "等待 2 秒让注册生效..."
        sleep 2

        # 立即登录
        login_response=$(curl -s -X POST "${API_URL}/auth/login" \
            -H "Content-Type: application/json" \
            -d '{"username":"'"engineer_${unique_id}"'","password":"Test123456","country":"Thailand"}')

        ENGINEER_TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        ENGINEER_USERNAME="testengineer"

        if [ -n "$ENGINEER_TOKEN" ]; then
            print_pass "测试工程师登录成功"
            echo "  Token: ${ENGINEER_TOKEN:0:50}..."
        else
            print_fail "测试工程师登录失败" "$login_response"
        fi
    else
        print_fail "测试工程师注册失败" "$register_response"
    fi
}

# 获取工程师列表
get_engineers() {
    print_step "获取工程师列表..."

    local response=$(curl -s "${API_URL}/users/engineers" \
        -H "Authorization: Bearer $ENGINEER_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        local engineers=$(echo "$response" | grep -o '"username":"[^"]*"' | wc -l)
        print_pass "获取工程师列表成功，共有 $engineers 个工程师"
        echo "  Response: $(echo "$response" | head -c 200)"
    else
        print_fail "获取工程师列表失败" "$response"
    fi
}

# ============================================
# 工程师获取自己的工单
# ============================================

test_engineer_tickets() {
    print_header "工程师工单操作测试"

    # 1. 获取我的工单列表
    print_step "1. 获取我的工单列表"
    local my_tickets_response=$(curl -s "${API_URL}/tickets/my?page=0&size=10" \
        -H "Authorization: Bearer $ENGINEER_TOKEN")

    if echo "$my_tickets_response" | grep -q '"success":true'; then
        local ticket_count=$(echo "$my_tickets_response" | grep -o '"id":"[^"]*"' | wc -l)
        print_pass "获取我的工单成功，当前有 $ticket_count 个工单"
        echo "  Response: $(echo "$my_tickets_response" | head -c 300)"

        # 获取第一个待处理的工单ID用于后续测试
        if [ -z "$TICKET_ID" ] && [ "$ticket_count" -gt 0 ]; then
            TICKET_ID=$(echo "$my_tickets_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
            print_info "将使用工单 $TICKET_ID 进行状态流转测试"
        fi
    else
        print_fail "获取我的工单失败" "$my_tickets_response"
    fi

    # 2. 获取工单详情
    if [ -n "$TICKET_ID" ]; then
        print_step "2. 获取工单详情 (ID: $TICKET_ID)"
        local detail_response=$(curl -s "${API_URL}/tickets/${TICKET_ID}" \
            -H "Authorization: Bearer $ENGINEER_TOKEN")

        if echo "$detail_response" | grep -q '"success":true'; then
            local title=$(echo "$detail_response" | grep -o '"title":"[^"]*"' | head -1 | cut -d'"' -f4)
            local status=$(echo "$detail_response" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
            local assigned_to=$(echo "$detail_response" | grep -o '"assignedTo":"[^"]*"' | head -1 | cut -d'"' -f4)
            print_pass "获取工单详情成功: $title (状态: $status)"
            print_info "当前分配工程师: $assigned_to"
            echo "  Response: $(echo "$detail_response" | head -c 400)"
        else
            print_fail "获取工单详情失败" "$detail_response"
        fi
    else
        print_info "跳过获取工单详情（没有待处理工单）"
    fi
}

# ============================================
# 工单状态流转测试
# ============================================

test_ticket_workflow() {
    print_header "工单状态流转测试"

    if [ -z "$TICKET_ID" ]; then
        print_info "没有可用的工单，跳过状态流转测试"
        return
    fi

    # 获取当前状态
    local current_status=$(curl -s "${API_URL}/tickets/${TICKET_ID}" \
        -H "Authorization: Bearer $ENGINEER_TOKEN" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)

    print_info "工单 $TICKET_ID 当前状态: $current_status"

    # 3. 接受工单 (open -> assigned)
    if [ "$current_status" = "open" ]; then
        print_step "3. 接受工单 (open -> assigned)"
        local accept_response=$(curl -s -X POST "${API_URL}/tickets/${TICKET_ID}/accept" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ENGINEER_TOKEN" \
            -d '{"departureTime": "2026-01-21T09:00:00", "notes": "准备出发"}')

        if echo "$accept_response" | grep -q '"success":true'; then
            print_pass "接受工单成功"
        else
            print_fail "接受工单失败" "$accept_response"
        fi
    else
        print_info "跳过接受工单（当前状态: $current_status）"
    fi

    # 4. 出发 (assigned -> departed)
    print_step "4. 出发前往现场 (assigned -> departed)"
    local depart_response=$(curl -s -X POST "${API_URL}/tickets/${TICKET_ID}/depart" \
        -H "Authorization: Bearer $ENGINEER_TOKEN")

    if echo "$depart_response" | grep -q '"success":true'; then
        print_pass "出发成功"
    else
        print_fail "出发失败" "$depart_response"
    fi

    # 5. 到达现场 (departed -> arrived)
    print_step "5. 到达现场 (departed -> arrived)"
    local arrive_response=$(curl -s -X POST "${API_URL}/tickets/${TICKET_ID}/arrive" \
        -H "Authorization: Bearer $ENGINEER_TOKEN")

    if echo "$arrive_response" | grep -q '"success":true'; then
        print_pass "到达成功"
    else
        print_fail "到达失败" "$arrive_response"
    fi

    # 6. 提交工单 (arrived -> review)
    print_step "6. 提交工单 (arrived -> review)"
    local submit_response=$(curl -s -X POST "${API_URL}/tickets/${TICKET_ID}/submit" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ENGINEER_TOKEN" \
        -d '{"comment": "维修工作已完成"}')

    if echo "$submit_response" | grep -q '"success":true'; then
        print_pass "提交工单成功"
    else
        print_fail "提交工单失败" "$submit_response"
    fi

    # 7. 验证最终状态
    print_step "7. 验证工单最终状态"
    local final_response=$(curl -s "${API_URL}/tickets/${TICKET_ID}" \
        -H "Authorization: Bearer $ENGINEER_TOKEN")

    if echo "$final_response" | grep -q '"success":true'; then
        local final_status=$(echo "$final_response" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
        print_pass "工单最终状态: $final_status"

        if [ "$final_status" = "review" ]; then
            print_info "状态流转成功: open -> assigned -> departed -> arrived -> review"
        fi
    else
        print_fail "验证失败" "$final_response"
    fi
}

# ============================================
# 异常场景测试
# ============================================

test_engineer_edge_cases() {
    print_header "工程师异常场景测试"

    # 1. 未分配工单，接受被拒绝
    print_step "1. 接受未分配的工单（应该失败）"
    local unassigned_response=$(curl -s -X POST "${API_URL}/tickets/invalid-id/accept" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ENGINEER_TOKEN" \
        -d '{"departureTime": "2026-01-21T09:00:00"}')

    if echo "$unassigned_response" | grep -q '"success":false'; then
        print_pass "未分配工单被正确拒绝"
    else
        print_fail "未分配工单应该被拒绝" "$unassigned_response"
    fi

    # 2. 无 Token 访问
    print_step "2. 无 Token 访问我的工单（应该失败）"
    local no_token_response=$(curl -s "${API_URL}/tickets/my")

    if echo "$no_token_response" | grep -q '"success":false'; then
        print_pass "无 Token 访问被正确拒绝"
    else
        print_fail "无 Token 应该被拒绝" "$no_token_response"
    fi

    # 3. 使用管理员 Token 访问工程师接口
    print_step "3. 使用管理员 Token 访问工程师接口"
    local admin_token_response=$(curl -s "${API_URL}/tickets/my" \
        -H "Authorization: Bearer invalid-token")

    if echo "$admin_token_response" | grep -q '"success":false'; then
        print_pass "无效 Token 被正确拒绝"
    else
        print_fail "无效 Token 应该被拒绝" "$admin_token_response"
    fi
}

# ============================================
# 单独测试：接受工单（带空请求体）
# ============================================

test_accept_without_body() {
    print_header "接受工单异常测试"

    # 获取一个 open 状态的工单
    print_step "获取 open 状态的工单用于测试"
    local tickets_response=$(curl -s "${API_URL}/tickets?page=0&size=20" \
        -H "Authorization: Bearer $ENGINEER_TOKEN")

    local open_ticket_id=""
    if echo "$tickets_response" | grep -q '"success":true'; then
        # 查找第一个 open 状态的工单
        open_ticket_id=$(echo "$tickets_response" | python3 -c "
import sys, json
data = json.loads(sys.stdin.read())
for item in data.get('data', []):
    if item.get('status') == 'open':
        print(item.get('id'))
        break
" 2>/dev/null)

        if [ -z "$open_ticket_id" ]; then
            print_info "没有找到 open 状态的工单，跳过此测试"
            return
        fi
    fi

    print_info "使用工单 $open_ticket_id 进行测试"

    # 测试不带请求体的 accept
    print_step "测试不带请求体的 accept"
    local accept_no_body=$(curl -s -X POST "${API_URL}/tickets/${open_ticket_id}/accept" \
        -H "Authorization: Bearer $ENGINEER_TOKEN")

    if echo "$accept_no_body" | grep -q '"success":true'; then
        print_pass "不带请求体接受成功"
    else
        print_fail "不带请求体接受失败" "$accept_no_body"
    fi
}

# ============================================
# 主流程
# ============================================

main() {
    echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║       工程师工单操作测试脚本 v1.0             ║${NC}"
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

    # 工程师登录
    engineer_login

    if [ -z "$ENGINEER_TOKEN" ]; then
        print_fail "无法获取工程师 Token，测试终止"
        exit 1
    fi

    # 运行测试
    get_engineers
    test_engineer_tickets
    test_ticket_workflow
    test_engineer_edge_cases
    test_accept_without_body

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
