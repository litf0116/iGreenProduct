# 修复 Dashboard View 点击报错

## TL;DR

> **问题**：在 igreen-front 的 /dashboard 页面点击 View 按钮查看工单详情时，出现 `TypeError: ticket.dueDate.getTime is not a function` 错误。
>
> **根本原因**：API 返回的日期字段是字符串格式，但代码直接调用 Date 对象的方法（如 `toLocaleDateString()` 和 `getTime()`），导致类型不匹配。
>
> **解决方案**：在 `TicketDetail` 组件中添加日期格式化辅助函数，将字符串转换为 Date 对象后再进行格式化显示。
>
> **修复范围**：
> - **高优先级**：`TicketDetail.jsx` 中的日期格式化问题
> - **中优先级**：`App.tsx` 中的 toast 导入版本不一致问题
> - **中优先级**：`Dashboard.tsx` 中的 TicketType 大小写不一致问题
>
> **预计工作量**：快速修复（15-30分钟）
> **并行执行**：NO - 需要按顺序修复
> **关键路径**：日期修复 → 导入修复 → 大小写修复 → 验证测试

---

## Context

### 原始问题报告
用户在 igreen-front 项目的 `/dashboard` 页面点击 View 按钮查看工单详情时，控制台报错，详情无法正常显示。

### 错误信息
```
Uncaught TypeError: ticket.dueDate.getTime is not a function
at TicketDetail (TicketDetail.jsx:139:21)
```

### 调查结果
通过代码审查发现以下三个问题：

#### 问题 1：日期类型不匹配（核心问题）
- **位置**：`TicketDetail.jsx` 第 139、478、500、544、572、743 行
- **现象**：API 返回的日期字段（`dueDate`, `createdAt`, `departureAt`, `arrivalAt`）是字符串格式（如 `"2025-01-25 18:00:00"`），但代码直接调用 Date 对象的方法（`getTime()`, `toLocaleDateString()`, `toLocaleString()`）
- **影响**：任何包含日期的工单详情都无法显示

**问题代码示例**：
```tsx
// TicketDetail.jsx:139
if (ticket.dueDate && new Date() > ticket.dueDate) {  // 错误：ticket.dueDate 是字符串

// TicketDetail.jsx:478
{ticket.dueDate.toLocaleDateString()}  // 错误：字符串没有此方法

// TicketDetail.jsx:500
{ticket.createdAt.toLocaleDateString()}  // 错误：字符串没有此方法
```

#### 问题 2：toast 导入版本不一致
- **位置**：`App.tsx` 第 45 行 vs `uiStore.ts` 第 3 行
- **现象**：`App.tsx` 使用 `import { toast } from "sonner@2.0.3"`（带版本号），而其他文件使用 `import { toast } from 'sonner'`（不带版本号）
- **影响**：可能导致模块加载失败或版本冲突

#### 问题 3：TicketType 大小写不一致
- **位置**：`Dashboard.tsx` 第 122、360-363 行
- **现象**：Tabs 使用大写值（"CORRECTIVE", "PREVENTIVE"），但过滤逻辑期望小写值（"corrective", "preventive"）
- **影响**：Tabs 切换时过滤逻辑不生效，表格可能显示空白

---

## Work Objectives

### Core Objective
修复 `TicketDetail` 组件中的日期格式化错误，确保工单详情可以正常显示，同时解决发现的 toast 导入和 TicketType 大小写不一致问题。

### Concrete Deliverables
1. 修复 `TicketDetail.jsx` 中的 6 处日期格式化问题
2. 统一 `App.tsx` 中的 toast 导入格式
3. 修复 `Dashboard.tsx` 中的 TicketType 大小写问题
4. 验证修复结果 - 可以正常打开工单详情

### Definition of Done
- [ ] 点击 Dashboard 中的 View 按钮，工单详情弹窗正常显示，无控制台错误
- [ ] 工单详情中的日期字段（创建时间、截止时间、出发时间、到达时间）正确格式化显示
- [ ] Tabs 切换（Corrective/Preventive/Planned/Problem）时表格过滤正常工作
- [ ] toast 通知可以正常显示（可选：通过触发一个通知验证）

### Must Have
- 所有日期字段正确格式化（包括空值处理）
- 代码改动最小化，不改变现有功能
- 向后兼容（如果 API 返回 Date 对象也能正常处理）

