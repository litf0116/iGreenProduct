# iGreenProduct 系统功能说明文档

## 项目概述

iGreenProduct 是一个**电动汽车充电桩维护工单管理系统**，采用全栈架构，包含统一的后端服务和两个前端应用。

### 技术栈

| 层级 | 技术选型 |
|------|----------|
| **后端** | FastAPI (Python)、SQLAlchemy、Pydantic、MySQL/SQLite、JWT |
| **前端 - 工程师APP** | React、TypeScript、Vite、Tailwind CSS、Radix UI |
| **前端 - 管理员系统** | React、TypeScript、Vite、Tailwind CSS、Radix UI、Recharts |

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         iGreenProduct 系统架构                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │   iGreenApp      │         │ iGreenticketing  │              │
│  │  (工程师移动APP)   │         │   (管理员派单系统)  │              │
│  └────────┬─────────┘         └────────┬─────────┘              │
│           │                             │                         │
│           └──────────┬──────────────────┘                         │
│                      │                                            │
│                      ▼                                            │
│           ┌────────────────────┐                                  │
│           │   后端 API 服务      │                                  │
│           │   (FastAPI)        │                                  │
│           └────────┬───────────┘                                  │
│                    │                                              │
│                    ▼                                              │
│           ┌────────────────────┐                                  │
│           │     数据库          │                                  │
│           │  (MySQL/SQLite)    │                                  │
│           └────────────────────┘                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 一、用户角色与权限

### 角色定义

| 角色 | 代码 | 描述 |
|------|------|------|
| **管理员** | `admin` | 系统最高权限，可管理所有功能和数据 |
| **经理** | `manager` | 可管理用户、分组、模板、站点，但不能删除 |
| **工程师** | `engineer` | 现场维护人员，负责执行工单任务 |

### 权限矩阵

| 功能模块 | 管理员 | 经理 | 工程师 |
|----------|--------|------|--------|
| 用户管理 (CRUD) | ✅ 全部 | ✅ 创建/编辑/查看 | ❌ 仅查看自己 |
| 工单管理 | ✅ 全部 | ✅ 全部 | ✅ 相关工单 |
| 模板管理 | ✅ 全部 | ✅ 全部 | ❌ 仅查看 |
| 分组管理 | ✅ 全部 | ✅ 全部 | ❌ 仅查看 |
| 站点管理 | ✅ 全部 | ✅ 全部 | ❌ 仅查看 |
| 系统配置 | ✅ 全部 | ❌ | ❌ |
| 文件上传 | ✅ | ✅ | ✅ |

---

## 二、功能模块详解

### 2.1 认证模块 (`/api/auth`)

| 功能 | 端点 | 方法 | 描述 |
|------|------|------|------|
| 用户登录 | `/api/auth/login` | POST | 邮箱密码登录，返回JWT Token |
| 用户注册 | `/api/auth/register` | POST | 创建新用户账户 |
| 用户登出 | `/api/auth/logout` | POST | 清除认证状态 |

**请求体示例**:
```json
{
  "email": "engineer@example.com",
  "password": "secure_password"
}
```

---

### 2.2 用户管理模块 (`/api/users`)

| 功能 | 端点 | 方法 | 权限 |
|------|------|------|------|
| 获取用户列表 | `/api/users` | GET | 所有用户 |
| 获取用户详情 | `/api/users/{user_id}` | GET | 所有用户 |
| 创建用户 | `/api/users` | POST | admin, manager |
| 更新用户 | `/api/users/{user_id}` | PUT | 自己或admin/manager |
| 删除用户 | `/api/users/{user_id}` | DELETE | admin |

**过滤参数**:
- `role`: 按角色过滤 (admin, engineer, manager)
- `group_id`: 按分组过滤
- `status`: 按状态过滤 (active, inactive)

**数据模型**:
```python
User {
  id: int
  name: str           # 姓名
  username: str       # 用户名
  email: str          # 邮箱
  password: str       # 加密密码
  role: Role          # 角色
  group_id: int       # 所属分组
  status: Status      # 状态
  created_at: datetime
}
```

---

### 2.3 工单管理模块 (`/api/tickets`)

#### 工单状态流转

