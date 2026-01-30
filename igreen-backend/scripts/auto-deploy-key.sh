#!/bin/bash

# iGreen Backend 自动化部署脚本（SSH密钥版本）
# 使用SSH密钥认证，无需输入密码

set -e

SERVER="root@180.188.45.250"
LOCAL_JAR="./igreen-backend/target/igreen-backend-1.0.0-SNAPSHOT.jar"
REMOTE_DIR="/data/igreen-backend"
REMOTE_JAR="${REMOTE_DIR}/igreen-backend-1.0.0-SNAPSHOT.jar"

echo "=========================================="
echo "iGreen Backend 自动化部署"
echo "=========================================="

# 检查本地JAR是否存在
if [ ! -f ${LOCAL_JAR} ]; then
    echo "❌ 错误: 未找到本地JAR包 ${LOCAL_JAR}"
    echo "请先执行: mvn clean package -DskipTests"
    exit 1
fi

echo "📦 步骤 1/5: 上传JAR包到服务器..."
scp ${LOCAL_JAR} ${SERVER}:${REMOTE_JAR}.new
echo "✅ 上传完成"

echo "🔄 步骤 2/5: 远程部署应用..."
ssh ${SERVER} bash -s << 'ENDSSH'
cd /data/igreen-backend

# 备份当前JAR
mkdir -p backup
if [ -f igreen-backend-1.0.0-SNAPSHOT.jar ]; then
    BACKUP_FILE="backup/igreen-backend-$(date +%Y%m%d_%H%M%S).jar"
    cp igreen-backend-1.0.0-SNAPSHOT.jar ${BACKUP_FILE}
    echo "📦 备份完成: ${BACKUP_FILE}"
else
    echo "⚠️  未找到现有JAR，跳过备份"
fi

# 停止应用
echo "🛑 停止应用..."
pkill -f igreen-backend || true
sleep 2

# 替换JAR
echo "🔄 替换JAR包..."
mv igreen-backend-1.0.0-SNAPSHOT.jar.new igreen-backend-1.0.0-SNAPSHOT.jar

# 启动应用
echo "🚀 启动应用..."
export JWT_SECRET_KEY='iGreenProduct2025SecureJWTKeyForProductionEnvironment'
nohup java -jar -Xms512m -Xmx2g -XX:+UseG1GC igreen-backend-1.0.0-SNAPSHOT.jar \
    --spring.profiles.active=prod > logs/app.log 2>&1 &

# 等待启动
echo "⏳ 等待应用启动..."
sleep 5

# 检查进程状态
if pgrep -f igreen-backend > /dev/null; then
    PID=$(pgrep -f igreen-backend)
    echo "✅ 应用启动成功！PID: ${PID}"
else
    echo "❌ 应用启动失败"
    echo "📊 最新日志:"
    tail -20 logs/app.log
    exit 1
fi
ENDSSH

echo "📊 步骤 3/5: 查看应用日志..."
ssh ${SERVER} "tail -20 ${REMOTE_DIR}/logs/app.log"

echo ""
echo "🔍 步骤 4/5: 测试API健康检查..."
sleep 3
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://180.188.45.250:8090/api/health || echo "000")

if [ ${HEALTH_CHECK} == "200" ]; then
    echo "✅ API健康检查通过 (HTTP 200)"
else
    echo "⚠️  API健康检查失败 (HTTP ${HEALTH_CHECK})"
fi

echo ""
echo "✅ 步骤 5/5: 部署完成！"
echo "=========================================="
echo "应用地址: http://180.188.45.250:8090"
echo "健康检查: http://180.188.45.250:8090/api/health"
echo "查看日志: ssh ${SERVER} 'tail -f ${REMOTE_DIR}/logs/app.log'"
echo "=========================================="
