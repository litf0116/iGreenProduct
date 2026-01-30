# 颜色体系迁移计划

## 目标
将 iGreenApp 的 CSS 变量颜色体系完整迁移到 uni-app (igreen-uniapp) 的 SCSS 变量系统中。

## 上下文

### 原始请求
用户希望将 igreen-uniapp 的颜色系统迁移为与 iGreenApp 一致。iGreenApp 使用 CSS 变量，igreen-uniapp 使用 SCSS 变量。

### 迁移原因
- iGreenApp 已完成颜色系统设计
- 两个应用需要视觉一致性
- iGreenApp 的颜色系统更加语义化

### 研究发现
- iGreenApp: 主色 `#030213` (黑色)，强调色 `#e9ebef` (浅灰)
- igreen-uniapp: 主色 `#0d9488` (青色)
- 主要差异在主色调和强调色系

---

## 工作目标

### 核心目标
统一两个应用的颜色系统，使 igreen-uniapp 与 iGreenApp 保持一致

### 具体可交付成果
- 新的 `src/uni.scss` 文件（完整颜色体系）
- 更新的 Vue 组件（使用新颜色变量）

### 完成定义
- Sass 编译无错误
- 登录页视觉与 iGreenApp 一致
- Dashboard 卡片样式与 iGreenApp 一致
- 所有 Badge 组件样式一致

### 必须包含
- 核心语义化颜色（background, foreground, card, popover）
- 主色系（primary, primary-foreground）
- 次要色系（secondary, secondary-foreground）
- 强调色系（accent, accent-foreground）
- 破坏性操作颜色（destructive, destructive-foreground）
- 中性色系（muted, muted-foreground）
- 边框和输入颜色（border, input, input-background）
- 侧边栏颜色（sidebar 相关）
- 图表颜色（chart-1 到 chart-5）
- 暗色模式变量

### 明确排除
- 不修改 iGreenApp 的颜色系统
- 不修改后端 API
- 不修改业务逻辑

---

## 验证策略

用户明确选择 **手动 QA 验证**，因为没有配置测试框架。

### 验证方式
**H5 开发服务器验证**
- 使用 Playwright 浏览器自动化
- 验证页面视觉效果

### 验收标准

#### 对于每个任务，手动验证包括：
- Sass 编译通过（查看终端输出）
- H5 页面正常显示（浏览器访问 http://localhost:5173）
- 颜色与 iGreenApp 一致（对比截图）

#### 最终验证命令：
```bash
cd igreen-uniapp
npm run dev:h5  # 启动 H5 开发服务器
# 浏览器访问 http://localhost:5173
# 手动对比与 iGreenApp 的颜色一致性
```

---

## 任务流程

```
任务 1: 重写 uni.scss 颜色体系
  ↓
任务 2: 更新 Button.vue
  ↓
任务 3: 更新 Card.vue
  ↓
任务 4: 更新 Input.vue
  ↓
任务 5: 更新 Badge.vue
  ↓
任务 6: 更新 StatusBadge.vue
  ↓
任务 7: 更新 PriorityBadge.vue
  ↓
任务 8: 更新 TypeBadge.vue
  ↓
任务 9: 更新 App.vue
  ↓
任务 10: 更新 login/index.vue
  ↓
任务 11: 更新 dashboard/index.vue
```

### 并行化
任务 2-8 可以并行执行（相互独立）
任务 9-11 顺序执行（依赖颜色变量）

---

## TODO 列表

