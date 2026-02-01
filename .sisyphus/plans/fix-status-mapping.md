# 修复前端状态映射错误

## 问题描述

前端 api.ts 中错误地映射了不存在的状态 `in_progress`。

## 当前错误代码

文件: `iGreenApp/src/lib/api.ts` (第17-26行)

```typescript
function transformTicket(backendTicket: any): Ticket {
  // 后端状态是英文大写，前端用小写
  // 注意：后端 ACCEPTED 对应前端 assigned（已接单待出发）
  // IN_PROGRESS 对应 departed（已出发前往现场）
  const statusMap: Record<string, string> = {
    'accepted': 'assigned',
    'in_progress': 'departed',  // ← 错误！后端没有这个状态
  };
```

## 后端实际状态

文件: `igreen-backend/src/main/java/com/igreen/domain/enums/TicketStatus.java`

```java
public enum TicketStatus {
    OPEN,
    ASSIGNED,
    ACCEPTED,
    DEPARTED,  // ← 实际使用的是这个
    ARRIVED,
    REVIEW,
    COMPLETED,
    ON_HOLD,
    CANCELLED;
}
```

## 修复方案

移除 `in_progress` 的映射，因为后端直接返回 `departed`：

```typescript
function transformTicket(backendTicket: any): Ticket {
  // 后端状态是英文大写，前端用小写
  // 后端状态: OPEN, ASSIGNED, ACCEPTED, DEPARTED, ARRIVED, REVIEW, COMPLETED, ON_HOLD, CANCELLED
  const statusMap: Record<string, string> = {
    'accepted': 'assigned',  // 后端 ACCEPTED 对应前端 assigned（已接单待出发）
  };
```

## 工单全生命周期状态流转

```
OPEN → ASSIGNED → ACCEPTED → DEPARTED → ARRIVED → REVIEW → COMPLETED
```

## 修改文件

- `iGreenApp/src/lib/api.ts` (第17-26行)

## 验证步骤

1. 修改代码
2. 编译前端: `cd iGreenApp && npm run build`
3. 测试出发功能，确认状态正确显示为"已出发"
