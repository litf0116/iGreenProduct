# 修复 igreen-backend 编译问题

## 问题
TicketService.java:493 编译错误：
```
[ERROR] /Users/mac/workspace/iGreenProduct/igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java:[493,60] 
不兼容的类型: java.lang.String无法转换为java.lang.Long
```

## 根本原因
`reviewTicket` 方法参数类型错误：
- 当前：`public TicketResponse reviewTicket(String id, String cause, String userId)`
- 应该：`public TicketResponse reviewTicket(Long id, String cause, String userId)`

因为 `TicketMapper.selectByIdWithDetails(@Param("id") Long id)` 期望 `Long` 类型，但传入的是 `String`。

## 修复步骤

### 步骤1：修复 TicketService.java
**文件**: `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java`
**行号**: 492

**修改前**:
```java
@Transactional
public TicketResponse reviewTicket(String id, String cause, String userId) {
    Ticket ticket = ticketMapper.selectByIdWithDetails(id)
```

**修改后**:
```java
@Transactional
public TicketResponse reviewTicket(Long id, String cause, String userId) {
    Ticket ticket = ticketMapper.selectByIdWithDetails(id)
```

### 步骤2：验证编译
```bash
cd /Users/mac/workspace/iGreenProduct/igreen-backend && mvn compile
```

## 其他可能需要检查的地方

检查 TicketController.java 中调用 reviewTicket 的地方是否需要调整：
- 行160: `ticketService.reviewTicket(id, cause, userId)`
- 确保传入的 `id` 是 Long 类型
