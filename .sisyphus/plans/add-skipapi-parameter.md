# 添加 skipApi 参数控制工单更新方案

## 问题描述

工单操作（depart/arrive/complete/decline）后会调用 `onUpdateTicket` 刷新状态，导致重复调用 `api.updateTicket`。

## 解决方案

添加 `options?: { skipApi?: boolean }` 参数，由调用者控制是否跳过 API 调用。

## 修改清单

### 1. App.tsx - 修改 handleUpdateTicket 函数签名

**文件**: `iGreenApp/src/App.tsx`  
**位置**: 第 160 行

**当前代码**:
```typescript
const handleUpdateTicket = async (id: number, updates: Partial<Ticket>) => {
    // ... 原有逻辑 ...
    const hasNonStatusUpdates = Object.keys(updates).some(key => key !== 'status');
    if (!hasNonStatusUpdates) {
      return;
    }
    await api.updateTicket(id, updates);
};
```

**修改后代码**:
```typescript
const handleUpdateTicket = async (id: number, updates: Partial<Ticket>, options?: { skipApi?: boolean }) => {
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

    // skipApi 默认为 false，调用者可以传 true 跳过 API 调用
    // 用于操作接口（accept/depart/arrive/complete）后刷新，避免重复调用
    if (options?.skipApi) {
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

### 2. TicketDetail.tsx - 修改操作函数调用

**文件**: `iGreenApp/src/components/TicketDetail.tsx`

#### 2.1 handleGrabOrder (第 93-105 行)

**修改前**:
```typescript
const handleGrabOrder = async () => {
    try {
      await api.acceptTicket(ticket.id);
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket);
      toast.success("Ticket assigned to you");
    } catch (error) {
      console.error("Failed to accept ticket:", error);
      toast.error("Failed to accept ticket");
    }
};
```

**修改后**:
```typescript
const handleGrabOrder = async () => {
    try {
      await api.acceptTicket(ticket.id);
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket, { skipApi: true });
      toast.success("Ticket assigned to you");
    } catch (error) {
      console.error("Failed to accept ticket:", error);
      toast.error("Failed to accept ticket");
    }
};
```

#### 2.2 handleDepart (第 107-118 行)

**修改前**:
```typescript
const handleDepart = async () => {
    try {
      await api.departTicket(ticket.id);
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket);
      toast.success("Departure recorded");
    } catch (error) {
      console.error("Failed to depart:", error);
      toast.error("Failed to record departure");
    }
};
```

**修改后**:
```typescript
const handleDepart = async () => {
    try {
      await api.departTicket(ticket.id);
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket, { skipApi: true });
      toast.success("Departure recorded");
    } catch (error) {
      console.error("Failed to depart:", error);
      toast.error("Failed to record departure");
    }
};
```

#### 2.3 handleArrive (第 120-132 行)

**修改前**:
```typescript
const handleArrive = async () => {
    try {
      await api.arriveTicket(ticket.id);
      ensureSteps();
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket);
      toast.success("Arrival recorded - Start working on steps");
    } catch (error) {
      console.error("Failed to arrive:", error);
      toast.error("Failed to record arrival");
    }
};
```

**修改后**:
```typescript
const handleArrive = async () => {
    try {
      await api.arriveTicket(ticket.id);
      ensureSteps();
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket, { skipApi: true });
      toast.success("Arrival recorded - Start working on steps");
    } catch (error) {
      console.error("Failed to arrive:", error);
      toast.error("Failed to record arrival");
    }
};
```

#### 2.4 handleConfirm (第 352-363 行)

**修改前**:
```typescript
const handleConfirm = async () => {
    try {
        await api.completeTicket(ticket.id);
        const updatedTicket = await api.getTicket(ticket.id);
        onUpdateTicket(ticket.id, updatedTicket);
        toast.success("Ticket confirmed and closed.");
    } catch (error) {
        console.error("Failed to confirm:", error);
        toast.error("Failed to confirm ticket");
    }
};
```

**修改后**:
```typescript
const handleConfirm = async () => {
    try {
        await api.completeTicket(ticket.id);
        const updatedTicket = await api.getTicket(ticket.id);
        onUpdateTicket(ticket.id, updatedTicket, { skipApi: true });
        toast.success("Ticket confirmed and closed.");
    } catch (error) {
        console.error("Failed to confirm:", error);
        toast.error("Failed to confirm ticket");
    }
};
```

#### 2.5 handleReject (第 365-376 行)

**修改前**:
```typescript
const handleReject = async () => {
    try {
      await api.declineTicket(ticket.id, "审核不通过，请修改后重新提交");
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket);
      toast.error("Work rejected. Please check steps and resubmit.");
    } catch (error) {
      console.error("Failed to reject ticket:", error);
      toast.error("Failed to reject ticket");
    }
};
```

**修改后**:
```typescript
const handleReject = async () => {
    try {
      await api.declineTicket(ticket.id, "审核不通过，请修改后重新提交");
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket, { skipApi: true });
      toast.error("Work rejected. Please check steps and resubmit.");
    } catch (error) {
      console.error("Failed to reject ticket:", error);
      toast.error("Failed to reject ticket");
    }
};
```

## 使用方式总结

| 场景 | 调用方式 | skipApi | 结果 |
|------|---------|---------|------|
| 操作后刷新 | `onUpdateTicket(id, data, { skipApi: true })` | true | 只更新本地状态，不调用 API |
| 字段编辑 | `onUpdateTicket(id, { rootCause: 'xxx' })` | false (默认) | 调用 `api.updateTicket` |
| 状态变更 | `onUpdateTicket(id, { status: 'arrived' })` | false (默认) | 调用 `api.updateTicket` |

## 验证步骤

1. 执行工单操作（出发/到达/完成/拒绝）
2. 检查网络面板，应只看到：
   - 1 次操作 API 调用（如 `/tickets/xxx/depart`）
   - 1 次 getTicket 调用（获取最新数据）
   - **无** updateTicket 调用
3. 编辑字段（如根因分析）时，应看到 updateTicket 正常调用

## 任务清单

- [x] 修改 App.tsx handleUpdateTicket 函数签名
- [x] 修改 handleGrabOrder 调用（添加 skipApi: true）
- [x] 修改 handleDepart 调用（添加 skipApi: true）
- [x] 修改 handleArrive 调用（添加 skipApi: true）
- [x] 修改 handleConfirm 调用（添加 skipApi: true）
- [x] 修改 handleReject 调用（添加 skipApi: true）
- [x] 构建验证
- [ ] 测试各操作流程
