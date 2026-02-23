# 工单状态筛选修复 - KISS 简化方案

## TL;DR

> **核心理念**: KISS - Keep It Simple, Stupid
> - **不动后端** - 保持现有 9 个工程师状态不变
> - **前端适配** - 只修复前端类型和筛选器
> - **最小改动** - 只改必须改的地方
> 
> **预计改动**: 3 个文件，2 小时内可完成

---

## 问题分析

### 当前状态
| 位置 | 状态值 | 问题 |
|------|--------|------|
| 后端 | 9 个 | 无需修改 |
| Dashboard 筛选器 | 8 个 | 缺少 3 个，多余 2 个 |
| types.ts | 12 个 | 多了 3 个不存在的 |
| i18n | 不全 | 缺少翻译 |

### KISS 方案
**不动后端** → 前端自己处理映射 → 最少改动

---

## 实施计划

### 1. 修复 Dashboard 筛选器 (Dashboard.tsx)

```typescript
// 当前 (错误)
["open", "assigned", "accepted", "in_progress", "submitted", "completed", "on_hold", "cancelled", "all"]

// 修复后 (与后端 9 个状态对齐)
["open", "assigned", "accepted", "departed", "arrived", "review", "completed", "on_hold", "cancelled", "all"]
```

### 2. 修复前端类型定义 (types.ts)

```typescript
// 当前 (多余 in_progress, submitted, declined)
export type TicketStatus =
  | 'open' | 'assigned' | 'accepted' | 'in_progress' | 'departed'
  | 'arrived' | 'submitted' | 'review' | 'completed' | 'on_hold' 
  | 'cancelled' | 'declined';

// 修复后 (与后端一致)
export type TicketStatus =
  | 'open' | 'assigned' | 'accepted' | 'departed'
  | 'arrived' | 'review' | 'completed' | 'on_hold' | 'cancelled';
```

### 3. 补充 i18n 翻译 (i18n.ts)

需要添加的翻译 key:
- `assigned`: "已分配"
- `departed`: "已出发"
- `arrived`: "已到达"
- `review`: "待审核"

---

## 改动清单

| 文件 | 改动 | 行数 |
|------|------|------|
| `igreen-front/src/components/Dashboard.tsx` | 修复筛选器数组 | ~1 行 |
| `igreen-front/src/lib/types.ts` | 修复 TicketStatus 类型 | ~3 行 |
| `igreen-front/src/lib/i18n.ts` | 添加 4 个翻译 | ~8 行 |

---

## 状态映射说明

修复后，管理端 Dashboard 直接使用工程师端原始状态，不再进行转换：

| Dashboard 显示 | 后端状态值 | 说明 |
|--------------|-----------|------|
| Open | `open` | 待接单 |
| Assigned | `assigned` | 已分配 |
| Accepted | `accepted` | 已接单 |
| Departed | `departed` | 已出发 |
| Arrived | `arrived` | 已到达 |
| Review | `review` | 待审核 |
| Completed | `completed` | 已完成 |
| On Hold | `on_hold` | 暂停 |
| Cancelled | `cancelled` | 已取消 |

---

## 验证

完成后验证：
1. ✅ Dashboard 筛选器包含所有 9 个状态 + all
2. ✅ 筛选任意状态能正确过滤工单
3. ✅ 所有状态都有正确的翻译显示
