# Template Data 重构执行计划 - 删除 stepData

## 目标
将 `stepData` 和 `templateData` 统一为单一数据源 `templateData`，删除冗余的 `stepData` 相关代码。

---

## 已完成 ✅

- [x] 创建 `TemplateData.java` 模型类
- [x] 创建 `TemplateStepData.java` 模型类
- [x] 创建 `TemplateFieldData.java` 模型类

---

## 需要手动修改的文件

### 1. Ticket.java
**文件路径**: `src/main/java/com/igreen/domain/entity/Ticket.java`

**修改内容**:
```java
// 删除这一行:
private String stepData;

// 保留这一行:
private String templateData;

// 删除自定义的 getter/setter（如果有的话）:
public String getTemplateData() { ... }
public void setTemplateData(String templateData) { ... }
```

**原因**: `@Data` 注解会自动生成 getter/setter，不需要手动定义。

---

### 2. TicketResponse.java
**文件路径**: `src/main/java/com/igreen/domain/dto/TicketResponse.java`

**修改内容**:
```java
// 删除这个 import:
import com.igreen.domain.entity.TemplateStepValue;

// 修改 record 声明，删除 stepValues 参数:
public record TicketResponse(
    @JsonSerialize(using = ToStringSerializer.class) Long id,
    String title,
    String description,
    String type,
    String status,
    String priority,
    String siteId,
    String siteName,
    String siteAddress,
    String templateId,
    String templateName,
    String assignedTo,
    String assignedToName,
    String createdBy,
    String createdByName,
    String createdAt,
    String updatedAt,
    String dueDate,
    List<String> completedSteps,
    // 删除: List<TemplateStepValue> stepValues,
    Map<String, Object> templateData,
    Boolean accepted,
    String acceptedAt,
    String acceptedUserId,
    String acceptedUserName,
    String departureAt,
    String departurePhoto,
    String arrivalAt,
    String arrivalPhoto,
    String completionPhoto,
    String cause,
    String solution,
    List<TicketCommentResponse> comments,
    List<String> relatedTicketIds,
    String problemType
) {}
```

---

### 3. TicketUpdateRequest.java
**文件路径**: `src/main/java/com/igreen/domain/dto/TicketUpdateRequest.java`

**修改内容**:
```java
// 删除这个 import:
import com.igreen.domain.entity.TemplateStepValue;

// 修改 record 声明，删除 stepValues 参数:
@JsonIgnoreProperties(ignoreUnknown = true)
public record TicketUpdateRequest(
    String title,
    String description,
    String type,
    String siteId,
    String status,
    String priority,
    String assignedTo,
    LocalDateTime dueDate,
    List<String> completedSteps,
    // 删除: List<TemplateStepValue> stepValues,
    Map<String, Object> templateData,
    LocalDateTime departureAt,
    String departurePhoto,
    LocalDateTime arrivalAt,
    String arrivalPhoto,
    String completionPhoto,
    String cause,
    String solution,
    List<String> relatedTicketIds
) {}
```

---

### 4. TicketService.java
**文件路径**: `src/main/java/com/igreen/domain/service/TicketService.java`

#### 4.1 删除 updateTicket 方法中的 stepValues 处理
**位置**: 约第 167-173 行

**删除这段代码**:
```java
if (request.stepValues() != null) {
    try {
        ticket.setStepData(objectMapper.writeValueAsString(request.stepValues()));
    } catch (JsonProcessingException e) {
        throw new BusinessException(ErrorCode.INVALID_REQUEST);
    }
}
```

#### 4.2 修改 arriveTicket 方法中的初始化调用
**位置**: 约第 344-347 行

**修改前**:
```java
if (ticket.getTemplateId() != null && (ticket.getStepData() == null || ticket.getStepData().isEmpty())) {
    initializeStepDataFromTemplate(ticket);
}
```

**修改后**:
```java
if (ticket.getTemplateId() != null && (ticket.getTemplateData() == null || ticket.getTemplateData().isEmpty())) {
    initializeTemplateData(ticket);
}
```

#### 4.3 修改 createTicket 方法中的初始化调用
**位置**: 约第 72-77 行

**修改前**:
```java
if (ticket.getTemplateId() != null) {
    initializeStepDataFromTemplate(ticket);
    // 更新工单以包含 stepData
    ticketMapper.updateById(ticket);
}
```