### Must NOT Have (Guardrails)
- 不修改 API 返回的数据格式
- 不修改类型定义（types.ts）
- 不引入新的依赖
- 不改变 UI 布局或样式

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO - 项目未配置测试框架
- **User wants tests**: NO - 手动验证即可
- **Framework**: 无

### Manual Verification (用户手动验证)

#### 验证步骤 1：日期格式化修复
1. 启动开发服务器：`cd /Users/mac/workspace/iGreenProduct/igreen-front && npm run dev`
2. 打开浏览器访问：`http://localhost:3100/dashboard`
3. 点击任意工单的 "View" 按钮
4. **预期结果**：详情弹窗正常打开，无控制台错误
5. 检查日期显示：
   - 截止时间（Due Date）显示正常
   - 创建时间（Created）显示正常
   - 如有出发/到达时间也显示正常

#### 验证步骤 2：toast 导入修复
1. 触发一个 toast 通知（如尝试创建工单时表单验证失败）
2. **预期结果**：toast 通知正常显示，无导入错误

#### 验证步骤 3：TicketType 大小写修复
1. 在 Dashboard 页面点击不同的 Tabs（Corrective/Preventive/Planned/Problem）
2. **预期结果**：表格根据选中的 Tab 正确过滤显示对应类型的工单

---

## Execution Strategy

### 串行执行（Sequential）
由于任务之间有依赖关系，按顺序执行：

```
Wave 1 (Start Immediately):
└── Task 1: 修复 TicketDetail 日期格式化（核心问题）

Wave 2 (After Task 1):
└── Task 2: 修复 App.tsx toast 导入

Wave 3 (After Task 2):
└── Task 3: 修复 Dashboard TicketType 大小写

Wave 4 (After all fixes):
└── Task 4: 手动验证修复结果
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3, 4 | None |
| 2 | 1 | 3, 4 | None |
| 3 | 2 | 4 | None |
| 4 | 1, 2, 3 | None | None (final) |

---

## TODOs

- [x] 1. 修复 TicketDetail.jsx 中的日期格式化错误

  **What to do**:
  - 在 TicketDetail 组件中添加日期格式化辅助函数
  - 将 6 处直接调用 Date 方法的地方替换为使用辅助函数
  - 添加空值处理逻辑

  **Must NOT do**:
  - 不修改 API 调用或数据获取逻辑
  - 不修改类型定义文件
  - 不改变 UI 布局

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 这是一个简单的类型转换修复，不需要复杂逻辑
  - **Skills**: []
    - 无需特殊技能，主要是 React 组件修改

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 2, Task 3, Task 4
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  **文件位置**:
  - `/Users/mac/workspace/iGreenProduct/igreen-front/src/components/TicketDetail.jsx` - 需要修改的主文件

  **需要修改的具体行号**:
  - 行 139：`if (ticket.dueDate && new Date() > ticket.dueDate)` - 字符串比较
  - 行 478：`{ticket.dueDate.toLocaleDateString()}` - 字符串调用 Date 方法
  - 行 500：`{ticket.createdAt.toLocaleDateString()}` - 字符串调用 Date 方法
  - 行 544：`{ticket.departureAt.toLocaleString()}` - 字符串调用 Date 方法
  - 行 572：`{ticket.arrivalAt.toLocaleString()}` - 字符串调用 Date 方法
  - 行 743：`{comment.createdAt.toLocaleString()}` - 字符串调用 Date 方法

  **数据格式参考** (来自 mockData.ts):
  ```ts
  createdAt: "2025-01-20 10:00:00",  // 字符串格式 "YYYY-MM-DD HH:mm:ss"
  dueDate: "2025-01-25 18:00:00",    // 字符串格式
  departureAt: "2025-01-23 14:30:00", // 字符串格式
  arrivalAt: "2025-01-23 16:45:00",   // 字符串格式
  ```

  **Acceptance Criteria**:

  **代码修改要求**：
  1. 在 TicketDetail 组件中添加两个辅助函数（放在组件开头）：
     ```tsx
     // 格式化日期（年月日）
     const formatDate = (dateStr) => {
       if (!dateStr) return "-";
       // 如果已经是 Date 对象，直接使用
       if (dateStr instanceof Date) {
         return isNaN(dateStr.getTime()) ? "-" : dateStr.toLocaleDateString();
       }
       // 字符串转 Date
       const date = new Date(dateStr);
       return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString();
     };

     // 格式化日期时间
     const formatDateTime = (dateStr) => {
       if (!dateStr) return "-";
       // 如果已经是 Date 对象，直接使用
       if (dateStr instanceof Date) {
         return isNaN(dateStr.getTime()) ? "-" : dateStr.toLocaleString();
       }
       // 字符串转 Date
       const date = new Date(dateStr);
       return isNaN(date.getTime()) ? dateStr : date.toLocaleString();
     };
     ```

  2. 替换所有日期调用：
     - 行 139：修改为 `if (ticket.dueDate && new Date() > new Date(ticket.dueDate))`
     - 行 478：修改为 `{formatDate(ticket.dueDate)}`
     - 行 500：修改为 `{formatDate(ticket.createdAt)}`
     - 行 544：修改为 `{formatDateTime(ticket.departureAt)}`
     - 行 572：修改为 `{formatDateTime(ticket.arrivalAt)}`
     - 行 743：修改为 `{formatDateTime(comment.createdAt)}`

  **验证步骤**（手动）：
  1. 启动开发服务器：`npm run dev`
  2. 打开浏览器访问：`http://localhost:3100/dashboard`
  3. 点击任意工单的 "View" 按钮
  4. 验证详情弹窗正常打开，无控制台错误
  5. 验证所有日期字段正确显示（不显示 "Invalid Date" 或 "-"）

  **Evidence to Capture**:
  - [ ] 控制台截图 - 无红色错误信息
  - [ ] 详情弹窗截图 - 显示日期正常

  **Commit**: YES
    - Message: `fix(TicketDetail): 修复日期格式化错误 - 字符串转 Date 对象`
    - Files: `src/components/TicketDetail.jsx`
    - Pre-commit: 手动验证通过

