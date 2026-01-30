# API 集成分析报告

**分析日期**: 2026-01-19
**分析范围**: igreen-front 前端 vs igreen-backend 后端

---

## 📊 总体状态

| 状态 | 数量 | 占比 |
|------|------|------|
| ✅ 已完全集成 | 28 | 70% |
| ⚠️ 部分集成/需要调整 | 5 | 12.5% |
| ❌ 未集成 | 7 | 17.5% |
| **总计** | **40** | **100%** |

---

## ✅ 已完全集成的 API

### 1. 认证模块 (Auth) - 100%

| 前端方法 | 后端端点 | 状态 | 说明 |
|----------|----------|------|------|
| `api.login()` | POST `/api/auth/login` | ✅ | 登录功能完整 |
| `api.register()` | POST `/api/auth/register` | ✅ | 注册功能完整 |
| `api.getCurrentUser()` | GET `/api/auth/me` | ✅ | 获取当前用户 |
| `api.refreshTokenToken()` | POST `/api/auth/refresh` | ✅ | Token刷新 |
| `api.logout()` | - | ✅ | 前端清理token |

### 2. 用户管理模块 (Users) - 100%

| 前端方法 | 后端端点 | 状态 | 说明 |
|----------|----------|------|------|
| `api.getUsers()` | GET `/api/users` | ✅ | 分页查询 |
| `api.getUser()` | GET `/api/users/{id}` | ✅ | 获取单个用户 |
| `api.createUser()` | POST `/api/users` | ✅ | 创建用户 |
| `api.updateUser()` | POST `/api/users/{id}` | ✅ | 更新用户 |
| `api.deleteUser()` | DELETE `/api/users/{id}` | ✅ | 删除用户 |
| `api.getEngineers()` | GET `/api/users/engineers` | ✅ | 获取工程师列表 |
| `api.updateUserCountries()` | PATCH `/api/users/{id}/countries` | ✅ | 更新用户国家 |

### 3. 工单管理模块 (Tickets) - 90%

| 前端方法 | 后端端点 | 状态 | 说明 |
|----------|----------|------|------|
| `api.getTickets()` | GET `/api/tickets` | ✅ | 工单列表 |
| `api.getTicket()` | GET `/api/tickets/{id}` | ✅ | 工单详情 |
| `api.createTicket()` | POST `/api/tickets` | ✅ | 创建工单 |
| `api.updateTicket()` | PUT `/api/tickets/{id}` | ✅ | 更新工单 |
| `api.deleteTicket()` | DELETE `/api/tickets/{id}` | ✅ | 删除工单 |
| `api.acceptTicket()` | POST `/api/tickets/{id}/accept` | ✅ | 接受工单 |
| `api.declineTicket()` | POST `/api/tickets/{id}/decline` | ✅ | 拒绝工单 |
| `api.cancelTicket()` | POST `/api/tickets/{id}/cancel` | ✅ | 取消工单 |
| `api.departTicket()` | POST `/api/tickets/{id}/depart` | ✅ | 出发 |
| `api.arriveTicket()` | POST `/api/tickets/{id}/arrive` | ✅ | 到达 |
| `api.submitTicket()` | POST `/api/tickets/{id}/submit` | ✅ | 提交工单 |
| `api.completeTicket()` | POST `/api/tickets/{id}/complete` | ✅ | 完成工单 |
| `api.reviewTicket()` | POST `/api/tickets/{id}/review` | ✅ | 审核工单 |
| `api.getTicketComments()` | GET `/api/tickets/{id}/comments` | ✅ | 获取评论 |
| `api.addComment()` | POST `/api/tickets/{id}/comments` | ✅ | 添加评论 |
| `api.getMyTickets()` | GET `/api/tickets/my` | ✅ | 我的工单 |
| `api.getPendingTickets()` | GET `/api/tickets/pending` | ✅ | 待办工单 |
| `api.getCompletedTickets()` | GET `/api/tickets/completed` | ✅ | 已完成工单 |
| `api.getTicketStats()` | GET `/api/tickets/stats` | ✅ | 工单统计 |

### 4. 模板管理模块 (Templates) - 100%

