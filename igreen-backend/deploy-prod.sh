#!/bin/bash

# iGreenProduct 生产环境部署脚本
# 用于验证生产配置和部署Spring Boot应用

set -e

echo "🚀 开始生产环境部署验证..."

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
./mvnw clean compile -DskipTests
echo "✅ 编译成功"

# 运行测试
echo "🧪 运行测试..."
./mvnw test
echo "✅ 测试通过"

# 打包应用
echo "📦 打包应用..."
./mvnw package -DskipTests
echo "✅ 打包成功"

# 验证生产配置
echo "🔍 验证生产配置文件..."
if [ ! -f "src/main/resources/application-prod.yml" ]; then
    echo "❌ application-prod.yml文件不存在"
    exit 1
fi

echo "✅ 生产配置文件存在"

# 检查数据库连接（可选，需要数据库服务运行）
echo "💾 验证数据库连接..."
# 这里可以添加数据库连接测试逻辑

echo "🎉 生产环境部署验证完成！"

echo ""
echo "📋 部署命令："
echo "java -jar -Dspring.profiles.active=prod target/igreen-backend-1.0.0.jar"
echo ""
echo "🔧 或者使用systemd服务："
echo "sudo systemctl start igreen-backend"
echo "sudo systemctl enable igreen-backend"