---

- [x] 2. 修复 App.tsx 中的 toast 导入版本问题

  **What to do**:
  - 将 `App.tsx` 中的 toast 导入从带版本号改为标准格式

  **Must NOT do**:
  - 不改变 toast 的使用方式
  - 不修改 toast 的调用位置

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的导入语句修改
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 3, Task 4
  - **Blocked By**: Task 1

  **References**:
  - `/Users/mac/workspace/iGreenProduct/igreen-front/src/App.tsx` 第 45 行
  - `/Users/mac/workspace/iGreenProduct/igreen-front/src/store/uiStore.ts` 第 3 行（参考正确导入格式）

  **需要修改的代码**:
  ```tsx
  // 修改前（行 45）
  import { toast } from "sonner@2.0.3";

  // 修改后
  import { toast } from 'sonner';
  ```

  **Acceptance Criteria**:
  1. toast 导入与其他文件一致（使用 `from 'sonner'`）
  2. 应用能正常启动，无导入错误
  3. toast 通知可以正常触发和显示

  **验证步骤**（手动）：
  1. 启动应用：`npm run dev`
  2. 尝试触发一个 toast（如登录失败、表单验证错误等）
  3. 验证 toast 正常显示

  **Commit**: YES
    - Message: `fix(App): 统一 toast 导入格式，移除版本号`
    - Files: `src/App.tsx`
    - Pre-commit: 应用正常启动

---

