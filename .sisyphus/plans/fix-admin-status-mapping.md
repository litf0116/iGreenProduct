# 修复管理端状态映射

## 问题描述

管理端 (igreen-front) 使用了后端不存在的状态值：
- `in_progress` - 后端实际返回 `departed`
- `submitted` - 后端实际返回 `review`

这导致管理端无法正确显示工单状态。

## 后端实际状态

后端 `TicketStatus.java` 定义的状态：
```
OPEN, ASSIGNED, ACCEPTED, DEPARTED, ARRIVED, REVIEW, COMPLETED, ON_HOLD, CANCELLED
```

返回给前端时为小写形式：
```
open, assigned, accepted, departed, arrived, review, completed, on_hold, cancelled
```

## 修复方案

在管理端添加状态映射，将后端状态映射为用户友好的显示名称。

### 状态映射关系

| 后端状态 | 显示名称 | 翻译键 |
|----------|---------|--------|
| `open` | Open | `open` |
| `assigned` | Assigned | `assigned` |
| `accepted` | Accepted | `accepted` |
| `departed` | In Progress | `inProgress` |
| `arrived` | In process | `inProcess` |  ← 已修改
| `review` | In Review | `inReview` |
| `completed` | Completed | `completed` |
| `on_hold` | On Hold | `onHold` |
| `cancelled` | Cancelled | `cancelled` |

## 修改文件

### 1. `igreen-front/src/lib/types.ts`

**修改前**：
```typescript
export type TicketStatus =
  | 'open' | 'assigned' | 'accepted' | 'in_progress' | 'departed'
  | 'arrived' | 'submitted' | 'review' | 'completed' | 'on_hold' 
  | 'cancelled' | 'declined';
```

**修改后**：
```typescript
export type TicketStatus =
  | 'open' | 'assigned' | 'accepted' | 'departed'
  | 'arrived' | 'review' | 'completed' | 'on_hold' 
  | 'cancelled';
```

### 2. `igreen-front/src/lib/api.ts`

**添加状态显示名称映射函数**：
```typescript
// 状态显示名称映射（后端状态 → 用户友好名称）
export function getStatusDisplayName(status: string): string {
  const statusDisplayMap: Record<string, string> = {
    'open': 'Open',
    'assigned': 'Assigned',
    'accepted': 'Accepted',
    'departed': 'In Progress',  // 出发后显示为进行中
    'arrived': 'In process',    // 到达后显示为处理中
    'review': 'In Review',      // 提交审核后显示为审核中
    'completed': 'Completed',
    'on_hold': 'On Hold',
    'cancelled': 'Cancelled',
  };
  return statusDisplayMap[status] || status;
}

// 状态显示名称映射（用于 UI Badge）
export function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'open': 'default',
    'assigned': 'secondary',
    'accepted': 'secondary',
    'departed': 'default',       // 进行中 - 默认样式
    'arrived': 'default',        // 处理中 - 默认样式
    'review': 'secondary',       // 审核中 - 次要样式
    'completed': 'default',
    'on_hold': 'outline',
    'cancelled': 'destructive',
  };
  return variantMap[status] || 'default';
}
```

### 3. `igreen-front/src/App.tsx`

**修改统计计算逻辑（第160行）**：

**修改前**：
```typescript
inProgress: tickets.filter((t) => t.status === "in_progress" || t.status === "accepted").length,
```

**修改后**：
```typescript
inProgress: tickets.filter((t) => 
  t.status === "accepted" || t.status === "departed" || t.status === "arrived"
).length,
```

### 4. `igreen-front/src/components/Dashboard.tsx`

**修改状态翻译映射函数（第308-320行）**：

**修改前**：
```typescript
const getStatusTranslationKey = (status: string): TranslationKey => {
  const statusMap: Record<string, TranslationKey> = {
    "open": "open",
    "assigned": "assigned",
    "accepted": "accepted",
    "in_progress": "inProgress",
    "submitted": "submitted",
    "completed": "closed",
    "on_hold": "onHold",
    "cancelled": "cancelled",
  };
  return statusMap[status] || status as TranslationKey;
};
```

**修改后**：
```typescript
const getStatusTranslationKey = (status: string): TranslationKey => {
  const statusMap: Record<string, TranslationKey> = {
    "open": "open",
    "assigned": "assigned",
    "accepted": "accepted",
    "departed": "inProgress",    // 映射 departed → In Progress
    "arrived": "inProcess",      // 映射 arrived → In process
    "review": "inReview",        // 映射 review → In Review
    "completed": "completed",
    "on_hold": "onHold",
    "cancelled": "cancelled",
  };
  return statusMap[status] || status as TranslationKey;
};
```

### 5. `igreen-front/src/components/MyTasks.tsx`

**修改状态更新逻辑（第67行）**：

**修改前**：
```typescript
} else if (selectedTicket.status === "open" || selectedTicket.status === "assigned") {
  updates.status = "in_progress";
}
```

**修改后**：
```typescript
} else if (selectedTicket.status === "open" || selectedTicket.status === "assigned") {
  updates.status = "departed";  // 更新为后端实际支持的状态
}
```

### 6. `igreen-front/src/lib/i18n.ts`

**添加翻译键（第17-24行附近）**：

**添加**：
```typescript
// Ticket Status
open: "Open",
assigned: "Assigned",
accepted: "Accepted",
inProgress: "In Progress",
inProcess: "In process",        // 新增
arrived: "Arrived",
review: "In Review",            // 保留原翻译
completed: "Completed",
onHold: "On Hold",
cancelled: "Cancelled",
departed: "Departed",
```

### 7. `igreen-front/src/lib/mockData.ts`

**修改模拟数据状态值**：

搜索并替换：
- `IN_PROGRESS` → `departed`
- `SUBMITTED` → `review`

### 8. `igreen-front/src/test/mocks/handlers.ts`

**修改 Mock API 返回状态**：

- `IN_PROGRESS` → `DEPARTED`
- `SUBMITTED` → `REVIEW`

## 验证步骤

1. 修改完成后，运行前端构建：
   ```bash
   cd igreen-front && pnpm build
   ```

2. 验证 Dashboard 统计正确显示：
   - Pending: OPEN 状态工单数
   - In Progress: ACCEPTED + DEPARTED + ARRIVED 状态工单数
   - Completed: COMPLETED 状态工单数

3. 验证状态 Badge 正确显示：
   - departed 状态显示 "In Progress"
   - review 状态显示 "In Review"

4. 验证过滤功能正常：
   - 按状态筛选能正确过滤工单

## 状态流转对照表（修复后）

| 阶段 | 后端状态 | App 端显示 | 管理端显示 |
|------|---------|-----------|-----------|
| 创建 | `open` | Open | Open |
| 分配 | `assigned` | Assigned | Assigned |
| 接单 | `accepted` | Assigned | Accepted |
| 出发 | `departed` | departed | **In Progress** |
| 到达 | `arrived` | arrived | **In process** |
| 提交审核 | `review` | review | **In Review** |
| 审核通过 | `completed` | Completed | Completed |
| 审核拒绝 | `arrived` | arrived | Arrived (退回) |
| 取消 | `cancelled` | Cancelled | Cancelled |
| 暂停 | `on_hold` | On Hold | On Hold |

## 风险点

1. **类型变更**：`TicketStatus` 类型变更可能导致编译错误，需要检查所有使用该类型的地方
2. **Mock 数据**：测试数据中的状态需要同步更新
3. **向后兼容**：如果管理端 API 调用传递 `in_progress` 状态，需要更新为 `departed`
