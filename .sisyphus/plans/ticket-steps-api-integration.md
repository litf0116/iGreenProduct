# 步骤相关接口对接

## 背景

当前 `TicketDetail.tsx` 中步骤相关的操作只更新本地状态，没有调用后端 API：

| 操作 | 前端函数 | 当前状态 | 需要的后端接口 |
|------|----------|----------|----------------|
| 步骤完成切换 | `handleStepToggle` | ⚠️ 仅本地 | `PUT /api/tickets/{ticketId}/steps/{stepId}` |
| 步骤描述更新 | `handleStepDescription` | ⚠️ 仅本地 | `PUT /api/tickets/{ticketId}/steps/{stepId}` |
| 步骤更新(预防性) | `handlePreventiveStepUpdate` | ⚠️ 仅本地 | `PUT /api/tickets/{ticketId}/steps/{stepId}` |

## 后端接口设计

### 1. 更新步骤接口

**接口**: `PUT /api/tickets/{ticketId}/steps/{stepId}`

**请求体**:
```json
{
  "completed": boolean,
  "description": string,
  "status": "pass" | "fail" | "na",
  "cause": string,
  "photoUrl": string,
  "photoUrls": string[],
  "beforePhotoUrl": string,
  "beforePhotoUrls": string[],
  "afterPhotoUrl": string,
  "afterPhotoUrls": string[]
}
```

**响应**: 返回更新后的 TicketResponse

### 2. 批量更新步骤接口 (可选)

**接口**: `PUT /api/tickets/{ticketId}/steps`

**请求体**:
```json
{
  "steps": [
    {
      "id": string,
      "completed": boolean,
      "description": string,
      ...
    }
  ]
}
```

## 前端修改

### 1. 添加步骤更新 API 方法

**文件**: `iGreenApp/src/lib/api.ts`

```typescript
// 更新单个步骤
updateTicketStep: async (
  ticketId: number,
  stepId: string,
  updates: Partial<TicketStep>
): Promise<Ticket> => {
  return fetchWithAuth(`/api/tickets/${ticketId}/steps/${stepId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
},
```

### 2. 修改 handleStepToggle

**当前代码** (行 ~136):
```typescript
const handleStepToggle = (stepId: string, checked: boolean) => {
  const updatedSteps = ticket.steps?.map(s => 
    s.id === stepId ? { ...s, completed: checked } : s
  );
  onUpdateTicket(ticket.id, { steps: updatedSteps });
};
```

**修复后代码**:
```typescript
const handleStepToggle = async (stepId: string, checked: boolean) => {
  const step = ticket.steps?.find(s => s.id === stepId);
  if (!step) return;

  const updates = { ...step, completed: checked };
  
  try {
    await api.updateTicketStep(ticket.id, stepId, updates);
    const updatedSteps = ticket.steps?.map(s => 
      s.id === stepId ? { ...s, completed: checked } : s
    );
    onUpdateTicket(ticket.id, { steps: updatedSteps });
  } catch (error) {
    console.error("Failed to update step:", error);
    toast.error("Failed to update step");
  }
};
```

### 3. 修改 handleStepDescription

**当前代码** (行 ~147):
```typescript
const handleStepDescription = (stepId: string, desc: string) => {
  const updatedSteps = ticket.steps?.map(s => 
    s.id === stepId ? { ...s, description: desc } : s
  });
  onUpdateTicket(ticket.id, { steps: updatedSteps });
};
```

**修复后代码**:
```typescript
const handleStepDescription = async (stepId: string, desc: string) => {
  const step = ticket.steps?.find(s => s.id === stepId);
  if (!step) return;

  const updates = { ...step, description: desc };
  
  try {
    await api.updateTicketStep(ticket.id, stepId, updates);
    const updatedSteps = ticket.steps?.map(s => 
      s.id === stepId ? { ...s, description: desc } : s
    );
    onUpdateTicket(ticket.id, { steps: updatedSteps });
  } catch (error) {
    console.error("Failed to update step description:", error);
    // 不显示 toast，避免频繁操作干扰
  }
};
```

### 4. 修改 handlePreventiveStepUpdate

**当前代码** (行 ~157):
```typescript
const handlePreventiveStepUpdate = (stepId: string, updates: Partial<TicketStep>) => {
  // ... 计算完成状态逻辑
  onUpdateTicket(ticket.id, { steps: updatedSteps });
};
```

**修复后代码**:
```typescript
const handlePreventiveStepUpdate = async (stepId: string, updates: Partial<TicketStep>) => {
  try {
    await api.updateTicketStep(ticket.id, stepId, updates);
    // ... 计算完成状态逻辑
    onUpdateTicket(ticket.id, { steps: updatedSteps });
  } catch (error) {
    console.error("Failed to update step:", error);
    toast.error("Failed to update step");
  }
};
```

## 任务列表

### 后端任务

- [x] 添加 `PUT /api/tickets/{ticketId}/steps/{stepId}` 接口
- [x] 在 TicketService 中实现更新逻辑
- [x] 创建 TicketStepUpdateRequest DTO
- [ ] 测试后端接口

### 前端任务

- [x] 在 api.ts 添加 `updateTicketStep` 方法
- [x] 修改 `handleStepToggle` 添加 API 调用
- [x] 修改 `handleStepDescription` 添加 API 调用
- [x] 修改 `handlePreventiveStepUpdate` 添加 API 调用
- [ ] 功能测试

## 验证步骤

1. 登录工程师账号
2. 接受一个预防性维护工单
3. 点击 "I Have Arrived"
4. 在步骤列表中：
   - 切换步骤完成状态 → 确认调用 API
   - 添加步骤描述 → 确认调用 API
   - 更新步骤状态 (Pass/Fail/NA) → 确认调用 API
5. 刷新页面，确认数据持久化
