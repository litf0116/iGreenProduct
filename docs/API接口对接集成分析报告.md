# iGreenProduct API接口对接集成分析报告

**文档生成日期**: 2025年12月26日
**分析范围**: 后端API、iGreenApp前端、iGreenticketing前端

---

## 一、后端API端点总览

### 1.1 API统计摘要

| 模块 | 端点数量 | 已实现 | 说明 |
|-----|---------|-------|------|
| **认证 (auth.py)** | 3 | 3 ✅ | 登录、注册、登出 |
| **用户管理 (users.py)** | 5 | 5 ✅ | 用户CRUD + 过滤 |
| **工单管理 (tickets.py)** | 8 | 8 ✅ | 工单CRUD + 接受/拒绝/取消 |
| **模板管理 (templates.py)** | 5 | 5 ✅ | 模板CRUD + 步骤字段 |
| **分组管理 (groups.py)** | 5 | 5 ✅ | 分组CRUD |
| **站点管理 (sites.py)** | 5 | 5 ✅ | 站点CRUD |
| **文件管理 (files.py)** | 3 | 3 ✅ | 上传、删除、人脸识别 |
| **配置管理 (configs.py)** | 10 | 10 ✅ | SLA、问题类型、站点级别配置 |
| **总计** | **44** | **44** ✅ | **100%完成** |

### 1.2 后端API详细列表

#### 认证 API (3个端点)

| 方法 | 端点 | 状态 | 功能 |
|-----|------|------|------|
| POST | `/api/auth/login` | ✅ | 用户登录 |
| POST | `/api/auth/register` | ✅ | 用户注册 |
| POST | `/api/auth/logout` | ✅ | 用户登出 |

#### 用户管理 API (5个端点)

| 方法 | 端点 | 状态 | 功能 |
|-----|------|------|------|
| GET | `/api/users` | ✅ | 获取用户列表（支持过滤） |
| GET | `/api/users/{user_id}` | ✅ | 获取指定用户 |
| POST | `/api/users` | ✅ | 创建用户 |
| PUT | `/api/users/{user_id}` | ✅ | 更新用户 |
| DELETE | `/api/users/{user_id}` | ✅ | 删除用户 |

#### 工单管理 API (8个端点)

| 方法 | 端点 | 状态 | 功能 |
|-----|------|------|------|
| GET | `/api/tickets` | ✅ | 获取工单列表（支持过滤） |
| GET | `/api/tickets/{ticket_id}` | ✅ | 获取指定工单 |
| POST | `/api/tickets` | ✅ | 创建工单 |
| PUT | `/api/tickets/{ticket_id}` | ✅ | 更新工单 |
| DELETE | `/api/tickets/{ticket_id}` | ✅ | 删除工单 |
| POST | `/api/tickets/{ticket_id}/accept` | ✅ | 接受工单 |
| POST | `/api/tickets/{ticket_id}/decline` | ✅ | 拒绝工单 |
| POST | `/api/tickets/{ticket_id}/cancel` | ✅ | 取消工单 |

#### 模板管理 API (5个端点)

| 方法 | 端点 | 状态 | 功能 |
|-----|------|------|------|
| GET | `/api/templates` | ✅ | 获取模板列表 |
| GET | `/api/templates/{template_id}` | ✅ | 获取指定模板 |
| POST | `/api/templates` | ✅ | 创建模板 |
| PUT | `/api/templates/{template_id}` | ✅ | 更新模板 |
| DELETE | `/api/templates/{template_id}` | ✅ | 删除模板 |

#### 分组管理 API (5个端点)

| 方法 | 端点 | 状态 | 功能 |
|-----|------|------|------|
| GET | `/api/groups` | ✅ | 获取分组列表 |
| GET | `/api/groups/{group_id}` | ✅ | 获取指定分组 |
| POST | `/api/groups` | ✅ | 创建分组 |
| PUT | `/api/groups/{group_id}` | ✅ | 更新分组 |
| DELETE | `/api/groups/{group_id}` | ✅ | 删除分组 |

#### 站点管理 API (5个端点)

| 方法 | 端点 | 状态 | 功能 |
|-----|------|------|------|
| GET | `/api/sites` | ✅ | 获取站点列表 |
| GET | `/api/sites/{site_id}` | ✅ | 获取指定站点 |
| POST | `/api/sites` | ✅ | 创建站点 |
| PUT | `/api/sites/{site_id}` | ✅ | 更新站点 |
| DELETE | `/api/sites/{site_id}` | ✅ | 删除站点 |

