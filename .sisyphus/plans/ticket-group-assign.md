# Ticket 用户组分配 + 抢单功能工作计划

## TL;DR

> **快速摘要**: 修改 ticket 创建接口支持分配给用户组，并新增 acceptedUserId 记录实际抢单用户
> 
> **交付物**:
> - 后端 API 支持分配给用户组
> - 抢单时记录实际执行用户
> - 所有操作权限验证基于 acceptedUserId
> 
> **估计工作量**: 小
> **并行执行**: 否 - 顺序执行即可

---

## 需求

### 业务逻辑
1. 后台创建工单时，assignedTo 支持选择用户组（存储组ID）
2. 用户组成员可以自己抢单
3. **抢单后：assignedTo 保持组ID不变，设置 acceptedUserId = 抢单用户ID**
4. 所有后续操作权限验证基于 acceptedUserId

### 技术改动（KISS 原则）
- **保持 assignedTo 字段不变**，复用存储用户组ID
- 修改创建验证逻辑：查询 Group 表验证
- 新增 acceptedUserId 字段记录抢单用户

---

## 实施任务

### 1. 数据库修改
- [ ] tickets 表新增 `accepted_user_id` 字段 (VARCHAR)

### 2. Entity 修改
- [ ] `Ticket.java` 新增 `acceptedUserId` 字段

### 3. Response 修改
- [ ] `TicketResponse.java` 新增 `acceptedUserId`, `acceptedUserName` 字段

### 4. Service - 创建工单验证
- [ ] `TicketService.createTicket()` - 验证 assignedTo 改为查询 Group

### 5. Service - 抢单逻辑
- [ ] `TicketService.acceptTicket()` - 保持 assignedTo 不变，设置 acceptedUserId

### 6. Service - 权限验证修改（所有操作）
- [ ] `acceptTicket()` - ASSIGNED 状态验证改为 acceptedUserId
- [ ] `declineTicket()` - 验证改为 acceptedUserId
- [ ] `departTicket()` - 验证改为 acceptedUserId
- [ ] `arriveTicket()` - 验证改为 acceptedUserId
- [ ] `submitTicket()` - 验证改为 acceptedUserId
- [ ] `completeTicket()` - 验证改为 acceptedUserId

### 7. Service - 返回响应
- [ ] `toResponse()` - 查询并返回 acceptedUser 信息

### 8. 测试验证
- [ ] 创建工单分配给用户组 - 验证成功
- [ ] 抢单 - 验证 acceptedUserId 正确记录，assignedTo 不变
- [ ] 执行后续操作 - 验证权限基于 acceptedUserId

---

## 详细任务

### Task 1: 数据库修改

**SQL 脚本**:
```sql
ALTER TABLE tickets ADD COLUMN accepted_user_id VARCHAR(50);
```

### Task 2: Entity 修改

**文件**: `igreen-backend/src/main/java/com/igreen/domain/entity/Ticket.java`

**新增字段**:
```java
private String acceptedUserId;
```

### Task 3: Response 修改

**文件**: `igreen-backend/src/main/java/com/igreen/domain/dto/TicketResponse.java`

**新增字段**:
- `acceptedUserId`
- `acceptedUserName`

### Task 4: Service - 创建工单验证

**文件**: `TicketService.java` 第47-50行

**原代码**:
```java
User assignee = userMapper.selectById(request.assignedTo());
if (assignee == null) {
    throw new BusinessException(ErrorCode.USER_NOT_FOUND);
}
```

**改为**:
```java
Group group = groupMapper.selectById(request.assignedTo());
if (group == null) {
    throw new BusinessException(ErrorCode.GROUP_NOT_FOUND);
}
```

**添加依赖**:
```java
private final GroupMapper groupMapper;
```

### Task 5: Service - 抢单逻辑

**文件**: `TicketService.java` 第232-244行

**原代码**:
```java
if ("OPEN".equals(ticket.getStatus())) {
    ticket.setAssignedTo(userId);  // ❌ 会覆盖组ID
} else if ("ASSIGNED".equals(ticket.getStatus())) {
    if (ticket.getAssignedTo() == null || !userId.equals(ticket.getAssignedTo())) {
        throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
    }
}

ticket.setStatus("ACCEPTED");
ticket.setAccepted(true);
ticket.setAcceptedAt(LocalDateTime.now());
```

**改为**:
```java
// OPEN 状态：任何工程师可抢单（组内成员）
// ASSIGNED 状态：需验证是否已在组内或可抢单
if ("OPEN".equals(ticket.getStatus()) || "ASSIGNED".equals(ticket.getStatus())) {
    // 抢单时：assignedTo(组ID) 不变，设置 acceptedUserId
    ticket.setAcceptedUserId(userId);  // 新增
} else {
    throw new BusinessException(ErrorCode.TICKET_ALREADY_ACCEPTED);
}

ticket.setStatus("ACCEPTED");
ticket.setAccepted(true);
ticket.setAcceptedAt(LocalDateTime.now());
```

### Task 6: Service - 权限验证（所有操作）

**通用规则**:
```java
// 权限验证：优先验证 acceptedUserId
String effectiveUserId = ticket.getAcceptedUserId() != null 
    ? ticket.getAcceptedUserId() 
    : ticket.getAssignedTo();

if (effectiveUserId == null || !userId.equals(effectiveUserId)) {
    throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
}
```

**需要修改的方法**:
| 方法 | 行号 | 验证逻辑 |
|------|------|----------|
| declineTicket | 270-271 | 改为 acceptedUserId |
| departTicket | 328-329 | 改为 acceptedUserId |
| arriveTicket | 357-358 | 改为 acceptedUserId |
| submitTicket | 423-424 | 改为 acceptedUserId |
| completeTicket | 456-457 | 改为 acceptedUserId |

### Task 7: Service - 返回响应

**文件**: `TicketService.java` 的 `toResponse()` 方法

**新增**:
1. 查询 acceptedUser: `User acceptedUser = userMapper.selectById(ticket.getAcceptedUserId())`
2. 构造函数参数添加 `acceptedUserId`, `acceptedUserName`

---

## 验证方式

### 验证场景 1: 创建工单分配给用户组
```bash
curl -X POST http://localhost:8080/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试工单",
    "type": "MAINTENANCE",
    "templateId": "xxx",
    "assignedTo": "用户组ID",
    "dueDate": "2026-03-01T10:00:00"
  }'
# 期望: 创建成功，assignedTo = 组ID，acceptedUserId = null
```

### 验证场景 2: 抢单
```bash
curl -X POST http://localhost:8080/api/tickets/1/accept \
  -H "Content-Type: application/json" \
  -d '{"comment": "我来处理"}'
# 期望: acceptedUserId = 抢单用户ID，assignedTo 保持组ID不变
```

### 验证场景 3: 执行后续操作
```bash
# 抢单用户执行出发、到达、完成等操作
curl -X POST http://localhost:8080/api/tickets/1/depart \
# 期望: 成功（验证 acceptedUserId）
```

---

## 文件清单

| 文件 | 改动类型 |
|------|----------|
| tickets 表 | 新增 accepted_user_id 字段 |
| Ticket.java | 新增 acceptedUserId 字段 |
| TicketResponse.java | 新增 acceptedUserId, acceptedUserName |
| TicketService.java | 修改验证逻辑（6处）+ 抢单逻辑 + 返回响应 |
| GroupMapper.java | 需注入 |
