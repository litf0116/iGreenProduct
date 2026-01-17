#!/bin/bash

# ============================================
# iGreen API 接口测试脚本
# 用法: ./api_test.sh [base_url] [port]
# 默认: http://localhost 8000
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
# ====================================

get_admin_token() {
    if [ -z "$ADMIN_TOKEN" ]; then
        local admin_login=$(curl -s -X POST "${API_URL}/auth/login" \
            -H "Content-Type: application/json" \
            -d '{"email":"admin@igreen.com","password":"password123","country":"CN"}')

        ADMIN_TOKEN=$(extract_token "$admin_login")

        if [ -z "$ADMIN_TOKEN" ]; then
            print_info "无法获取管理员 Token，尝试创建管理员用户..."
        fi
    fi
}========

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
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
# 用法: test_api "测试名称" "方法" "路径" "数据" "期望状态码" "Token"
test_api() {
    local name="$1"
    local method="$2"
    local path="$3"
    local data="$4"
    local expect_code="$5"
    local token="$6"

    print_test "$name (${method} ${API_URL}${path})"

    # 构建 curl 参数
    local curl_args=("-s" "-X" "$method")
    local url="${API_URL}${path}"

    # 添加 Headers
    curl_args+=("-H" "Content-Type: application/json")

    # 添加 Token
    if [ -n "$token" ]; then
        curl_args+=("-H" "Authorization: Bearer $token")
    fi

    # 添加数据
    if [ -n "$data" ]; then
        curl_args+=("-d" "$data")
    fi

    # 发送请求
    local response=$(curl "${curl_args[@]}" "$url")
    local http_code=$(curl "${curl_args[@]}" -o /dev/null -w "%{http_code}" "$url")

    # 检查状态码
    if [ "$http_code" == "$expect_code" ]; then
        print_pass "$name - HTTP $http_code"
        echo "  Response: $(echo "$response" | head -c 200)"
        echo "$response" > "/tmp/test_${name// /_}.json"
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

    # 测试注册
    local register_response=$(curl -s -X POST "${API_URL}/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"name":"测试用户","username":"apitest","email":"apitest@test.com","password":"password123"}')

    if echo "$register_response" | grep -q "success"; then
        USER_TOKEN=$(extract_token "$register_response")
        print_pass "用户注册成功"
    else
        # 如果已存在，尝试登录
        print_info "用户已存在，尝试登录..."
        local login_response=$(curl -s -X POST "${API_URL}/auth/login" \
            -H "Content-Type: application/json" \
            -d '{"email":"apitest@test.com","password":"password123"}')
        USER_TOKEN=$(extract_token "$login_response")
    fi

    # 测试登录
    local login_response=$(curl -s -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"apitest@test.com","password":"password123"}')

    if echo "$login_response" | grep -q "accessToken"; then
        USER_TOKEN=$(extract_token "$login_response")
        print_pass "用户登录成功"
    else
        print_fail "用户登录失败"
    fi

    # 测试获取当前用户
    if [ -n "$USER_TOKEN" ]; then
        test_api "获取当前用户" "GET" "/auth/me" "" "200" "$USER_TOKEN"
    else
        print_skip "获取当前用户 (无 Token)"
    fi
}

test_users() {
    print_header "3. 用户接口测试"

    if [ -z "$USER_TOKEN" ]; then
        print_skip "用户列表 (无 Token)"
        return
    fi

    # 测试工程师列表
    test_api "工程师列表" "GET" "/users/engineers" "" "200" "$USER_TOKEN"

    # 测试用户列表 (需要管理员权限)
    # 先用管理员登录
    local admin_login=$(curl -s -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@igreen.com","password":"password123"}')

    ADMIN_TOKEN=$(extract_token "$admin_login")

    if [ -n "$ADMIN_TOKEN" ]; then
        test_api "用户列表" "GET" "/users?page=1&size=10" "" "200" "$ADMIN_TOKEN"
    else
        print_skip "用户列表 (无管理员 Token)"
    fi
}

test_tickets() {
    print_header "4. 工单接口测试"

    if [ -z "$USER_TOKEN" ]; then
        print_skip "工单接口 (无 Token)"
        return
    fi

    test_api "待办工单" "GET" "/tickets/pending" "" "200" "$USER_TOKEN"
    test_api "已完成工单" "GET" "/tickets/completed?page=1&size=10" "" "200" "$USER_TOKEN"
    test_api "我的工单" "GET" "/tickets/my?page=1&size=10&status=" "" "200" "$USER_TOKEN"
}

test_configs() {
    print_header "5. 配置接口测试"

    if [ -z "$USER_TOKEN" ]; then
        print_skip "配置接口 (无 Token)"
        return
    fi

    test_api "SLA 配置列表" "GET" "/configs/sla-configs" "" "200" "$USER_TOKEN"
    test_api "问题类型列表" "GET" "/configs/problem-types" "" "200" "$USER_TOKEN"
    test_api "站点级别配置" "GET" "/configs/site-level-configs" "" "200" "$USER_TOKEN"

    print_info "--- 配置增删改测试 (需要管理员权限) ---"

    get_admin_token

    if [ -n "$ADMIN_TOKEN" ]; then
        test_api "创建 SLA 配置" "POST" "/configs/sla-configs" \
            '{"priority":"P3","responseTimeMinutes":180,"completionTimeHours":12}' "200" "$ADMIN_TOKEN"

        test_api "创建问题类型" "POST" "/configs/problem-types" \
            '{"name":"网络故障","description":"网络连接问题排查"}' "200" "$ADMIN_TOKEN"

        test_api "创建站点级别配置" "POST" "/configs/site-level-configs" \
            '{"levelName":"普通站点","description":"普通站点配置","maxConcurrentTickets":5,"escalationTimeHours":4}' "200" "$ADMIN_TOKEN"

        test_api "更新问题类型" "POST" "/configs/problem-types/prob-001" \
            '{"name":"硬件故障-更新","description":"更新后的描述"}' "200" "$ADMIN_TOKEN"

        test_api "更新站点级别配置" "POST" "/configs/site-level-configs/level-1" \
            '{"levelName":"VIP-更新","description":"VIP站点更新配置","maxConcurrentTickets":5,"escalationTimeHours":3}' "200" "$ADMIN_TOKEN"

        test_api "删除 SLA 配置" "DELETE" "/configs/sla-configs/sla-3" "" "200" "$ADMIN_TOKEN"

        test_api "删除问题类型" "DELETE" "/configs/problem-types/prob-003" "" "200" "$ADMIN_TOKEN"

        test_api "删除站点级别配置" "DELETE" "/configs/site-level-configs/level-3" "" "200" "$ADMIN_TOKEN"
    else
        print_skip "配置增删改测试 (无法获取管理员 Token)"
    fi
}

test_sites() {
    print_header "6. 站点接口测试"

    if [ -z "$USER_TOKEN" ]; then
        print_skip "站点接口 (无 Token)"
        return
    fi

    test_api "站点列表" "GET" "/sites?page=1&size=10" "" "200" "$USER_TOKEN"
    test_api "站点统计" "GET" "/sites/stats" "" "200" "$USER_TOKEN"

    print_info "--- 站点增删改测试 (需要管理员/Manager权限) ---"

    get_admin_token

    if [ -n "$ADMIN_TOKEN" ]; then
        test_api "创建站点" "POST" "/sites" \
            '{"name":"API测试站点","address":"测试地址","level":"normal","status":"ONLINE"}' "200" "$ADMIN_TOKEN"

        test_api "获取站点详情" "GET" "/sites/site-1" "" "200" "$USER_TOKEN"

        test_api "更新站点" "POST" "/sites/site-1" \
            '{"name":"API测试站点-更新","address":"更新后的地址","level":"VIP","status":"ONLINE"}' "200" "$ADMIN_TOKEN"

        test_api "删除站点" "DELETE" "/sites/site-3" "" "200" "$ADMIN_TOKEN"
    else
        print_skip "站点增删改测试 (无法获取管理员 Token)"
    fi
}

test_groups() {
    print_header "7. 分组接口测试"

    if [ -z "$USER_TOKEN" ]; then
        print_skip "分组接口 (无 Token)"
        return
    fi

    test_api "分组列表" "GET" "/groups" "" "200" "$USER_TOKEN"
}

test_templates() {
    print_header "8. 模板接口测试"

    if [ -z "$USER_TOKEN" ]; then
        print_skip "模板接口 (无 Token)"
        return
    fi

    test_api "模板列表" "GET" "/templates" "" "200" "$USER_TOKEN"
    test_api "模板详情" "GET" "/templates/tmpl-001" "" "200" "$USER_TOKEN"

    print_info "--- 模板增删改测试 (需要管理员权限) ---"

    get_admin_token

    if [ -n "$ADMIN_TOKEN" ]; then
        test_api "创建模板" "POST" "/templates" \
            '{"name":"API测试模板","description":"通过API创建的模板","steps":[{"name":"步骤1","description":"第一步","order":1,"fields":[{"name":"字段1","type":"TEXT","required":true}]}]}' "200" "$ADMIN_TOKEN"

        test_api "更新模板" "PUT" "/templates/tmpl-001" \
            '{"name":"模板001-更新","description":"更新后的模板描述","steps":[{"name":"步骤1-更新","description":"更新后的步骤描述","order":1,"fields":[{"name":"字段1","type":"TEXT","required":true}]}]}' "200" "$ADMIN_TOKEN"

        test_api "删除模板" "DELETE" "/templates/tmpl-004" "" "200" "$ADMIN_TOKEN"
    else
        print_skip "模板增删改测试 (无法获取管理员 Token)"
    fi
}

test_files() {
    print_header "9. 文件接口测试"

    if [ -z "$USER_TOKEN" ]; then
        print_skip "文件接口 (无 Token)"
        return
    fi

    print_info "文件上传需要 multipart/form-data，跳过自动化测试"
}

# ============================================
# 主流程
# ============================================

main() {
    echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         iGreen API 接口测试脚本 v1.0           ║${NC}"
    echo -e "${BLUE}║         测试环境: ${BASE_URL}                 ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"

    # 检查服务是否可用
    print_test "检查服务可用性..."
    if curl -s -o /dev/null -w "%{http_code}" "${API_URL}/health" | grep -q "200\|500"; then
        print_pass "服务可用"
    else
        print_fail "服务不可用，请确保服务已启动"
        echo "启动命令: mvn spring-boot:run"
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
    test_files

    # 输出结果汇总
    print_header "测试结果汇总"

    echo -e "总测试数: ${TOTAL}"
    echo -e "${GREEN}通过: ${PASSED}${NC}"
    echo -e "${RED}失败: ${FAILED}${NC}"
    echo -e "${YELLOW}跳过: ${SKIPPED}${NC}"
    echo ""

    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ 所有测试通过!${NC}"
        exit 0
    else
        echo -e "${RED}❌ 有 ${FAILED} 个测试失败${NC}"
        exit 1
    fi
}

# 运行主函数
main "$@"
