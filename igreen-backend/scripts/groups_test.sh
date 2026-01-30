#!/bin/bash
# ============================================
# Groups 模块 CRUD 接口测试脚本
# 测试分组的创建、更新、查询、删除操作
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 配置
BASE_URL="${1:-http://localhost}"
PORT="${2:-8000}"
BASE_URL="${BASE_URL}:${PORT}"
API_URL="${BASE_URL}/api"

# 测试结果
TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0

# 存储测试数据
GROUP_ID=""
GROUP_NAME="TestGroup_$(date +%s)"

# Token
ADMIN_TOKEN=""

# ============================================
# 工具函数
# ============================================

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

print_result() {
    local result="$1"
    local response="$2"
    if [ "$result" == "0" ]; then
        print_pass "$response"
    else
        print_fail "$response" "$response"
    fi
}

# 获取管理员 Token
get_admin_token() {
    print_step "获取管理员 Token..."

    local login_response=$(curl -s -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"password123","country":"Thailand"}')

    ADMIN_TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

    if [ -n "$ADMIN_TOKEN" ]; then
        print_pass "获取管理员 Token 成功"
        print_info "Token: ${ADMIN_TOKEN:0:30}..."
    else
        print_fail "获取管理员 Token 失败" "$login_response"
    fi
}

# ============================================
# Groups CRUD 测试
# ============================================

