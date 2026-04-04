# 测试数据记录

> 生成时间: 2026-04-04
> 后端地址: http://localhost:8089
> 数据库: 43.255.212.68:3306/igreen_db

## 账号信息

| 用户名 | 密码 | 角色 | 区域 | 用途 | 用户ID |
|--------|------|------|------|------|--------|
| admin | admin123 | ADMIN | CN | Web 管理端 (igreen-front) | 59d30476-19f4-4a9a-a625-2c9542fbe851 |
| litengfei | ltf123 | ENGINEER | CN | 工程师 App (iGreenApp) | 388828bd-9ff7-48d5-96d5-930b72260327 |

## 登录方式

### Web 管理端 (igreen-front)
```bash
POST http://localhost:8089/api/auth/login
{
  "username": "admin",
  "password": "admin123",
  "country": "China"
}
```

### 工程师 App (iGreenApp)
```bash
POST http://localhost:8089/api/auth/login
{
  "username": "litengfei",
  "password": "ltf123",
  "country": "China",
  "platform": "app"
}
```

> ⚠️ 工程师登录必须传 `"platform": "app"`，否则返回 "管理端仅允许管理员账号登录"

## 基础数据

### 组
| 名称 | ID |
|------|-----|
| 测试维护组 | a22c80fb-f69a-47de-8653-beb1d0ef4124 |

### 站点
| 名称 | ID | 级别 |
|------|-----|------|
| 测试站点 | 41acdc79-79d5-44cf-9e0c-9e171b9d7ad1 | L1 |

### 模板 (CN 区域)
| 名称 | 类型 | ID | 步骤数 |
|------|------|-----|--------|
| CN Corrective Maintenance | CORRECTIVE | e7c74137-6721-4184-a75d-d872ea1cf898 | 3 (故障诊断、维修执行、测试验证) |
| CN Preventive Maintenance | PREVENTIVE | 18f9844d-0d9e-4449-abb0-e00aa7e9f507 | 3 (设备检查、清洁保养、功能测试) |
| CN Planned Maintenance | PLANNED | e5e7761d-4e60-421e-9d2f-e8d8306c080e | 2 (计划确认、执行维护) |

## 测试工单

| # | 标题 | 类型 | 优先级 | 模板 | 工单ID | 状态 |
|---|------|------|--------|------|--------|------|
| 1 | 充电桩 #405 离线 - 市中心广场 | CORRECTIVE | P1 | Corrective | 2040384967763935233 | ✅ completed (100%) |
| 2 | 充电枪 B 损坏 - 高速服务区12 | CORRECTIVE | P2 | Corrective | 2040384970972577794 | ✅ completed (100%) |
| 3 | 季度预防性维护 - 城市商场 L2 | PREVENTIVE | P3 | Preventive | 2040384974055391234 | ✅ completed (100%) |
| 4 | 4G 调制解调器升级 - 西区公园 | PLANNED | P3 | Planned | 2040384977012375553 | ✅ completed (100%) |
| 5 | 支付终端卡死 - 中央车站 | CORRECTIVE | P2 | Corrective | 2040384980317487106 | ✅ completed (100%) |

## 工单流程 API

### 工程师操作流程

```bash
TOKEN="<工程师登录获取的accessToken>"
TICKET_ID="<工单ID>"

# 1. Accept 接受工单
POST /api/tickets/{id}/accept
{"comment": "接受工单"}

# 2. Depart 出发
POST /api/tickets/{id}/depart
{}

# 3. Arrive 到达现场
POST /api/tickets/{id}/arrive
{}

# 4. Submit for Review 提交审核（提交完整的 templateData）
POST /api/tickets/{id}/submit-for-review
{
  "id": "<模板ID>",
  "name": "<模板名称>",
  "type": "<类型>",
  "steps": [
    {
      "id": "step-1",
      "name": "步骤名称",
      "status": "pass",
      "completed": true,
      "fields": [
        {"name": "字段名", "type": "TEXT", "required": true, "value": "填写的值"}
      ]
    }
  ]
}
```

### 管理员操作流程

```bash
TOKEN="<管理员登录获取的accessToken>"

# 审核通过（不传 body）
POST /api/tickets/{id}/review
# 无 body → 状态变为 completed

# 审核拒绝（传 cause 字符串）
POST /api/tickets/{id}/review
"退回原因"  # 状态回退到 arrived
```

### 状态流转

```
open → accepted → departed → arrived → review → completed
                                            ↓
                                      (拒绝) arrived
```

## 进度修复说明

### 问题
- `Ticket.java` 中 `templateData` 标记为 `@TableField(exist = false)` 导致无法保存到数据库
- `TemplateData/TemplateStepData/TemplateFieldData` 缺少 `@JsonIgnoreProperties(ignoreUnknown = true)` 导致 JSON 解析失败

### 修复文件
- `igreen-backend/.../entity/Ticket.java` - 移除 `@TableField(exist = false)`
- `igreen-backend/.../entity/TemplateData.java` - 添加 `@JsonIgnoreProperties(ignoreUnknown = true)`
- `igreen-backend/.../entity/TemplateStepData.java` - 添加 `@JsonIgnoreProperties(ignoreUnknown = true)`
- `igreen-backend/.../entity/TemplateFieldData.java` - 添加 `@JsonIgnoreProperties(ignoreUnknown = true)`
- `iGreenApp/src/lib/data.tsx` - 添加进度字段到 Ticket 接口
- `iGreenApp/src/lib/api.ts` - 映射后端进度字段
- `iGreenApp/src/components/TicketDetail.tsx` - 使用后端进度数据
