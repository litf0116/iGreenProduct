# 工单状态管理系统优化工作计划

## TL;DR

> **目标**: 实施管理端与工程师端分离的状态视图系统，采用"单一数据源 + 计算派生"方案
> 
> **核心交付物**:
> - AdminTicketStatus 枚举（管理端状态）
> - 优化后的 Dashboard 筛选器（6个状态）
> - 重构的 TicketStatsResponse
> - 完整的前端状态映射
> 
> **实施范围**: 完整实施（后端 + 前端管理端 + 工程师端）
> **状态筛选器**: 简化为 6 个状态

---

## 背景

### 问题描述
当前系统存在状态定义不一致问题：
- 后端有 9 个工程师端状态
- 前端 Dashboard 筛选器只有 8 个（缺少 departed, arrived, review）
- 前端臆造了不存在的状态（in_progress, submitted）
- 管理端与工程师端状态混合使用，导致展示混乱

### 决策确认
1. **TicketStatsResponse**: 完全重构 - 使用新的 6 个状态
2. **Dashboard 筛选器**: 简化为 6 个管理端状态
3. **实施范围**: 完整实施（后端 + 前端管理端 + 工程师端）

---

## 状态映射设计

### 管理端状态（AdminTicketStatus）

| 管理端状态 | 工程师端原始状态 | 说明 |
|-----------|----------------|------|
| `open` | `OPEN` | 可抢单 |
| `accepted` | `ASSIGNED` | 已分配 |
| `in_process` | `ASSIGNED` + `ACCEPTED` + `DEPARTED` + `ARRIVED` | 进行中（复合） |
| `submitted` | `REVIEW` | 待审核 |
| `on_hold` | `ON_HOLD` | 暂停 |
| `closed` | `COMPLETED` + `CANCELLED` | 已关闭 |

### Dashboard 筛选器（6个状态）
```
open → accepted → in_process → submitted → on_hold → closed
```

---

## 实施范围

### 1. 后端 (igreen-backend)
- 新增 AdminTicketStatus 枚举
- 重构 TicketStatsResponse
- 优化 TicketService 统计逻辑
- 可选：添加管理端状态查询接口

### 2. 前端管理端 (igreen-front)
- 新增 AdminTicketStatus 类型
- 修复 Dashboard 筛选器（6个状态）
- 补充 i18n 翻译
- 更新 API 类型定义

### 3. 前端工程师端 (iGreenApp)
- 确认状态类型一致
- 补充 i18n 翻译

---

## 验证策略

### 测试决策
- **测试框架**: 使用项目现有测试框架（后端 JUnit，前端 Vitest）
- **测试策略**: 无自动化单元测试，依赖 Agent-Executed QA

### QA 策略
每个任务包含 Agent-Executed QA Scenarios：
- **API 测试**: 使用 curl 验证后端 API 响应
- **前端测试**: 使用 Playwright 验证 UI 状态显示
- **集成测试**: 验证前后端状态映射一致性

---

## 工作阶段

### Wave 1: 后端核心（立即可开始）
- 创建 AdminTicketStatus 枚举
- 重构 TicketStatsResponse

### Wave 2: 后端业务逻辑
- 优化 TicketService 统计逻辑
- 添加状态映射方法

### Wave 3: 前端类型定义
- 前端管理端 AdminTicketStatus 类型
- API 类型更新

### Wave 4: Dashboard UI
- 修复筛选器（6个状态）
- 状态显示组件更新

### Wave 5: 国际化
- 补充 i18n 翻译
- 工程师端翻译

### Wave 6: 验证
- API 验证
- UI 验证
- 集成验证

---

## 最终验证

实施完成后，验证：
1. Dashboard 筛选器显示 6 个状态
2. 统计数据与筛选结果一致
3. 前后端状态映射正确
4. 国际化显示完整
