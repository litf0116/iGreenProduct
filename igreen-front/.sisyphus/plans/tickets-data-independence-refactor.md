# /tickets 页面组件数据独立性重构计划

## TL;DR

> **快速总结**: 将 CreateTicket 和 TicketDetail 组件从依赖 dataStore 传递数据改为独立获取数据，提高组件的独立性和可复用性。
> 
> **交付物**: 
> - 重构后的 CreateTicket.tsx（独立数据获取）
> - 重构后的 TicketDetail.tsx（独立数据获取）
> - 更新后的 App.tsx（移除 props 传递）
> 
> **预计工作量**: Medium
> **并行执行**: YES - 3 waves
> **关键路径**: CreateTicket → TicketDetail → App.tsx 路由更新

---

## Context

### 原始需求
用户希望重构 /tickets 页面，让其中的组件能够独立获取数据，而不是从 dataStore 中获取。

### 当前实现分析

#### CreateTicket 组件数据依赖：
- **templates**: 用于模板选择下拉框
- **users**: 用于分配给用户
- **groups**: 用于分组管理
- **sites**: 用于选择工作地点
- **tickets**: 用于关联工单（仅 corrective 类型的工单）
- **problemTypes**: 用于问题类型选择

#### TicketDetail 组件数据依赖：
- **ticket**: 当前显示的工单详情
- **template**: 工单使用的模板
- **language**: 界面语言
- **currentUserId**: 当前登录用户ID
- **users**: 用户列表（用于显示和重新分配）

### API 可用性确认
从 api.ts 中确认了以下方法可用：
- `api.getTemplates()`: 获取模板列表
- `api.getUsers(params)`: 获取用户列表（支持分页和关键词）
- `api.getGroups()`: 获取分组列表
- `api.getSites(params)`: 获取站点列表（支持分页和筛选）
- `api.getProblemTypes()`: 获取问题类型列表
- `api.getTickets(params)`: 获取工单列表

---

## Work Objectives

### 核心目标
让 /tickets 页面相关的组件能够独立获取所需数据，不再依赖父组件通过 props 传递。

### 具体交付物
- 支持独立数据获取的 CreateTicket 组件
- 支持独立数据获取的 TicketDetail 组件
- 简化后的 App.tsx 路由配置

### 定义完成
- [ ] CreateTicket 组件内部加载所有需要的数据
- [ ] TicketDetail 组件内部加载需要的数据
- [ ] App.tsx 不再通过 props 传递数据给这些组件

### 必须实现
- 加载状态显示（Loading Spinner）
- 错误处理和重试机制
- 乐观更新（如果涉及数据修改）

### 必须避免（约束）
- 不能破坏现有的功能
- 不能移除任何现有的数据字段或功能

---

## Verification Strategy

> **零人工干预** - 所有验证都是代理执行。不允许人工操作。

### 测试决策
- **基础设施存在**: YES
- **自动化测试**: Tests-after（在实现后添加测试）
- **框架**: 使用现有的测试基础设施

### QA 策略
每个任务必须包含代理执行的 QA 场景：

- **数据加载**: Playwright - 验证数据正确加载和显示
- **表单提交**: Playwright - 验证表单能正常提交
- **错误处理**: 手动验证 - 测试网络错误时的处理

---

## Execution Strategy

### 并行执行 Waves

```
Wave 1 (Start Immediately - CreateTicket refactoring):
├── Task 1: 重构 CreateTicket 组件 [unspecified-high]
├── Task 2: 添加加载状态和错误处理 [quick]
├── Task 3: 实现 API 调用和数据管理 [deep]
└── Task 4: 测试 CreateTicket 独立功能 [visual-engineering]

Wave 2 (After Wave 1 - TicketDetail refactoring):
├── Task 5: 重构 TicketDetail 组件 [unspecified-high]
├── Task 6: 添加数据获取逻辑 [deep]
├── Task 7: 处理模板数据获取 [quick]
└── Task 8: 测试 TicketDetail 独立功能 [visual-engineering]

Wave 3 (After Wave 2 - App.tsx integration):
├── Task 9: 更新 App.tsx 路由配置 [quick]
├── Task 10: 移除不必要的 props 传递 [quick]
├── Task 11: 清理 dataStore 中未使用的数据 [quick]
└── Task 12: 最终集成测试 [deep]

Critical Path: Task 1 → Task 3 → Task 5 → Task 6 → Task 9 → Task 12
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 4 (Wave 1 & 2)
```