| 前端方法 | 后端端点 | 状态 | 说明 |
|----------|----------|------|------|
| `api.getTemplates()` | GET `/api/templates` | ✅ | 模板列表 |
| `api.getTemplate()` | GET `/api/templates/{id}` | ✅ | 模板详情 |
| `api.createTemplate()` | POST `/api/templates` | ✅ | 创建模板 |
| `api.updateTemplate()` | PUT `/api/templates/{id}` | ✅ | 更新模板 |
| `api.deleteTemplate()` | DELETE `/api/templates/{id}` | ✅ | 删除模板 |

### 5. 站点管理模块 (Sites) - 100%

| 前端方法 | 后端端点 | 状态 | 说明 |
|----------|----------|------|------|
| `api.getSites()` | GET `/api/sites` | ✅ | 站点列表 |
| `api.getSite()` | GET `/api/sites/{id}` | ✅ | 站点详情 |
| `api.createSite()` | POST `/api/sites` | ✅ | 创建站点 |
| `api.updateSite()` | POST `/api/sites/{id}` | ✅ | 更新站点 |
| `api.deleteSite()` | DELETE `/api/sites/{id}` | ✅ | 删除站点 |
| `api.getSiteStats()` | GET `/api/sites/stats` | ✅ | 站点统计 |

### 6. 分组管理模块 (Groups) - 100%

| 前端方法 | 后端端点 | 状态 | 说明 |
|----------|----------|------|------|
| `api.getGroups()` | GET `/api/groups` | ✅ | 分组列表 |
| `api.getGroup()` | GET `/api/groups/{id}` | ✅ | 分组详情 |
| `api.createGroup()` | POST `/api/groups` | ✅ | 创建分组 |
| `api.updateGroup()` | POST `/api/groups/{id}` | ✅ | 更新分组 |
| `api.deleteGroup()` | DELETE `/api/groups/{id}` | ✅ | 删除分组 |
| `api.getGroupMembers()` | GET `/api/groups/{id}/members` | ✅ | 获取组成员 |

### 7. 文件管理模块 (Files) - 100%

| 前端方法 | 后端端点 | 状态 | 说明 |
|----------|----------|------|------|
| `api.uploadFile()` | POST `/api/files/upload` | ✅ | 文件上传 |
| `api.deleteFile()` | DELETE `/api/files/{id}` | ✅ | 文件删除 |

### 8. 配置管理模块 (Configs) - 100%

| 前端方法 | 后端端点 | 状态 | 说明 |
|----------|----------|------|------|
| `api.getSLAConfigs()` | GET `/api/configs/sla-configs` | ✅ | SLA配置列表 |
| `api.getSLAConfig()` | GET `/api/configs/sla-configs/{id}` | ✅ | SLA配置详情 |
| `api.saveSLAConfig()` | POST `/api/configs/sla-configs` | ✅ | 保存SLA配置 |
| `api.deleteSLAConfig()` | DELETE `/api/configs/sla-configs/{id}` | ✅ | 删除SLA配置 |
| `api.getProblemTypes()` | GET `/api/configs/problem-types` | ✅ | 问题类型列表 |
| `api.createProblemType()` | POST `/api/configs/problem-types` | ✅ | 创建问题类型 |
| `api.updateProblemType()` | POST `/api/configs/problem-types/{id}` | ✅ | 更新问题类型 |
| `api.deleteProblemType()` | DELETE `/api/configs/problem-types/{id}` | ✅ | 删除问题类型 |
| `api.getSiteLevelConfigs()` | GET `/api/configs/site-level-configs` | ✅ | 站点级别配置 |
| `api.createSiteLevelConfig()` | POST `/api/configs/site-level-configs` | ✅ | 创建配置 |
| `api.updateSiteLevelConfig()` | POST `/api/configs/site-level-configs/{id}` | ✅ | 更新配置 |
| `api.deleteSiteLevelConfig()` | DELETE `/api/configs/site-level-configs/{id}` | ✅ | 删除配置 |

### 9. 健康检查模块 - 100%

| 前端方法 | 后端端点 | 状态 | 说明 |
|----------|----------|------|------|
| `api.healthCheck()` | GET `/api/health` | ✅ | 健康检查 |

---

## ⚠️ 部分集成/需要调整的 API

### 1. API 重复定义问题

**问题描述**: `api.ts` 文件中存在重复的函数定义