#### 文件管理 API (3个端点)

| 方法 | 端点 | 状态 | 功能 |
|-----|------|------|------|
| POST | `/api/files/upload` | ✅ | 上传文件 |
| DELETE | `/api/files/{file_id}` | ✅ | 删除文件 |
| POST | `/api/files/face-recognition/verify` | ✅ | 人脸识别验证（模拟） |

#### 配置管理 API (10个端点)

| 方法 | 端点 | 状态 | 功能 |
|-----|------|------|------|
| GET | `/api/configs/sla-configs` | ✅ | 获取所有SLA配置 |
| GET | `/api/configs/sla-configs/{priority}` | ✅ | 获取指定SLA配置 |
| POST | `/api/configs/sla-configs` | ✅ | 创建/更新SLA配置 |
| GET | `/api/configs/problem-types` | ✅ | 获取所有问题类型 |
| POST | `/api/configs/problem-types` | ✅ | 创建问题类型 |
| PUT | `/api/configs/problem-types/{type_id}` | ✅ | 更新问题类型 |
| DELETE | `/api/configs/problem-types/{type_id}` | ✅ | 删除问题类型 |
| GET | `/api/configs/site-level-configs` | ✅ | 获取所有站点级别配置 |
| POST | `/api/configs/site-level-configs` | ✅ | 创建站点级别配置 |
| PUT | `/api/configs/site-level-configs/{config_id}` | ✅ | 更新站点级别配置 |
| DELETE | `/api/configs/site-level-configs/{config_id}` | ✅ | 删除站点级别配置 |

---

## 二、iGreenApp 前端API对接分析

### 2.1 iGreenApp API客户端实现

**文件**: `iGreenApp/src/lib/api.ts`

**已定义的API方法**: 8个

| API方法 | 后端端点 | 对接状态 | 说明 |
|--------|---------|---------|------|
| `login()` | POST `/api/auth/login` | ⚠️ **待修复** | 前端用username，后端需email |
| `logout()` | - | ✅ 客户端 | 清除本地token |
| `getTickets()` | GET `/api/tickets` | ⚠️ **未调用** | 方法已实现但前端未使用 |
| `getTicket()` | GET `/api/tickets/{id}` | ⚠️ **未调用** | 方法已实现但前端未使用 |
| `updateTicket()` | PUT `/api/tickets/{id}` | ⚠️ **未调用** | 方法已实现但前端未使用 |
| `acceptTicket()` | POST `/api/tickets/{id}/accept` | ⚠️ **未调用** | 方法已实现但前端未使用 |
| `declineTicket()` | POST `/api/tickets/{id}/decline` | ⚠️ **未调用** | 方法已实现但前端未使用 |
| `uploadFile()` | POST `/api/files/upload` | ✅ 已调用 | 照片上传功能 |

### 2.2 iGreenApp缺失的API方法

| API方法 | 后端端点 | 优先级 | 用途 |
|--------|---------|-------|------|
| `getCurrentUser()` | - | P1 | 获取当前用户信息 |
| `deleteFile()` | DELETE `/api/files/{id}` | P2 | 删除上传的文件 |
| `verifyFace()` | POST `/api/files/face-recognition/verify` | P2 | 人脸识别验证 |

### 2.3 iGreenApp前端使用情况

**前端组件**: Login.tsx, TicketList.tsx, TicketDetail.tsx, Profile.tsx

**当前数据来源**: Mock数据 (lib/mockData.ts)

**集成问题**:
1. ❌ Login.tsx 使用mock登录，未调用 `api.login()`
2. ❌ TicketList.tsx 使用mock数据，未调用 `api.getTickets()`
3. ❌ TicketDetail.tsx 使用mock数据，未调用 `api.getTicket()`
4. ⚠️ `api.updateTicket()` 未在前端调用
5. ⚠️ `api.acceptTicket()` 未在前端调用
6. ⚠️ `api.declineTicket()` 未在前端调用

### 2.4 iGreenApp集成进度

| 指标 | 数值 |
|-----|------|
| 已实现API方法 | 8个 |
| 已对接方法 | 1个 (uploadFile) |
| 未实现方法 | 3个 |
| 前端已调用 | 1个 |
| **集成完成度** | **12.5%** (1/8) |

---

## 三、iGreenticketing 前端API对接分析

### 3.1 iGreenticketing API客户端实现

**文件**: `iGreenticketing/src/lib/api.ts`

**已定义的API方法**: 38个

