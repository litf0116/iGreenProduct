# 工作计划：Field Value Template Data 架构改进

## TL;DR

> **核心目标**: 让每个 field 直接存储 value，消除字段映射，实现动态表单的自包含数据结构
> 
> **关键变更**: 引入 `templateData` 字段，替代顶层分散字段（rootCause, solution, feedback 等）
> 
> **技术选型**: 完整模板格式 + 一次性迁移 + 后端适配 + 不迁移历史数据

**交付物**:
- ✅ 新的数据结构（TemplateFieldValue 接口）
- ✅ 前端表单渲染逻辑重构
- ✅ 后端实体和 DTO 改造
- ✅ 数据库 Schema 更新
- ✅ API 转换层更新

**预计工作量**: Medium（2-3 天）
**并行执行**: YES - 前后端可并行开发
**关键路径**: 数据库 → 后端实体 → 后端 API → 前端类型 → 前端表单

---

## Context

### 原始需求

**用户原话**:
> "我们这里每一个 step 中的每一个 field 中的表单项都是动态渲染的。根据动态渲染处理的表单。其表单的输入值也是动态的一个结构。我们这里针对 step 步骤表单项。我们在其中补充录入值 value 属性 这样我们针对每一field 记录其对应的值了"

**需求分析**:
- 当前问题：字段分散存储在 Ticket 顶层，需要通过 `FIELD_ID_TO_LEGACY_FIELD` 映射
- 目标架构：每个 field 自己存储 value，数据结构自包含
- 改造范围：前后端数据模型、API、表单渲染逻辑

### 当前架构分析

**现有字段存储方式**:
```typescript
// 问题：字段分散在顶层
Ticket {
  rootCause?: string;          // corrective 专用
  solution?: string;           // corrective/problem 专用
  beforePhotoUrls?: string[];  // corrective 专用
  afterPhotoUrls?: string[];   // corrective 专用
  feedback?: string;           // planned 专用
  // ... 更多字段
}
```

**字段映射机制**:
```typescript
// 问题：需要维护映射表
export const FIELD_ID_TO_LEGACY_FIELD: Record<string, string> = {
  'field-root-cause': 'rootCause',
  'field-solution': 'solution',
  // ...
};
```

**新架构**:
```typescript
// 解决：field 自包含数据
Ticket {
  templateData?: {
    steps: [{
      fields: [{
        id: 'field-root-cause',
        value: 'Network module failure',  // ✨ field 自己存储值
        timestamp: '2026-01-20T14:30:00Z'
      }]
    }]
  }
}
```

### 技术决策

| 决策项 | 选择 | 说明 |
|--------|------|------|
| **数据格式** | 完整模板 | `templateData: { steps: [{ fields: [{ value }] }] }` |
| **迁移方案** | 一次性迁移 | 直接切换，需要停机维护 |
| **后端对接** | 后端适配 | 后端新增字段，前后端协同改造 |
| **历史数据** | 不迁移 | 只处理新工单，历史数据保持原样 |

---

## Work Objectives

### 核心目标

实现 field 自包含数据结构，消除字段映射依赖，提升动态表单的可扩展性。

### 具体交付物

1. **前端类型系统** (iGreenApp)
   - 新增 `TemplateFieldValue` 接口
   - 新增 `TicketTypeTemplateWithData` 接口
   - 更新 `Ticket` 接口添加 `templateData` 字段

2. **前端表单逻辑** (iGreenApp)
   - 重构 `DynamicFieldRenderer` 组件
   - 重构 `TicketDetail` 的字段读写逻辑
   - 移除 `FIELD_ID_TO_LEGACY_FIELD` 映射依赖

3. **前端 API 层** (iGreenApp)
   - 更新 `transformTicket` 函数
   - 更新 `updateTicket` 函数
   - 更新 `submitTicketForReview` 函数

4. **后端实体层** (igreen-backend)
   - Ticket 实体添加 `templateData` 字段
   - TicketUpdateRequest 添加 `templateData` 参数
   - TicketResponse 添加 `templateData` 字段

5. **后端服务层** (igreen-backend)
   - TicketService 更新处理逻辑
   - JSON 序列化/反序列化

6. **数据库层** (MySQL 8.0.44)
   - 添加 `template_data JSON` 字段
   - 创建迁移脚本

