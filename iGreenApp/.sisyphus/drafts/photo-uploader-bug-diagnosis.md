# Draft: PhotoUploader Sheet 无法弹出问题诊断

## 问题描述
**症状**: 点击 PhotoUploader 组件的 "Add" 按钮时，Sheet 弹窗无法弹出，无法进行拍照或从相册选择

**组件位置**: `/src/components/form/PhotoUploader.tsx`

**使用位置**: `/src/components/TicketDetail.tsx` (行 706, 727, 736)

---

## 初步分析

### 组件结构
```tsx
<Sheet open={photoSheetOpen} onOpenChange={setPhotoSheetOpen}>
  <SheetTrigger asChild>
    <button type="button">...</button>  {/* 点击这个按钮应该触发 Sheet */}
  </SheetTrigger>
  <SheetContent side="bottom">...</SheetContent>
</Sheet>
```

### 关键观察
1. ✅ Sheet 是受控组件 (`open={photoSheetOpen}`)
2. ✅ 按钮有 `type="button"` (不会触发表单提交)
3. ✅ 使用 `asChild` prop (Radix UI 推荐模式)
4. ⚠️ 需要确认: `photoSheetOpen` 状态是否正常更新
5. ⚠️ 需要确认: 是否有其他元素遮挡 (z-index 问题)
6. ⚠️ 需要确认: Sheet 组件是否正确渲染

---

## 可能的原因

### 1. 状态管理问题
- `photoSheetOpen` 状态未正确初始化
- `setPhotoSheetOpen` 未正确触发

### 2. 事件冒泡/阻止
- 父元素的 onClick 事件阻止了 Sheet 打开
- 事件冒泡被阻止

### 3. CSS/Z-index 问题
- Sheet 被其他元素遮挡
- z-index 值过低

### 4. Radix UI 配置问题
- Sheet 组件配置错误
- 依赖版本冲突

### 5. 父组件干扰
- TicketDetail 中的某些逻辑阻止了 Sheet

---

## 诊断问题

### 需要用户确认的信息

1. **浏览器控制台错误**
   - 点击按钮时，浏览器控制台是否有错误信息?
   - 是否有 React 警告或错误?

2. **点击行为**
   - 点击按钮时，按钮是否有视觉反馈 (hover 效果)?
   - 按钮是否可以聚焦 (按 Tab 键能否聚焦到按钮)?

3. **Sheet 状态**
   - 点击后，DOM 中是否有 Sheet 相关的元素生成?
   - 使用浏览器开发者工具查看 `<body>` 末尾是否有 Sheet 的 Portal 元素?

4. **网络请求**
   - 点击按钮是否触发了任何网络请求?

5. **环境信息**
   - 测试环境: 浏览器还是移动端 App?
   - 如果是移动端: iOS 还是 Android?

---

## 下一步行动

等待用户提供诊断信息后，我将:
1. 根据具体错误信息定位问题
2. 提供修复方案
3. 创建修复计划