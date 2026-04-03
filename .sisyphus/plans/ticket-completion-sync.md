# 工单完成度数据同步修复方案

## TL;DR

> **Quick Summary**: 修复后端 `TicketService.toResponse()` 方法，从 `templateData` JSON 中提取已完成的步骤ID列表，解决管理端工单完成度始终显示为0%的问题。
> 
> **Deliverables**: 
> - 修复后的 `TicketService.toResponse()` 方法
> - 完成度数据正确返回，前端进度条正常显示
> - 管理端可以基于完成度进行审核操作
> 
> **Estimated Effort**: Quick (1-2小时)
> **Parallel Execution**: NO - 单文件修改，顺序执行
> **Critical Path**: 修复toResponse → 测试验证 → 前端验证

---

## Context

### Original Request
用户报告：工单填写完成提交后，在系统侧不反映工单完成度，导致无法驳回或验证通过。

### Interview Summary
**Key Discussions**:
- 完成度定义：工单中完成的步骤数占总步骤数的比值
- 判断标准：必填步骤完成后才能操作
- 用户选择：最小修复方案（仅修复后端数据提取逻辑）
- 完成标准：`completed=true` 时算完成
- 步骤标识：返回步骤ID（确保唯一性）

**Research Findings**:
- **根本原因**：`TicketService.toResponse()` 方法中，`completedSteps` 字段硬编码为 `new ArrayList<>()`
- **数据正常**：APP端提交的 `templateData` JSON 已正确保存到数据库
- **前端就绪**：管理端有完整的进度条UI组件，但因数据缺失无法显示
- **影响范围**：仅后端一个方法的修改，风险可控

### Metis Review
**Identified Gaps** (addressed):
- 完成标准已明确：`completed=true`
- 步骤标识已明确：返回步骤ID
- 向后兼容性：`TicketResponse` 接口结构不变，仅填充数据
- 性能影响：优化方案为复用已解析的 `templateData` 对象

**Guardrails Applied**:
- 仅修改 `toResponse()` 方法，不改变数据存储逻辑
- 不修改 `TicketResponse` DTO 结构
- 保持现有错误处理模式
- 添加完整的单元测试覆盖

---

## Work Objectives

### Core Objective
修复后端 `completedSteps` 字段返回逻辑，确保管理端能正确显示工单完成度。

### Concrete Deliverables
- `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java` - 修复 `toResponse()` 方法
- 完成度数据正确返回：`completedSteps` 包含已完成步骤的ID列表
- 前端进度条正常显示百分比

### Definition of Done
- [ ] 后端单元测试通过：验证 `completedSteps` 正确提取
- [ ] API测试通过：`GET /api/tickets/{id}` 返回正确的 `completedSteps`
- [ ] 前端验证通过：管理端工单详情页显示正确的完成度百分比
- [ ] 边缘情况处理：空 `templateData` 返回空列表，不抛异常

### Must Have
- ✅ 从 `templateData.steps` 提取 `completed=true` 的步骤ID
- ✅ 处理 `null` 和空数据情况
- ✅ 保持现有错误处理模式（log error, return empty list）
- ✅ 不修改数据存储逻辑

### Must NOT Have (Guardrails)
- ❌ 不修改 `TicketResponse` DTO 结构
- ❌ 不修改 `templateData` 存储逻辑
- ❌ 不添加额外的数据库查询
- ❌ 不改变现有API契约

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Maven + JUnit 5)
- **Automated tests**: TDD (先写测试，再修复实现)
- **Framework**: JUnit 5 + Spring Boot Test
- **Pattern**: RED (failing test) → GREEN (minimal fix) → REFACTOR (optimize)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Backend API**: Use Bash (curl) — Send requests, assert status + response fields
- **Database**: Use Bash (mysql/sqlite) — Query data, verify JSON structure
- **Frontend UI**: Use Playwright (browse skill) — Navigate, verify DOM, screenshot

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Sequential - single file modification):
└── Task 1: 修复后端数据提取逻辑 [quick]