- [ ] 1. 重写 uni.scss 颜色体系

  **具体操作**：
  1. 备份现有 `src/uni.scss` 到 `src/uni.scss.backup`
  2. 创建新的 `src/uni.scss` 文件，内容如下：

  ```scss
  // ============================================
  // 1. Color Variables (Light Mode)
  // ============================================

  // Core semantic colors
  $background: #ffffff;
  $foreground: oklch(0.145 0 0);
  $card: #ffffff;
  $card-foreground: oklch(0.145 0 0);
  $popover: oklch(1 0 0);
  $popover-foreground: oklch(0.145 0 0);

  // Primary
  $primary: #030213;
  $primary-foreground: oklch(1 0 0);

  // Secondary
  $secondary: oklch(0.95 0.0058 264.53);
  $secondary-foreground: #030213;

  // Accent
  $accent: #e9ebef;
  $accent-foreground: #030213;

  // Destructive
  $destructive: #d4183d;
  $destructive-foreground: #ffffff;

  // Muted/Gray
  $muted: #ececf0;
  $muted-foreground: #717182;

  // Border & Input
  $border: rgba(0, 0, 0, 0.1);
  $input: transparent;
  $input-background: #f3f3f5;
  $switch-background: #cbced4;

  // Ring
  $ring: oklch(0.708 0 0);

  // ============================================
  // 2. Dark Mode Variables
  // ============================================
  $background-dark: oklch(0.145 0 0);
  $foreground-dark: oklch(0.985 0 0);
  $card-dark: oklch(0.145 0 0);
  $card-foreground-dark: oklch(0.985 0 0);
  $primary-dark: oklch(0.985 0 0);
  $primary-foreground-dark: oklch(0.205 0 0);
  $secondary-dark: oklch(0.269 0 0);
  $secondary-foreground-dark: oklch(0.985 0 0);
  $accent-dark: oklch(0.269 0 0);
  $accent-foreground-dark: oklch(0.985 0 0);
  $destructive-dark: oklch(0.396 0.141 25.723);
  $destructive-foreground-dark: oklch(0.637 0.237 25.331);
  $muted-dark: oklch(0.269 0 0);
  $muted-foreground-dark: oklch(0.708 0 0);
  $border-dark: oklch(0.269 0 0);

  // ============================================
  // 3. Sidebar Variables
  // ============================================
  $sidebar: oklch(0.985 0 0);
  $sidebar-foreground: oklch(0.145 0 0);
  $sidebar-primary: #030213;
  $sidebar-primary-foreground: oklch(0.985 0 0);
  $sidebar-accent: oklch(0.97 0 0);
  $sidebar-accent-foreground: oklch(0.205 0 0);
  $sidebar-border: oklch(0.922 0 0);

  // ============================================
  // 4. Chart Colors
  // ============================================
  $chart-1: oklch(0.646 0.222 41.116);
  $chart-2: oklch(0.6 0.118 184.704);
  $chart-3: oklch(0.398 0.07 227.392);
  $chart-4: oklch(0.828 0.189 84.429);
  $chart-5: oklch(0.769 0.188 70.08);

  // ============================================
  // 5. Border Radius
  // ============================================
  $radius: 0.625rem;  // 10px
  $radius-sm: 0.375rem;  // 6px
  $radius-md: 0.5rem;  // 8px
  $radius-lg: 0.625rem;  // 10px
  $radius-xl: 0.75rem;  // 12px

  // ============================================
  // 6. Font Weights
  // ============================================
  $font-weight-normal: 400;
  $font-weight-medium: 500;

  // ============================================
  // 7. Utility Classes
  // ============================================
  .bg-background { background-color: $background; }
  .bg-card { background-color: $card; }
  .bg-primary { background-color: $primary; }
  .bg-accent { background-color: $accent; }
  .bg-muted { background-color: $muted; }
  .bg-destructive { background-color: $destructive; }

  .text-foreground { color: $foreground; }
  .text-muted-foreground { color: $muted-foreground; }
  .text-primary { color: $primary; }
  .text-destructive { color: $destructive; }

  .border { border: 1px solid $border; }
  .rounded-md { border-radius: $radius-md; }
  .rounded-lg { border-radius: $radius-lg; }
  ```

  **并行化**: NO（基础文件，需要优先）

  **引用**:
  - `iGreenApp/src/styles/globals.css:1-100` - 颜色系统参考

  **验收标准**:
  - [ ] 文件 `src/uni.scss.backup` 存在
  - [ ] 文件 `src/uni.scss` 存在并包含新颜色变量
  - [ ] Sass 编译通过（运行 `cd igreen-uniapp && npm run dev:h5` 查看终端输出）
  - [ ] H5 页面 http://localhost:5173 能正常访问

