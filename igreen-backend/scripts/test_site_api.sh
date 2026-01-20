#!/bin/bash

# ============================================
# Site 模块 API 测试脚本
# 使用方式: ./test_site_api.sh [BASE_URL] [TOKEN]
# 示例: ./test_site_api.sh http://localhost:8080 your_token_here
# ============================================

set -e

# 配置
BASE_URL=${1:-"http://localhost:8080"}
TOKEN=${2:-""}
AUTH_HEADER=""

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 工具函数
print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# 检查 Token
if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}警告: 未提供 TOKEN，某些测试可能会失败${NC}"
else
    AUTH_HEADER="-H \"Authorization: Bearer $TOKEN\""
fi

# ============================================
# 1. 站点列表查询测试
# ============================================
echo -e "\n============================================"
echo "站点列表查询测试"
echo "============================================\n"

# 测试 1.1: 获取站点列表（默认分页）
print_test "获取站点列表（默认分页）"
response=$(curl -s -X GET "$BASE_URL/api/sites" $AUTH_HEADER)
echo "$response" | grep -q "\"code\":200" && print_success "默认分页查询成功" || print_error "默认分页查询失败"

# 测试 1.2: 获取站点列表（自定义分页）
print_test "获取站点列表（page=1, size=5）"
response=$(curl -s -X GET "$BASE_URL/api/sites?page=1&size=5" $AUTH_HEADER)
echo "$response" | grep -q "\"code\":200" && print_success "自定义分页查询成功" || print_error "自定义分页查询失败"

# 测试 1.3: 按关键字筛选
print_test "按关键字筛选（keyword=上海）"
response=$(curl -s -X GET "$BASE_URL/api/sites?keyword=上海" $AUTH_HEADER)
echo "$response" | grep -q "\"code\":200" && print_success "关键字筛选成功" || print_error "关键字筛选失败"

# 测试 1.4: 按级别筛选
print_test "按级别筛选（level=VIP）"
response=$(curl -s -X GET "$BASE_URL/api/sites?level=VIP" $AUTH_HEADER)
echo "$response" | grep -q "\"code\":200" && print_success "级别筛选成功" || print_error "级别筛选失败"

# 测试 1.5: 按状态筛选
print_test "按状态筛选（status=ONLINE）"
response=$(curl -s -X GET "$BASE_URL/api/sites?status=ONLINE" $AUTH_HEADER)
echo "$response" | grep -q "\"code\":200" && print_success "状态筛选成功" || print_error "状态筛选失败"

# 测试 1.6: 组合筛选
print_test "组合筛选（keyword=上海&level=VIP&status=ONLINE）"
response=$(curl -s -X GET "$BASE_URL/api/sites?keyword=上海&level=VIP&status=ONLINE" $AUTH_HEADER)
echo "$response" | grep -q "\"code\":200" && print_success "组合筛选成功" || print_error "组合筛选失败"

# ============================================
# 2. 站点统计测试
# ============================================
echo -e "\n============================================"
echo "站点统计测试"
echo "============================================\n"

# 测试 2.1: 获取站点统计
print_test "获取站点统计信息"
response=$(curl -s -X GET "$BASE_URL/api/sites/stats" $AUTH_HEADER)
echo "$response" | grep -q "\"code\":200" && print_success "站点统计查询成功" || print_error "站点统计查询失败"

# 显示统计信息
if [ $? -eq 0 ]; then
    echo "统计数据: $response" | jq '.data'
fi

# ============================================
# 3. 站点详情查询测试
# ============================================
echo -e "\n============================================"
echo "站点详情查询测试"
echo "============================================\n"

# 测试 3.1: 获取存在的站点详情
print_test "获取存在的站点详情（test-site-vip-001）"
response=$(curl -s -X GET "$BASE_URL/api/sites/test-site-vip-001" $AUTH_HEADER)
echo "$response" | grep -q "\"code\":200" && print_success "站点详情查询成功" || print_error "站点详情查询失败"

# 测试 3.2: 获取不存在的站点
print_test "获取不存在的站点详情"
response=$(curl -s -X GET "$BASE_URL/api/sites/nonexistent-id" $AUTH_HEADER)
echo "$response" | grep -q "\"code\":400" && print_success "不存在的站点返回正确错误码" || print_error "错误处理失败"

# ============================================
# 4. 站点 CRUD 测试（需要权限）
# ============================================
echo -e "\n============================================"
echo "站点 CRUD 测试"
echo "============================================\n"

