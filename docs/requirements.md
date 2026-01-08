# iGreenProduct 需求文档

**文档版本**: v2.0
**编制日期**: 2026-01-08
**更新日期**: 2026-01-08
**项目名称**: iGreenProduct - EV充电站维护管理系统

---

## 目录

1. [项目概述](#1-项目概述)
2. [用户角色](#2-用户角色)
3. [功能需求](#3-功能需求)
   - [3.1 认证模块](#31-认证模块)
   - [3.2 工单管理模块](#32-工单管理模块)
   - [3.3 工程师工作流模块](#33-工程师工作流模块)
   - [3.4 站点管理模块](#34-站点管理模块)
   - [3.5 模板管理模块](#35-模板管理模块)
   - [3.6 分组与用户模块](#36-分组与用户模块)
   - [3.7 文件管理模块](#37-文件管理模块)
   - [3.8 系统配置模块](#38-系统配置模块)
4. [数据模型](#4-数据模型)
5. [SLA服务级别协议](#5-sla服务级别协议)
6. [权限矩阵](#6-权限矩阵)
7. [技术约束](#7-技术约束)

---

## 1. 项目概述

### 1.1 项目背景

iGreenProduct 是一个针对电动汽车（EV）充电站的维护管理系统，实现维护工单的在线管理和工程师现场作业支持。

### 1.2 系统组成

| 组成部分 | 技术栈 | 用途 |
|----------|--------|------|
| 后端服务 | Spring Boot 3.x + Java 17 | RESTful API服务 |
| 移动端 | uniapp + Vue.js 3 | 工程师现场作业（iOS/Android/H5） |
| 管理后台 | React 18 + TypeScript | 运维管理可视化 |

### 1.3 术语定义

| 术语 | 定义 |
|------|------|
| 工单（Ticket） | 维护任务的基本单元 |
| 模板（Template） | 标准化维护流程定义 |
| 站点（Site） | 电动汽车充电站 |
| SLA | Service Level Agreement，服务级别协议 |

---

## 2. 用户角色

### 2.1 角色定义

| 角色 | 说明 | 权限范围 |
|------|------|----------|
| admin | 管理员 | 完全系统访问权限 |
| manager | 经理 | 工单管理、资源创建、审核 |
| engineer | 工程师 | 执行分配的工单任务 |

### 2.2 用户属性

| 属性 | 类型 | 说明 |
|------|------|------|
| id | UUID | 用户唯一标识 |
| name | String | 用户全名 |
| username | String | 登录用户名（唯一） |
| email | String | 邮箱地址（唯一） |
| password | String | 加密后的密码 |
| role | Enum | 角色：admin/engineer/manager |
| status | Enum | 状态：active/inactive |
| group_id | UUID | 所属分组ID |

---

## 3. 功能需求

### 3.1 认证模块

#### 3.1.1 用户登录

**功能描述**：用户通过邮箱和密码登录系统，获取JWT Token。

**API端点**：`POST /api/auth/login`

#### 3.1.2 用户注册

**功能描述**：新用户注册系统账户。

**API端点**：`POST /api/auth/register`

#### 3.1.3 用户登出

**功能描述**：用户退出登录。

**API端点**：`POST /api/auth/logout`

---

### 3.2 工单管理模块

#### 3.2.1 工单数据结构

| 属性 | 类型 | 说明 |
|------|------|------|
| id | UUID | 工单唯一标识 |
| title | String | 工单标题 |
| description | Text | 工单描述 |
| type | Enum | 工单类型 |
| status | Enum | 工单状态 |
| priority | Enum | 优先级 |
| site | String | 站点名称 |
| template_id | UUID | 关联模板ID |
| assigned_to | UUID | 被分配工程师ID |
| created_by | UUID | 创建者ID |
| completed_steps | JSON | 已完成步骤列表 |
| step_data | JSON | 步骤执行数据 |
| accepted | Boolean | 是否已接受 |
| accepted_at | DateTime | 接受时间 |
| due_date | DateTime | 截止时间 |
| created_at | DateTime | 创建时间 |

#### 3.2.2 工单类型

| 类型 | 枚举值 | 说明 |
|------|--------|------|
| 纠正性维护 | corrective | 修复已知问题的维护 |
| 计划性维护 | planned | 按计划执行的常规维护 |
| 预防性维护 | preventive | 预防性检查 |
| 问题管理 | problem | 问题调查和分析 |

#### 3.2.3 工单状态

| 状态 | 枚举值 | 说明 |
|------|--------|------|
| 待处理 | open | 工单已创建，等待接受 |
| 已接受 | accepted | 工程师已接受 |
| 执行中 | inProgress | 工程师已出发 |
| 已到达 | arrived | 工程师已到达现场 |
| 暂停中 | onHold | 维护工作暂停 |
| 已提交 | submitted | 工程师完成工作，等待审核 |
| 已完成 | closed | 审核通过 |
| 已取消 | cancelled | 工单被取消 |

#### 3.2.4 工单优先级

| 优先级 | 枚举值 | 说明 |
|--------|--------|------|
| 紧急 | P1 | 严重影响运营 |
| 高 | P2 | 重要问题 |
| 中 | P3 | 一般问题 |
| 低 | P4 | 轻微问题 |

#### 3.2.5 工单API

| 功能 | API端点 | 方法 |
|------|---------|------|
| 获取工单列表 | `/api/tickets` | GET |
| 获取工单详情 | `/api/tickets/{id}` | GET |
| 创建工单 | `/api/tickets` | POST |
| 更新工单 | `/api/tickets/{id}` | PUT |
| 删除工单 | `/api/tickets/{id}` | DELETE |
| 接受工单 | `/api/tickets/{id}/accept` | POST |
| 拒绝工单 | `/api/tickets/{id}/decline` | POST |
| 取消工单 | `/api/tickets/{id}/cancel` | POST |

---

### 3.3 工程师工作流模块

#### 3.3.1 接受工单

**前置条件**：工单状态为open，用户是被分配工程师

**状态变更**：open → accepted

**API端点**：`POST /api/tickets/{ticket_id}/accept`

#### 3.3.2 拒绝工单

**前置条件**：工单状态为open，用户是被分配工程师

**输入参数**：comment（拒绝原因）

**状态变更**：open → open（重新分配）

**API端点**：`POST /api/tickets/{ticket_id}/decline`

#### 3.3.3 取消工单

**前置条件**：工单状态为open

**输入参数**：comment（取消原因）

**状态变更**：open → cancelled

**API端点**：`POST /api/tickets/{ticket_id}/cancel`

#### 3.3.4 执行维护

**前置条件**：工单状态为arrived

**处理逻辑**：
- 根据工单类型执行不同流程
- 记录完成步骤和执行数据
- 上传照片

#### 3.3.5 提交完成

**前置条件**：工单状态为arrived

**状态变更**：arrived → submitted

**API端点**：`POST /api/tickets/{ticket_id}/complete`

#### 3.3.6 审核确认（管理后台）

**功能描述**：经理/管理员审核工程师提交的工单

**确认**：submitted → closed

**拒绝**：submitted → arrived（退回重做）

---

### 3.4 站点管理模块

#### 3.4.1 站点数据结构

| 属性 | 类型 | 说明 |
|------|------|------|
| id | UUID | 站点唯一标识 |
| name | String | 站点名称（唯一） |
| address | String | 站点地址 |
| level | String | 站点级别：normal/vip |
| status | Enum | 状态：online/offline/underConstruction |

#### 3.4.2 站点API

| 功能 | API端点 | 方法 |
|------|---------|------|
| 获取站点列表 | `/api/sites` | GET |
| 获取站点详情 | `/api/sites/{id}` | GET |
| 创建站点 | `/api/sites` | POST |
| 更新站点 | `/api/sites/{id}` | PUT |
| 删除站点 | `/api/sites/{id}` | DELETE |
| 导入站点 | - | 批量导入 |

---

### 3.5 模板管理模块

#### 3.5.1 模板结构

**Template（模板）**：

| 属性 | 类型 | 说明 |
|------|------|------|
| id | UUID | 模板唯一标识 |
| name | String | 模板名称（唯一） |
| description | Text | 模板描述 |

**TemplateStep（模板步骤）**：

| 属性 | 类型 | 说明 |
|------|------|------|
| id | UUID | 步骤唯一标识 |
| name | String | 步骤名称 |
| description | Text | 步骤描述 |
| order | Integer | 步骤顺序 |
| template_id | UUID | 所属模板ID |

**TemplateField（模板字段）**：

| 属性 | 类型 | 说明 |
|------|------|------|
| id | UUID | 字段唯一标识 |
| name | String | 字段名称 |
| type | Enum | 字段类型 |
| required | Boolean | 是否必填 |
| step_id | UUID | 所属步骤ID |

#### 3.5.2 字段类型

| 类型 | 枚举值 | 说明 |
|------|--------|------|
| 文本 | text | 短文本输入 |
| 数字 | number | 数字输入 |
| 日期 | date | 日期选择 |
| 位置 | location | 地理位置 |
| 照片 | photo | 照片上传 |
| 签名 | signature | 签名绘制 |

#### 3.5.3 模板API

| 功能 | API端点 | 方法 |
|------|---------|------|
| 获取模板列表 | `/api/templates` | GET |
| 获取模板详情 | `/api/templates/{id}` | GET |
| 创建模板 | `/api/templates` | POST |
| 更新模板 | `/api/templates/{id}` | PUT |
| 删除模板 | `/api/templates/{id}` | DELETE |

---

### 3.6 分组与用户模块

#### 3.6.1 分组数据结构

| 属性 | 类型 | 说明 |
|------|------|------|
| id | UUID | 分组唯一标识 |
| name | String | 分组名称（唯一） |
| description | String | 分组描述 |
| tags | JSON | 标签列表 |
| status | Enum | 状态：active/inactive |

#### 3.6.2 分组API

| 功能 | API端点 | 方法 |
|------|---------|------|
| 获取分组列表 | `/api/groups` | GET |
| 获取分组详情 | `/api/groups/{id}` | GET |
| 创建分组 | `/api/groups` | POST |
| 更新分组 | `/api/groups/{id}` | PUT |
| 删除分组 | `/api/groups/{id}` | DELETE |

#### 3.6.3 用户API

| 功能 | API端点 | 方法 |
|------|---------|------|
| 获取用户列表 | `/api/users` | GET |
| 获取用户详情 | `/api/users/{id}` | GET |
| 创建用户 | `/api/users` | POST |
| 更新用户 | `/api/users/{id}` | PUT |
| 删除用户 | `/api/users/{id}` | DELETE |

---

### 3.7 文件管理模块

#### 3.7.1 文件数据结构

| 属性 | 类型 | 说明 |
|------|------|------|
| id | UUID | 文件唯一标识 |
| name | String | 文件名 |
| url | String | 文件访问URL |
| type | String | MIME类型 |
| size | Integer | 文件大小（字节） |
| field_type | String | 字段类型：photo/signature |

#### 3.7.2 文件API

| 功能 | API端点 | 方法 |
|------|---------|------|
| 上传文件 | `/api/files/upload` | POST |
| 删除文件 | `/api/files/{id}` | DELETE |

---

### 3.8 系统配置模块

#### 3.8.1 SLA配置

| 属性 | 类型 | 说明 |
|------|------|------|
| id | UUID | 配置ID |
| priority | Enum | 优先级：P1/P2/P3/P4 |
| response_time | Integer | 响应时间（分钟） |
| resolution_time | Integer | 解决时间（分钟） |

**API端点**：
- `GET /api/configs/sla-configs`
- `POST /api/configs/sla-configs`

#### 3.8.2 问题类型配置

| 属性 | 类型 | 说明 |
|------|------|------|
| id | UUID | 类型ID |
| name | String | 类型名称 |
| description | Text | 类型描述 |

**API端点**：
- `GET /api/configs/problem-types`
- `POST /api/configs/problem-types`
- `PUT /api/configs/problem-types/{id}`
- `DELETE /api/configs/problem-types/{id}`

#### 3.8.3 站点级别配置

| 属性 | 类型 | 说明 |
|------|------|------|
| id | UUID | 配置ID |
| name | String | 级别名称 |
| sla_multiplier | Float | SLA时间倍数 |

**API端点**：
- `GET /api/configs/site-level-configs`
- `POST /api/configs/site-level-configs`
- `PUT /api/configs/site-level-configs/{id}`
- `DELETE /api/configs/site-level-configs/{id}`

---

## 4. 数据模型

### 4.1 核心表结构

| 表名 | 说明 |
|------|------|
| users | 用户账户表 |
| groups | 用户分组表 |
| tickets | 工单表 |
| sites | 站点表 |
| templates | 模板表 |
| template_steps | 模板步骤表 |
| template_fields | 模板字段表 |
| files | 文件表 |
| sla_configs | SLA配置表 |
| site_level_configs | 站点级别配置表 |
| problem_types | 问题类型表 |

---

## 5. SLA服务级别协议

### 5.1 默认配置

| 优先级 | 响应时间 | 解决时间 |
|--------|----------|----------|
| P1 | 60分钟 | 240分钟 |
| P2 | 120分钟 | 480分钟 |
| P3 | 240分钟 | 1440分钟 |
| P4 | 480分钟 | 2880分钟 |

### 5.2 VIP站点

VIP站点可配置SLA倍数（默认1.5倍）

---

## 6. 权限矩阵

### 6.1 功能权限

| 功能 | admin | manager | engineer |
|------|-------|---------|----------|
| 登录/注册/登出 | ✓ | ✓ | ✓ |
| 创建工单 | ✓ | ✓ | ✗ |
| 编辑工单 | ✓ | ✓ | ✗ |
| 删除工单 | ✓ | ✗ | ✗ |
| 接受/拒绝工单 | ✗ | ✗ | ✓（分配） |
| 执行工单 | ✗ | ✗ | ✓（分配） |
| 确认工单 | ✓ | ✓ | ✗ |
| 用户管理 | ✓ | 创建/编辑 | ✗ |
| 站点管理 | ✓ | 创建/编辑 | ✗ |
| 模板管理 | ✓ | 创建/编辑 | ✗ |
| 分组管理 | ✓ | 创建/编辑 | ✗ |
| 系统配置 | ✓ | ✗ | ✗ |

---

## 7. 技术约束

### 7.1 后端技术栈

| 技术 | 说明 |
|------|------|
| 框架 | Spring Boot 3.x |
| 语言 | Java 17+ |
| ORM | MyBatis-Plus |
| 认证 | Spring Security + JWT |
| 数据库 | MySQL 8.0+ |
| 缓存 | Redis |

### 7.2 移动端技术栈

| 技术 | 说明 |
|------|------|
| 框架 | uniapp 3.x |
| 开发语言 | Vue.js 3 |
| 目标平台 | iOS / Android / H5 |
| UI组件 | uView UI / uni-ui |

### 7.3 管理后台技术栈

| 技术 | 说明 |
|------|------|
| 框架 | React 18+ |
| 语言 | TypeScript |
| 构建工具 | Vite |
| 样式 | Tailwind CSS |
| 组件库 | shadcn/ui |

### 7.4 文件存储

| 配置 | 说明 |
|------|------|
| 存储方式 | 本地存储或对象存储 |
| 文件大小限制 | 单文件最大20MB |
| 支持格式 | JPG, PNG, PDF |

---

**文档结束**

---

*本文档根据现有代码实现整理，v2.0版本*
