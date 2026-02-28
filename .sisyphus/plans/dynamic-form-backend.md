# 动态表单后端实施计划

## 目标
扩展后端支持动态表单字段，特别是 ToggleGroup 类型和多值字段（PHOTOS）。

## 变更概览

### 1. FieldType.java - 添加新枚举值
**文件**: `igreen-backend/src/main/java/com/igreen/domain/enums/FieldType.java`

**修改内容**:
```java
public enum FieldType {
    TEXT,           // 单行/多行文本
    NUMBER,         // 数字
    DATE,           // 日期
    LOCATION,       // 位置
    PHOTO,          // 单张照片（向后兼容）
    PHOTOS,         // 多张照片（新增）
    SIGNATURE,      // 签名
    TOGGLE_GROUP;   // 三态选择（pass/fail/na）- 新增
    
    // ... 保持现有方法不变
}
```

### 2. TemplateFieldValue.java - 添加多值支持
**文件**: `igreen-backend/src/main/java/com/igreen/domain/entity/TemplateFieldValue.java`

**修改内容**:
```java
@Data
public class TemplateFieldValue extends TemplateField {
    private String value;           // 单值字段（TEXT, NUMBER, DATE, TOGGLE_GROUP）
    private List<String> values;    // 多值字段（PHOTOS）- 新增
}
```

### 3. TemplateField.java - 添加配置支持（可选）
**文件**: `igreen-backend/src/main/java/com/igreen/domain/entity/TemplateField.java`

**修改内容**:
```java
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateField {
    private String id;
    private String name;
    private FieldType type;
    private Boolean required;
    private String options;         // 选项JSON（用于TOGGLE_GROUP等）
    private String config;          // 额外配置JSON（新增，可选）
    
    public String getId() {
        if (StringUtils.isNotBlank(id)) {
            id = UUID.randomUUID().toString();
        }
        return id;
    }
}
```

### 4. 验证现有代码兼容性

**已支持的代码**（无需修改）:
- `TicketStepUpdateRequest.java` - 已有 `fieldValues` 字段
- `TemplateStepValue.java` - 已有 `fieldValues` 字段
- `TicketService.updateTicketStep()` - 已支持 fieldValues 的存储

**数据流验证**:
1. 前端发送 `fieldValues` 数组
2. `TicketStepUpdateRequest` 接收并绑定
3. `TicketService` 将 fieldValues 存入 stepData JSON
4. `TicketResponse` 将 stepData 返回给前端

## API 请求/响应示例

### 请求：更新步骤字段值
```json
PUT /api/tickets/{ticketId}/steps/{stepId}

{
  "completed": true,
  "status": "fail",
  "timestamp": "2025-03-01T10:30:00Z",
  "fieldValues": [
    {
      "id": "field-status",
      "name": "Inspection Result",
      "type": "TOGGLE_GROUP",
      "required": true,
      "value": "fail"
    },
    {
      "id": "field-cause",
      "name": "Failure Cause",
      "type": "TEXT",
      "required": true,
      "value": "Network module failure"
    },
    {
      "id": "field-before-photos",
      "name": "Before Photos",
      "type": "PHOTOS",
      "required": true,
      "values": ["url1", "url2"]
    }
  ]
}
```

### 存储的 stepData JSON
```json
[
  {
    "id": "step-1",
    "name": "Check MDB Cabinet",
    "completed": true,
    "status": "fail",
    "timestamp": "2025-03-01T10:30:00Z",
    "fieldValues": [
      {
        "id": "field-status",
        "name": "Inspection Result",
        "type": "TOGGLE_GROUP",
        "required": true,
        "value": "fail"
      },
      {
        "id": "field-cause",
        "name": "Failure Cause",
        "type": "TEXT",
        "required": true,
        "value": "Network module failure"
      },
      {
        "id": "field-before-photos",
        "name": "Before Photos",
        "type": "PHOTOS",
        "required": true,
        "values": ["url1", "url2"]
      }
    ]
  }
]
```

## 实施步骤

### Wave 1: 核心模型修改（可并行）

#### Task 1: 修改 FieldType 枚举
**文件**: `igreen-backend/src/main/java/com/igreen/domain/enums/FieldType.java`

**What to do**:
1. 添加 `PHOTOS` 枚举值
2. 添加 `TOGGLE_GROUP` 枚举值

**Acceptance Criteria**:
- [ ] FieldType 包含 PHOTOS 和 TOGGLE_GROUP
- [ ] 序列化时输出小写字符串（photos, toggle_group）
- [ ] 反序列化时能正确识别

