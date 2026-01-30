#!/bin/bash
# ============================================
# 模板管理模块测试脚本
# 测试模板的创建、更新、查询、删除操作
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

TEMPLATE_ID=""
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
# 模板 CRUD 测试
# ============================================

test_templates_crud() {
    print_header "模板管理 CRUD 测试"

    # 1. 查询模板列表
    print_step "1. 查询模板列表"
    local list_response=$(curl -s "${API_URL}/templates" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$list_response" | grep -q '"success":true'; then
        local template_count=$(echo "$list_response" | grep -o '"id":"[^"]*"' | wc -l)
        print_pass "获取模板列表成功，当前有 $template_count 个模板"
        echo "  Response: $(echo "$list_response" | head -c 300)"
    else
        print_fail "获取模板列表失败" "$list_response"
    fi

    # 2. 获取现有模板ID（用于后续测试）
    print_step "2. 获取现有模板用于详情测试"
    local first_template_id=$(echo "$list_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$first_template_id" ]; then
        print_pass "获取到模板ID: $first_template_id"
        TEMPLATE_ID="$first_template_id"
    else
        print_info "没有现有模板，将创建新模板进行测试"
    fi

    # 3. 获取模板详情
    if [ -n "$TEMPLATE_ID" ]; then
        print_step "3. 获取模板详情 (ID: $TEMPLATE_ID)"
        local detail_response=$(curl -s "${API_URL}/templates/${TEMPLATE_ID}" \
            -H "Authorization: Bearer $ADMIN_TOKEN")

        if echo "$detail_response" | grep -q '"success":true'; then
            local template_name=$(echo "$detail_response" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
            local step_count=$(echo "$detail_response" | grep -o '"steps":\[' | wc -l)
            print_pass "获取模板详情成功: $template_name (包含 $step_count 个步骤)"
            echo "  Response: $(echo "$detail_response" | head -c 400)"
        else
            print_fail "获取模板详情失败" "$detail_response"
        fi
    else
        print_info "跳过获取模板详情（没有现有模板）"
    fi

    # 4. 创建模板
    print_step "4. 创建新模板"
    local unique_id=$(date +%s)
    local create_data="{
        \"name\": \"测试模板_$unique_id\",
        \"description\": \"这是测试创建的模板描述 - $(date)\",
        \"steps\": [
            {
                \"name\": \"第一步：现场检查\",
                \"description\": \"到达现场后进行初步检查\",
                \"order\": 1,
                \"fields\": [
                    {\"name\": \"现场照片\", \"type\": \"PHOTO\", \"required\": true, \"options\": null},
                    {\"name\": \"检查备注\", \"type\": \"TEXT\", \"required\": false, \"options\": null}
                ]
            },
            {
                \"name\": \"第二步：维修操作\",
                \"description\": \"执行维修工作\",
                \"order\": 2,
                \"fields\": [
                    {\"name\": \"维修类型\", \"type\": \"TEXT\", \"required\": true, \"options\": \"更换零件,清洁保养,调整校准\"},
                    {\"name\": \"使用材料\", \"type\": \"TEXT\", \"required\": false, \"options\": null}
                ]
            },
            {
                \"name\": \"第三步：完成确认\",
                \"description\": \"确认工作完成\",
                \"order\": 3,
                \"fields\": [
                    {\"name\": \"完成照片\", \"type\": \"PHOTO\", \"required\": true, \"options\": null},
                    {\"name\": \"客户签字\", \"type\": \"SIGNATURE\", \"required\": true, \"options\": null}
                ]
            }
        ]
    }"

    local create_response=$(curl -s -X POST "${API_URL}/templates" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "$create_data")

    if echo "$create_response" | grep -q '"success":true'; then
        TEMPLATE_ID=$(echo "$create_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        local template_name=$(echo "$create_response" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
        print_pass "创建模板成功: $template_name (ID: $TEMPLATE_ID)"
        echo "  Response: $(echo "$create_response" | head -c 500)"
    else
        print_fail "创建模板失败" "$create_response"
    fi

    # 5. 验证创建的模板
    if [ -n "$TEMPLATE_ID" ]; then
        print_step "5. 验证创建的模板详情"
        local verify_response=$(curl -s "${API_URL}/templates/${TEMPLATE_ID}" \
            -H "Authorization: Bearer $ADMIN_TOKEN")

        if echo "$verify_response" | grep -q '"success":true'; then
            local step_count=$(echo "$verify_response" | grep -o '"name":"[^"]*"' | wc -l)
            # 减去1（模板名称），剩余的是步骤名称
            local actual_steps=$((step_count - 1))
            print_pass "模板验证成功，包含 $actual_steps 个步骤"
        else
            print_fail "模板验证失败" "$verify_response"
        fi
    fi

    # 6. 更新模板
    if [ -n "$TEMPLATE_ID" ]; then
        print_step "6. 更新模板"
        local update_data="{
            \"name\": \"更新后的模板_$(date +%s)\",
            \"description\": \"这是更新后的模板描述 - $(date)\",
            \"steps\": [
                {
                    \"name\": \"更新后的步骤1\",
                    \"description\": \"更新后的步骤描述\",
                    \"order\": 1,
                    \"fields\": [
                        {\"name\": \"新字段\", \"type\": \"TEXT\", \"required\": true, \"options\": null}
                    ]
                }
            ]
        }"

        local update_response=$(curl -s -X PUT "${API_URL}/templates/${TEMPLATE_ID}" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -d "$update_data")

        if echo "$update_response" | grep -q '"success":true'; then
            print_pass "更新模板成功"
        else
            print_fail "更新模板失败" "$update_response"
        fi
    else
        print_info "跳过更新模板（创建失败）"
    fi

    # 7. 验证更新后的模板
    if [ -n "$TEMPLATE_ID" ]; then
        print_step "7. 验证更新后的模板"
        local updated_response=$(curl -s "${API_URL}/templates/${TEMPLATE_ID}" \
            -H "Authorization: Bearer $ADMIN_TOKEN")

        if echo "$updated_response" | grep -q '"success":true'; then
            local updated_name=$(echo "$updated_response" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
            if echo "$updated_name" | grep -q "更新后的模板"; then
                print_pass "更新验证成功: $updated_name"
            else
                print_fail "更新未生效" "$updated_response"
            fi
        else
            print_fail "验证更新失败" "$updated_response"
        fi
    fi
}

# ============================================
# 模板异常场景测试
# ============================================

test_templates_edge_cases() {
    print_header "模板异常场景测试"

    # 1. 查询不存在的模板
    print_step "1. 查询不存在的模板"
    local not_found_response=$(curl -s "${API_URL}/templates/non-existent-id" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$not_found_response" | grep -q '"success":false'; then
        print_pass "不存在的模板被正确拒绝"
    else
        print_fail "不存在的模板应该返回失败" "$not_found_response"
    fi

    # 2. 无 Token 访问
    print_step "2. 无 Token 访问模板列表"
    local no_token_response=$(curl -s "${API_URL}/templates")

    if echo "$no_token_response" | grep -q '"success":false'; then
        print_pass "无 Token 访问被正确拒绝"
    else
        print_fail "无 Token 应该被拒绝" "$no_token_response"
    fi

    # 3. 无效 Token 访问
    print_step "3. 无效 Token 访问"
    local invalid_token_response=$(curl -s "${API_URL}/templates" \
        -H "Authorization: Bearer invalid-token")

    if echo "$invalid_token_response" | grep -q '"success":false'; then
        print_pass "无效 Token 被正确拒绝"
    else
        print_fail "无效 Token 应该被拒绝" "$invalid_token_response"
    fi

    # 4. 创建模板 - 空名称
    print_step "4. 创建模板 - 空名称"
    local empty_name_response=$(curl -s -X POST "${API_URL}/templates" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d '{"name":"","description":"测试","steps":[]}')

    if echo "$empty_name_response" | grep -q '"success":false'; then
        print_pass "空名称被正确拒绝"
    else
        print_fail "空名称应该被拒绝" "$empty_name_response"
    fi

    # 5. 创建重复名称模板
    if [ -n "$TEMPLATE_ID" ]; then
        print_step "5. 创建重复名称模板"
        # 先获取现有模板名称
        local existing_name=$(curl -s "${API_URL}/templates/${TEMPLATE_ID}" \
            -H "Authorization: Bearer $ADMIN_TOKEN" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)

        if [ -n "$existing_name" ]; then
            local duplicate_response=$(curl -s -X POST "${API_URL}/templates" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $ADMIN_TOKEN" \
                -d "{\"name\":\"$existing_name\",\"description\":\"重复名称\",\"steps\":[]}")

            if echo "$duplicate_response" | grep -q '"success":false'; then
                print_pass "重复名称被正确拒绝"
            else
                print_fail "重复名称应该被拒绝" "$duplicate_response"
            fi
        fi
    fi

    # 6. 更新不存在的模板
    print_step "6. 更新不存在的模板"
    local update_not_found=$(curl -s -X PUT "${API_URL}/templates/non-existent-id" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d '{"name":"测试","description":"测试","steps":[]}')

    if echo "$update_not_found" | grep -q '"success":false'; then
        print_pass "更新不存在的模板被正确拒绝"
    else
        print_fail "更新不存在的模板应该失败" "$update_not_found"
    fi

    # 7. 删除不存在的模板
    print_step "7. 删除不存在的模板"
    local delete_not_found=$(curl -s -X DELETE "${API_URL}/templates/non-existent-id" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$delete_not_found" | grep -q '"success":false'; then
        print_pass "删除不存在的模板被正确拒绝"
    else
        print_fail "删除不存在的模板应该失败" "$delete_not_found"
    fi
}

# ============================================
# 模板删除测试（可选）
# ============================================

test_delete_template() {
    print_header "模板删除测试"

    if [ -z "$TEMPLATE_ID" ]; then
        print_info "没有可删除的模板，跳过删除测试"
        return
    fi

    print_step "删除测试模板 (ID: $TEMPLATE_ID)"
    local delete_response=$(curl -s -X DELETE "${API_URL}/templates/${TEMPLATE_ID}" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$delete_response" | grep -q '"success":true'; then
        print_pass "删除模板成功"
    else
        print_fail "删除模板失败" "$delete_response"
    fi

    # 验证已删除
    print_step "验证模板已删除"
    local verify_delete=$(curl -s "${API_URL}/templates/${TEMPLATE_ID}" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$verify_delete" | grep -q '"success":false'; then
        print_pass "模板已成功删除"
    else
        print_fail "模板删除验证失败" "$verify_delete"
    fi
}

# ============================================
# 主流程
# ============================================

main() {
    echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║       模板管理模块测试脚本 v1.0 (管理员)       ║${NC}"
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

    # 运行测试
    test_templates_crud
    test_templates_edge_cases

    # 询问是否删除测试模板
    if [ -n "$TEMPLATE_ID" ]; then
        echo ""
        read -p "是否删除测试模板? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            test_delete_template
        fi
    fi

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