```
┌─────────┐     ┌──────────┐     ┌─────────────┐
│  OPEN   │ ──▶ │ ACCEPTED │ ──▶ │ IN_PROGRESS │
│  (开放)  │     │ (已接受)  │     │  (进行中)    │
└─────────┘     └──────────┘     └──────┬───────┘
     │                                  │
     │                                  ▼
     │                           ┌──────────┐
     │                           │ SUBMITTED│
     │                           │  (已提交)  │
     │                           └─────┬────┘
     │                                 │
     ▼                                 ▼
┌─────────┐     ┌──────────┐     ┌─────────┐
│ON_HOLD  │     │CANCELLED │    │ CLOSED  │
│ (暂停)   │     │ (已取消)  │     │ (已关闭)  │
└─────────┘     └──────────┘     └─────────┘
```

#### API 端点

| 功能 | 端点 | 方法 | 权限 |
|------|------|------|------|
| 获取工单列表 | `/api/tickets` | GET | 所有用户 |
| 获取工单详情 | `/api/tickets/{ticket_id}` | GET | 所有用户 |
| 创建工单 | `/api/tickets` | POST | 所有用户 |
| 更新工单 | `/api/tickets/{ticket_id}` | PUT | 所有用户 |
| 删除工单 | `/api/tickets/{ticket_id}` | DELETE | 创建者或admin |
| 接受工单 | `/api/tickets/{ticket_id}/accept` | POST | 被分配的工程师 |
| 拒绝工单 | `/api/tickets/{ticket_id}/decline` | POST | 被分配的工程师 |
| 取消工单 | `/api/tickets/{ticket_id}/cancel` | POST | 创建者或admin |

**过滤参数**:
- `status`: 工单状态
- `priority`: 优先级 (P1, P2, P3, P4)
- `assigned_to`: 被分配用户ID
- `created_by`: 创建者ID
- `type`: 工单类型

**数据模型**:
```python
Ticket {
  id: int
  title: str              # 标题
  description: str        # 描述
  type: TicketType        # 类型
  priority: Priority      # 优先级
  status: TicketStatus    # 状态
  template_id: int        # 关联模板
  site_id: int            # 关联站点
  assigned_to: int        # 分配给
  created_by: int         # 创建者
  sla_deadline: datetime  # SLA截止时间
  step_data: JSON         # 步骤完成数据
  created_at: datetime
}
```

#### 工单类型说明

| 类型 | 代码 | 描述 |
|------|------|------|
| 计划性维护 | `planned` | 按计划进行的常规维护 |
| 预防性维护 | `preventive` | 为防止故障进行的维护 |
| 纠正性维护 | `corrective` | 修复已发生的故障 |
| 问题处理 | `problem` | 突发问题处理 |

#### 优先级说明

| 优先级 | 代码 | 响应时间要求 |
|--------|------|--------------|
| P1 | `p1` | 紧急 (4小时内) |
| P2 | `p2` | 高 (24小时内) |
| P3 | `p3` | 中 (48小时内) |
| P4 | `p4` | 低 (72小时内) |

---

### 2.4 模板管理模块 (`/api/templates`)

模板系统用于定义标准化的维护工作流程，包含多个步骤和字段。

#### API 端点

| 功能 | 端点 | 方法 | 权限 |
|------|------|------|------|
| 获取模板列表 | `/api/templates` | GET | 所有用户 |
| 获取模板详情 | `/api/templates/{template_id}` | GET | 所有用户 |
| 创建模板 | `/api/templates` | POST | admin, manager |
| 更新模板 | `/api/templates/{template_id}` | PUT | admin, manager |
| 删除模板 | `/api/templates/{template_id}` | DELETE | admin |

#### 模板结构

```
Template (模板)
│
├── TemplateStep (步骤)
│   │
│   └── TemplateField (字段)
│       ├── TEXT (文本)
│       ├── NUMBER (数字)
│       ├── DATE (日期)
│       ├── LOCATION (位置)
│       ├── PHOTO (照片)
│       ├── SIGNATURE (签名)
│       └── FACE_RECOGNITION (人脸识别)
```

#### 数据模型

