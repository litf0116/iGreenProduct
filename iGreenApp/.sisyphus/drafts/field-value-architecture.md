# Draft: Field Value 动态存储架构改进

## 用户需求

**核心需求**：让每个 step 中的每个 field 直接存储其录入值 value，而不是通过字段映射到顶层。

**用户原话**：
> "我们这里每一个 step 中的每一个 field 中的表单项都是动态渲染的。根据动态渲染处理的表单。其表单的输入值也是动态的一个结构。我们这里针对 step 步骤表单项。我们在其中补充录入值 value 属性 这样我们针对每一field 记录其对应的值了"

---

## 当前架构分析

### 现有数据结构

**Ticket 数据模型** (`src/lib/data.tsx`):
```typescript
export interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  // ... 其他字段
  
  // 当前方案：字段存储在顶层
  rootCause?: string;          // corrective 专用
  solution?: string;           // corrective/problem 专用
  beforePhotoUrls?: string[];  // corrective 专用
  afterPhotoUrls?: string[];   // corrective 专用
  feedback?: string;           // planned 专用
  feedbackPhotoUrls?: string[];
  estimatedResolutionTime?: string;  // problem 专用
  problemPhotoUrls?: string[];
  
  steps?: TicketStep[];  // preventive 专用
}
```

**当前字段映射机制** (`src/config/fieldConfigs.ts`):
```typescript
// 动态字段 ID → 顶层字段名映射
export const FIELD_ID_TO_LEGACY_FIELD: Record<string, string> = {
  'field-root-cause': 'rootCause',
  'field-solution': 'solution',
  'field-before-photos': 'beforePhotoUrls',
  // ... 等等
};
```

### 现有问题

1. **字段分散存储**：
   - corrective 字段：rootCause, solution, beforePhotoUrls, afterPhotoUrls
   - planned 字段：feedback, feedbackPhotoUrls
   - problem 字段：solution, estimatedResolutionTime, problemPhotoUrls
   - preventive 字段：steps[] 数组

2. **字段名不一致**：
   - 前端：rootCause, estimatedResolutionTime
   - 后端：cause, dueDate

3. **类型混乱**：
   - corrective 和 problem 都用 solution 字段，但含义不同
   - 难以区分哪些字段属于哪个工单类型

4. **扩展性差**：
   - 新增字段需要修改 Ticket 接口
   - 不同工单类型的字段混在一起

---

## 新架构设计

### 目标架构

**核心理念**：field 自己存储 value，数据结构自包含。

```typescript
// 新的 TemplateField 接口（扩展现有）
export interface TemplateField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  description?: string;
  config?: Record<string, any>;
  
  // ✨ 新增：字段值存储
  value?: string;           // TEXT, DATE 类型
  values?: string[];        // PHOTOS 类型
}

// 新的 TemplateStepConfig 接口
export interface TemplateStepConfig {
  id: string;
  name: string;
  fields: TemplateField[];  // 每个 field 包含自己的 value
}

// 新的工单数据结构
export interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  type: TicketType;
  
  // ✨ 新增：统一的结构化数据存储
  formData?: {
    [stepId: string]: {
      [fieldId: string]: {
        value?: string;
        values?: string[];
        timestamp?: string;  // 最后更新时间
      }
    }
  };
  
  // 或者更简洁：直接存储 template 实例
  templateData?: TicketTypeTemplate;  // 包含所有 field 和其 value
}
```

### 数据流对比

**当前流程**：
```
用户输入 → field.id 
→ FIELD_ID_TO_LEGACY_FIELD 映射 
→ ticket[rootCause] = value
→ API: { rootCause: value }
```

**新流程**：
```
用户输入 → field.id
→ ticket.templateData.steps[0].fields.find(f => f.id === field.id).value = value
→ API: { templateData: { ... } }
```

---

## 影响范围评估

### 需要修改的文件

#### 前端 (iGreenApp)

1. **类型定义** (`src/lib/data.tsx`)
   - 扩展 TemplateField 接口，添加 value/values 字段
   - 修改 Ticket 接口，添加 formData 或 templateData 字段