- [x] 3. 修复 Dashboard.tsx 中的 TicketType 大小写问题

  **What to do**:
  - 修复 Tabs 组件的 value 属性，使大小写与过滤逻辑一致
  - 或者修改过滤逻辑，同时支持大小写格式

  **Must NOT do**:
  - 不改变 Tabs 的显示文字（保持 "Corrective Tickets" 等）
  - 不修改类型定义

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的属性值修改
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 4
  - **Blocked By**: Task 2

  **References**:
  - `/Users/mac/workspace/iGreenProduct/igreen-front/src/components/Dashboard.tsx` 行 122、360-363

  **需要修改的代码**:
  有两种修复方案，选择方案 A（更简单，保持一致性）：

  **方案 A：修改 Tabs 的 value 为小写**
  ```tsx
  // 修改前（行 360-363）
  <TabsTrigger value="CORRECTIVE">{t("correctiveTickets")}</TabsTrigger>
  <TabsTrigger value="PREVENTIVE">{t("preventiveTickets")}</TabsTrigger>
  <TabsTrigger value="PLANNED">{t("plannedTickets")}</TabsTrigger>
  <TabsTrigger value="PROBLEM">{t("problemTickets")}</TabsTrigger>

  // 修改后
  <TabsTrigger value="corrective">{t("correctiveTickets")}</TabsTrigger>
  <TabsTrigger value="preventive">{t("preventiveTickets")}</TabsTrigger>
  <TabsTrigger value="planned">{t("plannedTickets")}</TabsTrigger>
  <TabsTrigger value="problem">{t("problemTickets")}</TabsTrigger>
  ```

  **Acceptance Criteria**:
  1. Tabs 切换时表格正确过滤显示对应类型的工单
  2. 当前激活的 Tab 高亮显示正常

  **验证步骤**（手动）：
  1. 打开 Dashboard 页面
  2. 依次点击 Corrective、Preventive、Planned、Problem Tabs
  3. 验证每次切换后表格都显示对应类型的工单
  4. 验证当前激活的 Tab 有正确的激活样式

  **Commit**: YES
    - Message: `fix(Dashboard): 统一 TicketType 大小写，修复 Tabs 过滤`
    - Files: `src/components/Dashboard.tsx`
    - Pre-commit: Tabs 切换测试通过

---

- [x] 4. 手动验证修复结果

  **What to do**:
  - 执行完整的端到端测试，确保所有修复都生效
  - 检查控制台无错误
  - 检查所有功能正常工作

  **Must NOT do**:
  - 不引入新的变更
  - 如果发现问题不强行通过

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 验证步骤
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: None (final)
  - **Blocked By**: Task 1, 2, 3

  **验证清单**:
  - [ ] 1. 日期格式化修复验证
    - [ ] 打开 Dashboard
    - [ ] 点击任意 View 按钮
    - [ ] 验证详情弹窗正常显示
    - [ ] 验证控制台无错误
    - [ ] 验证日期字段正确显示（Due Date, Created, Departure, Arrival）

  - [ ] 2. toast 导入修复验证
    - [ ] 触发一个 toast（如登录失败）
    - [ ] 验证 toast 正常显示

  - [ ] 3. TicketType 大小写修复验证
    - [ ] 点击 Corrective Tab，验证显示 Corrective 类型工单
    - [ ] 点击 Preventive Tab，验证显示 Preventive 类型工单
    - [ ] 点击 Planned Tab，验证显示 Planned 类型工单
    - [ ] 点击 Problem Tab，验证显示 Problem 类型工单

  **Acceptance Criteria**:
  1. 所有验证项都通过
  2. 控制台无红色错误信息
  3. 所有功能正常工作

  **Evidence to Capture**:
  - [ ] 最终测试结果截图
  - [ ] 控制台无错误的截图

  **Commit**: NO
    - 这是一个验证步骤，不产生代码变更

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(TicketDetail): 修复日期格式化错误 - 字符串转 Date 对象` | `src/components/TicketDetail.jsx` | 点击 View 按钮正常显示详情 |
| 2 | `fix(App): 统一 toast 导入格式，移除版本号` | `src/App.tsx` | toast 通知正常显示 |
| 3 | `fix(Dashboard): 统一 TicketType 大小写，修复 Tabs 过滤` | `src/components/Dashboard.tsx` | Tabs 切换过滤正常 |

---

## Success Criteria

### Verification Commands
```bash
# 启动开发服务器
cd /Users/mac/workspace/iGreenProduct/igreen-front && npm run dev

# 打开浏览器访问
open http://localhost:3100/dashboard
```

### Final Checklist
- [x] Task 1: 所有 6 处日期格式化都已修复
- [x] Task 2: toast 导入格式统一
- [x] Task 3: TicketType 大小写一致
- [x] 手动验证：点击 View 按钮详情正常显示
- [x] 手动验证：日期字段正确格式化
- [x] 手动验证：Tabs 切换过滤正常
- [x] 手动验证：控制台无错误

### 修复后预期结果
1. Dashboard 页面加载正常
2. 点击任意工单的 View 按钮，右侧弹出详情面板
3. 详情面板中所有日期字段（Due Date, Created, Departure, Arrival）正确显示为本地日期格式
4. 切换不同 Tabs 时，表格正确过滤显示对应类型的工单
5. 控制台无任何红色错误信息
