# AGENTS.md

<!-- OPENSPEC:START -->
# OpenSpec 使用说明

这些说明适用于在此项目中工作的 AI助手。

## 语言偏好设置

**默认使用中文**：除非明确说明使用英文，否则所有输出都应使用中文，包括：
- 文档内容
- 代码注释
- 提交信息
- 规范说明

## 工作流程

当请求满足以下条件时，始终打开`@/openspec/AGENTS.md`：
- 提及规划或提案（如提案、规范、变更、计划等词语）
- 引入新功能、重大变更、架构变更或大型性能/安全工作时
- 听起来不明确，需要在编码前了解权威规范时

使用`@/openspec/AGENTS.md`了解：
- 如何创建和应用变更提案
- 规范格式和约定
- 项目结构和指南

保持此托管块，以便'openspec-cn update'可以刷新说明。

<!-- OPENSPEC:END -->

---

## 构建、测试和检查命令

### 后端 (Spring Boot 3 + Java 17)

**环境要求**: Java 17 (必须)

```bash
# 设置 Java 17 环境
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
java -version  # 验证版本

cd igreen-backend

# 开发模式运行（端口 8080）
make dev                    # 开发模式（自动重载）
mvn spring-boot:run        # 直接使用 Maven
make start                 # 后台启动

# 构建
mvn clean compile         # 编译
make build                # 使用 Makefile 构建
mvn clean package         # 打包

# 测试
mvn test                   # 运行所有测试
mvn test -Dtest=TestName   # 运行单个测试
mvn test -Dtest=*UserTest   # 运行匹配的测试类

# 数据库
mysql -u root -p < init-scripts/01-schema.sql  # 初始化数据库

# 生产部署
java -jar target/igreen-backend-1.0.0.jar
```

### 前端 - iGreenApp (工程师移动APP)

```bash
cd iGreenApp

npm install              # 安装依赖
npm run dev            # 启动开发服务器 (端口 3000)
npm run build           # 生产构建

# 测试
npm run test            # 运行测试（如果配置）
npm run test:ui        # 测试 UI 模式
```

### 前端 - iGreenticketing (管理员系统)

```bash
cd iGreenticketing

npm install            # 安装依赖
npm run dev           # 启动开发服务器
npm run build          # 生产构建

# 测试
npm run test           # 运行测试
```

---

## 代码风格指南

### 通用原则
- 保持组件和函数专注单一职责
- 使用代码库中现有的模式和库
- 遵循已建立的文件夹结构
- iGreenApp 优先考虑移动端响应式设计

### Java (后端)

#### 命名约定
- **类名**: PascalCase (UserController, UserService, TicketService)
- **方法名**: camelCase，动词开头 (getUserById, createUser, validateToken)
- **常量**: UPPER_SNAKE_CASE (DEFAULT_PAGE_SIZE, MAX_RETRY_COUNT)
- **变量**: camelCase (userList, ticketCount, isActive)
- **包名**: 全小写 (com.igreen.domain.controller)

#### 结构约定
```
Controller → Service → Mapper → Database
     ↓          ↓         ↓
   DTO      Entity    Entity
```

#### 层级职责
- **Controller**: 处理 HTTP 请求/响应，参数验证，调用 Service
- **Service**: 业务逻辑，事务管理，调用 Mapper 和其他 Service
- **Mapper**: 数据访问，MyBatis XML 或注解
- **DTO**: 数据传输对象，Request/Response 分离
- **Entity**: 数据库实体，对应表结构

#### 注解使用
- `@RestController`: API 控制器
- `@RequestMapping("/api/xxx")`: 路由前缀
- `@GetMapping`, `@PostMapping`: HTTP 方法
- `@PreAuthorize`: 权限控制
- `@Transactional`: 事务管理
- `@Valid`: 参数验证

#### 异常处理
- 使用自定义业务异常 `BusinessException(ErrorCode)`
- 统一异常处理器 `GlobalExceptionHandler`
- 错误码枚举 `ErrorCode`
- 返回格式: `Result.failure(errorCode)`

#### 日志规范
- 使用 SLF4J: `private static final Logger log = LoggerFactory.getLogger(ClassName.class);`
- 日志级别: ERROR(错误), WARN(警告), INFO(重要信息), DEBUG(调试)
- 敏感信息脱敏: 不记录密码、Token 等

### TypeScript/React (前端)

