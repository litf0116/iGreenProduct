# 移除统一更新接口 修复方案

## 问题描述

调用 `arrive/accept/depart/complete` 等独立操作接口后，又调用 `updateTicket` 统一接口，导致 403 错误。

**原因**：
1. TicketDetail.tsx 中调用 `api.arriveTicket()` 完成实际操作
2. 然后调用 `onUpdateTicket()` 触发父组件更新
3. App.tsx 的 `handleUpdateTicket` 又调用 `api.arriveTicket()`，造成重复调用
4. 后端返回 403（状态已变更，无法再执行该操作）

## 修复方案

### 修改 1: App.tsx - 移除 handleUpdateTicket 中的状态操作逻辑

**位置**: `iGreenApp/src/App.tsx:160-195`

**当前代码**:
```typescript
const handleUpdateTicket = async (id: number, updates: Partial<Ticket>) => {
    const statusActions: Record<string, () => Promise<any>> = {
      'assigned': () => api.acceptTicket(id),
      'departed': () => api.departTicket(id),
      'arrived': () => api.arriveTicket(id),
      'completed': () => api.completeTicket(id),
      'review': () => api.reviewTicket(id),
    };
    
    // ... 乐观更新 ...
    
    try {
      if (updates.status && statusActions[updates.status]) {
        await statusActions[updates.status]();  // 重复调用！
      } else {
        await api.updateTicket(id, updates);
      }
    }
};
```

**修改为**:
```typescript
const handleUpdateTicket = async (id: number, updates: Partial<Ticket>) => {
    const previousTickets = [...tickets];
    const targetTicket = tickets.find(t => t.id === id);
    
    if (!targetTicket) return;

    // 本地乐观更新
    setTickets(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));

    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket(prev => prev ? { ...prev, ...updates } : null);
    }

    // 状态变更操作由独立接口处理（accept/depart/arrive/complete）
    // 此处只更新非状态字段（如 steps、comments、photos 等）
    // 如果调用方只传了 status，说明是操作后刷新，不需要再调用 API
    const hasNonStatusUpdates = Object.keys(updates).some(key => key !== 'status');
    if (!hasNonStatusUpdates) {
      // 只有 status 字段的更新，不调用 API（已在独立操作中完成）
      return;
    }

    try {
      await api.updateTicket(id, updates);
    } catch (error) {
      setTickets(previousTickets);
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(targetTicket);
      }
      toast.error("Failed to update ticket");
    }
};
```

### 修改 2: TicketDetail.tsx - 优化操作后的更新逻辑

**位置**: `iGreenApp/src/components/TicketDetail.tsx:93-134`

确认各个操作函数只传递必要字段，不重复触发 API：

- `handleGrabOrder` (第 93-104 行)：接受工单
- `handleDepart` (第 107-118 行)：出发
- `handleArrive` (第 121-133 行)：到达

这些函数应该：
1. 先调用独立操作 API（如 `api.arriveTicket()`）
2. 成功后调用 `onUpdateTicket()` 仅更新本地状态（不传 status）
3. 或使用 `onRefreshTicket()` 重新获取工单详情

## 状态流转

```
OPEN → ACCEPTED → DEPARTED → ARRIVED → REVIEW → COMPLETED
         ↓           ↓           ↓
    acceptTicket  departTicket  arriveTicket
```

## 独立操作接口清单

| 操作 | API 接口 | TicketDetail 函数 |
|------|----------|-------------------|
| 接单 | `POST /tickets/{id}/accept` | `handleGrabOrder()` |
| 出发 | `POST /tickets/{id}/depart` | `handleDepart()` |
| 到达 | `POST /tickets/{id}/arrive` | `handleArrive()` |
| 完成 | `POST /tickets/{id}/complete` | `handleComplete()` |
| 审核 | `POST /tickets/{id}/review` | `handleReview()` |

## 统一更新接口使用场景

`api.updateTicket()` 仅在需要更新非状态字段时使用：
- 更新工单步骤 (steps)
- 更新根因分析 (rootCause)
- 更新解决方案 (solution)
- 更新反馈信息 (feedback)
- 更新照片等字段
