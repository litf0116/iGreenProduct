# ============================================
# iGreen Backend Makefile
# 用法: make [命令]
# ============================================

# 配置
APP_NAME = igreen-backend
PORT = 8001
JAVA_HOME ?= $(shell /usr/libexec/java_home -v 21 2>/dev/null || echo "/usr/lib/jvm/java-21-openjdk-amd64")

# 颜色
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
NC = \033[0m

.PHONY: help start stop restart build test clean init-db api-test docs

# ============================================
# 帮助信息
# ============================================

help:
	@echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
	@echo -e "${GREEN}║         iGreen Backend 开发命令                ║${NC}"
	@echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
	@echo ""
	@echo "可用命令:"
	@echo "  start       启动应用 (默认端口 8001)"
	@echo "  stop        停止应用"
	@echo "  restart     重启应用"
	@echo "  build       构建应用 (JAR)"
	@echo "  test        运行单元测试"
	@echo "  clean       清理构建产物"
	@echo "  init-db     初始化数据库测试数据"
	@echo "  api-test    运行 API 接口测试"
	@echo "  logs        查看应用日志"
	@echo "  swagger     打开 Swagger UI"
	@echo "  help        显示帮助信息"

# ============================================
# 应用管理
# ============================================

start:
	@echo -e "${YELLOW}启动应用...${NC}"
	@export JAVA_HOME=$(JAVA_HOME) && mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=$(PORT)"

stop:
	@echo -e "${YELLOW}停止应用...${NC}"
	@pkill -f "$(APP_NAME)" 2>/dev/null || echo "应用未运行"
	@echo -e "${GREEN}应用已停止${NC}"

restart: stop start

build:
	@echo -e "${YELLOW}构建应用...${NC}"
	@export JAVA_HOME=$(JAVA_HOME) && mvn clean package -DskipTests
	@echo -e "${GREEN}构建成功: target/$(APP_NAME)-1.0.0-SNAPSHOT.jar${NC}"

run-jar:
	@echo -e "${YELLOW}运行 JAR...${NC}"
	@export JAVA_HOME=$(JAVA_HOME) && java -jar target/$(APP_NAME)-1.0.0-SNAPSHOT.jar --server.port=$(PORT)

# ============================================
# 测试
# ============================================

test:
	@echo -e "${YELLOW}运行单元测试...${NC}"
	@export JAVA_HOME=$(JAVA_HOME) && mvn test
	@echo -e "${GREEN}测试完成${NC}"

api-test:
	@echo -e "${YELLOW}运行 API 接口测试...${NC}"
	@bash scripts/api_test.sh localhost $(PORT)

# ============================================
# 数据库
# ============================================

init-db:
	@echo -e "${YELLOW}初始化数据库测试数据...${NC}"
	@if [ -f "scripts/init_data.sql" ]; then \
		read -p "请输入 MySQL 密码: " -s MYSQL_PASSWORD && echo ""; \
		mysql -u root -p$$MYSQL_PASSWORD igreen_db < scripts/init_data.sql 2>/dev/null || \
		mysql -u root -p igreen_db < scripts/init_data.sql; \
		echo -e "${GREEN}数据库初始化完成${NC}"; \
	else \
		echo -e "${RED}初始化脚本不存在: scripts/init_data.sql${NC}"; \
	fi

# ============================================
# 清理
# ============================================

clean:
	@echo -e "${YELLOW}清理构建产物...${NC}"
	@mvn clean
	@rm -rf target
	@echo -e "${GREEN}清理完成${NC}"

# ============================================
# 日志和文档
# ============================================

logs:
	@tail -100f /tmp/app.log

swagger:
	@echo -e "${GREEN}打开 Swagger UI...${NC}"
	@if command -v open &> /dev/null; then \
		open "http://localhost:$(PORT)/swagger-ui.html"; \
	elif command -v xdg-open &> /dev/null; then \
		xdg-open "http://localhost:$(PORT)/swagger-ui.html"; \
	else \
		echo "请手动访问: http://localhost:$(PORT)/swagger-ui.html"; \
	fi

# ============================================
# Docker
# ============================================

docker-build:
	@echo -e "${YELLOW}构建 Docker 镜像...${NC}"
	@docker build -t $(APP_NAME):latest .

docker-run:
	@echo -e "${YELLOW}运行 Docker 容器...${NC}"
	@docker run -p $(PORT):8000 $(APP_NAME):latest

# ============================================
# 代码质量
# ============================================

lint:
	@echo -e "${YELLOW}代码检查...${NC}"
	@mvn checkstyle:check 2>/dev/null || echo "checkstyle 未配置"

format:
	@echo -e "${YELLOW}代码格式化...${NC}"
	@mvn formatter:format 2>/dev/null || echo "formatter 未配置"

# ============================================
# 开发
# ============================================

dev:
	@echo -e "${YELLOW}启动开发模式 (热重载)...${NC}"
	@export JAVA_HOME=$(JAVA_HOME) && mvn spring-boot:run -Dspring-boot.run.fork=false

watch:
	@echo -e "${YELLOW}监听文件变化...${NC}"
	@echo "请使用 IDE 的热重载功能或 dev 模式"
