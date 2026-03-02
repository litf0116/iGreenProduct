# Draft: Template Data 重构 - 删除 stepData

## 背景

当前系统中 `stepData` 和 `templateData` 存在职责重叠：
- `stepData`: 存储用户填写的步骤数据
- `templateData`: 存储模板快照 + 前端也把值存这里

**问题**: 两边数据不同步，逻辑混乱，前端实际上已经在 `templateData` 中存储用户值。

## 确认方案

**统一使用 `templateData` 作为单一数据源**：
- 保留模板快照字段（id, name, type, steps 定义）
- 同时存储用户填写的数据（status, completed, timestamp, value）
- 删除 `stepData` 字段

## templateData 数据结构

```json
{
  "id": "template-001",
  "name": "设备维修模板",
  "type": "preventive",
  "steps": [
    {
      "id": "step-001",
      "name": "客户信息确认",
      "status": "completed",
      "completed": true,
      "timestamp": "2025-01-01T10:00:00",
      "fields": [
        {
          "id": "field-001",
          "name": "客户名称",
          "type": "TEXT",
          "required": true,
          "description": "...",
          "config": {...},
          "value": "张三"
        }
      ]
    }
  ]
}
```

## 数据字段分类

| 层级 | 模板快照字段 | 用户数据字段 |
|------|-------------|-------------|
| 模板级 | `id`, `name` | - |
| 步骤级 | `id`, `name` | `status`, `completed`, `timestamp` |
| 字段级 | `id`, `name`, `type`, `required`, `description`, `config` | `value` |

## 修改范围

### 后端文件
1. `Ticket.java` - 删除 stepData 字段
2. `TicketResponse.java` - 删除 stepValues 参数
3. `TicketUpdateRequest.java` - 删除 stepValues 参数
4. `TicketService.java` - 重构初始化和更新逻辑
5. `TicketController.java` - 简化接口
6. `TemplateStepValue.java` - 可删除（不再需要）
7. `TemplateFieldValue.java` - 可删除（不再需要）
8. `StepData.java` - 删除（已废弃）

### 数据库
- `tickets` 表删除 `step_data` 列

## 风险评估

- **低风险**: 前端已经在使用 templateData 存储值
- **需要注意**: 数据迁移（现有 stepData 数据需要合并到 templateData）

## Open Questions

- [ ] 是否需要保留历史数据的迁移脚本？
- [ ] 测试环境还是直接在生产环境测试？