- [ ] 2. 更新 Button.vue 使用新颜色

  **具体操作**：
  编辑 `src/components/ui/Button.vue`
  
  查找并替换：
  - `$primary-bg` → `$primary`
  - `$primary-color` → `$primary`
  - `$white` → `$primary-foreground` 或 `$card-foreground`
  - `$text-light` → `$foreground`

  **并行化**: YES（独立组件）

  **引用**:
  - `src/components/ui/Button.vue` - 目标文件
  - `uni.scss` - 新颜色变量定义

  **验收标准**:
  - [ ] Button 组件使用 `$primary` 作为背景色
  - [ ] Button 组件使用 `$primary-foreground` 作为文字色
  - [ ] Sass 编译通过
  - [ ] 按钮样式与 iGreenApp 一致

- [ ] 3. 更新 Card.vue 使用新颜色

  **具体操作**：
  编辑 `src/components/ui/Card.vue`
  
  查找并替换：
  - `$white` → `$card`
  - `$gray-100` → `$muted`
  - `$text-color` → `$card-foreground`

  **并行化**: YES（独立组件）

  **引用**:
  - `src/components/ui/Card.vue` - 目标文件
  - `uni.scss` - 新颜色变量定义

  **验收标准**:
  - [ ] Card 组件使用 `$card` 作为背景
  - [ ] Card 组件使用 `$card-foreground` 作为文字色
  - [ ] Sass 编译通过
  - [ ] 卡片样式与 iGreenApp 一致

- [ ] 4. 更新 Input.vue 使用新颜色

  **具体操作**：
  编辑 `src/components/ui/Input.vue`
  
  查找并替换：
  - `$input-bg` → `$input-background`
  - `$border-color` → `$border`
  - `$text-muted` → `$muted-foreground`

  **并行化**: YES（独立组件）

  **引用**:
  - `src/components/ui/Input.vue` - 目标文件
  - `uni.scss` - 新颜色变量定义

  **验收标准**:
  - [ ] Input 组件使用 `$input-background` 作为背景
  - [ ] Input 组件使用 `$border` 作为边框
  - [ ] Sass 编译通过
  - [ ] 输入框样式与 iGreenApp 一致

- [ ] 5. 更新 Badge.vue 使用新颜色

  **具体操作**：
  编辑 `src/components/ui/Badge.vue`
  
  查找并替换颜色变量为语义化颜色

  **并行化**: YES（独立组件）

  **引用**:
  - `src/components/ui/Badge.vue` - 目标文件
  - `uni.scss` - 新颜色变量定义

  **验收标准**:
  - [ ] Badge 组件使用语义化颜色变量
  - [ ] Sass 编译通过
  - [ ] Badge 样式与 iGreenApp 一致

- [ ] 6. 更新 StatusBadge.vue 使用新颜色

  **具体操作**：
  编辑 `src/components/tickets/StatusBadge.vue`
  
  根据状态类型映射颜色：
  - open → `$primary`
  - assigned → `$chart-1`
  - departed → `$chart-2`
  - arrived → `$chart-3`
  - review → `$chart-4`
  - completed → `$muted-foreground`

  **并行化**: YES（独立组件）

  **引用**:
  - `src/components/tickets/StatusBadge.vue` - 目标文件
  - `uni.scss` - 新颜色变量定义

  **验收标准**:
  - [ ] StatusBadge 使用 `$chart-*` 系列颜色
  - [ ] Sass 编译通过
  - [ ] 状态徽章样式与 iGreenApp 一致

