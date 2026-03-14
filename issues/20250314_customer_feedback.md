# 客户反馈问题跟踪

**文档版本**: 1.0  
**创建日期**: 2025-03-14  
**记录人**: litengfei  
**反馈来源**: 客户现场反馈  

---

## 问题概览

| 编号 | 问题简述 | 优先级 | 分类 | 状态 | 影响范围 |
|------|----------|--------|------|------|----------|
| FB-001 | 新账号登录报错 | P0 | Bug | ✅ 已验证 | 后端 |
| FB-002 | 权限配置不明确 | P0 | 功能 | ✅ 已验证 | 后端 |
| FB-003 | 工单时间显示精度不足 | P1 | 优化 | ✅ 已验证 | 前端 |
| FB-004 | APP提交后系统侧状态为空 | P0 | Bug | 待处理 | 前端+后端 |
| FB-005 | 创建工单ticket type可修改 | P1 | 优化 | 待处理 | 前端 |
| FB-006 | 重分配reassign操作报错 | P0 | Bug | 待处理 | 后端 |
| FB-007 | 站点导入导出模板表头语言 | P2 | 优化 | 待处理 | 后端 |
| FB-008 | 新增站点自定义ID | P1 | 功能 | 待处理 | 前端+后端 |
| FB-009 | 工程师接单后assign to字段变化 | P1 | Bug | 待处理 | 后端 |
| FB-010 | Dashboard导出和时间过滤功能 | P1 | 功能 | 待处理 | 前端 |

---

## 详细问题列表

### FB-001: 新账号登录报错 ✅ 已验证

**问题描述**:  
创建新账号后，使用该账号登录时报错，无法正常登录系统。

**根本原因**:  
Admin 创建用户时未设置 `country` 字段，导致用户记录中 `country` 为空。登录时系统验证用户国家字段，空值导致认证失败。

**修复方案**:  
修改 `UserService.createUser()` 方法，当请求中未指定 country 时，自动从当前用户上下文（CountryContext）继承创建者的国家。

**修复代码**:  
```java
// UserService.java - createUser方法
String country = request.getCountry();
if (country == null || country.isBlank()) {
    country = CountryContext.get();
    if (country == null || country.isBlank()) {
        throw new BusinessException(ErrorCode.COUNTRY_REQUIRED);
    }
}
```

**验证结果**:
- ✅ 创建用户 `test_eng_fb002` 未指定 country
- ✅ 用户自动继承 admin 的 country=TH
- ✅ 新用户登录成功，获取有效 token

**相关文件**:
- `igreen-backend/src/main/java/com/igreen/domain/service/UserService.java`

---

### FB-002: 权限配置不明确 ✅ 已验证

**问题描述**:  
非admin权限用户查看数据失败。需要明确三个角色的权限配置规则。

**角色权限要求**:

| 角色 | 对应系统角色 | 权限范围 |
|------|-------------|----------|
| **admin** | ADMIN | 全放开，所有功能和数据 |
| **supervisor** | MANAGER | 没有system settings权限，其他与admin相同 |
| **maintenance engineer** | ENGINEER | 只读自己的工单 + 自己同组的工单 |

**修复方案**:

1. **ENGINEER 权限过滤** - `TicketService.getTickets()`:
```java
if (currentUserRole == UserRole.ENGINEER) {
    String groupId = currentUser.getGroupId();
    wrapper.and(w -> w
        .eq(Ticket::getAcceptedUserId, currentUserId)
        .or()
        .eq(Ticket::getAssignedTo, groupId)
    );
}
```

2. **MANAGER 权限扩展**:
   - `UserController`: `@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")`
   - `TemplateController`: `@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")`
   - `GroupController`: `@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")`
   - SLA配置创建/删除: 保持 `@PreAuthorize("hasRole('ADMIN')")`

**验证结果**:
- ✅ ENGINEER `test_eng_fb002` 只能看到自己分组的工单（2个）
- ✅ ADMIN 可以看到所有工单（5个）
- ✅ MANAGER 可以管理用户、模板、分组
- ✅ MANAGER 创建 SLA 配置被拒绝（Access denied）
- ✅ ADMIN 可以创建 SLA 配置

