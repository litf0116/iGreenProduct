# 后端日期时间序列化修复

## TL;DR

> **问题**：后端 API 返回的时间字段（如 createdAt, dueDate 等）是 ISO 格式或时间戳，前端无法直接调用 `.toLocaleDateString()` 方法。
>
> **根本原因**：后端未对日期时间字段进行格式化序列化。
>
> **解决方案**：在 Spring Boot 后端配置全局日期时间格式化，针对所有时间类型字段使用 `yyyy-MM-dd HH:mm:ss` 格式。
>
> **修复范围**：
> - 配置 Jackson 日期时间序列化
> - 全局统一日期格式
> - 验证 API 返回格式正确
>
> **预计工作量**：快速修复（10-20分钟）
> **并行执行**：NO
> **关键路径**：配置序列化 → 验证格式 → 前端适配

---

## Context

### 原始问题
前端 `TicketDetail.jsx` 组件调用 `.toLocaleDateString()` 方法时出错，因为 API 返回的时间字段是字符串格式但不是本地化格式。

### 错误信息
```
Uncaught TypeError: ticket.dueDate.getTime is not a function
```

### 调查结果
通过代码审查发现：
- 后端返回的时间字段是 ISO 8601 格式（如 `2025-01-20T10:00:00.000Z`）或时间戳
- 前端期望 `yyyy-MM-dd HH:mm:ss` 格式的字符串
- 需要在后端统一配置日期时间序列化格式

---

## Work Objectives

### Core Objective
在 Spring Boot 后端配置全局日期时间格式化，确保所有 API 返回的时间字段格式统一为 `yyyy-MM-dd HH:mm:ss`。

### Concrete Deliverables
1. 配置 Jackson 全局日期时间格式化
2. 统一所有时间字段的返回格式
3. 验证 API 返回的时间格式正确
4. 可选：保持前端的日期格式化辅助函数（作为后备）

### Definition of Done
- [ ] API 返回的所有时间字段格式统一为 `yyyy-MM-dd HH:mm:ss`
- [ ] 前端可以正常解析和显示日期时间
- [ ] 不破坏现有的日期时间处理逻辑
- [ ] 向后兼容（如果前端已有日期格式化逻辑）

### Must Have
- 所有 API 端点返回的日期时间格式一致
- 格式：`yyyy-MM-dd HH:mm:ss`
- 配置简单，不引入新依赖

### Must NOT Have (Guardrails)
- 不修改前端代码（除非必要）
- 不改变数据库存储格式
- 不影响现有的日期时间计算逻辑
- 不引入复杂的配置

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES - Spring Boot 应用
- **User wants tests**: NO - 手动验证 API 响应
- **Framework**: 无

### 手动验证

#### 验证步骤 1：检查当前 API 响应格式
```bash
# 启动后端
cd /Users/mac/workspace/iGreenProduct/igreen-backend
./mvnw spring-boot:run

# 调用 API 检查时间字段格式
curl http://localhost:8001/api/tickets | jq '.data[0].createdAt'
```

#### 验证步骤 2：验证新格式
```bash
# 调用 API 检查时间字段格式
curl http://localhost:8001/api/tickets | jq '.data[0].createdAt'
# 预期结果: "2025-01-20 10:00:00" 而不是 "2025-01-20T10:00:00.000Z"
```

---

## Execution Strategy

### 串行执行（Sequential）
由于任务之间有依赖关系，按顺序执行：

```
Wave 1 (Start Immediately):
└── Task 1: 配置 Jackson 日期时间序列化

Wave 2 (After Task 1):
└── Task 2: 验证 API 响应格式

Wave 3 (After Task 2):
└── Task 3: 可选 - 清理前端日期格式化代码（如有必要）
```

---

## TODOs