if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}跳过 CRUD 测试（未提供 TOKEN）${NC}"
else
    # 测试 4.1: 创建站点
    print_test "创建新站点"
    timestamp=$(date +%s)
    create_response=$(curl -s -X POST "$BASE_URL/api/sites" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "name": "测试站点-'$timestamp'",
            "address": "测试地址-'$timestamp'",
            "level": "normal",
            "status": "ONLINE"
        }')

    if echo "$create_response" | grep -q "\"code\":200"; then
        print_success "站点创建成功"
        # 提取新创建的站点 ID
        NEW_SITE_ID=$(echo "$create_response" | jq -r '.data.id')
        echo "新站点 ID: $NEW_SITE_ID"
    else
        print_error "站点创建失败"
        echo "$create_response"
        NEW_SITE_ID=""
    fi

    # 测试 4.2: 更新站点
    if [ -n "$NEW_SITE_ID" ]; then
        print_test "更新站点（$NEW_SITE_ID）"
        update_response=$(curl -s -X POST "$BASE_URL/api/sites/$NEW_SITE_ID" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d '{
                "name": "测试站点-已更新",
                "status": "OFFLINE"
            }')

        echo "$update_response" | grep -q "\"code\":200" && print_success "站点更新成功" || print_error "站点更新失败"
    fi

    # 测试 4.3: 删除站点
    if [ -n "$NEW_SITE_ID" ]; then
        print_test "删除站点（$NEW_SITE_ID）"
        delete_response=$(curl -s -X DELETE "$BASE_URL/api/sites/$NEW_SITE_ID" \
            -H "Authorization: Bearer $TOKEN")

        echo "$delete_response" | grep -q "\"code\":200" && print_success "站点删除成功" || print_error "站点删除失败"
    fi

    # 测试 4.4: 创建重复名称的站点
    print_test "创建重复名称的站点（应失败）"
    duplicate_response=$(curl -s -X POST "$BASE_URL/api/sites" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "name": "上海陆家嘴超级充电站",
            "address": "测试地址",
            "level": "normal",
            "status": "ONLINE"
        }')

    echo "$duplicate_response" | grep -q "\"code\":400" && print_success "重复名称被正确拒绝" || print_error "重复名称处理失败"

    # 测试 4.5: 验证失败（名称为空）
    print_test "创建站点时名称为空（应失败）"
    invalid_response=$(curl -s -X POST "$BASE_URL/api/sites" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "name": "",
            "address": "测试地址",
            "level": "normal",
            "status": "ONLINE"
        }')

    echo "$invalid_response" | grep -q "\"code\":400" && print_success "验证失败被正确处理" || print_error "验证处理失败"
fi

# ============================================
# 5. 边界条件测试
# ============================================
echo -e "\n============================================"
echo "边界条件测试"
echo "============================================\n"

# 测试 5.1: 分页参数边界
print_test "分页参数边界测试（page=100, size=100）"
response=$(curl -s -X GET "$BASE_URL/api/sites?page=100&size=100" $AUTH_HEADER)
echo "$response" | grep -q "\"code\":200" && print_success "分页边界处理正确" || print_error "分页边界处理失败"

# 测试 5.2: 无效分页参数
print_test "无效分页参数（page=0）"
response=$(curl -s -X GET "$BASE_URL/api/sites?page=0&size=10" $AUTH_HEADER)
echo "$response" | grep -q "\"code\":400" && print_success "无效分页参数被正确拒绝" || print_error "分页参数验证失败"

# 测试 5.3: 无效状态值
print_test "无效状态值筛选（status=INVALID）"
response=$(curl -s -X GET "$BASE_URL/api/sites?status=INVALID" $AUTH_HEADER)
# 应该返回成功但过滤掉无效状态
echo "$response" | grep -q "\"code\":200" && print_success "无效状态值处理正确" || print_error "无效状态值处理失败"

# ============================================
# 测试完成
# ============================================
echo -e "\n============================================"
echo "测试完成"
echo "============================================"
echo ""
echo -e "${GREEN}测试脚本执行完毕${NC}"
echo ""
echo "说明:"
echo "1. 所有测试用例都是幂等的，可以安全重复执行"
echo "2. 创建、更新、删除测试需要有效的 TOKEN"
echo "3. 某些测试依赖于已加载的测试数据"
echo ""
