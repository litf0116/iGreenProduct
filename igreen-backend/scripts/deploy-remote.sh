#!/bin/bash

# iGreen Backend 快速部署脚本
# 用于更新服务器上的 JAR 包并重启应用

set -e

echo "=========================================="
echo "iGreen Backend 部署脚本"
echo "=========================================="

# 配置
APP_DIR="/data/igreen-backend"
JAR_NAME="igreen-backend-1.0.0-SNAPSHOT.jar"
BACKUP_DIR="${APP_DIR}/backup"
JAR_FILE="${APP_DIR}/${JAR_NAME}"

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 备份当前 JAR
if [ -f ${JAR_FILE} ]; then
    echo "📦 备份当前 JAR 包..."
    BACKUP_FILE="${BACKUP_DIR}/${JAR_NAME}.$(date +%Y%m%d_%H%M%S)"
    cp ${JAR_FILE} ${BACKUP_FILE}
    echo "✅ 备份完成: ${BACKUP_FILE}"
else
    echo "⚠️  未找到现有 JAR 包，跳过备份"
fi

# 停止应用
echo "🛑 停止应用..."
pkill -f "igreen-backend" || true
sleep 2

# 替换 JAR（如果有新文件）
NEW_JAR="${APP_DIR}/${JAR_NAME}.new"
if [ -f ${NEW_JAR} ]; then
    echo "🔄 替换 JAR 包..."
    mv ${NEW_JAR} ${JAR_FILE}
    echo "✅ JAR 包已更新"
else
    echo "ℹ️  未找到新 JAR 包，仅重启应用"
fi

# 启动应用
echo "🚀 启动应用..."
cd ${APP_DIR}

# 使用环境变量启动
export JWT_SECRET_KEY="iGreenProduct2025SecureJWTKeyForProductionEnvironment"
nohup java -jar -Xms512m -Xmx2g -XX:+UseG1GC ${JAR_NAME} \
    --spring.profiles.active=prod \
    > logs/app.log 2>&1 &

# 等待启动
echo "⏳ 等待应用启动..."
sleep 5

# 检查状态
if pgrep -f "igreen-backend" > /dev/null; then
    echo "✅ 应用启动成功！"
    echo "📋 PID: $(pgrep -f igreen-backend)"
    echo "📊 查看日志: tail -f ${APP_DIR}/logs/app.log"
else
    echo "❌ 应用启动失败，请查看日志"
    echo "📊 日志: tail -50 ${APP_DIR}/logs/app.log"
    exit 1
fi

echo "=========================================="
echo "部署完成！"
echo "=========================================="
