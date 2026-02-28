# Draft: 工单表单字段需求调研

## 原始需求
客户反馈：小程序端不同类型的工单需要填写不同的表单项
关键词：表单上报、step、ticket、更新 step 数据

---

## 调研结果

### 后端定义的工单类型 (TicketType 枚举)

| 类型 | 枚举值 | 说明 |
|------|--------|------|
| 计划性维护 | PLANNED | 定期计划的维护工作 |
| 预防性维护 | PREVENTIVE | 预防性检查维护 |
| 纠正性维护 | CORRECTIVE | 故障修复 |
| 问题管理 | PROBLEM | 问题跟踪和解决 |

### 后端字段类型 (FieldType 枚举)

| 字段类型 | 枚举值 | 说明 |
|----------|--------|------|
| 文本 | TEXT | 普通文本输入 |
| 数字 | NUMBER | 数字输入 |
| 日期 | DATE | 日期选择 |
| 位置 | LOCATION | 地理位置定位 |
| 照片 | PHOTO | 图片上传 |
| 签名 | SIGNATURE | 手写签名 |

### 现有动态表单系统

**Template 模板结构**:
```
Template (模板)
└── TemplateStep[] (步骤列表)
    └── TemplateField[] (字段列表)
        ├── name: 字段名称
        ├── type: 字段类型 (TEXT/NUMBER/DATE/LOCATION/PHOTO/SIGNATURE)
        ├── required: 是否必填
        └── options: 选项配置 (JSON)
```

**关键文件路径**:
- `igreen-backend/src/main/java/com/igreen/domain/entity/Template.java`
- `igreen-backend/src/main/java/com/igreen/domain/entity/TemplateStep.java`
- `igreen-backend/src/main/java/com/igreen/domain/entity/TemplateField.java`
- `igreen-backend/src/main/java/com/igreen/domain/enums/FieldType.java`

---

### 前端当前表单实现 (TicketDetail.tsx)

#### 1. Corrective (纠正性维护) - 到达现场后表单
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| rootCause | Textarea | ✅ | 故障根本原因 |
| solution | Textarea | ✅ | 解决方案描述 |
| beforePhotoUrls | Photo[] | ✅ | 维修前照片(多张) |
| afterPhotoUrls | Photo[] | ✅ | 维修后照片(多张) |

#### 2. Planned (计划性维护) - 到达现场后表单
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| feedback | Textarea | ✅ | 维护反馈/备注 |
| feedbackPhotoUrls | Photo[] | ✅ | 维护照片(多张) |

#### 3. Problem (问题管理) - 到达现场后表单
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| solution | Textarea | ✅ | 解决方案/行动计划 |
| estimatedResolutionTime | Date | ✅ | 预计解决日期 |
| problemPhotoUrls | Photo[] | ✅ | 证据照片(多张) |

#### 4. Preventive (预防性维护) - 步骤检查表
每个步骤需要填写:
| 字段 | 类型 | 条件 | 说明 |
|------|------|------|------|
| status | Toggle | 必填 | pass/fail/na |
| photoUrls | Photo[] | status=pass | 证据照片 |
| cause | Textarea | status=fail | 故障原因 |
| beforePhotoUrls | Photo[] | status=fail | 维修前照片 |
| afterPhotoUrls | Photo[] | status=fail | 维修后照片 |

---

## 待确认问题

### 问题1: 具体需求澄清
客户说的"不同类型工单需要填写不同表单项"是指：
- [ ] A. 目前缺少某些工单类型的表单字段，需要新增？
- [ ] B. 现有表单字段不满足需求，需要修改？
- [ ] C. 需要支持动态配置表单字段，而非硬编码？
- [ ] D. 其他需求？

### 问题2: "step" 具体指什么？
- [ ] A. Preventive 维护的检查步骤？
- [ ] B. 工单流程状态 (open → assigned → departed → arrived → review → completed)？
- [ ] C. 需要新增的上报步骤？

---

## 管理员后台现状

**已有模板管理组件**: `igreen-front/src/components/TemplateManager.tsx`

✅ 支持功能：
- 创建/编辑/删除模板
- 添加/删除步骤 (TemplateStep)
- 添加/删除字段 (TemplateField)
- 字段类型选择：text/number/date/location/photo/signature
- 设置字段是否必填

---

## 核心工作范围 (基于用户确认)

用户确认:
- 需求类型: 将现有硬编码表单转换为动态配置
- "step" 含义: 检查步骤
- 需要管理员后台配置界面

### 需要做的事情：

1. **后端**: 确保 API 支持工单类型与模板关联
2. **前端(iGreenApp)**: 实现动态表单渲染器
   - 根据 TemplateStep/TemplateField 配置动态渲染表单
   - 替换现有的硬编码表单逻辑
3. **管理员后台**: 可能需要扩展模板管理
   - 模板与工单类型(TicketType)关联
   - 配置每种工单类型使用哪个模板

---

## 用户确认的决策

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 模板关联方式 | 创建工单时选择模板 | 从可用模板列表中手动选择 |
| 默认模板 | 自动生成 | 根据现有硬编码表单生成对应的默认模板配置 |
| 数据存储 | TemplateFieldValue 表 | 规范化存储每个字段的值 |
| Step 含义 | 检查步骤 | 类似 Preventive 维护的多步骤检查表 |

---

## 实体类结构 (已确认)

### TemplateStep
```java
public class TemplateStep {
    private String id;           // UUID
    private String name;         // 步骤名称
    private String description;  // 步骤描述
    private Integer sortOrder;   // 排序
    private List<TemplateField> fields;  // 字段列表
}
```

### TemplateField
```java
public class TemplateField {
    private String id;       // UUID
    private String name;     // 字段名称
    private FieldType type;  // TEXT/NUMBER/DATE/LOCATION/PHOTO/SIGNATURE
    private Boolean required; // 是否必填
    private String options;   // 选项配置(JSON)
}
```

---

## 清单检查 (Clearance Check)

- [x] 核心目标明确：将硬编码表单转换为动态配置系统
- [x] 范围边界确定：后端API + 前端动态渲染 + 管理后台扩展
- [x] 技术方案决定：使用 Template/TemplateStep/TemplateField 结构
- [x] 数据存储方式：TemplateFieldValue 表
- [ ] 测试策略待确认

---