---

## TODOs

- [ ] 1. 重构 CreateTicket 组件，添加本地状态管理

  **What to do**:
  - 添加本地状态：templates, users, groups, sites, tickets, problemTypes
  - 添加 loading 和 error 状态
  - 使用 useEffect 在组件挂载时获取数据
  - 实现错误重试逻辑

  **Must NOT do**:
  - 不应移除任何现有的 props（保持向后兼容）
  - 不应改变组件的公共接口

  **Recommended Agent Profile**:
  - **Category**: unspecified-high
    - Reason: 需要深度重构现有组件逻辑
  - **Skills**: []
    - Reason: 不需要特定技能

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 | Sequential
  - **Blocks**: Task 2, Task 3
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `src/components/TemplateManager.tsx:33-86` - 本地状态管理和数据获取模式
  - `src/components/TemplateManager.tsx:54-78` - useEffect 数据加载模式

  **API/Type References** (contracts to implement against):
  - `src/lib/types.ts:74-97` - Template, Ticket, User, Group 类型定义
  - `src/lib/api.ts:256-266` - getTemplates API 方法
  - `src/lib/api.ts:97-105` - getUsers API 方法
  - `src/lib/api.ts:136-152` - getGroups API 方法
  - `src/lib/api.ts:187-205` - getSites API 方法
  - `src/lib/api.ts:573-600` - getProblemTypes API 方法

  **Test References** (testing patterns to follow):
  - `src/components/TemplateManager.tsx:261-268` - 加载状态 UI 模式

  **External References** (libraries and frameworks):
  - Official docs: https://react.dev/reference/react/useEffect - React useEffect Hook

  **WHY Each Reference Matters** (explain the relevance):
  - TemplateManager.tsx: 已经实现了组件内部数据获取，是完美的参考模式
  - api.ts methods: 需要调用的具体 API 方法

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  **If TDD (tests enabled)**:
  - [ ] 测试文件创建: src/components/CreateTicket.test.tsx
  - [ ] npm run test → PASS

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these)**:

  ```
  Scenario: CreateTicket 组件独立加载数据
    Tool: Playwright
    Preconditions: 用户已登录，导航到 /tickets 页面
    Steps:
      1. 导航到 http://localhost:3101/tickets
      2. 等待页面加载完成
      3. 验证模板下拉框有数据
      4. 验证用户列表有数据
      5. 验证站点列表有数据
    Expected Result: 所有下拉框都显示正确的数据，没有错误
    Failure Indicators: 下拉框为空或显示加载失败
    Evidence: .sisyphus/evidence/task-1-create-ticket-load.png

  Scenario: CreateTicket 处理加载错误
    Tool: interactive_bash
    Preconditions: 模拟 API 服务不可用
    Steps:
      1. 阻止 API 调用（使用浏览器网络工具）
      2. 刷新页面
      3. 检查是否显示错误信息
      4. 点击重试按钮
    Expected Result: 显示友好的错误信息和重试选项
    Failure Indicators: 页面崩溃或没有错误提示
    Evidence: .sisyphus/evidence/task-1-error-handling.png
  ```

  **Evidence to Capture**:
  - [ ] 加载状态截图
  - [ ] 数据加载成功截图
  - [ ] 错误处理截图

  **Commit**: NO (part of larger refactoring)