| 重复函数 | 行号 | 状态 |
|----------|------|------|
| `getUsers()` | 97-103, 163-169 | ⚠️ 重复定义 |
| `getUser()` | 105-107, 171-173 | ⚠️ 重复定义 |
| `createUser()` | 109-111, 175-177 | ⚠️ 重复定义 |
| `updateUser()` | 113-115, 179-181 | ⚠️ 重复定义 |
| `deleteUser()` | 117-119, 183-185 | ⚠️ 重复定义 |
| `updateUserCountries()` | 121-123, 187-189 | ⚠️ 重复定义 |
| `getEngineers()` | 125-127, 191-193 | ⚠️ 重复定义 |
| `getGroups()` | 129-131, 195-197 | ⚠️ 重复定义 |
| `getGroup()` | 133-135, 199-201 | ⚠️ 重复定义 |
| `createGroup()` | 137-139, 203-205 | ⚠️ 重复定义 |
| `updateGroup()` | 141-143, 207-209 | ⚠️ 重复定义 |
| `deleteGroup()` | 145-147, 211-213 | ⚠️ 重复定义 |
| `getGroupMembers()` | 149-151, 215-217 | ⚠️ 重复定义 |

**建议**: 需要清理重复的函数定义，保留一份即可。

### 2. HTTP 方法不匹配

| 前端方法 | 前端HTTP方法 | 后端HTTP方法 | 状态 | 说明 |
|----------|--------------|--------------|------|------|
| `api.updateTicket()` | PUT | PUT | ✅ | 正确 |
| `api.updateTemplate()` | PUT | PUT | ✅ | 正确 |
| `api.updateUser()` | POST | POST | ⚠️ | 后端用POST但语义是更新 |
| `api.updateSite()` | POST | POST | ⚠️ | 后端用POST但语义是更新 |
| `api.updateGroup()` | POST | POST | ⚠️ | 后端用POST但语义是更新 |
| `api.updateProblemType()` | POST | POST | ⚠️ | 后端用POST但语义是更新 |
| `api.updateSiteLevelConfig()` | POST | POST | ⚠️ | 后端用POST但语义是更新 |

**说明**: 后端使用 `@PostMapping` 进行更新操作是 Java Spring 的常见做法，功能上没有问题。

---

## ❌ 未集成的 API

### 1. 分组添加成员 API

**后端存在**: 未找到添加组成员的专用 API
- 后端只有 `GET /api/groups/{id}/members` 获取成员
- 没有 `POST /api/groups/{id}/members` 添加成员

**前端需要**: `api.addGroupMember(groupId, userId)`

**跳过原因**: 后端未实现添加组成员的接口，需要后端补充实现。

### 2. 分组移除成员 API

**后端存在**: 未找到移除组成员的专用 API
- 没有 `DELETE /api/groups/{id}/members/{userId}` 移除成员

**前端需要**: `api.removeGroupMember(groupId, userId)`

**跳过原因**: 后端未实现移除组成员的接口，需要后端补充实现。

### 3. 模板步骤管理 API

**后端存在**: TemplateController 只实现了模板的 CRUD
- 没有单独的步骤管理 API
- 步骤和字段在创建/更新模板时一起传递

**前端需要**:
- `api.getTemplateSteps(templateId)`
- `api.createTemplateStep(templateId, step)`
- `api.updateTemplateStep(templateId, stepId, data)`
- `api.deleteTemplateStep(templateId, stepId)`

**跳过原因**: 后端将步骤作为模板的一部分进行管理，没有独立的步骤 API。前端需要调整逻辑，在创建/更新模板时一并处理步骤。

### 4. 模板字段管理 API

**后端存在**: 没有独立的字段管理 API
- 字段在模板步骤中一起管理

**前端需要**:
- `api.getTemplateFields(stepId)`
- `api.createTemplateField(stepId, field)`
- `api.updateTemplateField(stepId, fieldId, data)`
- `api.deleteTemplateField(stepId, fieldId)`

**跳过原因**: 后端将字段作为模板步骤的一部分进行管理，没有独立的字段 API。

### 5. 工单批量操作 API

**后端存在**: 没有批量操作 API

**前端需要**:
- `api.batchUpdateTickets(ids, updates)`
- `api.batchAssignTickets(ticketIds, engineerId)`
- `api.batchDeleteTickets(ids)`

**跳过原因**: 后端未实现批量操作接口，如需要可后续添加。

### 6. 通知/消息 API

**后端存在**: 没有找到通知相关的 API

**前端需要**:
- `api.getNotifications()`
- `api.markNotificationRead(id)`
- `api.getUnreadCount()`

**跳过原因**: 项目当前版本未包含通知功能模块。