```python
Template {
  id: int
  name: str              # 模板名称
  description: str       # 描述
  type: TicketType       # 适用工单类型
  steps: List[Step]      # 步骤列表
}

TemplateStep {
  id: int
  template_id: int
  title: str             # 步骤标题
  description: str       # 步骤描述
  order: int             # 执行顺序
  fields: List[Field]    # 字段列表
}

TemplateField {
  id: int
  step_id: int
  name: str              # 字段名称
  type: FieldType        # 字段类型
  required: bool         # 是否必填
  options: List[str]     # 选项（如果是选择类字段）
}
```

---

### 2.5 分组管理模块 (`/api/groups`)

分组用于组织工程师，便于工单分配和管理。

#### API 端点

| 功能 | 端点 | 方法 | 权限 |
|------|------|------|------|
| 获取分组列表 | `/api/groups` | GET | 所有用户 |
| 获取分组详情 | `/api/groups/{group_id}` | GET | 所有用户 |
| 创建分组 | `/api/groups` | POST | admin, manager |
| 更新分组 | `/api/groups/{group_id}` | PUT | admin, manager |
| 删除分组 | `/api/groups/{group_id}` | DELETE | admin |

#### 数据模型

```python
Group {
  id: int
  name: str              # 分组名称
  description: str       # 描述
  status: GroupStatus    # 状态 (active/inactive)
  users: List[User]      # 分组成员
}
```

---

### 2.6 站点管理模块 (`/api/sites`)

站点管理充电桩的位置和配置信息。

#### API 端点

| 功能 | 端点 | 方法 | 权限 |
|------|------|------|------|
| 获取站点列表 | `/api/sites` | GET | 所有用户 |
| 获取站点详情 | `/api/sites/{site_id}` | GET | 所有用户 |
| 创建站点 | `/api/sites` | POST | admin, manager |
| 更新站点 | `/api/sites/{site_id}` | PUT | admin, manager |
| 删除站点 | `/api/sites/{site_id}` | DELETE | admin |

#### 站点状态

| 状态 | 代码 | 描述 |
|------|------|------|
| 在线 | `online` | 正常运行 |
| 离线 | `offline` | 暂停服务 |
| 建设中 | `under_construction` | 正在建设 |

#### 数据模型

```python
Site {
  id: int
  name: str              # 站点名称
  address: str           # 地址
  level: str             # 站点级别
  status: SiteStatus     # 状态
  location: dict         # 地理位置坐标
  num_chargers: int      # 充电桩数量
  config: dict           # 配置信息
}
```

---

### 2.7 配置管理模块 (`/api/configs`)

#### SLA 配置

| 功能 | 端点 | 方法 | 权限 |
|------|------|------|------|
| 获取SLA配置列表 | `/api/configs/sla-configs` | GET | 所有用户 |
| 获取SLA配置详情 | `/api/configs/sla-configs/{priority}` | GET | 所有用户 |
| 创建/更新SLA配置 | `/api/configs/sla-configs` | POST | admin |

```python
SLAConfig {
  priority: Priority     # 优先级
  response_hours: int    # 响应时间（小时）
  resolution_hours: int  # 解决时间（小时）
}
```

#### 问题类型配置

| 功能 | 端点 | 方法 | 权限 |
|------|------|------|------|
| 获取问题类型列表 | `/api/configs/problem-types` | GET | 所有用户 |
| 创建问题类型 | `/api/configs/problem-types` | POST | admin, manager |
| 更新问题类型 | `/api/configs/problem-types/{type_id}` | PUT | admin, manager |
| 删除问题类型 | `/api/configs/problem-types/{type_id}` | DELETE | admin |

```python
ProblemType {
  id: int
  name: str              # 问题类型名称
  description: str       # 描述
  default_priority: Priority # 默认优先级
}
```

#### 站点级别配置

| 功能 | 端点 | 方法 | 权限 |
|------|------|------|------|
| 获取站点级别配置 | `/api/configs/site-level-configs` | GET | 所有用户 |
| 创建站点级别配置 | `/api/configs/site-level-configs` | POST | admin |
| 更新站点级别配置 | `/api/configs/site-level-configs/{config_id}` | PUT | admin |
| 删除站点级别配置 | `/api/configs/site-level-configs/{config_id}` | DELETE | admin |

```python
SiteLevelConfig {
  id: int
  level: str             # 站点级别
  sla_multiplier: float  # SLA时间倍数
  allowed_types: List[TicketType] # 允许的工单类型
}
```