**修改后**:
```java
if (ticket.getTemplateId() != null) {
    initializeTemplateData(ticket);
    ticketMapper.updateById(ticket);
}
```

#### 4.4 重构 initializeStepDataFromTemplate 方法
**位置**: 约第 357-430 行

**完整替换为**:
```java
private void initializeTemplateData(Ticket ticket) {
    try {
        Template template = templateService.getTemplateById(ticket.getTemplateId());
        List<TemplateStep> templateSteps = template.getSteps();

        if (templateSteps != null && !templateSteps.isEmpty()) {
            List<TemplateStepData> steps = new ArrayList<>();

            for (TemplateStep step : templateSteps) {
                TemplateStepData stepData = TemplateStepData.builder()
                    .id(step.getId())
                    .name(step.getName())
                    .status("pending")
                    .completed(false)
                    .build();

                List<TemplateFieldData> fields = new ArrayList<>();
                if (step.getFields() != null) {
                    for (TemplateField field : step.getFields()) {
                        TemplateFieldData fieldData = TemplateFieldData.builder()
                            .id(field.getId())
                            .name(field.getName())
                            .type(field.getType())
                            .required(field.getRequired())
                            .description(field.getDescription())
                            .config(field.getConfig())
                            .value("")
                            .build();
                        fields.add(fieldData);
                    }
                }
                stepData.setFields(fields);
                steps.add(stepData);
            }

            TemplateData templateData = TemplateData.builder()
                .id(template.getId())
                .name(template.getName())
                .type(ticket.getType())
                .steps(steps)
                .build();

            ticket.setTemplateData(objectMapper.writeValueAsString(templateData));
            log.info("Initialized templateData for ticket {} from template {}",
                ticket.getId(), ticket.getTemplateId());
        }
    } catch (JsonProcessingException e) {
        log.error("Error initializing templateData for ticket {}", ticket.getId(), e);
    }
}
```

#### 4.5 删除 submitTicket 方法
**位置**: 约第 441-471 行

**删除整个方法**:
```java
@Transactional
public TicketResponse submitTicket(Long id, StepData stepData, String userId) {
    // ... 整个方法删除
}
```

#### 4.6 修改 toResponse 方法
**位置**: 约第 650-696 行

**删除这段代码** (约第 666-674 行):
```java
List<TemplateStepValue> stepValues = new ArrayList<>();
if (ticket.getStepData() != null && !ticket.getStepData().isEmpty()) {
    try {
        stepValues = objectMapper.readValue(ticket.getStepData(), new TypeReference<ArrayList<TemplateStepValue>>() {});
    } catch (JsonProcessingException e) {
        log.error("Error parsing step data", e);
    }
}
```

**修改 return 语句** (约第 692-695 行):
```java
// 删除 stepValues 参数
return new TicketResponse(
    ticket.getId(),
    ticket.getTitle(),
    ticket.getDescription(),
    ticket.getType() != null ? ticket.getType().toLowerCase() : null,
    ticket.getStatus() != null ? ticket.getStatus().toLowerCase() : null,
    ticket.getPriority(),
    site != null ? site.getId() : null,
    site != null ? site.getName() : null,
    site != null ? site.getAddress() : null,
    ticket.getTemplateId(),
    null,
    ticket.getAssignedTo(),
    assignGroup != null ? assignGroup.getName() : null,
    ticket.getCreatedBy(),
    creator != null ? creator.getName() : null,
    ticket.getCreatedAt() != null ? ticket.getCreatedAt().format(DATE_TIME_FORMATTER) : null,
    ticket.getUpdatedAt() != null ? ticket.getUpdatedAt().format(DATE_TIME_FORMATTER) : null,
    ticket.getDueDate() != null ? ticket.getDueDate().format(DATE_TIME_FORMATTER) : null,
    completedSteps,
    templateData,  // 保留
    ticket.getAccepted(),
    ticket.getAcceptedAt() != null ? ticket.getAcceptedAt().format(DATE_TIME_FORMATTER) : null,
    ticket.getAcceptedUserId(),
    acceptedUser != null ? acceptedUser.getName() : null,
    ticket.getDepartureAt() != null ? ticket.getDepartureAt().format(DATE_TIME_FORMATTER) : null,
    ticket.getDeparturePhoto(),
    ticket.getArrivalAt() != null ? ticket.getArrivalAt().format(DATE_TIME_FORMATTER) : null,
    ticket.getArrivalPhoto(),
    ticket.getCompletionPhoto(),
    ticket.getCause(),
    ticket.getSolution(),
    comments,
    relatedTicketIds,
    ticket.getProblemType()
);
```