### 完成定义 (Definition of Done)

- [ ] 前端类型定义更新完成，TypeScript 编译通过
- [ ] 前端表单可以正常渲染和保存 field.value
- [ ] 后端 API 可以接收和返回 templateData
- [ ] 数据库字段创建成功
- [ ] 集成测试通过：创建工单 → 填写表单 → 提交审核
- [ ] 旧字段保持兼容，历史工单正常显示

### 必须有 (Must Have)

- ✅ field.value 动态存储功能
- ✅ 前后端数据同步
- ✅ 数据库 JSON 字段支持
- ✅ 向后兼容（旧字段保留）

### 必须没有 (Must NOT Have)

- ❌ 修改历史工单数据
- ❌ 破坏现有 preventive 类型的 steps 功能
- ❌ 移除旧字段（rootCause 等）- 必须保留以兼容历史数据
- ❌ 过度抽象或不必要的复杂性

---

## Verification Strategy

### 测试决策

- **基础设施存在**: YES（前端无单元测试，依赖手动测试）
- **自动化测试**: NONE
- **框架**: N/A
- **Agent-Executed QA**: ALWAYS（mandatory for all tasks）

### QA 策略

每个任务必须包含 Agent-Executed QA 场景，使用以下工具：

- **前端/UI**: Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Bash (curl) — Send requests, assert status + response fields
- **数据库**: Bash (mysql) — Query, verify schema, check data

### 验证场景模板

```
Scenario: [Happy path]
  Tool: [Playwright / Bash (curl) / Bash (mysql)]
  Preconditions: [Exact setup state]
  Steps:
    1. [Exact action]
    2. [Assertion]
  Expected Result: [Concrete, observable, binary pass/fail]
  Evidence: .sisyphus/evidence/task-{N}-{scenario-slug}.{ext}
```

---

## Execution Strategy

### 并行执行波次

```
Wave 1 (Start Immediately — 数据库 + 后端基础):
├── Task 1: 数据库 Schema 更新 [quick]
├── Task 2: 后端实体添加字段 [quick]
├── Task 3: 后端 DTO 更新 [quick]
└── Task 4: 后端 Mapper 更新 [quick]

Wave 2 (After Wave 1 — 后端服务层):
├── Task 5: TicketService 更新逻辑 [unspecified-high]
└── Task 6: 后端集成测试 [quick]

Wave 3 (After Wave 1 — 前端类型系统，与 Wave 2 并行):
├── Task 7: 前端类型定义更新 [quick]
└── Task 8: 前端 API 转换层更新 [unspecified-high]

Wave 4 (After Wave 3 — 前端表单逻辑):
├── Task 9: DynamicFieldRenderer 重构 [unspecified-high]
├── Task 10: TicketDetail 字段读写重构 [deep]
└── Task 11: PhotoUploader 适配 [quick]

Wave 5 (After Wave 4 — 集成验证):
├── Task 12: 端到端测试 - Corrective [deep]
├── Task 13: 端到端测试 - Planned [deep]
├── Task 14: 端到端测试 - Problem [deep]
└── Task 15: 端到端测试 - Preventive [deep]

Wave FINAL (After ALL tasks — 独立审查):
├── Task F1: 代码质量审查 [unspecified-high]
├── Task F2: 历史数据兼容性验证 [unspecified-high]
├── Task F3: 文档更新 [writing]
└── Task F4: 清理和优化 [quick]
```

**关键路径**: Task 1 → Task 2-4 → Task 5 → Task 7-8 → Task 10 → Task 12-15 → F1-F4
**并行加速**: ~40% faster than sequential
**最大并发**: 4 (Wave 1 & Wave 3)

---

## TODOs

> 实现任务列表 - 每个任务包含详细步骤、参考代码、验收标准

