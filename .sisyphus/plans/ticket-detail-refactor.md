# TicketDetail 组件拆分计划

## 目标
将 `TicketDetail.tsx` (约1100行) 拆分为多个独立组件，降低复杂度，提高可维护性。

## 当前结构

```
TicketDetail.tsx (1100行)
├── PhotoUploader (已提取)
├── DynamicFieldRenderer (已提取)
└── TicketDetail (主组件)
    ├── renderSummary()      → 可提取
    └── renderWorkflow()     → 可拆分多个状态组件
```

## 拆分方案

### Wave 1: 提取 TicketSummary 组件

**文件**: `iGreenApp/src/components/TicketSummary.tsx`

```typescript
interface TicketSummaryProps {
  ticket: Ticket;
}

export function TicketSummary({ ticket }: TicketSummaryProps) {
  return (
    <div className="w-full bg-white p-4 rounded-lg border border-slate-200 text-left text-sm space-y-4">
      {/* 从 renderSummary() 移动的代码 */}
    </div>
  );
}
```

**影响**:
- 减少 TicketDetail 约 130 行
- 使摘要逻辑独立可测试

### Wave 2: 提取 PreventiveStepItem 组件

**文件**: `iGreenApp/src/components/PreventiveStepItem.tsx`

```typescript
interface PreventiveStepItemProps {
  step: TicketStep;
  loadingImage: string | null;
  onUpdate: (stepId: string, updates: Partial<TicketStep>) => void;
  onAddPhoto: (...) => void;
}

export function PreventiveStepItem({ step, loadingImage, onUpdate, onAddPhoto }: PreventiveStepItemProps) {
  return (
    <div className={`border rounded-xl p-4 transition-all ${...}`}>
      {/* 步骤渲染逻辑 */}
    </div>
  );
}
```

**影响**:
- 减少 TicketDetail 约 70 行
- Preventive 步骤逻辑独立

### Wave 3: 提取状态工作流组件

**目录结构**:
```
iGreenApp/src/components/workflows/
├── OpenWorkflow.tsx      # 新工单状态
├── AssignedWorkflow.tsx  # 已分配状态
├── DepartedWorkflow.tsx  # 出发中状态
├── ArrivedWorkflow.tsx   # 到达状态 (动态表单)
├── ReviewWorkflow.tsx    # 审核状态
└── CompletedWorkflow.tsx # 完成状态
```

### Wave 4: 提取 DynamicTicketForm 组件

**文件**: `iGreenApp/src/components/DynamicTicketForm.tsx`

```typescript
interface DynamicTicketFormProps {
  ticket: Ticket;
  template: TicketTypeTemplate;
  loadingImage: string | null;
  onFieldChange: (fieldId: string, value: any) => void;
  onAddPhoto: (...) => void;
  onFinish: () => void;
}

export function DynamicTicketForm({ ticket, template, ... }: DynamicTicketFormProps) {
  const colors = getTypeColors(ticket.type);
  const IconComponent = getTypeIcon(ticket.type);
  
  return (
    <div className="space-y-6">
      <WorkflowHeader colors={colors} icon={IconComponent} title={template.name} />
      {/* 动态字段渲染 */}
      <FinishButton isComplete={isFormComplete()} onFinish={onFinish} />
    </div>
  );
}
```

## 重构后的文件结构

```
iGreenApp/src/components/
├── TicketDetail.tsx           # 主组件 (~300行)
├── TicketSummary.tsx          # 新增: 工单摘要
├── PhotoUploader.tsx          # 已有: 照片上传
├── DynamicFieldRenderer.tsx   # 已有: 动态字段
├── PreventiveStepItem.tsx     # 新增: Preventive 步骤项
├── DynamicTicketForm.tsx      # 新增: 动态表单
└── workflows/                  # 新增: 工作流组件
    ├── OpenWorkflow.tsx
    ├── AssignedWorkflow.tsx
    ├── DepartedWorkflow.tsx
    ├── ReviewWorkflow.tsx
    └── CompletedWorkflow.tsx
```

## 实施步骤

### Task 1: 提取 TicketSummary
- 创建 `TicketSummary.tsx`
- 移动 `renderSummary()` 代码
- 更新 `TicketDetail.tsx` 导入使用

### Task 2: 提取 PreventiveStepItem
- 创建 `PreventiveStepItem.tsx`
- 移动步骤渲染逻辑
- 更新 `TicketDetail.tsx` 使用

### Task 3: 提取 DynamicTicketForm
- 创建 `DynamicTicketForm.tsx`
- 移动动态表单渲染逻辑
- 包含 Corrective/Planned/Problem 表单

### Task 4: 编译验证
- 运行 `npm run build`
- 确保无错误

## 优先级

基于 **KISS 原则**，建议按以下优先级执行：

1. **高优先级**: `TicketSummary` - 最大的独立模块
2. **中优先级**: `PreventiveStepItem` - 减少嵌套层级
3. **低优先级**: `DynamicTicketForm` - 可选，当前代码已足够清晰

## 执行命令

```bash
/start-work ticket-detail-refactor
```