#### 组件结构
```typescript
// 定义 Props 接口（组件前）
interface Props {
  title: string;
  onConfirm: () => void;
}

// 函数组件
export function ComponentName({ title, onConfirm }: Props) {
  // Hooks 在顶部
  const [state, setState] = useState<Type>(initial);

  // 事件处理函数以 handle 开头
  const handleConfirm = () => {
    // ...
  };

  return <div>...</div>;
}
```

#### 命名约定
- **组件**: PascalCase (Dashboard, TicketList, TicketDetail)
- **函数/处理器**: camelCase with handle 前缀 (handleLogin, loadTickets, handleTicketClick)
- **常量**: UPPER_SNAKE_CASE (MOCK_TICKETS, API_BASE_URL)
- **类型/接口**: PascalCase (Ticket, UserProfile, TicketStatus)
- **状态变量**: camelCase (isAuthenticated, currentView, selectedTicket)

#### 导入顺序
```typescript
// 1. 外部 React/core imports first
import React, { useState, useEffect } from 'react';

// 2. 第三方库
import { Button } from "./components/ui/button";
import { toast } from 'sonner';

// 3. 本地组件
import { Dashboard } from './components/Dashboard';

// 4. 本地工具/库
import { api } from './lib/api';
import { Ticket, TicketStatus } from './lib/data';
```

#### 样式规范
- 优先使用 Tailwind CSS 工具类
- 组件变体使用 class-variance-authority (CVA) 用于 UI 组件
- 条件类合并使用 cn() 辅助函数
- 使用 slate 色板作为基础: slate-50, slate-900, slate-500 等
- indigo/primary 颜色用于操作: indigo-600, bg-indigo-500

#### 错误处理
- async 操作使用 try/catch
- 通过 sonner 显示用户友好的 toast 通知: `toast.error("错误消息")`
- 处理 401 错误重定向到登录页并清除 token
- API 失败使用乐观更新回滚（参考 App.tsx:108-134）

#### 状态管理
- 使用 React hooks 管理本地状态
- 使用乐观更新提升用户体验（立即更新 UI，API 失败时回滚）
- API 调用集中在 lib/api.ts 文件
- 分页使用 URL search params 或 query strings (offset, limit)

---

## 测试脚本管理

### 测试目录结构
```
tests/
├── backend/              # 后端 API 测试
│   ├── auth.test.sh
│   ├── user.test.sh
│   └── ticket.test.sh
├── integration/          # 集成测试
│   └── e2e.test.sh
└── logs/                # 测试日志
```

### 测试脚本规范
- 使用 `*.test.sh` 命名
- 测试脚本头部包含：描述、依赖、执行步骤
- 测试结果记录到日志文件
- 失败的测试返回非零退出码

### 测试脚本模板
```bash
#!/bin/bash
# ============================================================================
# 测试名称: 用户注册和登录
# 描述: 验证用户注册流程和登录功能
# 依赖: 后端服务运行在 8080 端口
# ============================================================================

BASE_URL="http://localhost:8080"
LOG_FILE="tests/logs/$(basename $0 .sh).log"

# 创建日志目录
mkdir -p tests/logs

# 测试函数
test_register() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 测试用户注册..." | tee -a "$LOG_FILE"

  RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "测试用户",
      "username": "testuser_$(date +%s)",
      "password": "Test1234",
      "confirmPassword": "Test1234",
      "country": "China"
    }')

  SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')

  if [ "$SUCCESS" = "true" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 注册成功" | tee -a "$LOG_FILE"
    return 0
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 注册失败: $RESPONSE" | tee -a "$LOG_FILE"
    return 1
  fi
}

# 执行测试并检查结果
if test_register; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 测试通过 ✓" | tee -a "$LOG_FILE"
  exit 0
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 测试失败 ✗" | tee -a "$LOG_FILE"
  exit 1
fi
```

### 回归测试管理
- **定期清理**: 删除超过 30 天的测试日志
- **版本标记**: 测试脚本名称包含版本或日期
- **失败标记**: 失败的测试在文件名添加 `.failed` 后缀
- **自动清理**: 执行 `make clean-tests` 清理过期测试

```bash
# 清理命令
make clean-tests        # 删除过期测试日志
make test-report        # 生成测试报告
```

---

## 项目结构

