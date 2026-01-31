# 修复 DropdownMenuTrigger 组件

## 问题描述

点击 "Add Photo" 按钮时，DropdownMenu 无法展示 action sheet。

## 问题原因

`DropdownMenuTrigger` 组件实现不正确：
- 当前实现直接使用 `Slot` 组件来支持 `asChild`
- 但这样会失去 Radix UI 的触发逻辑
- 正确的做法是使用 `DropdownMenuPrimitive.Trigger` 并传递 `asChild` 属性

## 修复方案

### 文件：iGreenApp/src/components/ui/dropdown-menu.tsx

**当前代码**（第24-40行）：
```typescript
function DropdownMenuTrigger({
  asChild = true,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger> & { asChild?: boolean }) {
  // 如果 asChild 为 true，使用 Slot 组件来支持 asChild 模式
  if (asChild) {
    return (
      <Slot data-slot="dropdown-menu-trigger" {...props} />
    );
  }
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}
```

**修复后代码**：
```typescript
function DropdownMenuTrigger({
  asChild = true,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger> & { asChild?: boolean }) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      asChild={asChild}
      {...props}
    />
  );
}
```

### 关键修改

1. **移除条件分支**：不再根据 `asChild` 的值选择不同的组件
2. **直接使用原组件**：始终使用 `DropdownMenuPrimitive.Trigger`
3. **传递 asChild 属性**：将 `asChild` 作为 prop 传递给原始组件
4. **移除 Slot 导入**：如果不再需要，可以移除 `import { Slot } from "@radix-ui/react-slot";`

## 任务清单

- [ ] 修改 `DropdownMenuTrigger` 实现
- [ ] 构建验证
- [ ] 测试 DropdownMenu 功能

## 验证步骤

1. 刷新浏览器
2. 进入 arrived 状态（corrective 类型工单）
3. 点击 "Before" 或 "After" 区域的 "Add" 按钮
4. 应该显示下拉菜单：Take Photo / Choose from Album