| API方法 | 后端端点 | 对接状态 | 说明 |
|--------|---------|---------|------|
| **认证 (2个)** | | | |
| `login()` | POST `/api/auth/login` | ⚠️ **待修复** | 前端用username，后端需email |
| `logout()` | - | ✅ 客户端 | 清除本地token |
| **用户管理 (6个)** | | | |
| `getUsers()` | GET `/api/users` | ✅ 端点正确 | 已实现 |
| `getUser()` | GET `/api/users/{id}` | ✅ 端点正确 | 已实现 |
| `createUser()` | POST `/api/users` | ✅ 端点正确 | 已实现 |
| `updateUser()` | PUT `/api/users/{id}` | ✅ 端点正确 | 已实现 |
| `deleteUser()` | DELETE `/api/users/{id}` | ✅ 端点正确 | 已实现 |
| `getCurrentUser()` | GET `/api/users/me` | ❌ **端点不存在** | 后端无此端点 |
| **分组管理 (5个)** | | | |
| `getGroups()` | GET `/api/groups` | ✅ 端点正确 | 已实现 |
| `getGroup()` | GET `/api/groups/{id}` | ✅ 端点正确 | 已实现 |
| `createGroup()` | POST `/api/groups` | ✅ 端点正确 | 已实现 |
| `updateGroup()` | PUT `/api/groups/{id}` | ✅ 端点正确 | 已实现 |
| `deleteGroup()` | DELETE `/api/groups/{id}` | ✅ 端点正确 | 已实现 |
| **站点管理 (5个)** | | | |
| `getSites()` | GET `/api/sites` | ✅ 端点正确 | 已实现 |
| `getSite()` | GET `/api/sites/{id}` | ✅ 端点正确 | 已实现 |
| `createSite()` | POST `/api/sites` | ✅ 端点正确 | 已实现 |
| `updateSite()` | PUT `/api/sites/{id}` | ✅ 端点正确 | 已实现 |
| `deleteSite()` | DELETE `/api/sites/{id}` | ✅ 端点正确 | 已实现 |
| **模板管理 (5个)** | | | |
| `getTemplates()` | GET `/api/templates` | ✅ 端点正确 | 已实现 |
| `getTemplate()` | GET `/api/templates/{id}` | ✅ 端点正确 | 已实现 |
| `createTemplate()` | POST `/api/templates` | ✅ 端点正确 | 已实现 |
| `updateTemplate()` | PUT `/api/templates/{id}` | ✅ 端点正确 | 已实现 |
| `deleteTemplate()` | DELETE `/api/templates/{id}` | ✅ 端点正确 | 已实现 |
| **工单管理 (6个)** | | | |
| `getTickets()` | GET `/api/tickets` | ✅ 端点正确 | 已实现 |
| `getTicket()` | GET `/api/tickets/{id}` | ✅ 端点正确 | 已实现 |
| `createTicket()` | POST `/api/tickets` | ✅ 端点正确 | 已实现 |
| `updateTicket()` | PUT `/api/tickets/{id}` | ✅ 端点正确 | 已实现 |
| `deleteTicket()` | DELETE `/api/tickets/{id}` | ✅ 端点正确 | 已实现 |
| `addComment()` | POST `/api/tickets/{id}/comments` | ❌ **端点不存在** | 后端无此端点 |
| **文件管理 (1个)** | | | |
| `uploadFile()` | POST `/api/files/upload` | ✅ 端点正确 | 已实现 |
| **配置管理 (3个)** | | | |
| `getSLAConfigs()` | GET `/api/configs/sla` | ❌ **端点错误** | 正确为 `/api/configs/sla-configs` |
| `getSiteLevelConfigs()` | GET `/api/configs/site-levels` | ❌ **端点错误** | 正确为 `/api/configs/site-level-configs` |
| `getProblemTypes()` | GET `/api/configs/problem-types` | ✅ 端点正确 | 已实现 |

### 3.2 iGreenticketing缺失的API方法

| API方法 | 后端端点 | 优先级 | 用途 |
|--------|---------|-------|------|
| `acceptTicket()` | POST `/api/tickets/{id}/accept` | P1 | 接受工单 |
| `declineTicket()` | POST `/api/tickets/{id}/decline` | P1 | 拒绝工单 |
| `cancelTicket()` | POST `/api/tickets/{id}/cancel` | P1 | 取消工单 |
| `deleteFile()` | DELETE `/api/files/{id}` | P2 | 删除文件 |
| `createSLAConfig()` | POST `/api/configs/sla-configs` | P2 | 创建SLA配置 |
| `updateSLAConfig()` | PUT `/api/configs/sla-configs/{priority}` | P2 | 更新SLA配置 |
| `deleteSLAConfig()` | DELETE `/api/configs/sla-configs/{priority}` | P2 | 删除SLA配置 |
| `updateSiteLevelConfig()` | PUT `/api/configs/site-level-configs/{id}` | P2 | 更新站点级别配置 |
| `deleteSiteLevelConfig()` | DELETE `/api/configs/site-level-configs/{id}` | P2 | 删除站点级别配置 |