- [ ] 1. **数据库 Schema 更新** [quick]

  **What to do**:
  - 在 `igreen-backend/init-scripts/` 创建迁移脚本 `02-add-template-data.sql`
  - 添加 SQL: `ALTER TABLE tickets ADD COLUMN template_data JSON COMMENT '模板数据（包含字段值）'`
  - 更新 `01-schema.sql` 在 tickets 表定义中添加字段

  **Must NOT do**:
  - ❌ 不要删除旧字段（rootCause, solution 等）
  - ❌ 不要修改现有数据

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件修改，SQL 语句简单
  - **Skills**: [`git-master`]
    - `git-master`: 数据库迁移文件需要提交

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Task 5 (后端服务需要数据库字段)
  - **Blocked By**: None

  **References**:
  - `igreen-backend/init-scripts/01-schema.sql:98` - tickets 表定义位置
  - `igreen-backend/init-scripts/01-schema.sql:38` - step_data 字段定义参考（JSON 类型）

  **Acceptance Criteria**:
  - [ ] 文件 `02-add-template-data.sql` 已创建
  - [ ] SQL 语句语法正确
  - [ ] 字段注释清晰

  **QA Scenarios**:
  ```
  Scenario: 数据库迁移脚本验证
    Tool: Bash (mysql)
    Preconditions: MySQL 服务运行中
    Steps:
      1. mysql -u root -p igreen < init-scripts/02-add-template-data.sql
      2. mysql -u root -p -e "DESCRIBE igreen.tickets" | grep template_data
    Expected Result: 输出包含 "template_data" 行
    Failure Indicators: ERROR 或字段不存在
    Evidence: .sisyphus/evidence/task-01-schema-update.txt
  ```

  **Commit**: YES
  - Message: `feat(database): add template_data JSON column`
  - Files: `init-scripts/02-add-template-data.sql, init-scripts/01-schema.sql`

---

- [ ] 2. **后端实体添加字段** [quick]

  **What to do**:
  - 在 `Ticket.java` 实体类中添加字段：`private String templateData;`
  - 添加 Getter 和 Setter 方法
  - 放在 `stepData` 字段之后（line 38 附近）

  **Must NOT do**:
  - ❌ 不要删除旧字段
  - ❌ 不要修改字段类型（使用 String，与 stepData 保持一致）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单实体类添加字段，简单直接
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:
  - `igreen-backend/src/main/java/com/igreen/domain/entity/Ticket.java:38` - stepData 字段定义参考
  - `igreen-backend/src/main/java/com/igreen/domain/entity/Ticket.java:39-41` - Getter/Setter 模式

  **Acceptance Criteria**:
  - [ ] 字段已添加到实体类
  - [ ] Getter/Setter 已添加
  - [ ] Java 编译通过

  **QA Scenarios**:
  ```
  Scenario: 实体类编译验证
    Tool: Bash
    Preconditions: JDK 21 安装
    Steps:
      1. cd igreen-backend
      2. mvn clean compile
    Expected Result: BUILD SUCCESS
    Failure Indicators: 编译错误
    Evidence: .sisyphus/evidence/task-02-compile.txt
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `feat(backend): add templateData field to Ticket entity`
  - Files: `Ticket.java`

---

- [ ] 3. **后端 DTO 更新** [quick]

  **What to do**:
  - 在 `TicketUpdateRequest.java` 添加参数：`Map<String, Object> templateData`
  - 在 `TicketResponse.java` 添加字段：`Map<String, Object> templateData`
  - （可选）在 `TicketCreateRequest.java` 添加字段

  **Must NOT do**:
  - ❌ 不要修改其他参数
  - ❌ 不要移除旧字段参数

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: DTO record 修改简单
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:
  - `igreen-backend/src/main/java/com/igreen/domain/dto/TicketUpdateRequest.java` - 更新请求 DTO
  - `igreen-backend/src/main/java/com/igreen/domain/dto/TicketResponse.java` - 响应 DTO
  - `igreen-backend/src/main/java/com/igreen/domain/dto/TicketUpdateRequest.java:stepValues` - Map 类型参数参考

  **Acceptance Criteria**:
  - [ ] TicketUpdateRequest 已添加 templateData 参数
  - [ ] TicketResponse 已添加 templateData 字段
  - [ ] Java 编译通过

  **QA Scenarios**:
  ```
  Scenario: DTO 编译验证
    Tool: Bash
    Preconditions: Task 2 完成
    Steps:
      1. cd igreen-backend
      2. mvn clean compile
    Expected Result: BUILD SUCCESS
    Evidence: .sisyphus/evidence/task-03-compile.txt
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `feat(backend): add templateData to DTOs`
  - Files: `TicketUpdateRequest.java, TicketResponse.java`