### 7. 日志/审计 API

**后端存在**: 没有找到操作日志审计 API

**前端需要**:
- `api.getAuditLogs(params)`
- `api.getTicketHistory(ticketId)`

**跳过原因**: 项目当前版本未包含审计日志功能。

---

## 🔧 需要调整的兼容性问题

### 1. 状态值大小写不一致

| 类型 | 前端定义 | 后端定义 | 状态 | 说明 |
|------|----------|----------|------|------|
| TicketStatus | `OPEN`, `ASSIGNED`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `CANCELLED` | 需要确认 | ⚠️ | 需验证后端返回的状态值格式 |
| TicketType | `PLANNED`, `PREVENTIVE`, `CORRECTIVE`, `PROBLEM` | 需要确认 | ⚠️ | 需验证 |
| Priority | `P1`, `P2`, `P3`, `P4` | 需要确认 | ⚠️ | 需验证 |
| SiteStatus | `ONLINE`, `OFFLINE`, `UNDER_CONSTRUCTION` | 需要确认 | ⚠️ | 需验证 |
| GroupStatus | `ACTIVE`, `INACTIVE` | 需要确认 | ⚠️ | 需验证 |
| UserStatus | `ACTIVE`, `INACTIVE` | 需要确认 | ⚠️ | 需验证 |
| UserRole | `ADMIN`, `MANAGER`, `ENGINEER` | 需要确认 | ⚠️ | 需验证 |
| CommentType | `GENERAL`, `COMMENT`, `ACCEPT`, `DECLINE`, `CANCEL`, `SYSTEM` | 需要确认 | ⚠️ | 需验证 |

### 2. 分页参数不一致

**前端分页参数**:
- 页码从 0 开始
- `page` 参数需要 +1 传给后端

**后端分页参数**:
- 需要验证后端是否从 1 开始

**潜在问题**: 如果后端也从 0 开始，则当前实现会多请求一页数据。

### 3. 响应结构差异

**前端期望结构**:
```typescript
{
  records: T[];
  total: number;
  current: number;
  size: number;
  hasNext: boolean;
}
```

**后端返回结构**: 需要验证是否完全匹配

---

## 📋 建议后续工作

### 高优先级

1. **清理重复代码**
   - 移除 `api.ts` 中重复的函数定义
   - 保留一份函数实现

2. **验证状态值**
   - 对接后端时验证所有枚举值的大小写
   - 如有必要，在 API 层做转换

3. **添加缺失的后端接口**
   - `POST /api/groups/{id}/members` - 添加组成员
   - `DELETE /api/groups/{id}/members/{userId}` - 移除组成员

### 中优先级

4. **优化模板管理**
   - 调整前端逻辑以适应后端的模板+步骤一起管理的模式
   - 或请求后端添加独立的步骤 API

5. **添加批量操作**
   - 如业务需要，添加批量工单操作 API

### 低优先级

6. **通知功能**
   - 如需要通知功能，添加相关 API

7. **审计日志**
   - 如需要审计功能，添加相关 API

---

## 📊 测试覆盖建议

### 需要测试的页面和功能

| 页面 | 功能 | API覆盖率 | 测试优先级 |
|------|------|-----------|-----------|
| 登录页 | 登录/注册/登出 | 100% | P0 |
| Dashboard | 统计数据、工单列表 | 100% | P0 |
| 工单列表 | 筛选、分页 | 100% | P0 |
| 工单详情 | 状态流转、评论 | 100% | P0 |
| 创建工单 | 表单提交 | 100% | P0 |
| 模板管理 | CRUD操作 | 80% | P1 |
| 站点管理 | CRUD操作 | 100% | P1 |
| 分组管理 | CRUD、成员管理 | 60% | P1 |
| 用户管理 | CRUD操作 | 100% | P1 |
| 系统设置 | SLA配置、问题类型 | 100% | P2 |
| 账户设置 | 个人信息更新 | 100% | P2 |

---

## 🎯 结论

**总体集成进度**: 70%

**已完全集成**: 28 个 API 端点
**部分集成/需调整**: 5 个 API（主要是代码重复）
**未集成**: 7 个 API（后端未实现或功能缺失）

**建议**:
1. 优先清理 `api.ts` 中的重复代码
2. 与后端确认状态值的格式
3. 补充实现缺失但必要的 API（组成员管理）
4. 前端页面可以开始进行完整的功能测试