```
iGreenProduct/
├── igreen-backend/               # Spring Boot 3 后端 (Java 21)
│   ├── src/main/java/com/igreen/
│   │   ├── domain/
│   │   │   ├── controller/       # REST API 控制器
│   │   │   ├── entity/           # JPA 实体
│   │   │   ├── dto/              # 数据传输对象
│   │   │   ├── enums/            # 枚举类型
│   │   │   ├── mapper/           # MyBatis Mapper 接口
│   │   │   └── service/          # 业务逻辑
│   │   └── common/
│   │       ├── config/           # 配置类
│   │       ├── exception/        # 异常处理
│   │       ├── result/           # 响应封装
│   │       └── utils/            # 工具类
│   ├── src/main/resources/
│   │   ├── mapper/               # MyBatis XML 映射
│   │   └── application.yml       # 应用配置
│   └── init-scripts/             # 数据库初始化
│
├── iGreenApp/                    # 工程师移动APP
│   └── src/
│       ├── components/        # React 组件
│       │   ├── ui/           # shadcn/ui 组件
│       │   └── [Feature].tsx  # 功能组件
│       ├── lib/              # API 客户端、类型、工具
│       ├── App.tsx           # 主应用组件
│       └── main.tsx          # 入口点
│
├── iGreenticketing/           # 管理员派单系统
│   └── src/
│       ├── components/       # React 组件
│       ├── lib/             # API 客户端、类型、mock 数据
│       ├── App.tsx          # 主应用组件
│       └── main.tsx         # 入口点
│
├── tests/                       # 集成测试脚本
│   ├── backend/          # 后端 API 测试
│   ├── integration/      # 集成测试
│   └── logs/            # 测试日志
│
└── AGENTS.md            # 本文件
```

---

## 关键模式

### API 客户端模式
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}
```

### 类型定义
```typescript
export type TicketStatus = 'open' | 'assigned' | 'departed' | 'arrived' | 'review' | 'completed';
export interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  // ...
}
```

### 后端分层架构
```
Controller (参数验证) → Service (业务逻辑) → Mapper (数据访问)
     ↓                    ↓                 ↓
   DTO                 Entity           Entity
```

### 统一响应格式
```java
public class Result<T> {
    private Boolean success;
    private String message;
    private T data;
    private String code;

    public static <T> Result<T> success(T data) { ... }
    public static <T> Result<T> failure(ErrorCode errorCode) { ... }
}
```

---

## 重要注意事项

### 文件大小格式化
使用 `@lib/core/services/file_path_manager.dart` 格式化文件大小（前端项目）

### Git 分支命名
创建分支时添加日期前缀: `YYYYMMDD_description` (例如: `20250211_add-user-auth`)

### 开发者信息
- 当前开发者: litengfei
- 项目语言: 中文（文档用中文，代码用英文）

### 配置
- **后端**: 使用 .env 文件配置环境变量
- **前端**: 使用 VITE_API_URL 环境变量配置后端 API URL
- **默认端口**:
  - 后端: 8080
  - iGreenApp: 3000
  - iGreenticketing: 5173

### UI 组件
- 使用 shadcn/ui 组件从 components/ui/
- 图标来自 lucide-react
- Toast 通知通过 sonner
- 使用 Badge 组件显示状态/优先级

### 数据流
- **iGreenApp**: 使用集中式 API 客户端调用后端端点
- **iGreenticketing**: 当前使用 mock 数据，需要与后端集成

---

## 安全注意事项

1. **必须修改**的默认密码
2. 使用强随机 SECRET_KEY
3. 生产环境使用 HTTPS
4. 配置防火墙规则
5. 定期备份数据库
6. 使用环境变量存储敏感信息
7. 限制 CORS 来源

---

## 开发指南

### 添加新的 API 端点
1. 在 `domain/entity/` 添加数据模型
2. 在 `domain/dto/` 添加 Pydantic 模式
3. 在 `domain/mapper/` 添加路由
4. 在 `main.py` 中注册路由

### 修改前端 API 调用
编辑 `src/lib/api.ts` 文件添加新的 API 方法

### 测试新功能
1. 在 `tests/` 创建对应测试脚本
2. 执行测试验证功能
3. 测试脚本加入回归测试套件

---

## 最近更新

### 2025-02-11
- **优化**: 用户注册和创建用户时，自动生成 `username@igreen.com` 作为默认邮箱
- **修复**: CustomUserDetailsService 支持无 email 用户认证
- **修复**: SecurityConfig 添加 `/api/doc.html` 公开访问权限
- **测试**: 添加完整的测试脚本和测试目录结构
- **文档**: 创建/更新 AGENTS.md 文档

---

**文档版本**: 2.0.0
**最后更新**: 2025-02-11