---

- [ ] 4. **后端 Mapper 更新** [quick]

  **What to do**:
  - 在 `TicketMapper.xml` 的 `<resultMap>` 中添加映射：
    ```xml
    <result property="templateData" column="template_data"/>
    ```
  - 在 `Base_Column_List` 中添加 `template_data`

  **Must NOT do**:
  - ❌ 不要删除旧的映射

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: XML 配置修改简单
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:
  - `igreen-backend/src/main/resources/mapper/TicketMapper.xml:34` - resultMap 位置
  - `igreen-backend/src/main/resources/mapper/TicketMapper.xml:62` - Base_Column_List 位置
  - `igreen-backend/src/main/resources/mapper/TicketMapper.xml:stepData` - stepData 映射参考

  **Acceptance Criteria**:
  - [ ] resultMap 已添加映射
  - [ ] Base_Column_List 已更新
  - [ ] XML 语法正确

  **QA Scenarios**:
  ```
  Scenario: Mapper 配置验证
    Tool: Bash
    Preconditions: Task 1-3 完成
    Steps:
      1. cd igreen-backend
      2. mvn clean compile
    Expected Result: BUILD SUCCESS
    Evidence: .sisyphus/evidence/task-04-compile.txt
  ```

  **Commit**: YES (groups with Task 1)

---

- [ ] 5. **TicketService 更新逻辑** [unspecified-high]

  **What to do**:
  - 在 `updateTicket` 方法（line 133-209）中添加 templateData 处理：
    ```java
    if (request.templateData() != null) {
        try {
            ticket.setTemplateData(objectMapper.writeValueAsString(request.templateData()));
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
    }
    ```
  - 在 `toResponse` 方法（line 606-644）中添加解析逻辑：
    ```java
    Map<String, Object> templateData = new HashMap<>();
    if (ticket.getTemplateData() != null && !ticket.getTemplateData().isEmpty()) {
        try {
            templateData = objectMapper.readValue(ticket.getTemplateData(), new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            log.error("Error parsing template data", e);
        }
    }
    ```

  **Must NOT do**:
  - ❌ 不要移除旧字段的处理逻辑（cause, solution 等）
  - ❌ 不要破坏现有的 stepData 处理

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Service 层核心逻辑修改，需要仔细处理
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Wave 1)
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 1, 2, 3, 4

  **References**:
  - `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java:133-209` - updateTicket 方法
  - `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java:606-644` - toResponse 方法
  - `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java:stepData` - stepData 处理参考

  **Acceptance Criteria**:
  - [ ] updateTicket 可以处理 templateData
  - [ ] toResponse 可以解析 templateData
  - [ ] 异常处理完整
  - [ ] 日志记录充分

  **QA Scenarios**:
  ```
  Scenario: Service 层单元测试
    Tool: Bash
    Preconditions: Task 1-4 完成
    Steps:
      1. cd igreen-backend
      2. mvn test -Dtest=TicketServiceTest
    Expected Result: Tests run: N, Failures: 0
    Evidence: .sisyphus/evidence/task-05-service-test.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): update TicketService to handle templateData`
  - Files: `TicketService.java`

---

- [ ] 6. **后端集成测试** [quick]

  **What to do**:
  - 创建测试脚本 `tests/backend/template-data.test.sh`
  - 测试场景：
    1. 创建工单
    2. 更新 templateData
    3. 查询工单验证 templateData

  **Must NOT do**:
  - ❌ 不要测试历史数据迁移

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的 API 测试脚本
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Task 5)
  - **Blocks**: None
  - **Blocked By**: Task 5

  **References**:
  - `tests/backend/auth.test.sh` - 测试脚本模板参考
  - `AGENTS.md` - API 端点文档

  **Acceptance Criteria**:
  - [ ] 测试脚本已创建
  - [ ] 测试通过
  - [ ] 日志记录清晰

  **QA Scenarios**:
  ```
  Scenario: 后端 API 集成测试
    Tool: Bash (curl)
    Preconditions: 后端服务运行在 8080 端口
    Steps:
      1. 创建测试工单
      2. POST /api/tickets/{id} 更新 templateData
      3. GET /api/tickets/{id} 验证 templateData 返回
    Expected Result: 所有步骤成功，templateData 正确返回
    Evidence: .sisyphus/evidence/task-06-backend-test.log
  ```

  **Commit**: YES
  - Message: `test(backend): add templateData integration test`
  - Files: `tests/backend/template-data.test.sh`