- [ ] 2. 添加 CreateTicket 的加载状态和错误处理 UI

  **What to do**:
  - 实现 Spinner 加载动画
  - 添加错误提示组件
  - 实现重试按钮功能
  - 确保与 TemplateManager 的风格一致

  **Must NOT do**:
  - 不应创建重复的错误处理组件

  **Recommended Agent Profile**:
  - **Category**: quick
    - Reason: 简单的 UI 组件添加
  - **Skills**: []
    - Reason: 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES | NO
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `src/components/TemplateManager.tsx:262-268` - 加载状态实现
  - `src/components/TemplateManager.tsx:271-293` - 错误状态实现
  - `src/components/ui/Loader2.tsx` - 加载动画组件

  **API/Type References** (contracts to implement against):
  - N/A - UI only

  **Test References** (testing patterns to follow):
  - N/A

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these)**:

  ```
  Scenario: 加载状态正确显示
    Tool: Playwright
    Preconditions: 网络速度较慢或首次加载
    Steps:
      1. 清除浏览器缓存
      2. 导航到 /tickets 页面
      3. 截图记录加载状态
    Expected Result: 显示加载动画和提示文字
    Failure Indicators: 没有加载提示或空白页面
    Evidence: .sisyphus/evidence/task-2-loading-state.png

  Scenario: 错误状态正确显示
    Tool: Playwright
    Preconditions: 模拟网络错误
    Steps:
      1. 使用浏览器开发工具阻止 API 请求
      2. 导航到 /tickets 页面
      3. 验证错误信息显示
      4. 测试重试按钮功能
    Expected Result: 显示错误信息和可用的重试按钮
    Failure Indicators: 错误信息不清晰或重试不工作
    Evidence: .sisyphus/evidence/task-2-error-state.png
  ```

  **Evidence to Capture**:
  - [ ] 加载状态截图
  - [ ] 错误状态截图

  **Commit**: NO (part of larger refactoring)

- [ ] 3. 实现 CreateTicket 的 API 调用和数据缓存

  **What to do**:
  - 实现所有必要 API 调用（templates, users, groups, sites, problemTypes）
  - 添加数据缓存逻辑（避免重复请求）
  - 实现数据更新机制（当需要重新获取时）

  **Must NOT do**:
  - 不应改变 API 调用的参数格式

  **Recommended Agent Profile**:
  - **Category**: deep
    - Reason: 复杂的数据管理和 API 集成
  - **Skills**: []
    - Reason: 使用现有工具即可

  **Parallelization**:
  - **Can Run In Parallel**: YES | NO
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `src/components/TemplateManager.tsx:55-78` - useEffect 数据加载模式
  - `src/App.tsx:80-99` - Promise.all 并发加载模式

  **API/Type References** (contracts to implement against):
  - `src/lib/api.ts:256-266` - getTemplates 实现
  - `src/lib/api.ts:97-105` - getUsers 实现
  - `src/lib/api.ts:136-152` - getGroups 实现
  - `src/lib/api.ts:187-205` - getSites 实现
  - `src/lib/api.ts:573-600` - getProblemTypes 实现

  **WHY Each Reference Matters** (explain the relevance):
  - TemplateManager useEffect: 展示了正确的数据加载模式
  - App.tsx Promise.all: 展示了并发加载的最佳实践

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these)**:

  ```
  Scenario: API 调用正确执行
    Tool: Bash (curl)
    Preconditions: 后端服务正在运行
    Steps:
      1. 检查浏览器网络面板
      2. 验证所有必要的 API 调用都已发出
      3. 验证返回数据的格式正确
    Expected Result: 所有 API 调用成功，数据格式符合预期
    Failure Indicators: API 调用失败或数据格式错误
    Evidence: .sisyphus/evidence/task-3-api-calls.log

  Scenario: 数据缓存生效
    Tool: Playwright
    Preconditions: 页面已经加载过数据
    Steps:
      1. 在页面内切换标签（不离开页面）
      2. 检查是否发出了重复的 API 请求
      3. 返回标签页并再次检查
    Expected Result: 没有重复的 API 请求
    Failure Indicators: 看到重复的 API 调用
    Evidence: .sisyphus/evidence/task-3-caching.png
  ```

  **Evidence to Capture**:
  - [ ] 网络请求日志
  - [ ] 数据缓存验证截图

  **Commit**: NO (part of larger refactoring)

