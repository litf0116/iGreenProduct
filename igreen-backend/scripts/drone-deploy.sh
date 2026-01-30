#!/bin/bash

# iGreenProduct Drone CI 部署脚本
# 用于Spring Boot项目的构建、测试和部署

set -e

echo "🚀 开始Drone CI执行流程..."

# 步骤1: 设置JDK环境
echo "📦 步骤1: 设置JDK环境"
java -version
./mvnw --version

# 步骤2: 编译和测试
echo "🔨 步骤2: 编译和测试"
export MAVEN_OPTS="-Xmx1024m"
./mvnw clean compile test

# 步骤3: 打包应用
echo "📦 步骤3: 打包应用"
./mvnw package -DskipTests

# 步骤4: 构建Docker镜像 (可选)
if [[ "$DRONE_BRANCH" == "main" || "$DRONE_BRANCH" == "master" ]]; then
    echo "🐳 步骤4: 构建Docker镜像"

    # 确保Dockerfile存在
    if [ ! -f "Dockerfile" ]; then
        echo "❌ Dockerfile不存在，跳过Docker构建"
        exit 1
    fi

    # Docker构建命令
    docker build -t igreen-backend:latest .
    docker tag igreen-backend:latest your-registry.com/igreen-backend:latest
    docker tag igreen-backend:latest your-registry.com/igreen-backend:${DRONE_COMMIT_SHA:0:8}

    # 推送到注册表
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin your-registry.com
    docker push your-registry.com/igreen-backend:latest
    docker push your-registry.com/igreen-backend:${DRONE_COMMIT_SHA:0:8}

else
    echo "⏭️ 跳过Docker构建 (仅在main/master分支执行)"
fi

# 步骤5: 部署到服务器 (可选)
if [[ "$DRONE_BRANCH" == "main" || "$DRONE_BRANCH" == "master" ]]; then
    echo "🚀 步骤5: 部署到服务器"

    # SSH部署命令
    ssh -o StrictHostKeyChecking=no -i /root/.ssh/id_rsa root@180.188.45.250 << 'EOF'
        cd /opt/igreen
        echo "📥 拉取最新镜像..."
        docker-compose pull
        echo "🔄 重启服务..."
        docker-compose up -d --no-deps igreen-backend
        echo "✅ 部署完成!"
EOF

else
    echo "⏭️ 跳过部署 (仅在main/master分支执行)"
fi

echo "🎉 Drone CI执行完成!"