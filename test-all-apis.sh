#!/bin/bash

# iGreen 完整API接口对接测试脚本
# 测试所有后端Controller的接口，确保与前端完全兼容

set -e

BASE_URL="http://180.188.45.250:8090/api"
TOKEN=""
REFRESH_TOKEN=""

# 统计变量
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 测试计数函数
test_passed() {
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
    log_success "✓ $1"
}

test_failed() {
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
    log_error "✗ $1: $2"
}

# 登录函数
login() {
    log_info "🔐 登录系统获取Token..."

    LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "username": "admin",
        "password": "password123",
        "country": "TH"
      }')

    SUCCESS=$(echo ${LOGIN_RESPONSE} | grep -o '"success":[^,]*' | cut -d':' -f2)
    TOKEN=$(echo ${LOGIN_RESPONSE} | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo ${LOGIN_RESPONSE} | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

    if [ "$SUCCESS" == "true" ] && [ ! -z "$TOKEN" ]; then
        test_passed "登录接口"
        return 0
    else
        test_failed "登录接口" "登录失败: ${LOGIN_RESPONSE}"
        exit 1
    fi
}

# Token刷新函数
refresh_token_if_needed() {
    if [ -z "$TOKEN" ]; then
        login
        return
    fi

    # 测试当前token是否有效
    TEST_RESPONSE=$(curl -s -X GET ${BASE_URL}/auth/me \
      -H "Authorization: Bearer ${TOKEN}")

    SUCCESS=$(echo ${TEST_RESPONSE} | grep -o '"success":[^,]*' | cut -d':' -f2)

    if [ "$SUCCESS" != "true" ]; then
        log_warning "Token已过期，刷新Token..."
        REFRESH_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/refresh \
          -H "Content-Type: application/json" \
          -d "{\"refreshToken\": \"${REFRESH_TOKEN}\"}")

        NEW_TOKEN=$(echo ${REFRESH_RESPONSE} | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        NEW_REFRESH=$(echo ${REFRESH_RESPONSE} | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

        if [ ! -z "$NEW_TOKEN" ]; then
            TOKEN=${NEW_TOKEN}
            REFRESH_TOKEN=${NEW_REFRESH}
            log_success "Token刷新成功"
        else
            log_error "Token刷新失败，重新登录"
            login
        fi
    fi
}

# API测试函数
test_api() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_success="${5:-true}"

    refresh_token_if_needed

    log_info "测试: $name"

    local response
    if [ "$method" = "GET" ]; then
        response=$(curl -s -X GET "${BASE_URL}${url}" \
          -H "Authorization: Bearer ${TOKEN}")
    else
        response=$(curl -s -X ${method} "${BASE_URL}${url}" \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer ${TOKEN}" \
          -d "${data}")
    fi

    local success=$(echo ${response} | grep -o '"success":[^,]*' | cut -d':' -f2)
    local code=$(echo ${response} | grep -o '"code":"[^"]*"' | cut -d'"' -f4)

    if [ "$expected_success" = "true" ] && [ "$success" = "true" ]; then
        test_passed "$name"
        return 0
    elif [ "$expected_success" = "false" ] && [ "$success" != "true" ]; then
        test_passed "$name (预期失败)"
        return 0
    else
        test_failed "$name" "响应: ${response:0:200}"
        return 1
    fi
}

# 主测试函数
main() {
    echo "=========================================="
    echo "iGreen 完整API接口对接测试"
    echo "=========================================="

    # 初始化登录
    login

    echo ""
    echo "=========================================="
    echo "1. 认证接口测试 (AuthController)"
    echo "=========================================="

    # AuthController - 已经登录了，测试其他接口
    test_api "获取当前用户信息" "GET" "/auth/me"
    test_api "刷新Token" "POST" "/auth/refresh" "{\"refreshToken\": \"${REFRESH_TOKEN}\"}"

    echo ""
    echo "=========================================="
    echo "2. 用户管理接口测试 (UserController)"
    echo "=========================================="

    # UserController
    test_api "获取用户列表" "GET" "/users?page=1&size=10"
    test_api "获取工程师列表" "GET" "/users/engineers"

    # 创建测试用户
    TEST_USER_RESPONSE=$(curl -s -X POST ${BASE_URL}/users \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{
        "name": "API测试用户",
        "username": "api_test_user",
        "email": "api_test@example.com",
        "password": "Test123456",
        "role": "ENGINEER",
        "status": "ACTIVE"
      }')

    TEST_USER_ID=$(echo ${TEST_USER_RESPONSE} | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

    if [ ! -z "$TEST_USER_ID" ]; then
        test_passed "创建用户"
        test_api "获取用户详情" "GET" "/users/${TEST_USER_ID}"
        test_api "更新用户信息" "PUT" "/users/${TEST_USER_ID}" '{"status": "INACTIVE"}'
        test_api "删除用户" "DELETE" "/users/${TEST_USER_ID}"
    else
        test_failed "创建用户" "无法获取用户ID"
    fi

    echo ""
    echo "=========================================="
    echo "3. 群组管理接口测试 (GroupController)"
    echo "=========================================="

    # GroupController
    test_api "获取群组列表" "GET" "/groups"

    # 创建测试群组
    TEST_GROUP_RESPONSE=$(curl -s -X POST ${BASE_URL}/groups \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{
        "name": "API测试群组",
        "description": "用于API测试",
        "status": "ACTIVE"
      }')

    TEST_GROUP_ID=$(echo ${TEST_GROUP_RESPONSE} | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

    if [ ! -z "$TEST_GROUP_ID" ]; then
        test_passed "创建群组"
        test_api "获取群组详情" "GET" "/groups/${TEST_GROUP_ID}"
        test_api "更新群组信息" "PUT" "/groups/${TEST_GROUP_ID}" '{
            "name": "更新的API测试群组",
            "description": "更新后的描述",
            "status": "INACTIVE"
        }'
        test_api "删除群组" "DELETE" "/groups/${TEST_GROUP_ID}"
    else
        test_failed "创建群组" "无法获取群组ID"
    fi

    echo ""
    echo "=========================================="
    echo "4. 站点管理接口测试 (SiteController)"
    echo "=========================================="

    # SiteController
    test_api "获取站点列表" "GET" "/sites?page=1&size=10"
    test_api "获取站点统计" "GET" "/sites/stats"

    # 创建测试站点
    TEST_SITE_RESPONSE=$(curl -s -X POST ${BASE_URL}/sites \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{
        "name": "API测试站点",
        "address": "测试地址123号",
        "level": "A",
        "status": "ONLINE"
      }')

    TEST_SITE_ID=$(echo ${TEST_SITE_RESPONSE} | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

    if [ ! -z "$TEST_SITE_ID" ]; then
        test_passed "创建站点"
        test_api "获取站点详情" "GET" "/sites/${TEST_SITE_ID}"
        test_api "更新站点信息" "POST" "/sites/${TEST_SITE_ID}" '{
            "name": "更新的API测试站点",
            "address": "新地址456号",
            "level": "B",
            "status": "OFFLINE"
        }'
        test_api "删除站点" "DELETE" "/sites/${TEST_SITE_ID}"
    else
        test_failed "创建站点" "无法获取站点ID"
    fi

    echo ""
    echo "=========================================="
    echo "5. 模板管理接口测试 (TemplateController)"
    echo "=========================================="

    # TemplateController
    test_api "获取模板列表" "GET" "/templates"

    # 创建测试模板
    TEST_TEMPLATE_RESPONSE=$(curl -s -X POST ${BASE_URL}/templates \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{
        "name": "API测试模板",
        "description": "用于API测试的模板"
      }')

    TEST_TEMPLATE_ID=$(echo ${TEST_TEMPLATE_RESPONSE} | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

    if [ ! -z "$TEST_TEMPLATE_ID" ]; then
        test_passed "创建模板"
        test_api "获取模板详情" "GET" "/templates/${TEST_TEMPLATE_ID}"
        test_api "更新模板信息" "PUT" "/templates/${TEST_TEMPLATE_ID}" '{
            "name": "更新的API测试模板",
            "description": "更新后的模板描述"
        }'

        # 创建步骤
        STEP_RESPONSE=$(curl -s -X POST ${BASE_URL}/templates/${TEST_TEMPLATE_ID}/steps \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer ${TOKEN}" \
          -d '{
            "name": "API测试步骤",
            "description": "测试步骤",
            "order": 1
          }')

        STEP_ID=$(echo ${STEP_RESPONSE} | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

        if [ ! -z "$STEP_ID" ]; then
            test_passed "创建模板步骤"

            # 添加字段
            test_api "添加TEXT字段" "POST" "/templates/${TEST_TEMPLATE_ID}/steps/${STEP_ID}/fields" '{
                "name": "文本字段",
                "type": "TEXT",
                "required": true
            }'

            test_api "添加NUMBER字段" "POST" "/templates/${TEST_TEMPLATE_ID}/steps/${STEP_ID}/fields" '{
                "name": "数字字段",
                "type": "NUMBER",
                "required": false
            }'
        fi

        test_api "删除模板" "DELETE" "/templates/${TEST_TEMPLATE_ID}"
    else
        test_failed "创建模板" "无法获取模板ID"
    fi

    echo ""
    echo "=========================================="
    echo "6. 工单管理接口测试 (TicketController)"
    echo "=========================================="

    # 获取工程师ID用于创建工单
    ENGINEER_RESPONSE=$(curl -s -X GET "${BASE_URL}/users/engineers?size=1" \
      -H "Authorization: Bearer ${TOKEN}")
    ENGINEER_ID=$(echo ${ENGINEER_RESPONSE} | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    # 创建模板用于工单
    TEMPLATE_RESPONSE=$(curl -s -X POST ${BASE_URL}/templates \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{
        "name": "工单测试模板",
        "description": "用于工单测试"
      }')

    TEMPLATE_ID=$(echo ${TEMPLATE_RESPONSE} | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

    # TicketController
    test_api "获取工单列表" "GET" "/tickets?page=1&size=10"
    test_api "获取我的工单" "GET" "/tickets/my?page=1&size=10"
    test_api "获取待处理工单" "GET" "/tickets/pending"
    test_api "获取已完成工单" "GET" "/tickets/completed?page=1&size=10"
    test_api "获取工单统计" "GET" "/tickets/stats"

    # 创建测试工单
    if [ ! -z "$TEMPLATE_ID" ] && [ ! -z "$ENGINEER_ID" ]; then
        TICKET_RESPONSE=$(curl -s -X POST ${BASE_URL}/tickets \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer ${TOKEN}" \
          -d '{
            "title": "API测试工单",
            "description": "用于API测试的工单",
            "type": "PLANNED",
            "priority": "P2",
            "templateId": "'${TEMPLATE_ID}'",
            "assignedTo": "'${ENGINEER_ID}'",
            "dueDate": "2026-02-01T00:00:00"
          }')

        TICKET_ID=$(echo ${TICKET_RESPONSE} | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

        if [ ! -z "$TICKET_ID" ]; then
            test_passed "创建工单"
            test_api "获取工单详情" "GET" "/tickets/${TICKET_ID}"

            # 测试各种工单状态变更
            test_api "接受工单" "POST" "/tickets/${TICKET_ID}/accept" '{"comment": "接受测试工单"}'
            test_api "更新工单为ASSIGNED" "PUT" "/tickets/${TICKET_ID}" '{"status": "ASSIGNED"}'
            test_api "更新工单为IN_PROGRESS" "PUT" "/tickets/${TICKET_ID}" '{"status": "IN_PROGRESS"}'
            test_api "更新工单为COMPLETED" "PUT" "/tickets/${TICKET_ID}" '{"status": "COMPLETED"}'

            # 测试评论
            test_api "添加GENERAL评论" "POST" "/tickets/${TICKET_ID}/comments" '{
                "comment": "一般性评论",
                "type": "GENERAL"
            }'

            test_api "获取工单评论" "GET" "/tickets/${TICKET_ID}/comments"

            # 清理测试数据
            curl -s -X DELETE ${BASE_URL}/tickets/${TICKET_ID} \
              -H "Authorization: Bearer ${TOKEN}" > /dev/null
        fi

        # 清理模板
        curl -s -X DELETE ${BASE_URL}/templates/${TEMPLATE_ID} \
          -H "Authorization: Bearer ${TOKEN}" > /dev/null
    fi

    echo ""
    echo "=========================================="
    echo "7. 文件管理接口测试 (FileController)"
    echo "=========================================="

    # FileController - 创建一个简单的文本文件进行测试
    echo "测试文件内容" > /tmp/test_file.txt

    # 上传文件测试
    UPLOAD_RESPONSE=$(curl -s -X POST ${BASE_URL}/files/upload \
      -H "Authorization: Bearer ${TOKEN}" \
      -F "file=@/tmp/test_file.txt" \
      -F "fieldType=TEXT")

    UPLOAD_SUCCESS=$(echo ${UPLOAD_RESPONSE} | grep -o '"success":[^,]*' | cut -d':' -f2)

    if [ "$UPLOAD_SUCCESS" == "true" ]; then
        test_passed "上传文件"
        FILE_ID=$(echo ${UPLOAD_RESPONSE} | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

        if [ ! -z "$FILE_ID" ]; then
            test_api "删除文件" "DELETE" "/files/${FILE_ID}"
        fi
    else
        test_failed "上传文件" "响应: ${UPLOAD_RESPONSE:0:200}"
    fi

    # 清理临时文件
    rm -f /tmp/test_file.txt

    echo ""
    echo "=========================================="
    echo "8. 配置管理接口测试 (ConfigController)"
    echo "=========================================="

    # ConfigController
    test_api "获取SLA配置" "GET" "/configs/sla-configs"
    test_api "获取问题类型" "GET" "/configs/problem-types"
    test_api "获取站点等级配置" "GET" "/configs/site-level-configs"

    echo ""
    echo "=========================================="
    echo "9. 健康检查接口测试 (HealthController)"
    echo "=========================================="

    # HealthController
    HEALTH_RESPONSE=$(curl -s -X GET ${BASE_URL}/health)
    STATUS=$(echo ${HEALTH_RESPONSE} | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

    if [ "$STATUS" == "UP" ]; then
        test_passed "健康检查接口"
    else
        test_failed "健康检查接口" "状态: ${STATUS}"
    fi

    echo ""
    echo "=========================================="
    echo "测试结果汇总"
    echo "=========================================="
    echo "总测试数: ${TOTAL_TESTS}"
    echo "通过: ${PASSED_TESTS}"
    echo "失败: ${FAILED_TESTS}"
    echo "成功率: $((PASSED_TESTS * 100 / TOTAL_TESTS))%"

    if [ ${FAILED_TESTS} -eq 0 ]; then
        echo ""
        log_success "🎉 所有API接口测试通过！前后端对接完全成功！"
        return 0
    else
        echo ""
        log_error "⚠️  有 ${FAILED_TESTS} 个接口测试失败"
        return 1
    fi
}

# 执行主测试
main "$@"