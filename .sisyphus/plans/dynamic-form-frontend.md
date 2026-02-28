# 动态表单前端实施计划

## 目标
将 iGreenApp 中的硬编码表单改造为基于 JSON 配置的动态表单，支持后端的 Template Steps + Fields 结构。

## 分析：现有硬编码表单

### 1. Corrective Maintenance
```typescript
// 硬编码字段
rootCause: string;           // TEXT
solution: string;            // TEXT
beforePhotoUrls: string[];   // PHOTOS
afterPhotoUrls: string[];    // PHOTOS
```

### 2. Planned Maintenance
```typescript
feedback: string;            // TEXT
feedbackPhotoUrls: string[]; // PHOTOS
```

### 3. Problem Management
```typescript
solution: string;                    // TEXT
estimatedResolutionTime: string;     // DATE
problemPhotoUrls: string[];          // PHOTOS
```

### 4. Preventive Maintenance (ToggleGroup)
```typescript
// 每个步骤 (16个)
status: 'pass' | 'fail' | 'na';
// pass → photoUrls
// fail → cause + beforePhotoUrls + afterPhotoUrls
// na → 无
```

---

## 动态表单配置

### ToggleGroup 固定配置（硬编码）

```typescript
// src/config/fieldConfigs.ts

// =====================
// 1. Corrective Maintenance Template
// =====================
export const CORRECTIVE_TEMPLATE = {
  id: 'template-corrective',
  name: 'Corrective Maintenance',
  type: 'corrective',
  steps: [{
    id: 'step-maintenance',
    name: 'Maintenance Details',
    fields: [
      { id: 'field-root-cause', name: 'Root Cause', type: 'TEXT', required: true, config: { multiline: true } },
      { id: 'field-solution', name: 'Solution', type: 'TEXT', required: true, config: { multiline: true } },
      { id: 'field-before-photos', name: 'Before Photos', type: 'PHOTOS', required: true },
      { id: 'field-after-photos', name: 'After Photos', type: 'PHOTOS', required: true }
    ]
  }]
};

// =====================
// 2. Planned Maintenance Template
// =====================
export const PLANNED_TEMPLATE = {
  id: 'template-planned',
  name: 'Planned Maintenance',
  type: 'planned',
  steps: [{
    id: 'step-feedback',
    name: 'Maintenance Feedback',
    fields: [
      { id: 'field-feedback', name: 'Feedback / Notes', type: 'TEXT', required: true, config: { multiline: true } },
      { id: 'field-feedback-photos', name: 'Maintenance Photos', type: 'PHOTOS', required: true }
    ]
  }]
};

// =====================
// 3. Problem Management Template
// =====================
export const PROBLEM_TEMPLATE = {
  id: 'template-problem',
  name: 'Problem Management',
  type: 'problem',
  steps: [{
    id: 'step-resolution',
    name: 'Problem Resolution',
    fields: [
      { id: 'field-solution', name: 'Solution / Action Plan', type: 'TEXT', required: true, config: { multiline: true } },
      { id: 'field-estimated-resolution', name: 'Estimated Date for Resolution', type: 'DATE', required: true },
      { id: 'field-problem-photos', name: 'Evidence Photos', type: 'PHOTOS', required: true }
    ]
  }]
};

// =====================
// 4. Preventive ToggleGroup Config (Fixed)
// =====================
export const TOGGLE_GROUP_CONFIG = {
  options: [
    { value: 'pass', label: 'Pass', icon: 'ThumbsUp', color: 'green', conditionalFields: [
      { id: 'evidence', name: 'Evidence Photos', type: 'PHOTOS', required: true }
    ]},
    { value: 'fail', label: 'Not Pass', icon: 'ThumbsDown', color: 'red', conditionalFields: [
      { id: 'cause', name: 'Failure Cause', type: 'TEXT', required: true, config: { multiline: true } },
      { id: 'beforePhotos', name: 'Before Photos', type: 'PHOTOS', required: true },
      { id: 'afterPhotos', name: 'After Photos', type: 'PHOTOS', required: true }
    ]},
    { value: 'na', label: 'N/A', icon: 'MinusCircle', color: 'gray', conditionalFields: [] }
  ]
};
```

---

## 实施步骤

### Wave 1: 类型定义和配置（基础）

#### Task 1: 更新类型定义
**文件**: `iGreenApp/src/lib/data.tsx`