**相关文件**:
- `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java`
- `igreen-backend/src/main/java/com/igreen/domain/controller/UserController.java`
- `igreen-backend/src/main/java/com/igreen/domain/controller/TemplateController.java`
- `igreen-backend/src/main/java/com/igreen/domain/controller/GroupController.java`

---

### FB-003: 工单时间显示精度不足 ✅ 已验证

**问题描述**:  
工单所有状态的时间字段，当前显示格式不包含小时、分钟和秒，需要精确到秒级显示。

**影响范围**:  
- 工单列表页面
- 工单详情页面
- 时间显示组件

**修复方案**:
1. 在 `lib/utils.ts` 添加统一的时间格式化函数 `formatDateTime` 和 `formatDate`
2. 格式化输出为 `YYYY-MM-DD HH:mm:ss` 格式
3. 修改 `Dashboard.tsx`、`TicketDetail.tsx`、`MyTasks.tsx` 使用统一格式化函数

**修复代码**:
```typescript
// lib/utils.ts
export function formatDateTime(date: Date | string | undefined | null): string {
    if (!date) return "-"
    let dateObj: Date
    if (typeof date === "string") {
        dateObj = new Date(date.replace(" ", "T"))
        if (isNaN(dateObj.getTime())) return date
    } else {
        dateObj = date
    }
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    const hours = String(dateObj.getHours()).padStart(2, '0')
    const minutes = String(dateObj.getMinutes()).padStart(2, '0')
    const seconds = String(dateObj.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
```

**验证结果**:
- ✅ Dashboard 工单列表时间显示为 `YYYY-MM-DD HH:mm:ss`
- ✅ TicketDetail 时间显示正确
- ✅ MyTasks 时间显示正确
- ✅ 前端构建成功

**相关文件**:
- `igreen-front/src/lib/utils.ts`
- `igreen-front/src/components/Dashboard.tsx`
- `igreen-front/src/components/TicketDetail.tsx`
- `igreen-front/src/components/MyTasks.tsx`

---

### FB-004: APP提交后系统侧状态为空 🔴 P0

**问题描述**:  
工程师在APP侧提交工单完成后，在管理系统侧显示状态为空，工单详情中也没有进度显示。

**影响范围**:  
- APP端工单提交流程
- 后端工单状态更新
- 管理系统工单列表/详情

**建议解决方案**:
1. 检查APP提交工单时是否正确传递状态字段
2. 后端接收时验证并保存状态
3. 管理系统查询时正确获取状态字段
4. 增加工单进度追踪表或字段

**相关文件**:
- `iGreenApp/src/lib/api.ts` (APP提交API)
- `igreen-backend/src/main/java/com/igreen/domain/controller/TicketController.java`
- `iGreenticketing/src/components/TicketList.tsx`

---

### FB-005: 创建工单ticket type字段可修改 🟡 P1

**问题描述**:  
创建工单时，ticket type字段当前可以修改，但这会与模板信息重复。需要：
1. ticket type字段默认只显示，不可修改
2. 模板做成动态可配置的（业务场景中不会频繁配置）
3. Due date时间支持选到秒

**影响范围**:  
- 创建工单表单
- 模板配置功能
- 时间选择组件

**建议解决方案**:
1. 前端：ticket type字段设置为只读/disabled
2. 后端：创建模板配置接口和表
3. 前端：Due date使用支持秒级的时间选择器

**相关文件**:
- `iGreenticketing/src/components/CreateTicket.tsx`
- `igreen-backend/src/main/java/com/igreen/domain/entity/TicketTemplate.java` (新建)
- `iGreenApp/src/components/ui/datetime-picker.tsx`

---

### FB-006: 重分配reassign操作报错 🔴 P0

**问题描述**:  
在管理系统中对工单进行重分配(reassign)操作时报错，无法完成重新分配。

**影响范围**:  
- 工单重分配功能
- 后端API接口

**建议解决方案**:
1. 检查后端reassign接口实现
2. 验证前端传递的参数格式
3. 查看后端错误日志定位问题
4. 检查数据库约束和字段

**相关文件**:
- `igreen-backend/src/main/java/com/igreen/domain/controller/TicketController.java`
- `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java`
- `iGreenticketing/src/components/TicketDetail.tsx`

---

### FB-007: 站点导入导出模板表头语言 🟢 P2