- [ ] 4. 测试 CreateTicket 组件的独立功能

  **What to do**:
  - 验证表单所有字段都正常工作
  - 测试模板选择功能
  - 测试用户分配功能
  - 测试提交功能

  **Must NOT do**:
  - 不应改变表单的验证逻辑

  **Recommended Agent Profile**:
  - **Category**: visual-engineering
    - Reason: 需要测试 UI 交互和用户体验
  - **Skills**: []
    - Reason: 使用 Playwright 进行浏览器自动化测试

  **Parallelization**:
  - **Can Run In Parallel**: YES | NO
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: None
  - **Blocked By**: Task 1, 2, 3

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `e2e/create-ticket.spec.ts` - 已有的创建工单测试

  **API/Type References** (contracts to implement against):
  - `src/lib/types.ts:24-45` - CreateTicket 相关类型

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these)**:

  ```
  Scenario: 完整创建工单流程
    Tool: Playwright
    Preconditions: 用户已登录，有可用的模板和用户
    Steps:
      1. 导航到 /tickets 页面
      2. 选择一个模板
      3. 填写工单标题和描述
      4. 选择分配用户
      5. 点击提交按钮
      6. 验证成功提示
    Expected Result: 工单创建成功，显示成功消息并跳转
    Failure Indicators: 提交失败或数据不正确
    Evidence: .sisyphus/evidence/task-4-create-flow.png

  Scenario: 表单验证功能
    Tool: Playwright
    Preconditions: 在创建工单页面
    Steps:
      1. 不填写任何必填字段
      2. 点击提交按钮
      3. 验证错误提示
      4. 填写部分必填字段
      5. 再次验证
    Expected Result: 正确显示必填字段的验证错误
    Failure Indicators: 提交了无效数据或没有验证提示
    Evidence: .sisyphus/evidence/task-4-validation.png
  ```

  **Evidence to Capture**:
  - [ ] 创建流程截图
  - [ ] 验证错误截图
  - [ ] 成功提交截图

  **Commit**: NO (part of larger refactoring)

- [ ] 5. 重构 TicketDetail 组件，添加数据获取逻辑

  **What to do**:
  - 为 TicketDetail 添加本地状态管理
  - 实现根据 ticketId 获取工单详情
  - 实现获取相关模板数据
  - 实现获取用户列表（用于重新分配）
  - 添加 loading 和 error 状态

  **Must NOT do**:
  - 不应改变组件的回调接口（onAccept, onDecline 等）

  **Recommended Agent Profile**:
  - **Category**: unspecified-high
    - Reason: 需要重构复杂的数据流
  - **Skills**: []
    - Reason: 使用现有工具即可

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 | Sequential
  - **Blocks**: Task 6, 7, 8
  - **Blocked By**: Task 1, 2, 3, 4 (Wave 1 complete)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `src/components/TemplateManager.tsx:55-78` - 数据获取模式
  - `src/lib/api.ts:270-275` - getTemplate API

  **API/Type References** (contracts to implement against):
  - `src/lib/api.ts:270-275` - getTemplate 方法
  - `src/lib/api.ts:270-290` - getTicket 相关方法（如果存在）
  - `src/lib/types.ts:69-87` - Ticket 类型定义

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these)**:

  ```
  Scenario: TicketDetail 独立加载工单数据
    Tool: Playwright
    Preconditions: 存在工单记录
    Steps:
      1. 在 Dashboard 页面点击一个工单
      2. 等待 Sheet 打开
      3. 验证工单详情正确显示
    Expected Result: 工单详情正确加载，所有字段显示正确
    Failure Indicators: 数据不完整或加载失败
    Evidence: .sisyphus/evidence/task-5-ticket-load.png

  Scenario: TicketDetail 处理不存在的工单
    Tool: Playwright
    Preconditions: 使用无效的工单ID
    Steps:
      1. 手动导航到带无效ID的URL
      2. 验证错误处理
    Expected Result: 显示友好的错误信息
    Failure Indicators: 页面崩溃或无错误提示
    Evidence: .sisyphus/evidence/task-5-invalid-ticket.png
  ```

  **Evidence to Capture**:
  - [ ] 工单详情截图
  - [ ] 错误处理截图

  **Commit**: NO (part of larger refactoring)

