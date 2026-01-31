# 修改 TicketDeclineRequest 字段名

## 目标
将后端 `TicketDeclineRequest` 的字段从 `reason` 改为 `comment`，以匹配前端 API 调用。

## 修改内容

### 1. DTO 类
**文件**: `igreen-backend/src/main/java/com/igreen/domain/dto/TicketDeclineRequest.java`

```java
// 修改前
public record TicketDeclineRequest(
    @NotBlank String reason
) {}

// 修改后
public record TicketDeclineRequest(
    @NotBlank String comment
) {}
```

### 2. Service 层
**文件**: `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java`
**方法**: `declineTicket()` (约第265行)

找到使用 `request.reason()` 的地方，改为 `request.comment()`。

```java
// 修改前
.ticketCommentMapper.insert(TicketComment.builder()
    .comment("工单被拒绝: " + request.reason())
    ...

// 修改后
.ticketCommentMapper.insert(TicketComment.builder()
    .comment("工单被拒绝: " + request.comment())
    ...
```

### 3. 验证
执行编译：
```bash
cd igreen-backend && mvn compile
```

### 4. 测试
测试拒绝工单功能：
1. 进入 REVIEW 状态的工单
2. 管理员点击拒绝
3. 输入拒绝原因
4. 确认调用成功，工单状态变为 ARRIVED

## 注意事项
- 字段修改后，Jackson 会自动映射 JSON 的 `comment` 字段到 DTO
- 不需要修改前端代码
- 需要同步修改相关测试文件
