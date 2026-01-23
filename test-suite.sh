#!/bin/bash

# iGreenProduct 脚本测试套件
# 测试所有脚本的功能和错误处理

set -e

echo "🧪 开始脚本测试套件..."

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

test_fail() {
    echo -e "${RED}❌ $1${NC}"
}

test_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 测试1: quick-update.sh 帮助功能
test_info "测试1: quick-update.sh 帮助功能"
if ./quick-update.sh --help | grep -q "使用方法:"; then
    test_pass "帮助功能正常"
else
    test_fail "帮助功能异常"
fi

# 测试2: quick-update.sh 参数验证
test_info "测试2: quick-update.sh 参数验证"
if ./quick-update.sh invalid-param 2>&1 | grep -q "未知参数"; then
    test_pass "参数验证正常"
else
    test_fail "参数验证异常"
fi

# 测试3: quick-update.sh 编译功能
test_info "测试3: quick-update.sh 编译功能"
if ./quick-update.sh build-only 2>&1 | grep -q "JAR包编译完成"; then
    test_pass "编译功能正常"
else
    test_fail "编译功能异常"
fi

# 测试4: JAR文件存在性检查
test_info "测试4: JAR文件检查"
if [ -f "igreen-backend/target/igreen-backend-1.0.0-SNAPSHOT.jar" ]; then
    JAR_SIZE=$(stat -f%z "igreen-backend/target/igreen-backend-1.0.0-SNAPSHOT.jar" 2>/dev/null || stat -c%s "igreen-backend/target/igreen-backend-1.0.0-SNAPSHOT.jar" 2>/dev/null)
    test_pass "JAR文件存在 (大小: $JAR_SIZE bytes)"
else
    test_fail "JAR文件不存在"
fi

# 测试5: 脚本语法检查
test_info "测试5: 脚本语法检查"
scripts=("quick-update.sh" "deploy-to-server.sh" "validate-nginx-config.sh" "simple-nginx-check.sh" "igreen-backend/test-file-upload-unit.sh")

for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        if bash -n "$script" 2>/dev/null; then
            test_pass "$script 语法正确"
        else
            test_fail "$script 语法错误"
        fi
    else
        test_fail "$script 文件不存在"
    fi
done

# 测试6: 配置文件存在性检查
test_info "测试6: 配置文件检查"
configs=("nginx-igreen.conf" "igreen-backend/src/main/resources/application-prod.yml" "DATABASE_CONFIG.md" "NGINX_CONFIG.md" "SPRINGBOOT_DEPLOY_GUIDE.md" "DEPLOY_SCRIPT_README.md" "QUICK_UPDATE_README.md")

for config in "${configs[@]}"; do
    if [ -f "$config" ]; then
        test_pass "$config 存在"
    else
        test_fail "$config 不存在"
    fi
done

# 测试7: 可执行权限检查
test_info "测试7: 脚本执行权限检查"
executable_scripts=("quick-update.sh" "deploy-to-server.sh" "validate-nginx-config.sh" "simple-nginx-check.sh" "igreen-backend/test-file-upload-unit.sh")

for script in "${executable_scripts[@]}"; do
    if [ -x "$script" ]; then
        test_pass "$script 有执行权限"
    else
        test_fail "$script 缺少执行权限"
    fi
done

# 测试8: 依赖检查
test_info "测试8: 依赖检查"
if command -v java &> /dev/null; then
    test_pass "Java已安装 ($(java -version 2>&1 | head -1))"
else
    test_fail "Java未安装"
fi

if command -v mvn &> /dev/null; then
    test_pass "Maven已安装 ($(mvn -version | head -1))"
else
    test_fail "Maven未安装"
fi

# 测试9: 网络连接测试 (模拟)
test_info "测试9: 网络连接测试"
if ping -c 1 -W 2 8.8.8.8 &> /dev/null; then
    test_pass "网络连接正常"
else
    test_fail "网络连接异常"
fi

# 测试10: 磁盘空间检查
test_info "测试10: 磁盘空间检查"
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 90 ]; then
    test_pass "磁盘空间充足 ($DISK_USAGE% 已使用)"
else
    test_fail "磁盘空间不足 ($DISK_USAGE% 已使用)"
fi

echo ""
echo "🎯 脚本测试套件完成！"
echo ""
echo "📊 测试总结:"
echo "- ✅ 通过的测试项目"
echo "- ❌ 失败的测试项目"
echo "- ℹ️  信息性检查"
echo ""
echo "💡 建议:"
echo "- 确保所有脚本都有执行权限 (chmod +x *.sh)"
echo "- 在部署前先在测试环境验证"
echo "- 定期备份重要数据和配置"