- [ ] 6. 实现 TicketDetail 的模板数据获取

  **What to do**:
  - 根据工单的 templateId 获取模板详情
  - 实现模板数据的缓存
  - 处理模板不存在的情况

  **Must NOT do**:
  - 不应改变模板的显示格式

  **Recommended Agent Profile**:
  - **Category**: deep
    - Reason: 需要处理数据关联和错误场景
  - **Skills**: []
    - Reason: 使用现有工具即可

  **Parallelization**:
  - **Can Run In Parallel**: YES | NO
  - **Parallel Group**: Wave 2 (with Tasks 5, 7, 8)
  - **Blocks**: None
  - **Blocked By**: Task 5

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `src/components/TicketDetail.tsx:734` - 当前模板查找逻辑
  - `src/lib/api.ts:268-275` - getTemplate API 方法

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these)**:

  ```
  Scenario: 模板数据正确获取
    Tool: Playwright
    Preconditions: 工单有关联的模板
    Steps:
      1. 打开一个有模板的工单详情
      2. 验证模板信息正确显示
    Expected Result: 模板字段和步骤正确显示
    Failure Indicators: 模板信息缺失或错误
    Evidence: .sisyphus/evidence/task-6-template-display.png

  Scenario: 处理模板不存在的情况
    Tool: Playwright
    Preconditions: 工单关联的模板已被删除
    Steps:
      1. 打开工单详情
      2. 验证错误处理
    Expected Result: 显示友好提示，不影响工单其他信息显示
    Failure Indicators: 页面错误或空白
    Evidence: .sisyphus/evidence/task-6-missing-template.png
  ```

  **Evidence to Capture**:
  - [ ] 模板显示截图
  - [ ] 错误处理截图

  **Commit**: NO (part of larger refactoring)

- [ ] 7. 处理 TicketDetail 的用户列表数据

  **What to do**:
  - 获取用户列表用于重新分配
  - 实现用户搜索功能（如果需要）
  - 优化加载时机（按需加载）

  **Must NOT do**:
  - 不应改变重新分配的流程

  **Recommended Agent Profile**:
  - **Category**: quick
    - Reason: 相对简单的数据获取任务
  - **Skills**: []
    - Reason: 使用现有工具即可

  **Parallelization**:
  - **Can Run In Parallel**: YES | NO
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 8)
  - **Blocks**: None
  - **Blocked By**: Task 5

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `src/App.tsx:82-88` - 用户数据获取模式

  **API/Type References** (contracts to implement against):
  - `src/lib/api.ts:97-105` - getUsers API 方法

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these)**:

  ```
  Scenario: 用户列表正确加载
    Tool: Playwright
    Preconditions: 有可用用户
    Steps:
      1. 打开工单详情
      2. 点击重新分配按钮
      3. 验证用户列表显示
    Expected Result: 用户列表正确显示，可以选择新用户
    Failure Indicators: 用户列表为空或加载失败
    Evidence: .sisyphus/evidence/task-7-user-list.png

  Scenario: 重新分配功能正常
    Tool: Playwright
    Preconditions: 在工单详情页面
    Steps:
      1. 点击重新分配
      2. 选择一个新用户
      3. 确认分配
      4. 验证更新成功
    Expected Result: 工单成功重新分配给新用户
    Failure Indicators: 分配失败或数据不更新
    Evidence: .sisyphus/evidence/task-7-reassign.png
  ```

  **Evidence to Capture**:
  - [ ] 用户列表截图
  - [ ] 重新分配流程截图

  **Commit**: NO (part of larger refactoring)

- [ ] 8. 测试 TicketDetail 组件的独立功能

  **What to do**:
  - 验证所有操作（接受、拒绝、保留、恢复、重新分配等）
  - 测试评论功能
  - 测试照片上传功能
  - 测试完成工单流程

  **Must NOT do**:
  - 不应改变任何业务逻辑

  **Recommended Agent Profile**:
  - **Category**: visual-engineering
    - Reason: 需要全面的 UI 交互测试
  - **Skills**: []
    - Reason: 使用 Playwright 进行自动化测试

  **Parallelization**:
  - **Can Run In Parallel**: YES | NO
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7)
  - **Blocks**: None
  - **Blocked By**: Task 5, 6, 7

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `e2e/tickets.spec.ts` - 已有的工单测试

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these)**:

  ```
  Scenario: 完整的工单操作流程
    Tool: Playwright
    Preconditions: 有待处理的工单
    Steps:
      1. 打开工单详情
      2. 测试接受操作
      3. 测试添加评论
      4. 测试状态变更
      5. 测试完成流程
    Expected Result: 所有操作都正常工作，数据正确更新
    Failure Indicators: 任何操作失败或数据不一致
    Evidence: .sisyphus/evidence/task-8-operations.png

  Scenario: 错误处理和边界情况
    Tool: Playwright
    Preconditions: 模拟各种错误情况
    Steps:
      1. 测试网络错误时的处理
      2. 测试权限不足时的处理
      3. 测试并发操作的处理
    Expected Result: 所有错误都有友好的提示
    Failure Indicators: 未处理的错误或崩溃
    Evidence: .sisyphus/evidence/task-8-error-handling.png
  ```

  **Evidence to Capture**:
  - [ ] 所有操作的截图
  - [ ] 错误处理截图

  **Commit**: NO (part of larger refactoring)