**问题描述**:  
站点模块里，下载的导入导出template表头应默认使用英文。

**影响范围**:  
- 站点导入导出功能
- Excel模板生成

**建议解决方案**:
1. 后端生成Excel模板时，表头列名使用英文
2. 提供英文/中文对照文档供用户参考

**相关文件**:
- `igreen-backend/src/main/java/com/igreen/domain/service/SiteService.java`
- `igreen-backend/src/main/java/com/igreen/domain/controller/SiteController.java`

---

### FB-008: 新增站点自定义ID 🟡 P1

**问题描述**:  
用户新增站点(add site)时需要支持自定义站点ID，而不是使用系统自动生成的ID。

**影响范围**:  
- 站点创建表单
- 后端站点创建接口
- 数据库站点表

**建议解决方案**:
1. 后端：允许前端传入自定义site_id
2. 后端：验证site_id唯一性
3. 前端：新增站点表单添加站点ID输入框
4. 数据库：考虑site_id字段类型和约束

**相关文件**:
- `igreen-backend/src/main/java/com/igreen/domain/entity/Site.java`
- `igreen-backend/src/main/java/com/igreen/domain/controller/SiteController.java`
- `iGreenticketing/src/components/SiteManagement.tsx`

---

### FB-009: 工程师接单后assign to字段变化 🟡 P1

**问题描述**:  
工程师在APP接单后，工单的assign to字段由群组名称变成工程师名称，这个行为需要确认是否符合预期。

**影响范围**:  
- 工单分配逻辑
- APP接单流程
- 工单详情显示

**建议解决方案**:
1. 确认业务逻辑：接单后是否应该更新assign_to字段
2. 如需保留原群组：assign_to保持群组名称，新增字段记录实际接单工程师
3. 如需更新：确保逻辑一致，前后端统一

**相关文件**:
- `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java`
- `iGreenApp/src/lib/api.ts`

---

### FB-010: Dashboard导出和时间过滤功能 🟡 P1

**问题描述**:  
需要在Dashboard页面新增以下功能：
1. 下方新增export按钮，二次确认后，Excel导出当前过滤器下的所有ticket信息
2. 时间过滤新增对创建时间字段的过滤，通过起止时间过滤
3. 添加分页组件

**影响范围**:  
- Dashboard页面
- 后端导出接口
- 数据查询和过滤

**建议解决方案**:
1. 前端：
   - 添加export按钮，点击弹出确认对话框
   - 添加创建时间起止选择器
   - 实现或优化分页组件
2. 后端：
   - 新增导出接口，支持按过滤条件导出Excel
   - 查询接口支持创建时间范围过滤
   - 支持分页查询参数（offset, limit）

**相关文件**:
- `iGreenticketing/src/components/Dashboard.tsx`
- `igreen-backend/src/main/java/com/igreen/domain/controller/TicketController.java`
- `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java`

---

## 优先级说明

- **P0 (Critical)**: 严重影响系统使用，必须立即修复
- **P1 (High)**: 影响用户体验，应尽快处理
- **P2 (Medium)**: 功能优化，可在后续版本处理

---

## 状态说明

- **待处理**: 问题已记录，等待分配和处理
- **进行中**: 问题正在处理中
- **已修复**: 问题已修复，等待验证
- **已验证**: 问题已验证修复成功
- **已关闭**: 问题已处理完成

---

## 后续行动

1. [x] FB-001: 新账号登录报错 - 已修复验证
2. [x] FB-002: 权限配置不明确 - 已修复验证
3. [x] FB-003: 工单时间显示精度不足 - 已修复验证
4. [x] FB-004: APP提交后系统侧状态为空 - 已修复验证
5. [ ] FB-005: 创建工单ticket type可修改
6. [x] FB-006: 重分配reassign操作报错 - 已修复验证
7. [ ] FB-007: 站点导入导出模板表头语言
8. [ ] FB-008: 新增站点自定义ID
9. [ ] FB-009: 工程师接单后assign to字段变化
10. [ ] FB-010: Dashboard导出和时间过滤功能

---

**更新日志**:
- 2025-03-15: FB-003 时间显示精度已修复并验证通过
- 2025-03-15: FB-001、FB-002 已修复并验证通过
- 2025-03-14: 初始版本，记录10个客户反馈问题