#### 4.7 重构 updateTicketStep 方法
**位置**: 约第 699-734 行

**完整替换为**:
```java
@Transactional
public TicketResponse updateTicketStep(Long ticketId, String stepId, TicketStepUpdateRequest request, String userId) {
    Ticket ticket = ticketMapper.selectById(ticketId);
    if (ticket == null) {
        throw new BusinessException(ErrorCode.TICKET_NOT_FOUND);
    }

    // Parse templateData
    try {
        if (ticket.getTemplateData() != null && !ticket.getTemplateData().isEmpty()) {
            Map<String, Object> templateData = objectMapper.readValue(ticket.getTemplateData(), new TypeReference<Map<String, Object>>() {});
            List<Map<String, Object>> steps = (List<Map<String, Object>>) templateData.get("steps");

            if (steps != null) {
                for (Map<String, Object> step : steps) {
                    if (stepId.equals(step.get("id"))) {
                        step.put("status", request.getStatus());
                        step.put("completed", request.getCompleted());
                        step.put("timestamp", request.getTimestamp());
                        if (request.getFieldValues() != null) {
                            List<Map<String, Object>> fields = (List<Map<String, Object>>) step.get("fields");
                            if (fields != null) {
                                for (Map<String, Object> field : fields) {
                                    for (TemplateFieldValue fieldValue : request.getFieldValues()) {
                                        if (field.get("id").equals(fieldValue.getId())) {
                                            field.put("value", fieldValue.getValue());
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    }
                }
                ticket.setTemplateData(objectMapper.writeValueAsString(templateData));
            }
        }
    } catch (JsonProcessingException e) {
        log.error("Error updating step data", e);
        throw new BusinessException(ErrorCode.INTERNAL_ERROR);
    }

    ticketMapper.updateById(ticket);
    return getTicketById(ticketId);
}
```

---

### 5. TicketController.java
**文件路径**: `src/main/java/com/igreen/domain/controller/TicketController.java`

**修改内容**:
```java
// 删除这个 import:
import com.igreen.domain.dto.StepData;

// 删除这个方法 (约第 105-110 行):
@Operation(summary = "提交工单")
@PostMapping("/{id}/submit")
public ResponseEntity<Result<TicketResponse>> submitTicket(
    HttpServletRequest httpRequest,
    @PathVariable Long id,
    @Valid @RequestBody StepData stepData
) {
    String userId = getCurrentUserId(httpRequest);
    return ResponseEntity.ok(Result.success(ticketService.submitTicket(id, stepData, userId)));
}
```

---

### 6. 删除废弃文件
```bash
rm src/main/java/com/igreen/domain/entity/TemplateStepValue.java
rm src/main/java/com/igreen/domain/entity/TemplateFieldValue.java
rm src/main/java/com/igreen/domain/dto/StepData.java
```

---

### 7. 前端类型定义 (可选)
**文件路径**: `iGreenApp/src/lib/data.tsx`

**确保类型定义与后端一致** (已包含):
```typescript
export interface TicketTypeTemplateWithData {
  id: string;
  name: string;
  type: TicketType;
  steps: TemplateStepWithData[];
}

export interface TemplateStepWithData {
  id: string;
  name: string;
  fields: TemplateFieldValue[];
}

export interface TemplateFieldValue {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  description?: string;
  config?: Record<string, any>;
  value?: string | InspectionValue;
}
```

---

## 修改后验证步骤

1. 编译检查:
   ```bash
   mvn clean compile
   ```

2. 运行测试 (如果有):
   ```bash
   mvn test
   ```

3. 检查编译错误。

---

## 注意事项

⚠️ **数据库迁移**: `step_data` 列暂时保留在数据库中，后续需要时再删除。

⚠️ **Lombok**: 确保 `Ticket.java` 使用 `@Data` 注解自动生成 getter/setter，不要手动重复定义。

⚠️ **JSON 序列化**: `TemplateData`, `TemplateStepData`, `TemplateFieldData` 使用 Lombok 的 `@Data` 注解，Jackson 会自动序列化。

⚠️ **方法签名**: 删除方法后，确保没有其他地方调用这些方法。

---

## 完成后请执行

修改完成后，请告诉我，我会帮你验证编译是否通过。