---

- [ ] 7. **前端类型定义更新** [quick]

  **What to do**:
  - 在 `src/lib/data.tsx` 中添加新接口：
    ```typescript
    export interface TemplateFieldValue extends TemplateField {
      value?: string;        // TEXT, DATE 类型
      values?: string[];     // PHOTOS 类型
      timestamp?: string;    // 最后更新时间
    }
    
    export interface TemplateStepWithData extends TemplateStepConfig {
      fields: TemplateFieldValue[];
    }
    
    export interface TicketTypeTemplateWithData {
      id: string;
      name: string;
      type: TicketType;
      steps: TemplateStepWithData[];
    }
    ```
  - 更新 `Ticket` 接口添加字段：
    ```typescript
    templateData?: TicketTypeTemplateWithData;
    ```

  **Must NOT do**:
  - ❌ 不要删除旧字段定义

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: TypeScript 接口定义，简单直接
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 8，与 Wave 2 并行)
  - **Blocks**: Tasks 9, 10, 11
  - **Blocked By**: None

  **References**:
  - `iGreenApp/src/lib/data.tsx:28-35` - TemplateField 接口定义
  - `iGreenApp/src/lib/data.tsx:72-105` - Ticket 接口定义
  - `iGreenApp/src/config/fieldConfigs.ts` - 模板配置参考

  **Acceptance Criteria**:
  - [ ] 新接口已添加
  - [ ] Ticket 接口已更新
  - [ ] TypeScript 编译通过

  **QA Scenarios**:
  ```
  Scenario: TypeScript 类型检查
    Tool: Bash
    Preconditions: Node.js 安装
    Steps:
      1. cd iGreenApp
      2. npm run build
    Expected Result: Build successful, no TypeScript errors
    Evidence: .sisyphus/evidence/task-07-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(frontend): add TemplateFieldValue type definitions`
  - Files: `src/lib/data.tsx`

---

- [ ] 8. **前端 API 转换层更新** [unspecified-high]

  **What to do**:
  - 更新 `api.ts` 中的 `transformTicket` 函数：
    ```typescript
    // 解析 templateData
    templateData: backendTicket.templateData ? JSON.parse(backendTicket.templateData) : undefined,
    ```
  - 更新 `updateTicket` 函数：
    ```typescript
    // 序列化 templateData
    if (updates.templateData) {
      filteredUpdates.templateData = JSON.stringify(updates.templateData);
    }
    ```
  - 更新 `submitTicketForReview` 函数携带 templateData

  **Must NOT do**:
  - ❌ 不要删除旧字段的转换逻辑（rootCause, solution 等）
  - ❌ 不要破坏现有的 stepData 转换

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: API 层核心逻辑修改，需要仔细处理
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 7，与 Wave 2 并行)
  - **Blocks**: Tasks 9, 10
  - **Blocked By**: Task 7

  **References**:
  - `iGreenApp/src/lib/api.ts:20-62` - transformTicket 函数
  - `iGreenApp/src/lib/api.ts:238-260` - updateTicket 函数
  - `iGreenApp/src/lib/api.ts:89-104` - transformSteps 函数参考

  **Acceptance Criteria**:
  - [ ] transformTicket 可以解析 templateData
  - [ ] updateTicket 可以序列化 templateData
  - [ ] API 调用正常工作

  **QA Scenarios**:
  ```
  Scenario: API 转换测试
    Tool: Bash (curl)
    Preconditions: 后端服务运行
    Steps:
      1. 创建工单并设置 templateData
      2. 前端调用 API 获取工单
      3. 验证 templateData 正确解析
    Expected Result: templateData 结构正确
    Evidence: .sisyphus/evidence/task-08-api-test.txt
  ```

  **Commit**: YES
  - Message: `feat(api): update transformTicket for templateData`
  - Files: `src/lib/api.ts`

---

