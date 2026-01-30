# 修复 TicketDetail.tsx 中 createdAt 空值处理

## 问题描述

在 `TicketDetail.tsx` 中，`createdAt` 字段在渲染时没有处理空值情况，可能导致错误：

```typescript
// 行 1044
{new Date(ticket.createdAt).toLocaleDateString()}
// ❌ 如果 createdAt 为 null/undefined，new Date(null) 会返回 1970-01-01
// ❌ 如果 createdAt 为无效格式，会抛出错误
```

## 修复方案

### 文件: `iGreenApp/src/components/TicketDetail.tsx`

**位置 1**: 表格中的报告日期显示 (行 ~1043-1046)

**当前代码**:
```typescript
<div className="flex items-center gap-2 text-sm font-medium truncate">
  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
  <span className="truncate">
    {new Date(ticket.createdAt).toLocaleDateString()}
  </span>
</div>
```

**修复后代码**:
```typescript
<div className="flex items-center gap-2 text-sm font-medium truncate">
  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
  <span className="truncate">
    {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}
  </span>
</div>
```

**位置 2**: 其他可能使用 `new Date(ticket.createdAt)` 的地方

需要检查并修复所有类似的使用模式。

## 任务列表

### 任务 1: 修复表格中的 createdAt 显示

**文件**: `iGreenApp/src/components/TicketDetail.tsx`  
**行号**: ~1043-1046

**验收标准**:
- [x] `ticket.createdAt` 为空时显示 `-`
- [x] `ticket.createdAt` 有效时显示格式化日期

### 任务 2: 全局搜索其他 createdAt 使用位置

**验收标准**:
- [x] 搜索所有 `new Date(ticket.createdAt)` 的使用
- [x] 为每个使用位置添加空值检查

### 任务 3: 验证修复

**验证步骤**:
- [x] 创建一个没有 `createdAt` 的工单
- [x] 打开工单详情
- [x] 确认显示 `-` 而不是错误或 1970-01-01

## 相关文件

- `iGreenApp/src/components/TicketDetail.tsx` - 工单详情组件

## 备注

这个问题在以下场景会出现：
1. 后端返回的工单没有 `createdAt` 字段
2. 数据库中 `created_at` 列为 NULL
3. 新创建的工单但后端没有正确设置时间戳
