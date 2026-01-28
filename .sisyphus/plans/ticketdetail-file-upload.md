# TicketDetail.tsx 文件上传对接后端接口

## 背景

当前 `TicketDetail.tsx` 中的 `handleAddPhoto` 函数使用模拟数据：
```typescript
// 行 192-197 (模拟上传)
const count = source === 'camera' ? 1 : Math.floor(Math.random() * 3) + 1;
newPhotos.push(`https://images.unsplash.com/photo-...?random=${Math.random()}`);
```

需要对接真实的后端文件上传 API。

## 后端文件上传接口

### 接口信息

| 属性 | 值 |
|------|-----|
| **URL** | `POST /api/files/upload` |
| **Content-Type** | `multipart/form-data` |
| **认证** | 需要 Bearer Token |

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | File | ✅ | 上传的文件 |
| `fieldType` | string | ❌ | 字段类型 (photo, beforePhoto, afterPhoto, feedbackPhoto, problemPhoto) |

### 响应格式

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "/uploads/filename.jpg",
    "name": "original.jpg",
    "type": "image/jpeg",
    "size": 12345
  },
  "code": "200"
}
```

## 前端修改方案

### 文件: `iGreenApp/src/lib/api.ts`

添加文件上传 API 方法：

```typescript
// 文件上传
uploadFile: async (file: File, fieldType?: string): Promise<{ id: string; url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  if (fieldType) {
    formData.append('fieldType', fieldType);
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return { id: data.data.id, url: data.data.url };
},
```

### 文件: `iGreenApp/src/components/TicketDetail.tsx`

修改 `handleAddPhoto` 函数：

**当前代码** (行 178-226):
```typescript
const handleAddPhoto = async (
    source: 'camera' | 'gallery',
    stepId: string,
    fieldPrefix: 'photo' | 'beforePhoto' | 'afterPhoto' | 'feedbackPhoto' | 'problemPhoto' = 'photo',
    isCorrectiveOrPlanned: boolean = false
) => {
    // ... 模拟上传逻辑
    const newPhotos: string[] = [];
    for(let i=0; i<count; i++) {
        newPhotos.push(`https://images.unsplash.com/...?random=${Math.random()}`);
    }
    // ...
};
```

**修复后代码**:
```typescript
const handleAddPhoto = async (
    source: 'camera' | 'gallery',
    stepId: string,
    fieldPrefix: 'photo' | 'beforePhoto' | 'afterPhoto' | 'feedbackPhoto' | 'problemPhoto' = 'photo',
    isCorrectiveOrPlanned: boolean = false
) => {
    setLoadingImage(stepId + fieldPrefix);
    try {
        // 触发文件选择
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = source === 'gallery';
        input.capture = source === 'camera' ? 'environment' : undefined;

        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files || files.length === 0) {
                setLoadingImage(null);
                return;
            }

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    const uploaded = await api.uploadFile(file, fieldPrefix);

                    if (isCorrectiveOrPlanned) {
                        const existingPhotos = (ticket as any)[`${fieldPrefix}Urls`] || [];
                        onUpdateTicket(ticket.id, {
                            [`${fieldPrefix}Urls`]: [...existingPhotos, uploaded.url]
                        });
                    } else {
                        handlePreventiveStepUpdate(stepId, {
                            photoUrls: [...(ticket.steps?.find(s => s.id === stepId)?.photoUrls || []), uploaded.url]
                        });
                    }
                } catch (error) {
                    toast.error(`Failed to upload photo ${i + 1}`);
                }
            }
            toast.success('Photo(s) uploaded successfully');
            setLoadingImage(null);
        };

        input.click();
    } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload photo');
        setLoadingImage(null);
    }
};
```

## 任务列表

### 任务 1: 添加 API 上传方法

**文件**: `iGreenApp/src/lib/api.ts`

**验收标准**:
- [ ] 添加 `uploadFile(file, fieldType)` 方法
- [ ] 使用 FormData 发送 multipart 请求
- [ ] 正确处理响应并返回 `{ id, url }`
- [ ] 处理认证头

### 任务 2: 修改 handleAddPhoto 函数

**文件**: `iGreenApp/src/components/TicketDetail.tsx`

**验收标准**:
- [ ] 移除模拟上传代码
- [ ] 添加真实的文件选择逻辑
- [ ] 调用 `api.uploadFile` 上传文件
- [ ] 将上传后的 URL 更新到工单/步骤
- [ ] 保留 loading 状态和 toast 提示

### 任务 3: 修复 handleAddPhoto 参数类型错误

**问题**: 行 873 传入 `step.label` 但期望 `'camera' | 'gallery'`

**修复**:
```typescript
// 当前错误代码
onClick={() => handleAddPhoto(step.id, step.label)}

// 修复为
onClick={() => handleAddPhoto('gallery', step.id, 'photo')}
```

## 验证步骤

1. 进入工单详情页面
2. 点击 "Add Photo" 按钮
3. 选择相册或拍照
4. 确认图片上传到 `/api/files/upload`
5. 确认上传后的图片 URL 正确显示
6. 确认 toast 提示上传成功

## 相关文件

- `iGreenApp/src/lib/api.ts` - API 客户端
- `iGreenApp/src/components/TicketDetail.tsx` - 工单详情组件
- `igreen-backend/src/main/java/com/igreen/domain/controller/FileController.java` - 后端接口