test_groups_crud() {
    print_header "Groups 模块 CRUD 接口测试"

    # 1. 查询 - 获取分组列表
    print_step "1. 查询分组列表"
    local list_response=$(curl -s "${API_URL}/groups" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    if echo "$list_response" | grep -q '"success":true'; then
        local group_count=$(echo "$list_response" | grep -o '"id":"[^"]*"' | wc -l)
        print_pass "获取分组列表成功，当前有 $group_count 个分组"
        echo "  Response: $(echo "$list_response" | head -c 300)"
    else
        print_fail "获取分组列表失败" "$list_response"
    fi

    # 2. 创建 - 创建新分组
    print_step "2. 创建新分组"
    GROUP_NAME="TestGroup_$(date +%s)"
    local create_data="{\"name\":\"${GROUP_NAME}\",\"description\":\"测试分组 - 创建于 $(date)\",\"status\":\"ACTIVE\"}"
    
    local create_response=$(curl -s -X POST "${API_URL}/groups" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "$create_data")

    if echo "$create_response" | grep -q '"success":true'; then
        GROUP_ID=$(echo "$create_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        local created_name=$(echo "$create_response" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
        print_pass "创建分组成功: $created_name (ID: $GROUP_ID)"
        echo "  Response: $(echo "$create_response" | head -c 300)"
    else
        print_fail "创建分组失败" "$create_response"
        GROUP_ID=""
    fi

    # 3. 查询 - 获取单个分组详情
    if [ -n "$GROUP_ID" ]; then
        print_step "3. 查询单个分组详情 (ID: $GROUP_ID)"
        local detail_response=$(curl -s "${API_URL}/groups/${GROUP_ID}" \
            -H "Authorization: Bearer $ADMIN_TOKEN")
        
        if echo "$detail_response" | grep -q '"success":true'; then
            local detail_name=$(echo "$detail_response" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
            print_pass "获取分组详情成功: $detail_name"
            echo "  Response: $(echo "$detail_response" | head -c 300)"
        else
            print_fail "获取分组详情失败" "$detail_response"
        fi
    else
        print_info "跳过查询单个分组（创建失败）"
    fi

    # 4. 更新 - 更新分组信息
    if [ -n "$GROUP_ID" ]; then
        print_step "4. 更新分组信息 (ID: $GROUP_ID)"
        local update_data="{\"name\":\"${GROUP_NAME}_Updated\",\"description\":\"更新于 $(date)\",\"status\":\"ACTIVE\"}"
        
        local update_response=$(curl -s -X PUT "${API_URL}/groups/${GROUP_ID}" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -d "$update_data")

        if echo "$update_response" | grep -q '"success":true'; then
            local updated_name=$(echo "$update_response" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
            print_pass "更新分组成功: $updated_name"
            echo "  Response: $(echo "$update_response" | head -c 300)"
        else
            print_fail "更新分组失败" "$update_response"
        fi
    else
        print_info "跳过更新分组（创建失败）"
    fi

    # 5. 验证更新结果
    if [ -n "$GROUP_ID" ]; then
        print_step "5. 验证更新后的分组信息"
        local verify_response=$(curl -s "${API_URL}/groups/${GROUP_ID}" \
            -H "Authorization: Bearer $ADMIN_TOKEN")
        
        if echo "$verify_response" | grep -q "Updated"; then
            print_pass "验证成功，分组信息已更新"
            echo "  Response: $(echo "$verify_response" | head -c 300)"
        else
            print_fail "验证失败，分组信息未更新" "$verify_response"
        fi
    else
        print_info "跳过验证更新（创建失败）"
    fi

    # 6. 删除 - 删除分组
    if [ -n "$GROUP_ID" ]; then
        print_step "6. 删除分组 (ID: $GROUP_ID)"
        local delete_response=$(curl -s -X DELETE "${API_URL}/groups/${GROUP_ID}" \
            -H "Authorization: Bearer $ADMIN_TOKEN")
        
        if echo "$delete_response" | grep -q '"success":true'; then
            print_pass "删除分组成功"
            echo "  Response: $(echo "$delete_response" | head -c 300)"
        else
            print_fail "删除分组失败" "$delete_response"
        fi
    else
        print_info "跳过删除分组（创建失败）"
    fi

    # 7. 验证删除结果
    if [ -n "$GROUP_ID" ]; then
        print_step "7. 验证删除结果"
        local verify_delete=$(curl -s "${API_URL}/groups/${GROUP_ID}" \
            -H "Authorization: Bearer $ADMIN_TOKEN")
        
        if echo "$verify_delete" | grep -q '"success":false'; then
            print_pass "验证成功，分组已被删除"
        else
            print_fail "验证失败，分组仍然存在" "$verify_delete"
        fi
    else
        print_info "跳过验证删除（创建失败）"
    fi
}

# ============================================
# Groups 异常场景测试
# ============================================

test_groups_edge_cases() {
    print_header "Groups 模块异常场景测试"

    # 1. 创建分组 - 空名称
    print_step "1. 创建分组 - 空名称（应该失败）"
    local empty_name_response=$(curl -s -X POST "${API_URL}/groups" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d '{"name":"","description":"测试空名称"}')
    
    if echo "$empty_name_response" | grep -q '"success":false'; then
        print_pass "空名称被正确拒绝"
    else
        print_fail "空名称应该被拒绝" "$empty_name_response"
    fi

    # 2. 查询不存在的分组
    print_step "2. 查询不存在的分组（应该失败）"
    local not_found_response=$(curl -s "${API_URL}/groups/non-existent-id" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    if echo "$not_found_response" | grep -q '"success":false'; then
        print_pass "不存在的分组被正确拒绝"
    else
        print_fail "不存在的分组应该返回失败" "$not_found_response"
    fi

    # 3. 更新不存在的分组
    print_step "3. 更新不存在的分组（应该失败）"
    local update_not_found=$(curl -s -X PUT "${API_URL}/groups/non-existent-id" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d '{"name":"Test","description":"Test"}')
    
    if echo "$update_not_found" | grep -q '"success":false'; then
        print_pass "更新不存在的分组被正确拒绝"
    else
        print_fail "更新不存在的分组应该返回失败" "$update_not_found"
    fi

    # 4. 删除不存在的分组
    print_step "4. 删除不存在的分组（应该失败）"
    local delete_not_found=$(curl -s -X DELETE "${API_URL}/groups/non-existent-id" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    if echo "$delete_not_found" | grep -q '"success":false'; then
        print_pass "删除不存在的分组被正确拒绝"
    else
        print_fail "删除不存在的分组应该返回失败" "$delete_not_found"
    fi

    # 5. 无 Token 访问
    print_step "5. 无 Token 访问分组列表（应该失败）"
    local no_token_response=$(curl -s "${API_URL}/groups")
    
    if echo "$no_token_response" | grep -q '"success":false'; then
        print_pass "无 Token 访问被正确拒绝"
    else
        print_fail "无 Token 应该被拒绝" "$no_token_response"
    fi

    # 6. 无效 Token 访问
    print_step "6. 无效 Token 访问（应该失败）"
    local invalid_token_response=$(curl -s "${API_URL}/groups" \
        -H "Authorization: Bearer invalid-token-12345")
    
    if echo "$invalid_token_response" | grep -q '"success":false'; then
        print_pass "无效 Token 被正确拒绝"
    else
        print_fail "无效 Token 应该被拒绝" "$invalid_token_response"
    fi
}

# ============================================
# Users CRUD 测试
# ============================================

test_users_crud() {
    print_header "Users 模块 CRUD 接口测试"

    local test_username="TestUser_$(date +%s)"
    local test_email="testuser_$(date +%s)@igreen.com"

    # 1. 查询用户列表
    print_step "1. 查询用户列表"
    local user_list=$(curl -s "${API_URL}/users?page=0&size=10" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    if echo "$user_list" | grep -q '"success":true'; then
        local user_count=$(echo "$user_list" | grep -o '"id":"[^"]*"' | wc -l)
        print_pass "获取用户列表成功，当前有 $user_count 个用户"
    else
        print_fail "获取用户列表失败" "$user_list"
    fi

    # 2. 创建用户
    print_step "2. 创建新用户"
    local create_user_data="{\"name\":\"测试用户\",\"username\":\"${test_username}\",\"email\":\"${test_email}\",\"password\":\"Test123456\",\"role\":\"ENGINEER\",\"country\":\"Thailand\"}"
    
    local create_user_response=$(curl -s -X POST "${API_URL}/users" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "$create_user_data")

    if echo "$create_user_response" | grep -q '"success":true'; then
        local new_user_id=$(echo "$create_user_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        print_pass "创建用户成功 (ID: $new_user_id)"
    else
        print_fail "创建用户失败" "$create_user_response"
    fi

    # 3. 更新用户
    print_step "3. 更新用户信息"
    # 先搜索用户获取ID
    local search_user=$(curl -s "${API_URL}/users?keyword=${test_username}&page=0&size=10" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    local user_id=$(echo "$search_user" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$user_id" ]; then
        local update_user_data="{\"name\":\"更新后的用户\",\"username\":\"${test_username}\",\"email\":\"${test_email}\",\"role\":\"ENGINEER\",\"status\":\"ACTIVE\"}"
        
        local update_user_response=$(curl -s -X PUT "${API_URL}/users/${user_id}" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -d "$update_user_data")
        
        if echo "$update_user_response" | grep -q '"success":true'; then
            print_pass "更新用户成功"
        else
            print_fail "更新用户失败" "$update_user_response"
        fi
    else
        print_info "跳过更新用户（用户不存在或创建失败）"
    fi
}

# ============================================
# 主流程
# ============================================

main() {
    echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║       Groups 模块 CRUD 接口测试脚本 v1.0       ║${NC}"
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

    # 获取 Token
    get_admin_token

    if [ -z "$ADMIN_TOKEN" ]; then
        print_fail "无法获取管理员 Token，测试终止"
        exit 1
    fi

    # 运行测试
    test_groups_crud
    test_groups_edge_cases
    test_users_crud

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
