# 修复工单详情页面获取完整数据

## 问题描述

当前点击工单打开详情页面时，直接使用列表中的简要数据，没有调用后端完整接口获取更全面的数据。

## 问题分析

### 当前代码

**文件**: `iGreenApp/src/App.tsx`  
**行号**: ~144-149

```typescript
const handleTicketClick = (ticket: Ticket) => {
  // TODO: Backend Integration - Ticket Details
  // If the list only contains summary data, fetch full details here.
  setSelectedTicket(ticket);  // ❌ 使用列表简要数据
};
```

### 问题

1. 列表接口 `/api/tickets/my` 返回的数据可能缺少部分字段
2. 详情接口 `/api/tickets/{id}` 返回完整数据（包括 comments, relatedTickets 等）
3. 用户在详情页面需要看到完整信息

## 修复方案

### 文件: `iGreenApp/src/App.tsx`

**修改 `handleTicketClick` 函数**:

**当前代码**:
```typescript
const handleTicketClick = (ticket: Ticket) => {
  setSelectedTicket(ticket);
};
```

**修复后代码**:
```typescript
const handleTicketClick = async (ticket: Ticket) => {
  try {
    // 调用后端接口获取完整工单数据
    const fullTicket = await api.getTicket(ticket.id);
    setSelectedTicket(fullTicket);
  } catch (error) {
    console.error("Failed to fetch ticket details:", error);
    // 如果接口调用失败，回退使用列表数据
    setSelectedTicket(ticket);
  }
};
```

## 后端接口信息

| 属性 | 值 |
|------|-----|
| **URL** | `GET /api/tickets/{id}` |
| **认证** | Bearer Token |
| **返回** | 完整的 TicketResponse，包括 comments, relatedTicketIds 等 |

### 返回数据示例

```json
{
  "id": 202601110002,
  "title": "显示屏花屏",
  "description": "...",
  "status": "OPEN",
  "priority": "MEDIUM",
  "type": "MAINTENANCE",
  "site": "site-002",
  "assignedTo": "eng-002",
  "createdBy": "admin-001",
  "createdAt": "2026-01-11T02:40:10",
  "updatedAt": "2026-01-28T02:05",
  "dueDate": "2026-01-12T02:40:10",
  "comments": [],
  "relatedTicketIds": [],
  // ... 更多字段
}
```

## 任务列表

### 任务 1: 修改 handleTicketClick 函数

**文件**: `iGreenApp/src/App.tsx`  
**行号**: ~144-149

**验收标准**:
- [ ] `handleTicketClick` 改为 `async` 函数
- [ ] 调用 `api.getTicket(ticket.id)` 获取完整数据
- [ ] 成功时设置完整数据到 `selectedTicket`
- [ ] 失败时回退使用列表数据
- [ ] 添加错误日志

### 任务 2: 验证数据完整性

**验证步骤**:
1. 登录工程师账号
2. 进入 "My Workspace" 视图
3. 点击一个工单打开详情
4. 确认详情页面显示完整信息（标题、描述、状态、评论等）

## 相关文件

- `iGreenApp/src/App.tsx` - 主应用组件
- `iGreenApp/src/lib/api.ts` - API 客户端（`getTicket` 已存在）

## 备注

- `api.getTicket(id: number)` 方法已存在
- 后端 `GET /api/tickets/{id}` 接口已实现
- 只需要修改前端调用逻辑
