#!/bin/bash

# iGreenProduct 文件上传功能测试脚本
# 运行所有文件上传相关的单元测试

set -e

echo "🚀 开始文件上传功能测试..."

# 检查Java环境
echo "📦 检查Java环境..."
java -version
if ! java -version 2>&1 | grep -q "21"; then
    echo "❌ 需要Java 21环境"
    exit 1
fi

echo "✅ Java环境检查通过"

# 检查Maven
echo "🔧 检查Maven..."
./mvnw --version
echo "✅ Maven检查通过"

# 清理和编译
echo "🔨 编译项目..."
./mvnw clean compile -q
echo "✅ 编译成功"

# 运行文件上传相关的单元测试
echo "🧪 运行文件上传单元测试..."

# 运行FileController测试
echo "  📋 运行FileControllerTest..."
./mvnw test -Dtest=FileControllerTest -q

# 运行FileService测试
echo "  📋 运行FileServiceTest..."
./mvnw test -Dtest=FileServiceTest -q

echo "✅ 所有文件上传测试通过"

# 运行完整的测试套件（可选）
read -p "是否运行完整测试套件？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧪 运行完整测试套件..."
    ./mvnw test -q
    echo "✅ 完整测试套件通过"
fi

# 打包验证
echo "📦 打包验证..."
./mvnw package -DskipTests -q
echo "✅ 打包成功"

echo ""
echo "🎉 文件上传功能测试完成！"
echo ""
echo "📋 测试覆盖的场景："
echo "  ✅ 文件上传成功"
echo "  ✅ 空文件上传"
echo "  ✅ 超大文件上传"
echo "  ✅ 无扩展名文件处理"
echo "  ✅ 文件删除功能"
echo "  ✅ 异常处理"
echo "  ✅ 目录自动创建"