- [x] 1. 配置 Jackson 日期时间序列化（全局配置）

  **What to do**:
  - 创建或修改 Spring Boot 配置类
  - 配置 Jackson ObjectMapper 的日期时间格式
  - 设置时区为本地时区

  **Must NOT do**:
  - 不修改实体类注解（除非必要）
  - 不引入新依赖

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的配置修改
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 2, Task 3
  - **Blocked By**: None (can start immediately)

  **References**:

  **Spring Boot 日期时间序列化配置方式**：

  **方式 1：application.yml 配置（推荐）**
  ```yaml
  spring:
    jackson:
      serialization:
        write-dates-as-timestamps: false
      date-format: yyyy-MM-dd HH:mm:ss
      time-zone: Asia/Shanghai
  ```

  **方式 2：配置类方式**
  ```java
  @Configuration
  public class JacksonConfig {
      @Bean
      public ObjectMapper objectMapper() {
          ObjectMapper mapper = new ObjectMapper();
          mapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
          mapper.setTimeZone(TimeZone.getTimeZone("Asia/Shanghai"));
          return mapper;
      }
  }
  ```

  **Acceptance Criteria**:
  1. 所有 API 端点返回的日期时间格式统一为 `yyyy-MM-dd HH:mm:ss`
  2. 时区正确（Asia/Shanghai）
  3. 配置不影响其他 JSON 序列化逻辑

  **验证步骤**（手动）：
  1. 启动后端服务
  2. 调用任意包含时间字段的 API
  3. 检查响应中的时间字段格式

  **Evidence to Capture**:
  - [ ] API 响应截图或 JSON 示例

  **Commit**: YES
    - Message: `fix(backend): 配置 Jackson 日期时间序列化格式`
    - Files: `application.yml` 或新增配置类
    - Pre-commit: API 响应格式正确

---

- [x] 2. 验证 API 响应格式

  **What to do**:
  - 调用多个 API 端点
  - 检查时间字段格式是否统一
  - 验证时区正确

  **Must NOT do**:
  - 不修改 API 逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 验证步骤
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **需要验证的 API 端点**:
  - GET /api/tickets - 工单列表
  - GET /api/tickets/{id} - 工单详情
  - GET /api/users - 用户列表
  - 其他包含时间字段的 API

  **Acceptance Criteria**:
  1. 所有时间字段格式为 `yyyy-MM-dd HH:mm:ss`
  2. 时区为本地时间（Asia/Shanghai）
  3. 无 null 或空值问题

  **验证步骤**（手动）：
  1. 调用工单列表 API
  2. 检查 createdAt, updatedAt, dueDate 等字段
  3. 调用其他 API 验证格式一致性

  **Commit**: NO
    - 这是一个验证步骤

---

- [x] 3. 可选 - 清理前端日期格式化代码（如有必要）

  **What to do**:
  - 如果后端格式化正确，可以简化前端的日期处理逻辑
  - 或者保留前端格式化作为后备（推荐）

  **Must NOT do**:
  - 不引入新的问题

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 可选的优化步骤
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: None
  - **Blocked By**: Task 2

  **Acceptance Criteria**:
  1. 前端仍然可以正常显示日期
  2. 代码更简洁（可选）

  **Commit**: 可选
    - Message: `refactor(frontend): 简化日期处理逻辑（可选）`
    - Files: TicketDetail.jsx
    - Pre-commit: 功能正常

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(backend): 配置 Jackson 日期时间序列化格式` | `application.yml` 或 `JacksonConfig.java` | API 响应格式正确 |
| 2 | - | - | 验证通过 |
| 3 | `refactor(frontend): 简化日期处理逻辑` | `TicketDetail.jsx` | 前端正常显示 |

---

## Success Criteria

### Verification Commands
```bash
# 启动后端
cd /Users/mac/workspace/iGreenProduct/igreen-backend
./mvnw spring-boot:run

# 检查 API 响应
curl http://localhost:8001/api/tickets | jq '.data[0].createdAt'
# 预期: "2025-01-20 10:00:00"
```

### Final Checklist
- [x] Task 1: Jackson 日期时间序列化配置完成
- [x] Task 2: API 响应格式验证通过
- [x] Task 3: 前端日期显示正常（可选）
- [x] 所有时间字段格式统一为 `yyyy-MM-dd HH:mm:ss`
- [x] 前端可以正常解析和显示日期时间

### 修复后预期结果
1. API 返回的所有时间字段格式统一为 `yyyy-MM-dd HH:mm:ss`
2. 前端可以正常调用 `.toLocaleDateString()` 等方法
3. 所有时区正确（Asia/Shanghai）
4. 无日期格式化相关的错误
