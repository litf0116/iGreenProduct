#!/bin/bash

# SSH 密钥配置助手（Bash版本）
# 自动上传SSH公钥到服务器

set -e

SERVER_HOST="180.188.45.250"
SERVER_USER="root"
PUB_KEY_FILE="$HOME/.ssh/id_rsa.pub"

echo "=========================================="
echo "SSH 密钥配置助手"
echo "=========================================="

# 检查公钥文件是否存在
if [ ! -f ${PUB_KEY_FILE} ]; then
    echo "❌ 错误: 未找到公钥文件 ${PUB_KEY_FILE}"
    echo ""
    echo "正在生成新的RSA密钥..."
    ssh-keygen -t rsa -b 4096 -f "$HOME/.ssh/id_rsa" -N ""
    echo "✅ RSA密钥生成完成"
    PUB_KEY_FILE="$HOME/.ssh/id_rsa.pub"
fi

# 读取公钥内容
PUB_KEY=$(cat ${PUB_KEY_FILE})

echo ""
echo "📋 公钥内容:"
echo ${PUB_KEY}
echo ""

echo "🔐 正在配置SSH密钥..."

# 自动上传并配置SSH密钥
cat ${PUB_KEY_FILE} | ssh ${SERVER_USER}@${SERVER_HOST} bash -s << 'ENDSSH'

# 创建.ssh目录
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 检查authorized_keys是否存在
if [ ! -f ~/.ssh/authorized_keys ]; then
    touch ~/.ssh/authorized_keys
fi

# 检查公钥是否已存在
if ! grep -q "AAAAB3NzaC1yc2E" ~/.ssh/authorized_keys; then
    echo "📝 正在添加公钥到 authorized_keys..."
    cat >> ~/.ssh/authorized_keys << 'PUBKEY_EOF'
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCfO6QvJsB8pw064NW7C2Bc7v+3QjgdyQ5ztyIUN89e5SiTML/oOQm/wlxWoh6KNUl7xJEFOARZ4PJEyiukl7EBRRbaJXLhDxIZ073DnrHe/r5xtbbQdsPtnwqXx0p1OZ5Kd2czRmYekGNEUIsxbDc+n4fo1imSfq0sm6QNSBEoygjbFRtL2B5YMir+W90a7IcmeBnr9uFSImHsNdYkT9bBJz/dSqMapNj6VWqqpkvrV9z0N0KKDXlklUNfP73oo3WJ4Eqsa4yRlEps1YBQKaP0De+xGK4bYO/9WWNG3Jq7ahVbD65vsTG3Xy1nFVnvdi+xg1zqj3+3HkQJznnjeupxnQgirtzaSRVlA9vzQvGty+BVxcTaMP065Fp6OZnXaa8+AinMVFHobFD38SP0LQvl8JE99rwranElPdjmDQEldBZhQc4vdny3I85Qi1jT5tGgCv5h0U/l82vpP5EdLNCKfTDzxaLdzyGzIM6q64XYcxIE4lNXdCXO6+5mOAwH5MY0aIhMsBEuv/pfKGsTX+m1mbyZ5PgFOAK0ocfRy71747Ej13G8EwCIPph0s3aZhlsOBkfXTON00H0i9wHFQuSB/obre+zoUqVU0j9VkvG0NjlilJsdz+LLSx/ptepgZyHN72cQo12olctCNm0VbCr6oRqOPsqy10L4TRpwhhRNtw== mac@litengfeiMacBook-Pro.local
PUBKEY_EOF
    chmod 600 ~/.ssh/authorized_keys
    echo "✅ 公钥已添加"
else
    echo "ℹ️  公钥已存在，跳过添加"
fi

ENDSSH

echo ""
echo "🔍 验证SSH配置..."

# 测试密钥连接（应该不需要密码）
TEST_RESULT=$(ssh -o BatchMode=yes -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} 'echo SSH配置成功' 2>&1)

if [ "$TEST_RESULT" == "SSH配置成功" ]; then
    echo "✅ SSH密钥配置成功！"
    echo ""
    echo "现在可以使用以下命令连接，无需密码："
    echo "  ssh ${SERVER_USER}@${SERVER_HOST}"
    echo ""
    echo "或者执行自动部署："
    echo "  ./igreen-backend/scripts/auto-deploy-key.sh"
else
    echo "⚠️  SSH密钥测试失败"
    echo ""
    echo "错误信息: ${TEST_RESULT}"
    echo ""
    echo "可能原因："
    echo "1. 服务器SSH配置不允许密钥认证"
    echo "2. 需要手动配置"
    echo ""
    echo "请尝试手动配置："
    echo "  ssh ${SERVER_USER}@${SERVER_HOST}"
    echo "  mkdir -p ~/.ssh && chmod 700 ~/.ssh"
    echo "  echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCfO6QvJsB8pw064NW7C2Bc7v+3QjgdyQ5ztyIUN89e5SiTML/oOQm/wlxWoh6KNUl7xJEFOARZ4PJEyiukl7EBRRbaJXLhDxIZ073DnrHe/r5xtbbQdsPtnwqXx0p1OZ5Kd2czRmYekGNEUIsxbDc+n4fo1imSfq0sm6QNSBEoygjbFRtL2B5YMir+W90a7IcmeBnr9uFSImHsNdYkT9bBJz/dSqMapNj6VWqqpkvrV9z0N0KKDXlklUNfP73oo3WJ4Eqsa4yRlEps1YBQKaP0De+xGK4bYO/9WWNG3Jq7ahVbD65vsTG3Xy1nFVnvdi+xg1zqj3+3HkQJznnjeupxnQgirtzaSRVlA9vzQvGty+BVxcTaMP065Fp6OZnXaa8+AinMVFHobFD38SP0LQvl8JE99rwranElPdjmDQEldBZhQc4vdny3I85Qi1jT5tGgCv5h0U/l82vpP5EdLNCKfTDzxaLdzyGzIM6q64XYcxIE4lNXdCXO6+5mOAwH5MY0aIhMsBEuv/pfKGsTX+m1mbyZ5PgFOAK0ocfRy71747Ej13G8EwCIPph0s3aZhlsOBkfXTON00H0i9wHFQuSB/obre+zoUqVU0j9VkvG0NjlilJsdz+LLSx/ptepgZyHN72cQo12olctCNm0VbCr6oRqOPsqy10L4TRpwhhRNtw== mac@litengfeiMacBook-Pro.local' >> ~/.ssh/authorized_keys"
    echo "  chmod 600 ~/.ssh/authorized_keys"
    echo ""
    echo "然后测试连接："
    echo "  ssh -o BatchMode=yes ${SERVER_USER}@${SERVER_HOST} 'echo 测试成功'"
    exit 1
fi

echo ""
echo "=========================================="
echo "配置完成！"
echo "=========================================="