- [ ] 9. 更新 App.tsx 路由配置

  **What to do**:
  - 移除传递给 CreateTicket 的所有数据 props
  - 移除传递给 TicketDetail 的数据 props
  - 简化路由配置
  - 保留必要的回调函数（onSubmit, onCancel 等）

  **Must NOT do**:
  - 不应移除必要的回调函数
  - 不应改变路由路径

  **Recommended Agent Profile**:
  - **Category**: quick
    - Reason: 简单的 props 清理任务
  - **Skills**: []
    - Reason: 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES | NO
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 12)
  - **Blocks**: None
  - **Blocked By**: Task 5, 6, 7, 8 (Wave 2 complete)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `src/App.tsx:700-718` - 当前的 CreateTicket 路由配置
  - `src/App.tsx:732-749` - 当前的 TicketDetail 配置

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these)**:

  ```
  Scenario: 路由正确渲染
    Tool: Playwright
    Preconditions: 应用已启动
    Steps:
      1. 导航到 /tickets 页面
      2. 验证 CreateTicket 组件渲染
      3. 从 Dashboard 点击工单
      4. 验证 TicketDetail 渲染
    Expected Result: 组件正常渲染，没有控制台错误
    Failure Indicators: 组件不渲染或报错
    Evidence: .sisyphus/evidence/task-9-routing.png

  Scenario: 回调函数正常工作
    Tool: Playwright
    Preconditions: 在 /tickets 页面
    Steps:
      1. 创建新工单
      2. 验证 onSubmit 回调被调用
      3. 取消创建
      4. 验证 onCancel 回调被调用
    Expected Result: 所有回调正常工作，页面行为正确
    Failure Indicators: 回调未被调用或行为异常
    Evidence: .sisyphus/evidence/task-9-callbacks.png
  ```

  **Evidence to Capture**:
  - [ ] 路由渲染截图
  - [ ] 控制台错误检查截图

  **Commit**: NO (part of larger refactoring)

- [ ] 10. 清理 App.tsx 中未使用的数据加载代码

  **What to do**:
  - 移除 App.tsx 中不再需要的数据加载逻辑
  - 移除未使用的 dataStore 订阅
  - 清理不再需要的 useEffect

  **Must NOT do**:
  - 不应移除其他组件仍在使用的数据加载

  **Recommended Agent Profile**:
  - **Category**: quick
    - Reason: 简单的代码清理任务
  - **Skills**: []
    - Reason: 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES | NO
  - **Parallel Group**: Wave 3 (with Tasks 9, 11, 12)
  - **Blocks**: None
  - **Blocked By**: Task 9

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `src/App.tsx:80-99` - 当前的数据加载逻辑

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these)**:

  ```
  Scenario: 应用性能未受影响
    Tool: Bash
    Preconditions: 应用运行中
    Steps:
      1. 使用浏览器性能工具检查内存使用
      2. 检查网络请求数量
      3. 验证页面加载速度
    Expected Result: 性能指标在合理范围内
    Failure Indicators: 内存泄漏或不必要的网络请求
    Evidence: .sisyphus/evidence/task-10-performance.log
  ```

  **Evidence to Capture**:
  - [ ] 性能监控日志
  - [ ] 网络请求截图

  **Commit**: NO (part of larger refactoring)

- [ ] 11. 清理 dataStore 中未使用的数据

  **What to do**:
  - 检查 dataStore 中哪些数据不再被全局使用
  - 移除不必要的状态
  - 更新类型定义

  **Must NOT do**:
  - 不应移除其他组件仍在使用的状态

  **Recommended Agent Profile**:
  - **Category**: quick
    - Reason: 数据存储清理任务
  - **Skills**: []
    - Reason: 使用现有工具

  **Parallelization**:
  - **Can Run In Parallel**: YES | NO
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 12)
  - **Blocks**: None
  - **Blocked By**: Task 9, 10

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `src/store/index.ts` - dataStore 定义

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these)**:

  ```
  Scenario: dataStore 正常工作
    Tool: Bash
    Preconditions: 应用运行中
    Steps:
      1. 检查控制台警告
      2. 验证其他页面功能
    Expected Result: 没有数据相关的错误或警告
    Failure Indicators: 缺失状态或类型错误
    Evidence: .sisyphus/evidence/task-11-store.log
  ```

  **Evidence to Capture**:
  - [ ] 控制台日志
  - [ ] 功能验证截图

  **Commit**: NO (part of larger refactoring)