- [ ] 9. **DynamicFieldRenderer 重构** [unspecified-high]

  **What to do**:
  - 修改 `DynamicFieldRenderer.tsx` 的字段值读取逻辑：
    ```typescript
    // 旧方式
    value={getFieldValue(field.id)}
    
    // 新方式：直接从 field.value 读取
    value={field.value || field.values}
    ```
  - 修改 `onChange` 回调：直接更新 field.value

  **Must NOT do**:
  - ❌ 不要破坏现有的字段类型渲染逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 核心表单组件重构，需要仔细测试
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (after Wave 3)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 7, 8

  **References**:
  - `iGreenApp/src/components/form/DynamicFieldRenderer.tsx:19-81` - 整个组件
  - `iGreenApp/src/components/form/DynamicFieldRenderer.tsx:27-38` - TEXT 字段渲染
  - `iGreenApp/src/components/form/DynamicFieldRenderer.tsx:53-65` - PHOTOS 字段渲染

  **Acceptance Criteria**:
  - [ ] TEXT 字段可以显示和更新 field.value
  - [ ] PHOTOS 字段可以显示和更新 field.values
  - [ ] DATE 字段可以显示和更新 field.value
  - [ ] 所有字段类型正常工作

  **QA Scenarios**:
  ```
  Scenario: 字段渲染测试
    Tool: Playwright
    Preconditions: 前端服务运行
    Steps:
      1. 打开工单详情页（arrived 状态）
      2. 在 TEXT 字段输入内容
      3. 验证 field.value 更新
      4. 上传照片
      5. 验证 field.values 更新
    Expected Result: 所有字段类型正常工作
    Evidence: .sisyphus/evidence/task-09-field-render.png
  ```

  **Commit**: YES
  - Message: `feat(frontend): refactor DynamicFieldRenderer for templateData`
  - Files: `src/components/form/DynamicFieldRenderer.tsx`

---

- [ ] 10. **TicketDetail 字段读写重构** [deep]

  **What to do**:
  - 修改 `getFieldValue` 函数：
    ```typescript
    const getFieldValue = (fieldId: string): any => {
      // 从 templateData 中查找字段值
      const field = ticket.templateData?.steps[0]?.fields.find(f => f.id === fieldId);
      return field?.value || field?.values;
    };
    ```
  - 修改 `handleFieldChange` 函数：
    ```typescript
    const handleFieldChange = (fieldId: string, value: any) => {
      // 更新 templateData 中的字段值
      const updatedTemplateData = {
        ...ticket.templateData,
        steps: ticket.templateData?.steps.map(step => ({
          ...step,
          fields: step.fields.map(field =>
            field.id === fieldId
              ? { ...field, value: value, timestamp: new Date().toISOString() }
              : field
          )
        }))
      };
      onUpdateTicket(ticket.id, { templateData: updatedTemplateData });
    };
    ```
  - 修改 `isFormComplete` 函数：检查 field.value/values
  - 移除对 `FIELD_ID_TO_LEGACY_FIELD` 的依赖

  **Must NOT do**:
  - ❌ 不要破坏 preventive 类型的 steps 处理
  - ❌ 不要删除旧字段的兼容性代码

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 核心组件重构，影响范围大，需要深入测试
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (after Task 9)
  - **Blocks**: Tasks 12, 13, 14, 15
  - **Blocked By**: Tasks 8, 9

  **References**:
  - `iGreenApp/src/components/TicketDetail.tsx:266-270` - getFieldValue 函数
  - `iGreenApp/src/components/TicketDetail.tsx:273-278` - handleFieldChange 函数
  - `iGreenApp/src/components/TicketDetail.tsx:280-302` - isFormComplete 函数
  - `iGreenApp/src/components/TicketDetail.tsx:561-650` - arrived 状态渲染

  **Acceptance Criteria**:
  - [ ] getFieldValue 可以从 templateData 读取
  - [ ] handleFieldChange 可以更新 templateData
  - [ ] isFormComplete 可以检查 field.value
  - [ ] 所有工单类型表单正常工作

  **QA Scenarios**:
  ```
  Scenario: Corrective 工单表单测试
    Tool: Playwright
    Preconditions: 前端服务运行
    Steps:
      1. 创建 corrective 工单，状态 arrived
      2. 填写 Root Cause 字段
      3. 上传 Before Photos
      4. 上传 After Photos
      5. 点击 Finish 按钮
    Expected Result: 表单提交成功，状态变为 review
    Evidence: .sisyphus/evidence/task-10-corrective-test.png
  ```

  **Commit**: YES
  - Message: `feat(frontend): refactor TicketDetail field value handling`
  - Files: `src/components/TicketDetail.tsx`

