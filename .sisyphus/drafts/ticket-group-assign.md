# Draft: Ticket 用户组分配 + 抢单功能

## 需求确认
- **目标**: 创建工单时，assign to 支持选择用户组
- **当前状态**: assignedTo 存储用户ID，需要改为支持用户组ID
- **优先级**: 高

## 业务逻辑
1. 后台（管理员系统）创建工单时，可分配给用户组（存储到 assignedTo）
2. 用户组成员可以自己抢单
3. 抢单后记录实际执行用户 (acceptedUserId)

## 技术方案
1. **DTO 修改**: 
   - `TicketCreateRequest.assignedTo` - 保持不变，存储用户组ID
2. **Entity 修改**: 
   - `Ticket.assignedTo` - 保持不变，存储用户组ID
   - `Ticket` 新增 `acceptedUserId` 字段（抢单用户）
3. **Response 修改**: 
   - `TicketResponse` - 返回 assignedTo 作为组ID
   - `TicketResponse` 新增 acceptedUserId, acceptedUserName
4. **Service 修改**: 
   - 验证逻辑：assignedTo 验证时改为查询 Group 而非 User
   - 抢单逻辑 (acceptTicket)：更新 acceptedUserId
   - 支持查询时返回组名称
5. **数据库**: 
   - 如需要可保留 tickets.assigned_to (用户组ID)
   - tickets 表新增 `accepted_user_id` 字段

## 现有代码问题
- `TicketService.createTicket()` 第47-50行：
  ```java
  User assignee = userMapper.selectById(request.assignedTo());
  if (assignee == null) {
      throw new BusinessException(ErrorCode.USER_NOT_FOUND);
  }
  ```
  当前验证 assignedTo 是用户ID，需要改为验证 Group

## 待确认问题
- [x] 需求确认 ✓ (assignedTo 改为支持用户组ID + 新增 acceptedUserId)
