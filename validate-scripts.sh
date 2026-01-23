#!/bin/bash

# 验证igreen-backend/scripts目录下所有脚本的基本功能

echo "🧪 开始验证igreen-backend/scripts目录下的脚本..."

SCRIPT_DIR="igreen-backend/scripts"
cd "$SCRIPT_DIR" 2>/dev/null || { echo "❌ 找不到脚本目录"; exit 1; }

# 测试脚本语法
echo "📋 检查脚本语法..."
scripts=$(ls *.sh 2>/dev/null)
for script in $scripts; do
    if bash -n "$script" 2>/dev/null; then
        echo "✅ $script 语法正确"
    else
        echo "❌ $script 语法错误"
    fi
done

# 测试主要部署脚本的功能
echo ""
echo "🔧 测试主要部署脚本..."

# 测试quick-update.sh帮助
echo "测试quick-update.sh --help..."
if ./quick-update.sh --help | grep -q "使用方法:"; then
    echo "✅ quick-update.sh 帮助功能正常"
else
    echo "❌ quick-update.sh 帮助功能异常"
fi

# 测试deploy-to-server.sh语法（不实际执行）
echo "测试deploy-to-server.sh语法..."
if bash -n deploy-to-server.sh 2>/dev/null; then
    echo "✅ deploy-to-server.sh 语法正常"
else
    echo "❌ deploy-to-server.sh 语法异常"
fi

# 检查脚本执行权限
echo ""
echo "🔐 检查脚本执行权限..."
for script in $scripts; do
    if [ -x "$script" ]; then
        echo "✅ $script 有执行权限"
    else
        echo "⚠️  $script 缺少执行权限"
        chmod +x "$script"
        echo "  已修复执行权限"
    fi
done

# 检查脚本中的硬编码路径问题
echo ""
echo "🔍 检查脚本中的路径问题..."

# 检查是否存在从脚本目录到上级目录的硬编码路径
echo "检查quick-update.sh中的路径..."
problematic_paths=$(grep -n "\.\./\.\./\|igreen-backend/target" quick-update.sh || true)
if [ -n "$problematic_paths" ]; then
    echo "⚠️  quick-update.sh中发现路径问题:"
    echo "$problematic_paths"
else
    echo "✅ quick-update.sh路径配置正确"
fi

echo "检查deploy-to-server.sh中的路径..."
problematic_paths=$(grep -n "\.\./\.\./\|igreen-backend/target" deploy-to-server.sh || true)
if [ -n "$problematic_paths" ]; then
    echo "⚠️  deploy-to-server.sh中发现路径问题:"
    echo "$problematic_paths"
else
    echo "✅ deploy-to-server.sh路径配置正确"
fi

echo ""
echo "🎯 脚本验证完成！"

echo ""
echo "📋 脚本使用建议:"
echo "1. quick-update.sh - 用于日常代码更新和快速部署"
echo "2. deploy-to-server.sh - 用于完整的环境部署"
echo "3. full-deploy.sh - 完整的自动化部署流程"
echo "4. drone-deploy.sh - CI/CD流水线部署"
echo ""
echo "💡 使用前请确保:"
echo "- 在项目根目录运行脚本"
echo "- SSH密钥配置正确"
echo "- 服务器环境已准备好"