- [ ] 12. 最终集成测试

  **What to do**:
  - 端到端测试整个工单生命周期
  - 验证组件间的数据流
  - 测试并发场景
  - 性能基准测试

  **Must NOT do**:
  - 不应跳过任何测试场景

  **Recommended Agent Profile**:
  - **Category**: deep
    - Reason: 需要全面的集成测试
  - **Skills**: []
    - Reason: 使用现有测试框架

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 | Sequential
  - **Blocks**: None
  - **Blocked By**: Task 9, 10, 11

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `e2e/` - 端到端测试模式

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these)**:

  ```
  Scenario: 完整工单生命周期测试
    Tool: Playwright
    Preconditions: 清新环境
    Steps:
      1. 创建工单
      2. 分配工单
      3. 工程师接受工单
      4. 工程师出发
      5. 工程师到达
      6. 完成工单
      7. 管理员审核
    Expected Result: 整个流程顺畅，数据一致
    Failure Indicators: 任何步骤失败或数据不一致
    Evidence: .sisyphus/evidence/task-12-e2e.png

  Scenario: 并发操作测试
    Tool: Playwright (多个实例)
    Preconditions: 多个用户同时在线
    Steps:
      1. 多个用户同时创建工单
      2. 同时操作不同工单
      3. 验证数据一致性
    Expected Result: 并发操作正常，没有数据冲突
    Failure Indicators: 数据竞争或不一致
    Evidence: .sisyphus/evidence/task-12-concurrent.log
  ```

  **Evidence to Capture**:
  - [ ] 完整流程截图
  - [ ] 并发测试日志
  - [ ] 性能报告

  **Commit**: YES | NO (group with N)
  - Message: `refactor(tickets): make components self-contained for data fetching`
  - Files: `src/components/CreateTicket.tsx`, `src/components/TicketDetail.tsx`, `src/App.tsx`
  - Pre-commit: `npm run build && npm test`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4个审查代理并行运行。全部必须批准。拒绝→修复→重新运行。

- [ ] F1. **计划合规审计** — oracle
  读取计划端到端。对每个"Must Have"：验证实现存在（读取文件、curl端点、运行命令）。对每个"Must NOT Have"：搜索代码库中的禁止模式—如果发现则拒绝并指出文件:行。检查.evidence/文件中是否存在证据文件。比较交付物与计划。
  输出: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **代码质量审查** — unspecified-high
  运行 `tsc --noEmit` + linter + `npm test`。审查所有更改文件：`as any`/`@ts-ignore`、空catch、生产环境console.log、注释掉的代码、未使用的导入。检查AI slop：过度注释、过度抽象、通用名称（data/result/item/temp）。
  输出: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **真实人工QA** — unspecified-high (+ playwright 技能)
  从干净状态开始。执行每个任务的每个QA场景—遵循确切的步骤、捕获证据。测试跨任务集成（功能协同工作，而非隔离）。测试边界情况：空状态、无效输入、快速操作。保存到 `.sisyphus/evidence/final-qa/`。
  输出: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **范围保真度检查** — deep
  对每个任务：读取"What to do"，读取实际diff（git log/diff）。验证1:1—所有在规格中的都已构建（没有缺失），没有超出规格的已构建（没有蔓延）。检查"Must NOT do"合规。检测跨任务污染：任务N touching任务M的文件。标记未说明的更改。
  输出: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Task 12**: `refactor(tickets): make CreateTicket and TicketDetail self-contained for data fetching` — src/components/CreateTicket.tsx, src/components/TicketDetail.tsx, src/App.tsx

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: PASS
npm test       # Expected: PASS
```

### Final Checklist
- [ ] CreateTicket 组件独立加载数据
- [ ] TicketDetail 组件独立加载数据
- [ ] App.tsx 不再传递数据 props
- [ ] 所有测试通过