---

- [ ] 11. **PhotoUploader 适配** [quick]

  **What to do**:
  - 修改 `PhotoUploader.tsx` 以支持 templateData 结构
  - 更新 `onAddPhoto` 回调参数传递

  **Must NOT do**:
  - ❌ 不要破坏照片上传功能

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的组件适配
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (with Tasks 9, 10)
  - **Blocks**: Tasks 12-15
  - **Blocked By**: Tasks 8

  **References**:
  - `iGreenApp/src/components/form/PhotoUploader.tsx` - 整个组件

  **Acceptance Criteria**:
  - [ ] 照片上传功能正常
  - [ ] 照片可以正确添加到 field.values

  **Commit**: YES (groups with Task 10)

---

_由于输出长度限制，任务 12-15 和 F1-F4 的详细内容将在后续部分补充_

---


---

## Final Verification Wave

在所有实现任务完成后，运行 4 个并行审查任务：

- [ ] F1. **代码质量审查** — `unspecified-high`
  运行 `tsc --noEmit` + linter。审查所有改动文件，检查类型安全、代码规范、注释完整性。
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F2. **历史数据兼容性验证** — `unspecified-high`
  查询数据库历史工单，确保旧字段仍可读取。前端测试显示历史工单详情页正常。
  Output: `Historical tickets [N/N readable] | UI [N/N display correctly] | VERDICT`

- [ ] F3. **文档更新** — `writing`
  更新 AGENTS.md，添加 templateData 字段说明。更新 API 文档。添加迁移指南。
  Output: `Docs [N files updated] | VERDICT`

- [ ] F4. **清理和优化** — `quick`
  移除未使用的代码。优化导入。添加必要的注释。代码格式化。
  Output: `Cleanup [N items] | VERDICT`

---

## Commit Strategy

按功能模块分组提交：

- **Commit 1**: `feat(backend): add templateData field to Ticket entity`
  - Files: Ticket.java, TicketUpdateRequest.java, TicketResponse.java, TicketMapper.xml
  - Pre-commit: Backend build passes

- **Commit 2**: `feat(database): add template_data JSON column`
  - Files: init-scripts/02-add-template-data.sql
  - Pre-commit: Migration script tested

- **Commit 3**: `feat(backend): update TicketService to handle templateData`
  - Files: TicketService.java
  - Pre-commit: Backend tests pass

- **Commit 4**: `feat(frontend): add TemplateFieldValue type definitions`
  - Files: src/lib/data.tsx
  - Pre-commit: tsc --noEmit passes

- **Commit 5**: `feat(frontend): refactor form field value handling`
  - Files: src/components/form/DynamicFieldRenderer.tsx, src/components/TicketDetail.tsx
  - Pre-commit: Frontend build passes

- **Commit 6**: `feat(api): update transformTicket for templateData`
  - Files: src/lib/api.ts
  - Pre-commit: API calls work

- **Commit 7**: `test(e2e): add integration tests for templateData`
  - Files: tests/backend/template-data.test.sh
  - Pre-commit: All tests pass

---

## Success Criteria

### 验证命令

```bash
# 前端编译检查
cd iGreenApp && npm run build

# 后端编译检查
cd igreen-backend && mvn clean compile

# 数据库字段验证
mysql -u root -p -e "DESCRIBE igreen.tickets" | grep template_data

# API 功能测试
curl -X POST http://localhost:8080/api/tickets/202601200001 \
  -H "Content-Type: application/json" \
  -d '{"templateData":{"steps":[{"fields":[{"id":"field-root-cause","value":"test"}]}]}}'
```

### 最终检查清单

- [ ] 所有 "Must Have" 功能已实现
- [ ] 所有 "Must NOT Have" 已验证不存在
- [ ] 前后端编译通过
- [ ] 数据库字段创建成功
- [ ] API 可以正常读写 templateData
- [ ] 历史工单显示正常
- [ ] 所有工单类型表单填写正常
- [ ] 文档已更新