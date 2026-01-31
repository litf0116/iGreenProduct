# 移动端底部弹出 Action Sheet 重构计划

## 目标
将照片上传选择的 DropdownMenu 改为移动端风格的底部弹出 Action Sheet。

## 背景
- 当前使用 `DropdownMenu` 组件（行289-312）
- 项目中已有 `Sheet` 组件支持 `side="bottom"`
- 需要替换的代码位置：`renderPhotoUploader` 函数

## 实施步骤

### 步骤1：替换导入语句（行34-39）

**移除：**
```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
```

**添加：**
```typescript
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
```

### 步骤2：添加状态管理

在 `renderPhotoUploader` 函数内部（行274后）添加：
```typescript
const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
```

### 步骤3：替换 DropdownMenu 为 Sheet（行289-312）

将原有的 DropdownMenu 结构：
```typescript
<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <button ...>...</button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
        <DropdownMenuItem ...>...</DropdownMenuItem>
        <DropdownMenuItem ...>...</DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
```

替换为移动端 Action Sheet：
```typescript
<Sheet open={photoSheetOpen} onOpenChange={setPhotoSheetOpen}>
    <SheetTrigger asChild>
        <button 
            type="button" 
            className="cursor-pointer w-20 h-20 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
            {isLoading ? (
                <div className="animate-spin w-5 h-5 border-2 border-indigo-600 rounded-full border-t-transparent"></div>
            ) : (
                <>
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">Add</span>
                </>
            )}
        </button>
    </SheetTrigger>
    <SheetContent side="bottom" className="h-auto rounded-t-2xl border-t bg-white px-0 pb-0">
        <SheetHeader className="border-b border-slate-200 pb-4 px-4">
            <SheetTitle className="text-center text-lg font-medium text-slate-900">添加照片</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1 py-2">
            <button
                onClick={() => {
                    handleAddPhoto('camera', stepId, fieldPrefix, isCorrectiveOrPlanned);
                    setPhotoSheetOpen(false);
                }}
                className="flex items-center gap-4 w-full px-6 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-base font-medium text-slate-800">拍摄照片</span>
            </button>
            <button
                onClick={() => {
                    handleAddPhoto('gallery', stepId, fieldPrefix, isCorrectiveOrPlanned);
                    setPhotoSheetOpen(false);
                }}
                className="flex items-center gap-4 w-full px-6 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-base font-medium text-slate-800">从相册选择</span>
            </button>
        </div>
        <div className="px-4 pb-8 pt-4 bg-slate-50 border-t border-slate-200">
            <button
                onClick={() => setPhotoSheetOpen(false)}
                className="w-full py-3.5 bg-white border border-slate-300 shadow-sm text-slate-700 font-semibold rounded-xl transition-colors active:bg-slate-100"
            >
                取消
            </button>
        </div>
    </SheetContent>
</Sheet>
```

### 步骤4：验证构建

执行构建命令验证代码正确性：
```bash
cd iGreenApp && npm run build
```

## 视觉设计规范

### Sheet 容器
- **位置**：底部滑出 (`side="bottom"`)
- **圆角**：顶部圆角 (`rounded-t-2xl`)
- **背景**：白色 (`bg-white`)
- **内边距**：底部无内边距 (`pb-0`)，内容区有独立内边距

### 标题区域
- **样式**：居中标题，底部边框分隔
- **文字**：18px 字体，中等字重，深色 (`text-slate-900`)

### 选项按钮
- **触控区域**：大区域 (`py-4`)，适合移动端点击
- **布局**：图标 + 文字横向排列
- **图标样式**：圆形背景 (`bg-indigo-100`)，紫色图标
- **交互**：悬停/激活反馈 (`hover:bg-slate-50`, `active:bg-slate-100`)
- **文字**：16px 字体，中等字重

### 取消按钮
- **位置**：底部独立区域
- **样式**：白色背景，边框，阴影，圆角
- **交互**：按下反馈 (`active:bg-slate-100`)

## 文件修改清单

| 文件 | 修改类型 | 行号 |
|------|----------|------|
| `src/components/TicketDetail.tsx` | 替换导入 | 34-39 |
| `src/components/TicketDetail.tsx` | 添加状态 | 274后 |
| `src/components/TicketDetail.tsx` | 替换组件 | 289-312 |

## 测试清单

- [ ] 构建通过无错误
- [ ] 点击 Add 按钮底部 Sheet 滑出
- [ ] Sheet 包含"拍摄照片"和"从相册选择"选项
- [ ] 点击选项触发对应操作并关闭 Sheet
- [ ] 点击取消按钮关闭 Sheet
- [ ] 点击遮罩层关闭 Sheet
- [ ] 多个照片上传点独立工作
- [ ] 移动端触摸体验流畅
