#!/bin/bash
# 代理切换脚本 - 用于切换前端代理目标
# 使用方法:
# ./switch-proxy.sh local  - 切换到本地代理 (127.0.0.1:8089)
# ./switch-proxy.sh remote - 切换到远程代理 (43.255.212.68:8088)
# ./switch-proxy.sh        - 显示当前代理状态

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ENV_FILE="$SCRIPT_DIR/.env"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 显示当前代理配置
show_current() {
    if [ -f "$ENV_FILE" ]; then
        current_url=$(grep "VITE_API_URL=" "$ENV_FILE" | cut -d'=' -f2)
        echo -e "${GREEN}当前API配置: ${NC}$current_url"
        
        # 检查是否有PROXY_TARGET环境变量设置
        if [ -n "$PROXY_TARGET" ]; then
            echo -e "${YELLOW}当前代理目标: ${NC}$PROXY_TARGET"
        else
            echo -e "${YELLOW}当前代理目标: ${NC}http://127.0.0.1:8089 (默认本地)"
        fi
    else
        echo -e "${RED}错误: 找不到.env文件${NC}"
    fi
}

# 切换到本地代理
switch_to_local() {
    echo -e "${YELLOW}切换到本地代理...${NC}"
    
    # 更新.env文件中的API URL
    if [ -f "$ENV_FILE" ]; then
        sed -i.bak 's|VITE_API_URL=.*|VITE_API_URL=http://127.0.0.1:8089|' "$ENV_FILE"
        echo -e "${GREEN}✓ .env 文件已更新为本地API地址${NC}"
    else
        echo -e "${RED}错误: 找不到.env文件${NC}"
        exit 1
    fi
    
    # 创建本地代理环境变量文件
    cat > "$SCRIPT_DIR/.env.local" << EOF
# 本地开发环境变量
PROXY_TARGET=http://127.0.0.1:8089
EOF
    
    echo -e "${GREEN}✓ 已创建 .env.local 文件${NC}"
    echo -e "${YELLOW}使用方式:${NC}"
    echo -e "  ${GREEN}source .env.local${NC} && npm run dev"
    echo -e "  或者"
    echo -e "  ${GREEN}PROXY_TARGET=http://127.0.0.1:8089 npm run dev${NC}"
}

# 切换到远程代理
switch_to_remote() {
    echo -e "${YELLOW}切换到远程代理...${NC}"
    
    # 更新.env文件中的API URL
    if [ -f "$ENV_FILE" ]; then
        sed -i.bak 's|VITE_API_URL=.*|VITE_API_URL=http://43.255.212.68:8088|' "$ENV_FILE"
        echo -e "${GREEN}✓ .env 文件已更新为远程API地址${NC}"
    else
        echo -e "${RED}错误: 找不到.env文件${NC}"
        exit 1
    fi
    
    # 创建远程代理环境变量文件
    cat > "$SCRIPT_DIR/.env.remote" << EOF
# 远程开发环境变量
PROXY_TARGET=http://43.255.212.68:8088
EOF
    
    echo -e "${GREEN}✓ 已创建 .env.remote 文件${NC}"
    echo -e "${YELLOW}使用方式:${NC}"
    echo -e "  ${GREEN}source .env.remote${NC} && npm run dev"
    echo -e "  或者"
    echo -e "  ${GREEN}PROXY_TARGET=http://43.255.212.68:8088 npm run dev${NC}"
}

# 测试连接
test_connection() {
    echo -e "${YELLOW}测试API连接...${NC}"
    
    local_success=$(curl -s --max-time 5 http://127.0.0.1:8089/api/health >/dev/null 2>&1 && echo "成功" || echo "失败")
    remote_success=$(curl -s --max-time 5 http://43.255.212.68:8088/api/health >/dev/null 2>&1 && echo "成功" || echo "失败")
    
    echo -e "${GREEN}本地API (127.0.0.1:8089):${NC} $local_success"
    echo -e "${GREEN}远程API (43.255.212.68:8088):${NC} $remote_success"
}

# 主程序
main() {
    case "$1" in
        "local")
            switch_to_local
            ;;
        "remote")
            switch_to_remote
            ;;
        "test")
            test_connection
            ;;
        "help"|"-h"|"--help")
            echo "代理切换脚本"
            echo ""
            echo "使用方法:"
            echo "  $0 local   - 切换到本地代理 (127.0.0.1:8089)"
            echo "  $0 remote  - 切换到远程代理 (43.255.212.68:8088)"
            echo "  $0 test    - 测试API连接"
            echo "  $0         - 显示当前配置"
            echo ""
            echo "示例:"
            echo "  $0 local && npm run dev"
            echo "  PROXY_TARGET=http://127.0.0.1:8089 npm run dev"
            ;;
        *)
            show_current
            echo ""
            echo -e "${YELLOW}可用命令:${NC}"
            echo "  $0 local   - 切换到本地代理"
            echo "  $0 remote  - 切换到远程代理"
            echo "  $0 test    - 测试API连接"
            echo "  $0 help    - 显示帮助"
            ;;
    esac
}

main "$@"