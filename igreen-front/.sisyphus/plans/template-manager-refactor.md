# TemplateManager 重构计划：将数据获取迁移到组件内部

## TL;DR

> 将模板数据获取逻辑从 App.tsx 迁移到 TemplateManager 组件内部，实现自包含的数据管理和乐观更新

> **交付物**: 
> - 独立的 TemplateManager 组件（自带数据获取）
> - 清理后的 App.tsx

> **预估工作量**: Short | **并行执行**: NO (顺序)

---

## 背景

### 当前问题
1. TemplateManager 依赖父组件传递 templates 数据
2. 删除模板时状态更新失败（"templates.map is not a function"）
3. 乐观更新需要父子组件通信，逻辑复杂

### 解决方案
让 TemplateManager 自主管理模板数据，内部实现：
- 数据获取 (useEffect + api.getTemplates)
- 乐观更新 (先更新本地状态，再调用 API)
- 错误回滚 (API 失败时恢复状态)

---

## 工作目标

### 核心目标
TemplateManager 组件能够独立获取和管理模板数据，无需依赖父组件

### 具体交付物
1. `src/components/TemplateManager.tsx` - 带数据获取逻辑的组件
2. 清理后的 `src/App.tsx` - 移除模板相关 fetch 逻辑

### 完成定义
- [ ] TemplateManager 能在挂载时获取模板数据
- [ ] 创建/编辑/删除模板立即反映在 UI（乐观更新）
- [ ] API 失败时正确回滚状态
- [ ] App.tsx 中不再有模板数据获取逻辑

---

## 执行策略

### 任务拆分

#### 任务 1: 重写 TemplateManager.tsx

**要做的事情**:
1. 修改 props：templates 改为可选（向后兼容）
2. 添加本地状态：`templates`, `loading`, `error`
3. 添加 useEffect 挂载时获取数据
4. 实现 handleSave（创建/更新带乐观更新）
5. 实现 handleDelete（删除带乐观更新）
6. 添加加载状态 UI
7. 添加错误状态 UI 和重试按钮

**推荐 Agent Profile**:
- **Category**: `visual-engineering` - UI 组件开发
- **Skills**: 无特殊技能需求

**QA 场景**:

场景：组件挂载时获取模板
- Tool: Playwright
- 步骤：
  1. 打开 /tickets 页面
  2. 点击 Templates 标签
  3. 等待加载完成
- 预期结果：显示模板列表或空状态
- 证据：`.sisyphus/evidence/task1-load-templates.png`

场景：创建新模板
- Tool: Playwright
- 步骤：
  1. 点击 "Create Template" 按钮
  2. 填写模板名称、描述
  3. 添加一个 Step
  4. 点击保存
- 预期结果：新模板立即出现在列表中
- 证据：`.sisyphus/evidence/task1-create-template.png`

场景：删除模板
- Tool: Playwright  
- 步骤：
  1. 在模板卡片上点击删除按钮
- 预期结果：模板立即从列表中消失
- 证据：`.sisyphus/evidence/task1-delete-template.png`

场景：API 失败回滚
- Tool: 模拟网络错误
- 步骤：
  1. 尝试删除模板
  2. API 返回错误
- 预期结果：模板恢复到列表中，显示错误提示
- 证据：`.sisyphus/evidence/task1-rollback.png`

---

#### 任务 2: 清理 App.tsx

**要做的事情**:
1. 移除 `templates` 状态声明
2. 移除 `setTemplates` 声明  
3. 移除模板数据获取代码（Promise.all 中的 templatesRes）
4. 移除 `handleDeleteTemplate` 函数
5. 简化 TemplateManager 使用（只传 language）

**推荐 Agent Profile**:
- **Category**: `quick` - 小范围代码修改

**QA 场景**:
场景：App.tsx 不再获取模板数据
- Tool: Grep
- 验证：确认代码中无 `api.getTemplates` 调用

---

## 验证策略

### 测试决策
- **Infrastructure**: 已存在 (vitest)
- **Automated Tests**: 无需添加
- **Agent-Executed QA**: 必需（见上方 QA 场景）

---

## 提交策略

- **Task 1**: `refactor: TemplateManager with self-contained data fetching`
- **Task 2**: `refactor: remove template fetch logic from App.tsx`

---

## 成功标准

- [ ] TemplateManager 独立工作，不依赖父组件传递 templates
- [ ] 乐观更新正常工作（CRUD 操作立即反映）
- [ ] API 失败时正确回滚
- [ ] App.tsx 代码简化
- [ ] 所有 QA 场景通过