- [ ] 7. 更新 PriorityBadge.vue 使用新颜色

  **具体操作**：
  编辑 `src/components/tickets/PriorityBadge.vue`
  
  根据优先级映射颜色：
  - urgent → `$destructive`
  - high → `$destructive-foreground`
  - medium → `$warning-600`
  - low → `$muted-foreground`

  **并行化**: YES（独立组件）

  **引用**:
  - `src/components/tickets/PriorityBadge.vue` - 目标文件
  - `uni.scss` - 新颜色变量定义

  **验收标准**:
  - [ ] PriorityBadge 使用 `$destructive`, `$warning-600` 等颜色
  - [ ] Sass 编译通过
  - [ ] 优先级徽章样式与 iGreenApp 一致

- [ ] 8. 更新 TypeBadge.vue 使用新颜色

  **具体操作**：
  编辑 `src/components/tickets/TypeBadge.vue`
  
  根据工单类型映射颜色

  **并行化**: YES（独立组件）

  **引用**:
  - `src/components/tickets/TypeBadge.vue` - 目标文件
  - `uni.scss` - 新颜色变量定义

  **验收标准**:
  - [ ] TypeBadge 使用语义化颜色
  - [ ] Sass 编译通过
  - [ ] 类型徽章样式与 iGreenApp 一致

- [ ] 9. 更新 App.vue 使用新颜色

  **具体操作**：
  编辑 `src/App.vue`
  
  查找并替换颜色变量使用

  **并行化**: NO（依赖 uni.scss）

  **引用**:
  - `src/App.vue` - 目标文件
  - `uni.scss` - 新颜色变量定义

  **验收标准**:
  - [ ] App.vue 使用新的语义化颜色变量
  - [ ] Sass 编译通过

- [ ] 10. 更新 login/index.vue 使用新颜色

  **具体操作**：
  编辑 `src/pages/login/index.vue`
  
  重点更新：
  - 登录按钮使用 `$primary` 和 `$primary-foreground`
  - 卡片背景使用 `$card`
  - 输入框使用 `$input-background`

  **并行化**: NO（依赖 uni.scss）

  **引用**:
  - `src/pages/login/index.vue` - 目标文件
  - `uni.scss` - 新颜色变量定义

  **验收标准**:
  - [ ] 登录页使用 `$primary` 作为主按钮颜色
  - [ ] 登录卡片使用 `$card` 背景
  - [ ] Sass 编译通过
  - [ ] 登录页视觉与 iGreenApp 一致（对比截图）

- [ ] 11. 更新 dashboard/index.vue 使用新颜色

  **具体操作**：
  编辑 `src/pages/dashboard/index.vue`
  
  查找并替换颜色变量使用

  **并行化**: NO（依赖 uni.scss）

  **引用**:
  - `src/pages/dashboard/index.vue` - 目标文件
  - `uni.scss` - 新颜色变量定义

  **验收标准**:
  - [ ] Dashboard 使用语义化颜色变量
  - [ ] Sass 编译通过
  - [ ] Dashboard 视觉与 iGreenApp 一致（对比截图）

---

## 提交策略

| 在任务之后 | 消息 | 文件 | 验证 |
|------------|------|------|------|
| 1 | `refactor(uniapp): 迁移颜色系统为 iGreenApp 风格` | uni.scss, uni.scss.backup | npm run dev:h5 |

---

## 成功标准

### 最终验证命令
```bash
cd /Users/mac/workspace/iGreenProduct/igreen-uniapp
npm run dev:h5
# 浏览器访问 http://localhost:5173
# 手动对比与 iGreenApp 的颜色一致性
```

### 最终检查清单
- [ ] 所有 Sass 编译通过，无变量未定义错误
- [ ] 登录页视觉效果与 iGreenApp 一致
- [ ] Dashboard 卡片样式与 iGreenApp 一致
- [ ] Badge/Status/Priority/Type 组件样式一致
