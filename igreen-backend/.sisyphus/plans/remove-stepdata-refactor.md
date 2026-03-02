# 重构计划：删除 stepData，统一使用 templateData

## TL;DR

> **目标**: 删除 `stepData` 字段，将所有工单步骤数据统一存储在 `templateData` 中
> 
> **原因**: 当前 `stepData` 和 `templateData` 职责重叠，前端已在 `templateData` 中存储值，造成数据不同步
>
> **影响范围**: 后端 7 个文件，前端 2 个文件，数据库 1 列

---

## Context

### 当前状态
- ✅ `Ticket.java` 已删除 `stepData` 字段
- ✅ `TicketUpdateRequest.java` 没有 `stepValues` 字段
- ⏳ `TicketResponse.java` 仍有 `stepValues` 字段需要删除
- ⏳ `TicketService.java` 需要重构初始化逻辑
- ⏳ 废弃文件需要删除

### 数据结构设计

**templateData 最终结构**:
```json
{
  "id": "template-001",
  "name": "设备维修模板",
  "type": "preventive",
  "steps": [
    {
      "id": "step-001",
      "name": "客户信息确认",
      "status": "pending",
      "completed": false,
      "timestamp": null,
      "fields": [
        {
          "id": "field-001",
          "name": "客户名称",
          "type": "TEXT",
          "required": true,
          "value": ""
        }
      ]
    }
  ]
}
```

---

## TODOs

### - [ ] 1. 更新 TicketResponse.java 删除 stepValues

**文件**: `src/main/java/com/igreen/domain/dto/TicketResponse.java`

**当前代码**:
```java
import com.igreen.domain.entity.TemplateStepValue;

public record TicketResponse(
    // ... 其他字段 ...
    List<TemplateStepValue> stepValues,  // 删除这行
    Map<String, Object> templateData,
    // ... 其他字段 ...
) {}
```

**修改为**:
```java
// 删除 TemplateStepValue import

public record TicketResponse(
    // ... 其他字段 ...
    Map<String, Object> templateData,  // 只保留这个
    // ... 其他字段 ...
) {}
```

---

### - [ ] 2. 重构 TicketService.java 初始化逻辑

**文件**: `src/main/java/com/igreen/domain/service/TicketService.java`

**需要修改的方法**: `initializeStepDataFromTemplate()`

**修改前** (当前逻辑):
```java
private void initializeStepDataFromTemplate(Ticket ticket) {
    // 创建 stepData (List<TemplateStepValue>)
    // 创建 templateData (Map<String, Object>)
    // 分别设置到 ticket
}
```

**修改后** (简化逻辑):
```java
private void initializeStepDataFromTemplate(Ticket ticket) {
    Template template = templateService.getTemplateById(ticket.getTemplateId());
    List<TemplateStep> templateSteps = template.getSteps();
    
    Map<String, Object> templateData = new HashMap<>();
    templateData.put("id", template.getId());
    templateData.put("name", template.getName());
    templateData.put("type", ticket.getType());
    
    List<Map<String, Object>> steps = new ArrayList<>();
    for (TemplateStep step : templateSteps) {
        Map<String, Object> stepMap = new HashMap<>();
        stepMap.put("id", step.getId());
        stepMap.put("name", step.getName());
        stepMap.put("status", "pending");
        stepMap.put("completed", false);
        stepMap.put("timestamp", null);
        
        List<Map<String, Object>> fields = new ArrayList<>();
        for (TemplateField field : step.getFields()) {
            Map<String, Object> fieldMap = new HashMap<>();
            fieldMap.put("id", field.getId());
            fieldMap.put("name", field.getName());
            fieldMap.put("type", field.getType());
            fieldMap.put("required", field.getRequired());
            fieldMap.put("description", field.getDescription());
            fieldMap.put("config", field.getConfig());
            fieldMap.put("value", "");
            fields.add(fieldMap);
        }
        stepMap.put("fields", fields);
        steps.add(stepMap);
    }
    templateData.put("steps", steps);
    
    ticket.setTemplateData(objectMapper.writeValueAsString(templateData));
}
```

**同时删除**:
- `updateTicketStep()` 方法中对 `stepData` 的操作
- 所有 `TemplateStepValue` 和 `TemplateFieldValue` 的引用

---

### - [ ] 3. 更新 TicketService.java 中 buildTicketResponse 方法

**修改**:
```java
private TicketResponse buildTicketResponse(Ticket ticket, ...) {
    // 删除 stepValues 相关逻辑
    // 只保留 templateData
}
```

---

### - [ ] 4. 删除废弃的实体类

**需要删除的文件**:
1. `src/main/java/com/igreen/domain/entity/TemplateStepValue.java`
2. `src/main/java/com/igreen/domain/entity/TemplateFieldValue.java`
3. `src/main/java/com/igreen/domain/entity/StepData.java` (如果存在)

**检查方式**:
```bash
# 检查这些文件是否还被引用
grep -r "TemplateStepValue" src/
grep -r "TemplateFieldValue" src/
grep -r "StepData" src/
```

---

### - [ ] 5. 更新前端类型定义

**文件**: `iGreenApp/src/lib/data.tsx`

**修改 Ticket 类型**:
```typescript
export interface Ticket {
  // ... 其他字段 ...
  templateData: {
    id: string;
    name: string;
    type: string;
    steps: TemplateDataStep[];
  } | null;
  // 删除: stepValues?: TemplateStepValue[];
}

export interface TemplateDataStep {
  id: string;
  name: string;
  status: 'pending' | 'completed' | 'fail' | 'pass';
  completed: boolean;
  timestamp: string | null;
  fields: TemplateDataField[];
}

export interface TemplateDataField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  description?: string;
  config?: Record<string, any>;
  value: any;
}
```

---

### - [ ] 6. 验证编译和测试

**后端**:
```bash
cd igreen-backend
mvn clean compile
mvn test
```

**前端**:
```bash
cd iGreenApp
npm run build
```

---

### - [ ] 7. 数据库迁移（可选）

**如果有现有数据需要迁移**:
```sql
-- 备份现有数据
CREATE TABLE tickets_backup AS SELECT * FROM tickets;

-- 删除 step_data 列（如果存在）
ALTER TABLE tickets DROP COLUMN IF EXISTS step_data;
```

---

## 验证策略

### 测试场景

1. **创建工单测试**
   - 创建带模板的预防性维护工单
   - 验证 templateData 正确初始化
   - 验证 steps 结构完整

2. **更新字段测试**
   - 工程师填写表单字段
   - 验证 value 正确存储在 templateData 中

3. **查询工单测试**
   - 获取工单详情
   - 验证返回的 templateData 结构正确

---

## Commit Strategy

```
refactor(ticket): remove stepData field, unify to templateData

- Remove stepData field from Ticket entity
- Remove stepValues from TicketResponse
- Refactor TicketService to use templateData only
- Delete deprecated TemplateStepValue and TemplateFieldValue classes
- Update frontend types to match new structure

Breaking change: API response no longer includes stepValues
```

---

## Success Criteria

- [ ] 后端编译通过 (`mvn clean compile`)
- [ ] 后端测试通过 (`mvn test`)
- [ ] 前端构建通过 (`npm run build`)
- [ ] 创建工单时 templateData 正确初始化
- [ ] 更新字段时 templateData 正确更新
- [ ] 查询工单时返回完整的 templateData