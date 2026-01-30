#!/bin/bash

# ============================================
# iGreen API 接口测试脚本
# 用法: ./api_test.sh [base_url] [port]
# 默认: http://localhost 8000
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 默认配置
BASE_URL="${1:-http://localhost}"
PORT="${2:-8000}"
BASE_URL="${BASE_URL}:${PORT}"
API_URL="${BASE_URL}/api"

# 测试结果统计
TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0

# Token 存储
ADMIN_TOKEN=""
USER_TOKEN=""

# ============================================
# 工具函数
# ============================================

get_admin_token() {
    if [ -z "$ADMIN_TOKEN" ]; then
        local admin_login=$(curl -s -X POST "${API_URL}/auth/login" \
            -H "Content-Type: application/json" \
            -d '{"username":"admin","password":"password123","country":"Thailand"}')

        ADMIN_TOKEN=$(extract_token "$admin_login")

        if [ -z "$ADMIN_TOKEN" ]; then
            print_info "无法获取管理员 Token，尝试创建管理员用户..."
        fi
    fi
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
    ((TOTAL++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
    ((TOTAL++))
}

print_skip() {
    echo -e "${YELLOW}[SKIP]${NC} $1"
    ((SKIPPED++))
    ((TOTAL++))
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# 发送请求并检查结果
test_api() {
    local name="$1"
    local method="$2"
    local path="$3"
    local data="$4"
    local expect_code="$5"
    local token="$6"

    print_test "$name (${method} ${API_URL}${path})"

    local curl_args=("-s" "-X" "$method")
    local url="${API_URL}${path}"

    curl_args+=("-H" "Content-Type: application/json")

    if [ -n "$token" ]; then
        curl_args+=("-H" "Authorization: Bearer $token")
    fi

    if [ -n "$data" ]; then
        curl_args+=("-d" "$data")
    fi

    local response=$(curl "${curl_args[@]}" "$url")
    local http_code=$(curl "${curl_args[@]}" -o /dev/null -w "%{http_code}" "$url")

    if [ "$http_code" == "$expect_code" ]; then
        print_pass "$name - HTTP $http_code"
        echo "  Response: $(echo "$response" | head -c 200)"
        return 0
    else
        print_fail "$name - Expected $expect_code, got $http_code"
        echo "  Response: $(echo "$response" | head -c 300)"
        return 1
    fi
}

# 提取 Token
extract_token() {
    local response="$1"
    echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4
}

# ============================================
# 测试用例
# ============================================

test_health() {
    print_header "1. 健康检查测试"
    test_api "健康检查" "GET" "/health" "" "200"
}

test_auth() {
    print_header "2. 认证接口测试"

    local timestamp=$(date +%s)

    # 测试注册
    local register_response=$(curl -s -X POST "${API_URL}/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"测试用户\",\"username\":\"apitest${timestamp}\",\"email\":\"apitest${timestamp}@test.com\",\"password\":\"password123\",\"country\":\"Thailand\"}")

    if echo "$register_response" | grep -q "success"; then
        USER_TOKEN=$(extract_token "$register_response")
        print_pass "用户注册成功"
    else
        print_info "用户可能已存在，尝试登录..."
        local login_response=$(curl -s -X POST "${API_URL}/auth/login" \
            -H "Content-Type: application/json" \
            -d '{"username":"apitest","password":"password123","country":"Thailand"}')
        USER_TOKEN=$(extract_token "$login_response")
    fi

    # 测试登录
    local login_response=$(curl -s -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"password123","country":"Thailand"}')

    if echo "$login_response" | grep -q "accessToken"; then
        ADMIN_TOKEN=$(extract_token "$login_response")
        print_pass "管理员登录成功"
    else
        print_fail "管理员登录失败"
    fi

    # 测试获取当前用户
    if [ -n "$ADMIN_TOKEN" ]; then
        test_api "获取当前用户" "GET" "/auth/me" "" "200" "$ADMIN_TOKEN"
    else
        print_skip "获取当前用户 (无 Token)"
    fi

    # 测试 Token 刷新
    if [ -n "$ADMIN_TOKEN" ]; then
        local refresh_t=$(echo "$login_response" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$refresh_t" ]; then
            local refresh_response=$(curl -s -X POST "${API_URL}/auth/refresh" \
                -H "Content-Type: application/json" \
                -d "{\"refreshToken\":\"$refresh_t\"}")
            if echo "$refresh_response" | grep -q "accessToken"; then
                print_pass "Token刷新成功"
            else
                print_fail "Token刷新失败"
            fi
        fi
    fi

    # 测试错误登录
    print_test "错误密码登录（应该失败）"
    local wrong_login=$(curl -s -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"wrongpassword","country":"Thailand"}')
    if echo "$wrong_login" | grep -q '"success":false'; then
        print_pass "错误密码登录被正确拒绝"
    else
        print_fail "错误密码登录应该失败"
    fi

    # 测试无效Token
    print_test "无效Token访问（应该失败）"
    local unauth=$(curl -s "$API_PREFIX/users" \
        -H "Authorization: Bearer invalid-token")
    if echo "$unauth" | grep -q '"success":false'; then
        print_pass "无效Token被正确拒绝"
    else
        print_fail "无效Token应该被拒绝"
    fi
}

test_users() {
    print_header "3. 用户接口测试"

    get_admin_token

    if [ -n "$ADMIN_TOKEN" ]; then
        test_api "用户列表" "GET" "/users?page=0&size=10" "" "200" "$ADMIN_TOKEN"
        test_api "搜索用户" "GET" "/users?keyword=admin&page=0&size=10" "" "200" "$ADMIN_TOKEN"
    else
        print_skip "用户接口 (无管理员 Token)"
    fi
}

test_tickets() {
    print_header "4. 工单接口测试"

    get_admin_token

    if [ -n "$ADMIN_TOKEN" ]; then
        test_api "工单列表" "GET" "/tickets?page=0&size=10" "" "200" "$ADMIN_TOKEN"
        test_api "工单统计" "GET" "/tickets/stats" "" "200" "$ADMIN_TOKEN"
    else
        print_skip "工单接口 (无 Token)"
    fi
}

test_configs() {
    print_header "5. 配置接口测试"

    get_admin_token

    if [ -n "$ADMIN_TOKEN" ]; then
        test_api "SLA 配置列表" "GET" "/configs/sla-configs" "" "200" "$ADMIN_TOKEN"
        test_api "问题类型列表" "GET" "/configs/problem-types" "" "200" "$ADMIN_TOKEN"
        test_api "站点级别配置" "GET" "/configs/site-level-configs" "" "200" "$ADMIN_TOKEN"
    else
        print_skip "配置接口 (无 Token)"
    fi
}

test_sites() {
    print_header "6. 站点接口测试"

    get_admin_token

    if [ -n "$ADMIN_TOKEN" ]; then
        test_api "站点列表" "GET" "/sites?page=1&size=10" "" "200" "$ADMIN_TOKEN"
        test_api "站点统计" "GET" "/sites/stats" "" "200" "$ADMIN_TOKEN"
    else
        print_skip "站点接口 (无 Token)"
    fi
}

test_groups() {
    print_header "7. 分组接口测试"

    get_admin_token

    if [ -n "$ADMIN_TOKEN" ]; then
        test_api "分组列表" "GET" "/groups" "" "200" "$ADMIN_TOKEN"
    else
        print_skip "分组接口 (无 Token)"
    fi
}

test_templates() {
    print_header "8. 模板接口测试"

    get_admin_token

    if [ -n "$ADMIN_TOKEN" ]; then
        test_api "模板列表" "GET" "/templates" "" "200" "$ADMIN_TOKEN"
    else
        print_skip "模板接口 (无 Token)"
    fi
}

# ============================================
# 主流程
# ============================================

main() {
    echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         iGreen API 接口测试脚本 v2.0           ║${NC}"
    echo -e "${BLUE}║         测试环境: ${BASE_URL}                 ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"

    # 检查服务是否可用
    print_test "检查服务可用性..."
    if curl -s -o /dev/null -w "%{http_code}" "${API_URL}/health" | grep -q "200\|500"; then
        print_pass "服务可用"
    else
        print_fail "服务不可用，请确保服务已启动"
        echo "启动命令: cd igreen-backend && mvn spring-boot:run"
        exit 1
    fi

    # 等待服务完全启动
    sleep 2

    # 运行测试
    test_health
    test_auth
    test_users
    test_tickets
    test_configs
    test_sites
    test_groups
    test_templates

    # 输出结果汇总
    print_header "测试结果汇总"

    echo -e "总测试数: ${TOTAL}"
    echo -e "${GREEN}通过: ${PASSED}${NC}"
    echo -e "${RED}失败: ${FAILED}${NC}"
    echo -e "${YELLOW}跳过: ${SKIPPED}${NC}"
    echo ""

    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}所有测试通过!${NC}"
        exit 0
    else
        echo -e "${RED}有 ${FAILED} 个测试失败${NC}"
        exit 1
    fi
}

# 运行主函数
main "$@"
