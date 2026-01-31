# 工单状态流转 Bug 修复

## TL;DR

> **问题**：工程师点击"出发"后，工单状态被设置为 `IN_PROGRESS`，但正确应该是 `DEPARTED`。
>
> **根本原因**：`TicketService.java` 第 341 行代码错误。
>
> **解决方案**：将 `ticket.setStatus("IN_PROGRESS")` 改为 `ticket.setStatus("DEPARTED")`。
>
> **修复范围**：
> - 修改后端 TicketService.java
> - 修复数据库现有错误数据
> - 重启后端服务
>
> **预计工作量**：5分钟

---

## TODOs

- [ ] 1. 修复 TicketService.java 中的状态设置错误

  **文件**: `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java:341`
  
  **修改**:
  ```java
  // 修改前
  ticket.setStatus("IN_PROGRESS");
  
  // 修改后
  ticket.setStatus("DEPARTED");
  ```

- [ ] 2. 修复数据库中已有的错误状态数据

  **SQL**:
  ```sql
  UPDATE igreen_db.tickets 
  SET status = 'DEPARTED' 
  WHERE status = 'IN_PROGRESS' AND departure_at IS NOT NULL;
  ```

- [ ] 3. 重启后端服务使修复生效

---

## Verification

1. 工程师接单 → 状态变为 `assigned`
2. 工程师点击"出发" → 状态变为 `departed`
3. 前端正确显示"到达"按钮

---

## Commit

Message: `fix(backend): 修复出发操作设置错误状态的问题`
- 将 IN_PROGRESS 改为 DEPARTED
- 修复工单状态流转流程