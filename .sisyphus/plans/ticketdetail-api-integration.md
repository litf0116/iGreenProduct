# 完善 TicketDetail.tsx 操作 API 调用

## 问题描述

当前 `TicketDetail.tsx` 中多个操作只更新本地状态，没有调用后端 API：

| 操作 | 当前状态 | 问题 |
|------|----------|------|
| handleDepart | ⚠️ 仅本地更新 | 只更新 history.departedAt，没有调用 departTicket API |
| handleArrive | ⚠️ 仅本地更新 | 只更新 history.arrivedAt，没有调用 arriveTicket API |
| handleFinish | ⚠️ 仅本地更新 | 只更新 status 为 'review'，没有调用 submit API |
| handleConfirm | ❌ 模拟数据 | 模拟完成，实际没有调用 API |
| handleReject | ⚠️ 仅本地更新 | 只更新 status 为 'arrived'，没有调用 API |

## 修复方案

### 文件: `iGreenApp/src/components/TicketDetail.tsx`

#### 1. handleDepart - 出发

**当前代码**:
```typescript
const handleDepart = () => {
  onUpdateTicket(ticket.id, {
    status: 'departed',
    history: { ...ticket.history, departedAt: new Date().toISOString() }
  });
  toast.success("Departure recorded");
};
```

**修复后代码**:
```typescript
const handle => {
  tryDepart = async () {
    await api.departTicket(ticket.id);
    onUpdateTicket(ticket.id, {
      status: 'departed',
      history: { ...ticket.history, departedAt: new Date().toISOString() }
    });
    toast.success("Departure recorded");
  } catch (error) {
    console.error("Failed to depart:", error);
    toast.error("Failed to record departure");
  }
};
```

#### 2. handleArrive - 到达

**当前代码**:
```typescript
const handleArrive = () => {
  ensureSteps();
  onUpdateTicket(ticket.id, {
    status: 'arrived',
    history: { ...ticket.history, arrivedAt: new Date().toISOString() }
  });
  toast.success("Arrival recorded - Start working on steps");
};
```

**修复后代码**:
```typescript
const handleArrive = async () => {
  try {
    await api.arriveTicket(ticket.id);
    ensureSteps();
    onUpdateTicket(ticket.id, {
      status: 'arrived',
      history: { ...ticket.history, arrivedAt: new Date().toISOString() }
    });
    toast.success("Arrival recorded - Start working on steps");
  } catch (error) {
    console.error("Failed to arrive:", error);
    toast.error("Failed to record arrival");
  }
};
```

#### 3. handleFinish - 完成工作/提交审核

**当前代码**:
```typescript
const handleFinish = () => {
  // 验证逻辑...
  onUpdateTicket(ticket.id, { status: 'review' });
  toast.success("Work finished. Pending review.");
};
```

**修复后代码**:
```typescript
const handleFinish = async () => {
  try {
    await api.reviewTicket(ticket.id);
    onUpdateTicket(ticket.id, { status: 'review' });
    toast.success("Work finished. Pending review.");
  } catch (error) {
    console.error("Failed to submit:", error);
    toast.error("Failed to submit work for review");
  }
};
```

#### 4. handleConfirm - 确认完成

**当前代码**:
```typescript
const handleConfirm = () => {
  const simulateReject = false;
  if (simulateReject) {
    handleReject();
  } else {
    onUpdateTicket(ticket.id, {
      status: 'completed',
      history: { ...ticket.history, completedAt: new Date().toISOString() }
    });
    toast.success("Ticket confirmed and closed.");
  }
};
```

**修复后代码**:
```typescript
const handleConfirm = async () => {
  try {
    // 调用审核通过接口，完成工单
    await api.completeTicket(ticket.id);
    onUpdateTicket(ticket.id, {
      status: 'completed',
      history: { ...ticket.history, completedAt: new Date().toISOString() }
    });
    toast.success("Ticket confirmed and closed.");
  } catch (error) {
    console.error("Failed to confirm:", error);
    toast.error("Failed to confirm ticket");
  }
};
```

#### 5. handleReject - 驳回

**当前代码**:
```typescript
const handleReject = () => {
  onUpdateTicket(ticket.id, {
    status: 'arrived',
  });
  toast.error("Work rejected. Please check steps and resubmit.");
};
```

**修复后代码**:
```typescript
const handleReject = async () => {
  // 驳回时返回 arrived 状态，让工程师继续修改
  // 不需要调用特殊 API，只需更新状态
  onUpdateTicket(ticket.id, {
    status: 'arrived',
  });
  toast.error("Work rejected. Please check steps and resubmit.");
};
```

## 任务列表

### 任务 1: 修复 handleDepart

**验收标准**:
- [x] 调用 `api.departTicket(ticket.id)`
- [x] 成功时更新本地状态
- [x] 失败时显示错误 toast

### 任务 2: 修复 handleArrive

**验收标准**:
- [x] 调用 `api.arriveTicket(ticket.id)`
- [x] 成功时更新本地状态
- [x] 失败时显示错误 toast

### 任务 3: 修复 handleFinish

**验收标准**:
- [x] 调用 `api.reviewTicket(ticket.id)` 提交审核
- [x] 成功时更新状态为 'review'
- [x] 失败时显示错误 toast

### 任务 4: 修复 handleConfirm

**验收标准**:
- [x] 调用 `api.completeTicket(ticket.id)` 完成工单
- [x] 成功时更新状态为 'completed'
- [x] 失败时显示错误 toast

### 任务 5: 验证 handleReject

**验收标准**:
- [x] 驳回时更新状态为 'arrived'
- [x] 不需要额外 API 调用（状态更新由 handleUpdateTicket 处理）

## 后端 API 对应关系

| 前端操作 | API 方法 | 后端接口 |
|---------|----------|----------|
| departTicket | `api.departTicket(id)` | `POST /api/tickets/{id}/depart` |
| arriveTicket | `api.arriveTicket(id)` | `POST /api/tickets/{id}/arrive` |
| reviewTicket | `api.reviewTicket(id, cause)` | `POST /api/tickets/{id}/review` |
| completeTicket | `api.completeTicket(id)` | `POST /api/tickets/{id}/complete` |

## 验证步骤

1. 登录工程师账号
2. 接受一个工单
3. 点击 "Departure Now" → 确认调用 depart API
4. 点击 "I Have Arrived" → 确认调用 arrive API
5. 完成表单后点击 "Finish" → 确认调用 review API
6. 使用管理员账号审核通过 → 确认调用 complete API