**修改内容**:
```typescript
// 字段类型枚举
export type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'PHOTOS' | 'TOGGLE_GROUP' | 'SIGNATURE';

// 字段定义
export interface TemplateField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  description?: string;
  config?: Record<string, any>;  // 额外配置
}

// 字段值（扩展支持多值）
export interface TemplateFieldValue extends TemplateField {
  value?: string;           // 单值
  values?: string[];        // 多值（PHOTOS）
}

// 修改 TicketStep
export interface TicketStep {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  status?: 'pass' | 'fail' | 'na';
  
  // 新增：动态字段值
  fieldValues?: TemplateFieldValue[];
  
  // 旧字段保留兼容
  photoUrls?: string[];
  beforePhotoUrls?: string[];
  afterPhotoUrls?: string[];
  cause?: string;
  timestamp?: string;
  location?: string;
}
```

**Acceptance Criteria**:
- [ ] TemplateField 和 TemplateFieldValue 类型定义完成
- [ ] TicketStep 包含 fieldValues 字段
- [ ] 保留旧字段兼容性

#### Task 2: 创建字段配置文件
**文件**: `iGreenApp/src/config/fieldConfigs.ts`（新建）

**内容**:
- TOGGLE_GROUP_CONFIG
- 字段类型组件映射

---

### Wave 2: 字段组件实现

#### Task 3: 创建 FieldRenderer 组件
**文件**: `iGreenApp/src/components/fields/FieldRenderer.tsx`（新建）

**功能**: 根据字段类型分发渲染对应组件

#### Task 4: 创建 ToggleGroupField 组件
**文件**: `iGreenApp/src/components/fields/ToggleGroupField.tsx`（新建）

**功能**: 
- 渲染 ToggleGroup (pass/fail/na)
- 根据选中值显示条件字段
- 使用固定配置 TOGGLE_GROUP_CONFIG

#### Task 5: 创建 PhotosField 组件
**文件**: `iGreenApp/src/components/fields/PhotosField.tsx`（新建）

**功能**: 封装 PhotoUploader 支持多张照片

#### Task 6: 创建 TextField 组件
**文件**: `iGreenApp/src/components/fields/TextField.tsx`（新建）

**功能**: 封装 Textarea，支持单行/多行

---

### Wave 3: 动态表单集成

#### Task 7: 创建 DynamicStepForm 组件
**文件**: `iGreenApp/src/components/DynamicStepForm.tsx`（新建）

**功能**:
- 接收 step 和 templateFields
- 渲染动态字段
- 管理字段值状态
- 处理字段变更

#### Task 8: 修改 TicketDetail 支持动态渲染
**文件**: `iGreenApp/src/components/TicketDetail.tsx`

**修改内容**:
- Preventive 类型使用 DynamicStepForm
- 保持其他类型现有逻辑（渐进迁移）

---

### Wave 4: API 层更新

#### Task 9: 更新 API 数据转换
**文件**: `iGreenApp/src/lib/api.ts`

**修改内容**:
- transformSteps 支持 fieldValues
- 提交数据包含 fieldValues

---

### Wave 5: 测试验证

#### Task 10: 编译验证
**命令**: `npm run build`

#### Task 11: 功能测试
- 验证 Preventive 表单正常工作
- 验证 ToggleGroup 条件字段显示/隐藏
- 验证数据提交正确

---

## 文件结构

```
iGreenApp/src/
├── config/
│   └── fieldConfigs.ts          # 新建：字段配置
├── components/
│   ├── fields/
│   │   ├── FieldRenderer.tsx    # 新建：字段分发器
│   │   ├── ToggleGroupField.tsx # 新建：ToggleGroup 字段
│   │   ├── PhotosField.tsx      # 新建：照片字段
│   │   └── TextField.tsx        # 新建：文本字段
│   ├── DynamicStepForm.tsx      # 新建：动态步骤表单
│   └── TicketDetail.tsx         # 修改：集成动态表单
└── lib/
    ├── data.tsx                 # 修改：类型定义
    └── api.ts                   # 修改：API转换
```

---

## Commit Strategy

**Commit 1**: `feat(frontend): add field type definitions and configs`
- data.tsx, fieldConfigs.ts

**Commit 2**: `feat(frontend): add field renderer components`
- FieldRenderer.tsx, ToggleGroupField.tsx, PhotosField.tsx, TextField.tsx

**Commit 3**: `feat(frontend): add DynamicStepForm component`
- DynamicStepForm.tsx

**Commit 4**: `feat(frontend): integrate dynamic form in TicketDetail`
- TicketDetail.tsx, api.ts

---

## 执行命令

```bash
/start-work dynamic-form-frontend
```