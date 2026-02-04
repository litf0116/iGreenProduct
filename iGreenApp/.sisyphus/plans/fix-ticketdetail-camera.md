# 修复计划：TicketDetail 使用 Capacitor Camera

## TL;DR
将 TicketDetail.tsx 中的照片上传从 HTML file input 改为使用已安装的 Capacitor Camera 插件，保持 UI 完全不变。

## Context
TicketDetail 当前使用 `document.createElement('input')` 和 `setTimeout` hack 来触发文件选择，这种方式：
1. 未使用已安装的 `@capacitor/camera` 插件
2. 移动端无法调用原生相机
3. 代码质量差（setTimeout hack）

## Work Objectives
- [x] 导入 Capacitor Camera 工具函数
- [x] 重写 handleAddPhoto 使用 takePhoto/pickPhoto
- [x] 保持 PhotoUploader UI 组件完全不变
- [x] 构建验证通过
- [x] 同步到 Android

## TODOs

### Task 1: 添加 Camera 导入
**文件**: `src/components/TicketDetail.tsx`
**位置**: 第 53 行附近
**修改**: 添加导入
```typescript
import { takePhoto, pickPhoto } from '../lib/camera';
```

### Task 2: 重写 handleAddPhoto 函数
**文件**: `src/components/TicketDetail.tsx`
**位置**: 第 289-349 行
**修改**: 替换整个函数实现

**旧实现**: 使用 HTML input + setTimeout
**新实现**: 使用 Capacitor Camera API

关键变更点：
- 删除 `document.createElement('input')` 代码
- 删除 `setTimeout(() => input.click(), 100)`
- 使用 `await takePhoto()` 或 `await pickPhoto()`
- 将 base64 DataUrl 转换为 File 对象
- 保持上传后的 ticket 更新逻辑完全不变

### Task 3: 构建验证
```bash
npm run build
```
预期结果：构建成功，无 TypeScript 错误

### Task 4: 同步到 Android
```bash
npx cap sync android
```
预期结果：识别 @capacitor/camera@6.1.3 插件

## Commit Strategy
单提交：
```
refactor(camera): 使用 Capacitor Camera 替代 HTML file input

- 导入 takePhoto 和 pickPhoto 工具函数
- 重写 handleAddPhoto 使用原生相机 API
- 删除 document.createElement('input') 和 setTimeout hack
- 保持 PhotoUploader UI 组件完全不变
```

## Success Criteria
- [x] 代码构建无错误
- [x] Android 同步成功
- [x] UI 界面和交互完全不变
- [x] 使用 Capacitor Camera 而非 HTML input