---

### 2.8 文件管理模块 (`/api/files`)

| 功能 | 端点 | 方法 | 权限 |
|------|------|------|------|
| 上传文件 | `/api/files/upload` | POST | 所有用户 |
| 删除文件 | `/api/files/{file_id}` | DELETE | 所有用户 |
| 人脸识别验证 | `/api/files/face-recognition/verify` | POST | 所有用户 |

```python
File {
  id: int
  filename: str          # 文件名
  file_path: str         # 文件路径
  file_type: str         # 文件类型
  file_size: int         # 文件大小
  uploaded_by: int       # 上传者
  ticket_id: int         # 关联工单
  field_type: FieldType  # 字段类型
}
```

---

## 三、前端应用功能

### 3.1 工程师移动APP (iGreenApp)

#### 页面结构

| 路由 | 组件 | 功能描述 |
|------|------|----------|
| `/login` | Login | 用户登录 |
| `/dashboard` | Dashboard | 工作概览、待处理工单统计 |
| `/queue` | TicketList | 查看待处理工单队列 |
| `/my-work` | TicketList | 查看我的工单 |
| `/history` | TicketList | 查看历史工单 |
| `/tickets/:id` | TicketDetail | 工单详情、执行维护任务 |
| `/profile` | Profile | 个人资料和工作统计 |

#### 核心功能

1. **工单执行**
   - 查看工单详细信息
   - 按步骤执行维护任务
   - 填写表单字段（文本、数字、日期等）
   - 上传照片和签名
   - 人脸识别验证
   - 提交位置信息

2. **工单操作**
   - 接受/拒绝工单
   - 更新工单状态
   - 添加评论
   - 提交完成报告

3. **个人中心**
   - 查看个人信息
   - 工作统计（完成工单数、评分等）
   - 修改密码

#### 特色功能

- 响应式设计，适配移动设备
- 实时数据同步
- 离线数据缓存
- 人脸识别身份验证

---

### 3.2 管理员派单系统 (iGreenticketing)

#### 页面结构

| 路由 | 组件 | 功能描述 |
|------|------|----------|
| `/login` | Login | 用户登录 |
| `/signup` | SignUp | 用户注册 |
| `/dashboard` | Dashboard | 系统仪表板、数据统计 |
| `/tickets` | CreateTicket | 工单管理和创建 |
| `/templates` | TemplateManager | 模板管理 |
| `/sites` | SiteManagement | 站点管理 |
| `/groups` | GroupManager | 分组管理 |
| `/settings` | SystemSettings | 系统设置 |

#### 核心功能

1. **仪表板**
   - 工单统计数据
   - 工单状态分布图表
   - SLA达成率
   - 工程师工作量分析
   - 实时工单动态

2. **工单管理**
   - 创建新工单
   - 分配工单给工程师
   - 工单筛选和搜索
   - 批量操作
   - 导出报表

3. **模板管理**
   - 创建维护模板
   - 定义步骤和字段
   - 模板复用
   - 版本管理

4. **站点管理**
   - 添加/编辑充电站点
   - 设置站点状态
   - 配置站点级别

5. **分组管理**
   - 创建工程师分组
   - 分组成员管理
   - 分组权限设置

6. **系统设置**
   - SLA配置管理
   - 问题类型定义
   - 站点级别配置

#### 特色功能

- 高级筛选和多维度搜索
- 批量工单操作
- 数据可视化图表（Recharts）
- 报表导出
- 细粒度权限控制

---