### 3.3 iGreenticketing前端使用情况

**前端组件**: Login.tsx, Dashboard.tsx, CreateTicket.tsx, TemplateManager.tsx, SiteManagement.tsx, GroupManager.tsx, SystemSettings.tsx, TicketDetail.tsx, MyTasks.tsx, AccountSettings.tsx

**当前数据来源**: Mock数据 (lib/mockData.ts)

**集成问题**:
1. ❌ Login.tsx 使用mock登录，未调用 `api.login()`
2. ❌ 所有组件使用mock数据，未调用对应的API方法

### 3.4 iGreenticketing集成进度

| 指标 | 数值 |
|-----|------|
| 已实现API方法 | 38个 |
| 正确端点匹配 | 32个 |
| 端点错误 | 3个 (getSLAConfigs, getSiteLevelConfigs, getCurrentUser, addComment) |
| 缺失方法 | 9个 |
| 前端已调用 | 0个 (全部使用mock) |
| **API方法完成度** | **84%** (32/38) |
| **实际集成度** | **0%** (0/38) |

---

## 四、后端缺失的API端点

| 前端需求 | 端点 | 优先级 | 状态 |
|---------|------|-------|------|
| 获取当前用户 | GET `/api/users/me` | P1 | ❌ 不存在 |
| 添加评论 | POST `/api/tickets/{id}/comments` | P1 | ❌ 不存在 |

---

## 五、API对接待修复问题清单

### 5.1 紧急修复 (P0)

| 问题 | 影响 | 修复方案 | 预估工时 |
|-----|------|---------|---------|
| **登录接口参数不匹配** | 前端无法登录 | 修改后端login接口支持username或修改前端使用email | 1h |
| **iGreenticketing配置API端点错误** | 配置功能无法使用 | 修改前端api.ts中的端点路径 | 0.5h |

### 5.2 高优先级 (P1)

| 问题 | 影响 | 修复方案 | 预估工时 |
|-----|------|---------|---------|
| **后端缺少 `/api/users/me` 端点** | 无法获取当前用户 | 在users.py中添加该端点 | 1h |
| **后端缺少评论端点** | 无法添加评论 | 在tickets.py中添加评论端点 | 2h |
| **iGreenApp前端未调用任何API** | 无法正常使用 | 替换所有mock数据为真实API调用 | 8h |
| **iGreenticketing前端未调用任何API** | 无法正常使用 | 替换所有mock数据为真实API调用 | 16h |

### 5.3 中优先级 (P2)

| 问题 | 影响 | 修复方案 | 预估工时 |
|-----|------|---------|---------|
| **iGreenticketing缺失部分API方法** | 功能不完整 | 添加缺失的API方法 | 2h |
| **iGreenApp缺失getCurrentUser等API** | 功能不完整 | 添加缺失的API方法 | 1h |

---

## 六、集成工作量估算

### 6.1 需要对接的接口总数

| 项目 | 后端已有 | 前端已实现 | 待对接 | 需新建后端端点 |
|-----|---------|-----------|--------|----------------|
| iGreenApp | 44 | 8 | 7 | 2 |
| iGreenticketing | 44 | 38 | 38 | 2 |
| **总计** | **44** | **38** | **45** | **2** |

### 6.2 各模块对接工作量

| 模块 | 端点数 | 前端已实现 | 待对接 | 预估工时 |
|-----|-------|-----------|--------|---------|
| **认证** | 3 | 2 | 2 | 0.5h |
| **用户管理** | 5 | 6 | 5 | 1h |
| **工单管理** | 8 | 6 | 6 | 2h |
| **模板管理** | 5 | 5 | 5 | 1h |
| **分组管理** | 5 | 5 | 5 | 1h |
| **站点管理** | 5 | 5 | 5 | 1h |
| **文件管理** | 3 | 1 | 2 | 0.5h |
| **配置管理** | 10 | 3 | 3 | 1h |
| **新增端点** | 2 | 0 | 2 | 2h |
| **前端替换mock** | - | - | 2个前端应用 | 24h |
| **总计** | **44** | **38** | **45** | **35h** |