**QA Scenarios**:
```
Scenario: 验证新枚举值
  Tool: Bash (Java test)
  Steps:
    1. 编译项目: mvn clean compile
    2. 运行简单测试: 
       FieldType tg = FieldType.TOGGLE_GROUP;
       assert tg.getValue().equals("toggle_group");
    3. FieldType parsed = FieldType.fromValue("photos");
       assert parsed == FieldType.PHOTOS;
  Expected: 编译通过，测试通过
  Evidence: .sisyphus/evidence/fieldtype-test.txt
```

#### Task 2: 修改 TemplateFieldValue
**文件**: `igreen-backend/src/main/java/com/igreen/domain/entity/TemplateFieldValue.java`

**What to do**:
1. 添加 `values` 字段（List<String>）

**Acceptance Criteria**:
- [ ] TemplateFieldValue 包含 values 字段
- [ ] values 字段能正确序列化为 JSON 数组
- [ ] 反序列化时能正确解析

**QA Scenarios**:
```
Scenario: 验证多值字段序列化
  Tool: Bash (Java test)
  Steps:
    1. 创建 TemplateFieldValue 对象
    2. 设置 values = ["url1", "url2"]
    3. 使用 ObjectMapper 序列化为 JSON
    4. 验证输出包含 "values":["url1","url2"]
  Expected: JSON 格式正确
  Evidence: .sisyphus/evidence/fieldvalue-serialization.txt
```

#### Task 3: 修改 TemplateField（可选）
**文件**: `igreen-backend/src/main/java/com/igreen/domain/entity/TemplateField.java`

**What to do**:
1. 添加 `config` 字段（String，JSON格式）

**Acceptance Criteria**:
- [ ] TemplateField 包含 config 字段
- [ ] 不影响现有功能

### Wave 2: 集成测试

#### Task 4: 编译验证
**What to do**:
1. 编译整个后端项目
2. 确保无编译错误

**Acceptance Criteria**:
- [ ] `mvn clean compile` 成功
- [ ] 无编译警告

**QA Scenarios**:
```
Scenario: 验证编译
  Tool: Bash
  Steps:
    1. cd igreen-backend
    2. mvn clean compile
  Expected: BUILD SUCCESS
  Evidence: .sisyphus/evidence/backend-compile.txt
```

#### Task 5: API 集成测试
**What to do**:
1. 启动后端服务
2. 使用 curl 测试步骤更新 API
3. 验证 fieldValues 能正确存储和读取

**Acceptance Criteria**:
- [ ] API 能接受包含 fieldValues 的请求
- [ ] stepData JSON 包含 fieldValues
- [ ] 响应包含正确的 fieldValues

**QA Scenarios**:
```
Scenario: 验证 API 存储 fieldValues
  Tool: Bash (curl)
  Steps:
    1. 登录获取 token: 
       curl -X POST http://localhost:8080/api/auth/login \
         -d '{"username":"engineer","password":"engineer123"}'
    
    2. 更新步骤字段值:
       curl -X PUT http://localhost:8080/api/tickets/1/steps/step-1 \
         -H "Authorization: Bearer $TOKEN" \
         -H "Content-Type: application/json" \
         -d '{
           "completed":true,
           "status":"fail",
           "fieldValues":[
             {"id":"field-status","type":"TOGGLE_GROUP","value":"fail"},
             {"id":"field-cause","type":"TEXT","value":"Test"}
           ]
         }'
    
    3. 查询工单验证:
       curl http://localhost:8080/api/tickets/1 \
         -H "Authorization: Bearer $TOKEN"
  
  Expected: 响应中包含 fieldValues 数组
  Evidence: .sisyphus/evidence/api-fieldvalues.json
```

## 回滚方案

如果出现问题：
1. 回滚 FieldType.java（移除 PHOTOS 和 TOGGLE_GROUP）
2. 回滚 TemplateFieldValue.java（移除 values 字段）
3. 重新编译部署

## 后续前端工作

后端完成后，前端需要：
1. 更新 TypeScript 类型定义
2. 创建 FieldRenderer 组件
3. 创建 ToggleGroupField 组件
4. 修改 TicketDetail 使用动态表单

## Commit Strategy

**Commit 1**: `feat(backend): add TOGGLE_GROUP and PHOTOS field types`
- FieldType.java, TemplateFieldValue.java
- 文件: `git diff igreen-backend/src/main/java/com/igreen/domain/enums/FieldType.java igreen-backend/src/main/java/com/igreen/domain/entity/TemplateFieldValue.java`

**Commit 2**: `feat(backend): add config field to TemplateField` (可选)
- TemplateField.java

---

## 执行命令

运行以下命令开始执行：
```bash
/start-work dynamic-form-backend
```

或者分步骤执行：
```bash
/start-work fieldtype-enum-update
/start-work templatefieldvalue-update
```