Wave 2 (Parallel verification):
├── Task 2: 后端单元测试 [quick]
├── Task 3: API集成测试 [quick]
└── Task 4: 前端验证 [quick]

Wave FINAL (After ALL tasks — verification):
└── Task F1: 完整回归测试 [quick]

Critical Path: Task 1 → Task 2/3/4 (parallel) → F1
```

### Dependency Matrix

- **1**: — 2, 3, 4
- **2**: 1 — F1
- **3**: 1 — F1
- **4**: 1 — F1
- **F1**: 2, 3, 4 —

### Agent Dispatch Summary

- **Wave 1**: **1** — T1 → `quick`
- **Wave 2**: **3** — T2 → `quick`, T3 → `quick`, T4 → `quick`
- **FINAL**: **1** — F1 → `quick`

---

## TODOs

- [ ] 1. 修复后端数据提取逻辑

  **What to do**:
  - 修改 `TicketService.toResponse()` 方法（第869-896行）
  - 从 `templateData` JSON 中提取 `completedSteps` 列表
  - 实现逻辑：遍历 `TemplateData.steps`，筛选 `completed=true` 的步骤，提取其 `id`
  - 处理边缘情况：`templateData` 为 null 或空时返回空列表
  - 保持现有错误处理模式：log error + return empty list

  **Must NOT do**:
  - 不修改 `TicketResponse` DTO 结构
  - 不修改 `templateData` 存储逻辑
  - 不添加额外的数据库查询

  **Recommended Agent Profile**:
  - **Category**: `quick` - 单文件修改，逻辑清晰
    - Reason: 仅修改一个方法，逻辑简单明确
  - **Skills**: `[]`
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (Sequential)
  - **Blocks**: Task 2, 3, 4
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java:869-896` - 当前 toResponse() 方法实现
  - `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java:670-698` - submitTicketForReview() 中的 templateData 解析模式

  **API/Type References** (contracts to implement against):
  - `igreen-backend/src/main/java/com/igreen/domain/entity/TemplateData.java` - TemplateData 数据结构
  - `igreen-backend/src/main/java/com/igreen/domain/entity/TemplateStepData.java` - TemplateStepData 结构（包含 completed 字段）
  - `igreen-backend/src/main/java/com/igreen/domain/dto/TicketResponse.java:35` - completedSteps 字段定义

  **Test References** (testing patterns to follow):
  - `igreen-backend/src/test/java/com/igreen/domain/service/TicketServiceTest.java` - 现有测试模式

  **External References**:
  - Jackson ObjectMapper API: `objectMapper.readValue()` 和 `objectMapper.convertValue()`

  **Acceptance Criteria**:

  **If TDD (tests enabled)**:
  - [ ] 测试文件创建：TicketServiceTest.java
  - [ ] mvn test -Dtest=TicketServiceTest → PASS

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: [Happy path — templateData包含已完成的步骤]
    Tool: Bash (curl)
    Preconditions: 
      1. 后端服务运行在 localhost:8080
      2. 已有工单 ID=1，状态为 REVIEW
      3. templateData 包含 3 个步骤，其中 2 个 completed=true
    Steps:
      1. curl -X GET "http://localhost:8080/api/tickets/1" -H "Authorization: Bearer $TOKEN"
      2. 解析响应 JSON，提取 .data.completedSteps 字段
      3. 断言 completedSteps.length === 2
      4. 断言 completedSteps 包含正确的步骤 ID
    Expected Result: 
      HTTP 200
      {
        "success": true,
        "data": {
          "completedSteps": ["step-001", "step-003"],
          ...
        }
      }
    Failure Indicators: 
      - completedSteps 为空数组 []
      - completedSteps 包含错误的步骤 ID
      - HTTP 500 或其他错误状态
    Evidence: .sisyphus/evidence/task-1-happy-path.json

  Scenario: [Edge case — templateData为空或null]
    Tool: Bash (curl)
    Preconditions: 
      1. 工单 ID=2，templateData 为 null
    Steps:
      1. curl -X GET "http://localhost:8080/api/tickets/2" -H "Authorization: Bearer $TOKEN"
      2. 解析响应 JSON，提取 .data.completedSteps 字段
      3. 断言 completedSteps 为空数组 []
    Expected Result: 
      HTTP 200
      {
        "success": true,
        "data": {
          "completedSteps": [],
          "templateData": {},
          ...
        }
      }
    Failure Indicators:
      - HTTP 500 错误
      - completedSteps 为 null
      - 响应包含异常堆栈
    Evidence: .sisyphus/evidence/task-1-edge-null.json

  Scenario: [Failure case — templateData格式错误]
    Tool: Bash (curl)
    Preconditions: 
      1. 工单 ID=3，templateData 包含非法 JSON
    Steps:
      1. curl -X GET "http://localhost:8080/api/tickets/3" -H "Authorization: Bearer $TOKEN"
      2. 检查日志文件是否记录错误
      3. 断言响应仍然返回 200，completedSteps 为 []
    Expected Result: 
      HTTP 200
      {
        "success": true,
        "data": {
          "completedSteps": [],
          ...
        }
      }
      日志包含 ERROR 级别的 "Error parsing template data" 信息
    Failure Indicators:
      - HTTP 500 错误
      - 未记录错误日志
    Evidence: .sisyphus/evidence/task-1-error-handling.json
  ```

  **Evidence to Capture**:
  - [ ] task-1-happy-path.json
  - [ ] task-1-edge-null.json
  - [ ] task-1-error-handling.json

  **Commit**: YES
  - Message: `fix(ticket): extract completedSteps from templateData in toResponse()`
  - Files: `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java`
  - Pre-commit: `mvn test`

- [ ] 2. 后端单元测试

  **What to do**:
  - 编写 JUnit 5 测试用例
  - 测试场景：
    1. templateData 包含已完成步骤 → 正确提取
    2. templateData 为 null → 返回空列表
    3. templateData 包含非法 JSON → 捕获异常，返回空列表
    4. 所有步骤 completed=false → 返回空列表
    5. 混合 completed=true/false → 仅提取 true 的步骤

  **Must NOT do**:
  - 不测试其他无关方法

  **Recommended Agent Profile**:
  - **Category**: `quick` - 单元测试编写
    - Reason: 测试逻辑清晰，覆盖已知场景
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task F1
  - **Blocked By**: Task 1

  **References**:
  - `igreen-backend/src/test/java/com/igreen/domain/service/TicketServiceTest.java` - 现有测试类

  **Acceptance Criteria**:
  - [ ] mvn test -Dtest=TicketServiceTest → PASS (5 tests, 0 failures)

  **QA Scenarios**:
  ```
  Scenario: [Unit test execution]
    Tool: Bash (mvn)
    Preconditions: Task 1 已完成
    Steps:
      1. cd igreen-backend
      2. mvn test -Dtest=TicketServiceTest
      3. 检查测试报告
    Expected Result: 
      Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
    Failure Indicators: 
      - 任何测试失败
      - 测试编译错误
    Evidence: .sisyphus/evidence/task-2-unit-tests.txt
  ```

  **Commit**: NO (groups with Task 1)

- [ ] 3. API集成测试

  **What to do**:
  - 使用 curl 或 Postman 测试实际 API 端点
  - 验证完整的工单流程中的完成度数据传递
  - 测试场景：
    1. 工单创建时 completedSteps 为空
    2. APP提交步骤后 completedSteps 更新
    3. 提交审核后 completedSteps 正确

  **Must NOT do**:
  - 不修改代码，仅验证

  **Recommended Agent Profile**:
  - **Category**: `quick` - API测试
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 4)
  - **Blocks**: Task F1
  - **Blocked By**: Task 1

  **References**:
  - `igreen-backend/src/main/java/com/igreen/domain/controller/TicketController.java:165-172` - review 端点

  **Acceptance Criteria**:
  - [ ] 所有API测试返回正确数据

  **QA Scenarios**:
  ```
  Scenario: [API integration test]
    Tool: Bash (curl)
    Preconditions: 
      1. 后端服务运行
      2. 测试用户已登录，获取 TOKEN
    Steps:
      1. 创建工单，验证 completedSteps=[]
      2. 分配并接单
      3. 模拟APP提交步骤数据
      4. 验证 completedSteps 包含已提交的步骤
      5. 提交审核
      6. 验证 completedSteps 仍然正确
    Expected Result: 
      每个步骤的 completedSteps 数据正确
    Failure Indicators:
      - completedSteps 数据不匹配
      - API 返回错误状态码
    Evidence: .sisyphus/evidence/task-3-api-tests.json
  ```

  **Commit**: NO (validation only)

- [ ] 4. 前端验证

  **What to do**:
  - 启动管理端前端
  - 打开工单详情页
  - 验证进度条显示正确的百分比
  - 验证完成度文本显示正确（如 "2/5 步骤"）

  **Must NOT do**:
  - 不修改前端代码

  **Recommended Agent Profile**:
  - **Category**: `quick` - UI验证
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 3)
  - **Blocks**: Task F1
  - **Blocked By**: Task 1

  **References**:
  - `igreen-front/src/components/TicketDetail.tsx:657` - 进度条组件

  **Acceptance Criteria**:
  - [ ] 进度条显示正确百分比
  - [ ] 完成度文本正确

  **QA Scenarios**:
  ```
  Scenario: [Frontend UI verification]
    Tool: Playwright (browse skill)
    Preconditions: 
      1. 前端服务运行在 localhost:5173
      2. 有一个 REVIEW 状态的工单
      3. completedSteps=[step-001, step-003], total steps=5
    Steps:
      1. 导航到 http://localhost:5173
      2. 登录管理端
      3. 打开工单详情页
      4. 定位进度条元素（选择器：.progress-bar 或 [data-testid="completion-progress"]）
      5. 截图验证进度条
      6. 提取进度文本，断言包含 "40%" 或 "2/5"
    Expected Result: 
      - 进度条宽度为 40%
      - 文本显示 "40% Complete" 或 "2/5 步骤"
    Failure Indicators:
      - 进度条显示 0%
      - 文本显示 "0/5 步骤"
      - 进度条元素不存在
    Evidence: .sisyphus/evidence/task-4-frontend-ui.png
  ```

  **Commit**: NO (validation only)

---

## Final Verification Wave (MANDATORY)

- [ ] F1. **完整回归测试** — `quick`
  启动后端服务，执行完整的工单流程：创建→分配→接单→出发→到达→提交审核→审核通过。验证每个环节的完成度数据是否正确传递和显示。
  Output: `All stages [PASS/FAIL] | Completion data [CORRECT/INCORRECT] | VERDICT: APPROVE/REJECT`

---

## Commit Strategy

- **1**: `fix(ticket): extract completedSteps from templateData in toResponse()` — TicketService.java, mvn test

---

## Success Criteria

### Verification Commands
```bash
# 后端测试
cd igreen-backend && mvn test -Dtest=TicketServiceTest#testToResponseWithCompletedSteps

# API测试
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/tickets/1 | jq '.data.completedSteps'

# 前端验证
cd igreen-front && pnpm test:e2e --grep "ticket completion"
```

### Final Checklist
- [ ] 后端单元测试通过
- [ ] API返回正确的completedSteps数组
- [ ] 前端进度条显示正确百分比
- [ ] 边缘情况（空数据）处理正确
- [ ] 代码review通过
- [ ] 无性能退化