### 6.3 工作量统计

| 工作项 | 预估工时 |
|-------|---------|
| 后端新增2个端点 | 3h |
| 前端API方法补充 | 4h |
| 前端修复端点错误 | 1h |
| iGreenApp替换mock为真实API | 10h |
| iGreenticketing替换mock为真实API | 14h |
| 联调测试 | 3h |
| **总计** | **35h** |

---

## 七、API对接优先级路线图

### 7.1 第一阶段：核心功能对接 (12h)

**目标**: 完成认证和核心业务功能对接

| 顺序 | 任务 | 工时 | 说明 |
|-----|------|------|------|
| 1 | 后端新增 `/api/users/me` 端点 | 1h | 获取当前用户 |
| 2 | 后端新增评论端点 | 2h | 工单评论功能 |
| 3 | 修复登录接口参数 | 1h | 支持username登录 |
| 4 | iGreenApp认证对接 | 1h | 登录功能 |
| 5 | iGreenticketing认证对接 | 1h | 登录功能 |
| 6 | iGreenApp工单API对接 | 3h | 列表、详情、更新 |
| 7 | iGreenticketing工单API对接 | 3h | 创建、列表、详情 |

**交付物**:
- 用户可以正常登录
- 可以查看和创建工单
- 可以更新工单状态

### 7.2 第二阶段：管理功能对接 (14h)

**目标**: 完成管理后台核心管理功能对接

| 顺序 | 任务 | 工时 | 说明 |
|-----|------|------|------|
| 8 | iGreenticketing用户管理对接 | 3h | 用户CRUD |
| 9 | iGreenticketing分组管理对接 | 2h | 分组CRUD |
| 10 | iGreenticketing站点管理对接 | 2h | 站点CRUD |
| 11 | iGreenticketing模板管理对接 | 3h | 模板CRUD |
| 12 | iGreenticketing配置API修复 | 1h | 修复端点错误 |
| 13 | iGreenApp抢单/拒单对接 | 2h | 工程师功能 |
| 14 | iGreenApp文件上传对接 | 1h | 照片上传 |

**交付物**:
- 管理员可以管理用户、分组、站点、模板
- 工程师可以接受/拒绝工单
- 可以上传照片

### 7.3 第三阶段：完善与测试 (9h)

**目标**: 完善所有功能并测试

| 顺序 | 任务 | 工时 | 说明 |
|-----|------|------|------|
| 15 | iGreenApp补充缺失API方法 | 1h | getCurrentUser等 |
| 16 | iGreenticketing补充缺失API方法 | 2h | accept/decline/cancel等 |
| 17 | iGreenticketing配置管理对接 | 3h | SLA、问题类型、站点级别 |
| 18 | 全功能联调测试 | 2h | 测试所有功能 |
| 19 | Bug修复 | 1h | 修复测试发现的问题 |

**交付物**:
- 所有API方法已实现
- 所有功能正常工作
- 无严重Bug

---

## 八、接口对接统计汇总

### 8.1 对接进度

| 项目 | 后端API | 前端API方法 | 已对接 | 待对接 | 完成度 |
|-----|---------|-----------|--------|--------|--------|
| iGreenApp | 44 | 8 | 1 | 7 | 12.5% |
| iGreenticketing | 44 | 38 | 0 | 38 | 0% |
| **合计** | **44** | **38** | **1** | **38** | **2.6%** |

### 8.2 对接分类统计

| 分类 | 数量 | 占比 |
|-----|------|------|
| 已完全对接 | 1 | 2.6% |
| API方法已实现但前端未调用 | 32 | 82.1% |
| API方法未实现 | 5 | 12.8% |
| 后端端点不存在 | 2 | 5.1% |

### 8.3 对接复杂度评估

| 复杂度 | 端点数量 | 说明 |
|-------|---------|------|
| **简单** | 28 | 标准CRUD，直接替换mock即可 |
| **中等** | 8 | 需要处理数据格式转换、状态管理 |
| **复杂** | 4 | 工单操作、文件上传需要特殊处理 |
| **困难** | 2 | 需要新增后端端点 |

---

## 九、关键技术问题

### 9.1 登录接口参数不匹配

**问题描述**:
- 前端发送: `{ username: "...", password: "..." }`
- 后端期望: `{ email: "...", password: "..." }`

**解决方案**:

**方案1**: 修改前端使用email (推荐)
```typescript
// iGreenApp/src/lib/api.ts 和 iGreenticketing/src/lib/api.ts
login: async (email: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('email', email);  // 改为 email
  formData.append('password', password);
  // ...
}
```

**方案2**: 修改后端支持username
```python
# backend/app/schemas/user.py
class UserLogin(BaseModel):
    email: Optional[str] = None  # 改为可选
    username: Optional[str] = None  # 新增username
    password: str

# backend/app/api/auth.py
# 查找用户时同时支持email和username
user = db.query(User).filter(
    (User.email == user_data.email) | (User.username == user_data.username)
).first()
```

**推荐**: 方案1，因为登录通常使用email更标准

### 9.2 缺少评论端点

**问题描述**: 后端没有独立添加评论的端点

**解决方案**: 在 `backend/app/api/tickets.py` 中添加

```python
@router.post("/{ticket_id}/comments", response_model=TicketCommentResponse)
async def add_comment(
    ticket_id: str,
    comment_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """添加评论"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    comment = TicketComment(
        id=str(uuid.uuid4()),
        ticket_id=ticket_id,
        user_id=current_user.id,
        comment=comment_data.get("comment"),
        type=comment_data.get("type", "general")
    )
    db.add(comment)
    db.commit()
    return comment
```

### 9.3 配置API端点错误

**问题描述**: 前端调用的端点与后端不匹配

**解决方案**: 修改前端 `iGreenticketing/src/lib/api.ts`

```typescript
// 修改前
getSLAConfigs: async () => {
  return fetchWithAuth('/api/configs/sla');  // 错误
},
getSiteLevelConfigs: async () => {
  return fetchWithAuth('/api/configs/site-levels');  // 错误
},

// 修改后
getSLAConfigs: async () => {
  return fetchWithAuth('/api/configs/sla-configs');  // 正确
},
getSiteLevelConfigs: async () => {
  return fetchWithAuth('/api/configs/site-level-configs');  // 正确
},
```

---

## 十、附录

### 10.1 接口对接检查清单

#### iGreenApp

- [ ] 修复登录接口参数（email vs username）
- [ ] 实现 `getCurrentUser()` API方法
- [ ] Login.tsx 替换mock为真实API调用
- [ ] TicketList.tsx 替换mock为真实API调用
- [ ] TicketDetail.tsx 替换mock为真实API调用
- [ ] TicketDetail.tsx 调用 `getTicket()` 获取详情
- [ ] TicketDetail.tsx 调用 `updateTicket()` 更新工单
- [ ] TicketDetail.tsx 调用 `acceptTicket()` 接受工单
- [ ] TicketDetail.tsx 调用 `declineTicket()` 拒绝工单
- [ ] Profile.tsx 调用 `getCurrentUser()` 获取用户信息

#### iGreenticketing

- [ ] 修复登录接口参数（email vs username）
- [ ] 修复 `getSLAConfigs()` 端点路径
- [ ] 修复 `getSiteLevelConfigs()` 端点路径
- [ ] 删除或修改 `getCurrentUser()` 方法（后端无此端点）
- [ ] 删除或修改 `addComment()` 方法（后端无此端点）
- [ ] 添加缺失的API方法（acceptTicket, declineTicket等）
- [ ] Login.tsx 替换mock为真实API调用
- [ ] Dashboard.tsx 替换mock为真实API调用
- [ ] CreateTicket.tsx 替换mock为真实API调用
- [ ] TemplateManager.tsx 替换mock为真实API调用
- [ ] SiteManagement.tsx 替换mock为真实API调用
- [ ] GroupManager.tsx 替换mock为真实API调用
- [ ] SystemSettings.tsx 替换mock为真实API调用
- [ ] TicketDetail.tsx 替换mock为真实API调用
- [ ] MyTasks.tsx 替换mock为真实API调用
- [ ] AccountSettings.tsx 替换mock为真实API调用

#### 后端

- [ ] 添加 `GET /api/users/me` 端点
- [ ] 添加 `POST /api/tickets/{id}/comments` 端点
- [ ] 修改登录接口支持username或email

### 10.2 API文档访问

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

**文档版本**: v1.0
**最后更新**: 2025-12-26
**分析结论**:
- 后端API完整度: 100% (44/44)
- iGreenApp集成度: 12.5% (1/8)
- iGreenticketing集成度: 0% (0/38)
- **总体集成度**: 2.6%
- **剩余工作量**: 35小时
- **预计完成时间**: 5个工作日