2. **表单渲染** (`src/components/form/DynamicFieldRenderer.tsx`)
   - 修改读取逻辑：从 field.value 而非 ticket[rootCause]
   - 修改保存逻辑：直接更新 field.value

3. **Ticket Detail** (`src/components/TicketDetail.tsx`)
   - 移除 handleFieldChange 的字段映射逻辑
   - 修改 getFieldValue 从 field.value 读取
   - 修改 isFormComplete 从 field.value 检查

4. **API 客户端** (`src/lib/api.ts`)
   - transformTicket: 解析后端的 formData/templateData
   - updateTicket: 序列化 formData/templateData
   - 字段映射改为在 API 层处理（向后兼容）

5. **字段配置** (`src/config/fieldConfigs.ts`)
   - 可选：移除 FIELD_ID_TO_LEGACY_FIELD（如果完全迁移）

#### 后端 (igreen-backend)

1. **实体类** (`TicketEntity.java`)
   - 添加 formData 字段（JSON 类型）

2. **DTO** (`TicketUpdateRequest.java`)
   - 添加 formData 字段

3. **Mapper** (`TicketMapper.xml`)
   - 更新查询和更新语句

---

## 迁移策略

### 方案 A：渐进式迁移（推荐）

**优点**：向后兼容，风险低  
**缺点**：需要维护两套方案一段时间

**步骤**：
1. 添加新字段 `formData`，同时保留旧字段
2. 读取时优先从 `formData` 读取，fallback 到旧字段
3. 保存时同时更新两套数据
4. 数据迁移脚本：将旧字段数据迁移到 `formData`
5. 验证无误后，移除旧字段

### 方案 B：一次性迁移

**优点**：代码简洁，无历史包袱  
**缺点**：风险高，需要停机维护

**步骤**：
1. 数据库 schema 更新
2. 后端接口修改
3. 前端代码修改
4. 数据迁移脚本
5. 部署上线

---

## 技术决策点

### Q1: 数据存储格式？

**选项 1**：平铺结构
```typescript
formData: {
  "field-root-cause": { value: "xxx" },
  "field-solution": { value: "yyy" }
}
```

**选项 2**：层级结构（推荐）
```typescript
formData: {
  "step-maintenance": {
    "field-root-cause": { value: "xxx" },
    "field-solution": { value: "yyy" }
  }
}
```

**选项 3**：完整模板
```typescript
templateData: {
  id: "template-corrective",
  steps: [{
    id: "step-maintenance",
    fields: [
      { id: "field-root-cause", value: "xxx" },
      { id: "field-solution", value: "yyy" }
    ]
  }]
}
```

### Q2: 与后端 API 如何对接？

**选项 1**：前端适配层
- 前端用新结构，API 层转换成旧格式发给后端
- 后端无需改动

**选项 2**：后端适配
- 后端新增 formData 字段
- 前端直接发送新结构

### Q3: Preventive 类型的 steps 如何处理？

当前 preventive 使用独立的 steps[] 数组，每个 step 有 status、photos 等。

**选项**：统一到 formData
```typescript
formData: {
  "step-inspection": {
    "1": { value: "pass", photos: [...] },
    "2": { value: "fail", cause: "...", beforePhotos: [...], afterPhotos: [...] }
  }
}
```

---

## 待确认问题

1. **后端是否支持 JSON 字段存储？**  
   - 需要确认后端数据库类型（MySQL 支持 JSON 类型）

2. **是否需要保留旧字段以兼容其他系统？**  
   - 如管理后台、第三方集成等

3. **数据迁移的时机？**  
   - 立即迁移 / 读取时懒迁移 / 后台脚本迁移

4. **历史数据如何处理？**  
   - 是否需要迁移所有历史工单的数据

---

## 下一步行动

- [ ] 确认技术选型（数据格式、迁移方案）
- [ ] 与后端确认 API 改造方案
- [ ] 创建详细的工作计划
- [ ] 设计数据迁移脚本
- [ ] 实施前端改造
- [ ] 测试验证

---

**Draft 状态**: 初步分析完成，等待用户确认技术选型