## 四、数据模型关系图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           数据模型关系图                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────┐         ┌─────────┐         ┌─────────────────────┐   │
│  │  User   │────────▶│ Group   │         │      Template       │   │
│  │  (用户)  │   N:1   │ (分组)   │         │      (模板)         │   │
│  └────┬────┘         └─────────┘         └──────────┬──────────┘   │
│       │                                           │                │
│       │ 1:N                            1:N        │                │
│       ▼                                           ▼                │
│  ┌─────────┐         ┌─────────┐         ┌─────────────────────┐   │
│  │ Ticket  │────────▶│  Site   │◀────────│   TemplateStep      │   │
│  │ (工单)   │   N:1   │ (站点)   │         │    (模板步骤)        │   │
│  └────┬────┘         └─────────┘         └──────────┬──────────┘   │
│       │                                           │                │
│       │ 1:N                            1:N        │                │
│       ▼                                           ▼                │
│  ┌─────────────────┐                   ┌─────────────────────┐    │
│  │  TicketComment  │                   │    TemplateField    │    │
│  │   (工单评论)     │                   │    (模板字段)        │    │
│  └─────────────────┘                   └─────────────────────┘    │
│                                                                     │
│  ┌─────────┐         ┌──────────────────────────────────────┐     │
│  │  File   │         │              Config                   │     │
│  │ (文件)   │         │             (配置)                    │     │
│  └─────────┘         │ - SLAConfig                          │     │
│                       │ - ProblemType                        │     │
│                       │ - SiteLevelConfig                    │     │
│                       └──────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 五、系统特性

### 5.1 安全特性

- JWT Token 身份认证
- 密码加密存储（bcrypt）
- 基于角色的访问控制（RBAC）
- API 请求权限验证

### 5.2 工作流特性

- 完整的工单生命周期管理
- 可配置的维护模板
- 自动化 SLA 跟踪
- 状态变更审计

### 5.3 用户体验

- 响应式设计
- 实时数据更新
- 移动端优化
- 多语言支持

### 5.4 扩展性

- 模块化架构
- RESTful API 设计
- 数据库抽象层
- 可配置的业务规则

---

## 六、API 基础信息

| 项目 | 值 |
|------|-----|
| 基础路径 | `/api` |
| 健康检查 | `/api/health` |
| API 文档 | `/docs` (Swagger UI) |
| 替代文档 | `/redoc` (ReDoc) |
| 认证方式 | Bearer Token (JWT) |

---

## 七、项目文件结构

```
iGreenProduct/
├── backend/                          # 后端服务
│   ├── app/
│   │   ├── api/                      # API 路由
│   │   │   ├── auth.py               # 认证
│   │   │   ├── tickets.py            # 工单
│   │   │   ├── users.py              # 用户
│   │   │   ├── templates.py          # 模板
│   │   │   ├── groups.py             # 分组
│   │   │   ├── sites.py              # 站点
│   │   │   ├── configs.py            # 配置
│   │   │   └── files.py              # 文件
│   │   ├── core/                     # 核心配置
│   │   ├── models/                   # 数据模型
│   │   ├── schemas/                  # 数据模式
│   │   └── utils/                    # 工具函数
│   └── main.py                       # 应用入口
│
├── iGreenApp/                        # 工程师APP
│   └── src/
│       ├── lib/                      # 核心库
│       └── components/               # React组件
│
└── iGreenticketing/                  # 管理员系统
    └── src/
        ├── lib/                      # 核心库
        └── components/               # React组件
```

---

## 八、枚举类型汇总

| 类别 | 枚举值 |
|------|--------|
| **用户角色** | admin, engineer, manager |
| **用户状态** | active, inactive |
| **工单状态** | open, accepted, in_progress, closed, on_hold, cancelled, submitted |
| **工单类型** | planned, preventive, corrective, problem |
| **优先级** | p1, p2, p3, p4 |
| **字段类型** | text, number, date, location, photo, signature, face_recognition |
| **分组状态** | active, inactive |
| **站点状态** | online, offline, under_construction |
| **评论类型** | general, accept, decline, cancel |

---

## 九、后端API实现状态

| API模块 | 文件 | 代码行数 | 状态 |
|---------|------|----------|------|
| 认证 | `auth.py` | 138行 | ✅ 完整实现 |
| 用户管理 | `users.py` | 306行 | ✅ 完整实现 |
| 工单管理 | `tickets.py` | 329行 | ✅ 完整实现 |
| 模板管理 | `templates.py` | 223行 | ✅ 完整实现 |
| 分组管理 | `groups.py` | 141行 | ✅ 完整实现 |
| 站点管理 | `sites.py` | 134行 | ✅ 完整实现 |
| 配置管理 | `configs.py` | 294行 | ✅ 完整实现 |
| 文件管理 | `files.py` | 169行 | ✅ 完整实现 |

**注**: 人脸识别验证功能为模拟实现，生产环境需集成真实的人脸识别服务。

---

*文档版本: 1.0*
*最后更新: 2025年12月*
