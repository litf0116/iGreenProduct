# 修复 iGreenApp Ticket 数据加载问题

## 问题描述

"My Workspace" 视图中的工单数据无法显示，原因是：

1. **`loadTickets()` 函数缺少 `setTickets()` 调用** - API 返回数据后没有更新 React 状态
2. **本地 filter 与 API 返回数据不匹配** - 重复筛选导致数据被错误过滤

## 问题分析

### 数据流问题

```
API /tickets/my → getMyTickets() → loadTickets() 
                                              ↓
                                   ❌ 缺少 setTickets(data)
                                              ↓
                                   tickets 状态不更新
                                              ↓
                                   UI 不显示数据
```

### 状态筛选问题

```typescript
// App.tsx getFilteredTickets()
case 'my-work':
  return tickets.filter(t => ['assigned', 'departed', 'arrived', 'review'].includes(t.status));

// API 返回: 该用户分配到的工单 (所有状态)
// 结果: 本地 filter 与 API 数据重复筛选，导致无数据显示
```

## 修复方案

### 修复 1: 添加缺失的 setTickets() 调用

**文件**: `iGreenApp/src/App.tsx`

**问题位置**: `loadTickets()` 函数中 switch 语句后

**当前代码**:
```typescript
let data;
switch (currentView) {
  case 'queue':
  case 'dashboard':
    data = await api.getPendingTickets();
    setHasMore(false);
    break;
  case 'my-work':
    data = await api.getMyTickets(page, size);
    break;
  case 'history':
    data = await api.getCompletedTickets(page, size);
    break;
  default:
    data = [];
}
// ❌ 缺少: setTickets(data) 或 setTickets(prev => [...prev, ...data])
```

**修复后代码**:
```typescript
let data;
switch (currentView) {
  case 'queue':
  case 'dashboard':
    data = await api.getPendingTickets();
    setHasMore(false);
    break;
  case 'my-work':
    data = await api.getMyTickets(page, size);
    break;
  case 'history':
    data = await api.getCompletedTickets(page, size);
    break;
  default:
    data = [];
}

// ✅ 添加: 更新 tickets 状态
if (reset) {
  setTickets(data);
} else {
  setTickets(prev => [...prev, ...data]);
}
```

### 修复 2: 简化 getFilteredTickets() 逻辑

**文件**: `iGreenApp/src/App.tsx`

**原因**: 不同视图调用不同 API 返回不同数据，本地 filter 是多余的

**当前代码**:
```typescript
const getFilteredTickets = () => {
  switch (currentView) {
    case 'queue':
      return tickets.filter(t => t.status === 'open');
    case 'my-work':
      return tickets.filter(t => ['assigned', 'departed', 'arrived', 'review'].includes(t.status));
    case 'history':
      return tickets.filter(t => t.status === 'completed');
    default:
      return [];
  }
};
```

**修复后代码**:
```typescript
const getFilteredTickets = () => {
  // 不同视图已由不同 API 返回对应数据，无需本地筛选
  return tickets;
};
```

## 任务列表

### 任务 1: 修复 loadTickets() 函数

**文件**: `iGreenApp/src/App.tsx`  
**行号**: ~80-125

**验收标准**:
- [x] `loadTickets(true)` 后调用 `setTickets(data)` 重置数据
- [x] `loadTickets(false)` 后调用 `setTickets(prev => [...prev, ...data])` 追加数据
- [x] API 返回空数组时正确处理（不会追加空数据）

**验证步骤**:
- [x] 登录工程师账号
- [x] 进入 "My Workspace" 视图
- [x] 确认工单列表显示数据

### 任务 2: 简化 getFilteredTickets()

**文件**: `iGreenApp/src/App.tsx`  
**行号**: ~239-250

**验收标准**:
- [x] 移除所有本地 filter 逻辑
- [x] 直接返回 `tickets` 数组

## 影响范围

| 文件 | 修改类型 | 影响 |
|------|----------|------|
| `iGreenApp/src/App.tsx` | Bug fix | 修复数据不显示问题 |

## 测试用例

### 测试 1: My Workspace 视图
1. 使用 `lisi / password123` 登录
2. 进入 "My Workspace" 视图
3. 验证: 显示分配给当前用户的工单

### 测试 2: Queue 视图
1. 进入 "Queue" 视图
2. 验证: 显示 OPEN 状态的待接单工单

### 测试 3: History 视图
1. 进入 "History" 视图
2. 验证: 显示 COMPLETED 状态的已完成工单

### 测试 4: 下拉刷新
1. 在任意视图下拉刷新
2. 验证: 数据正确重新加载

### 测试 5: 加载更多
1. 滚动到底部触发加载更多
2. 验证: 正确追加新数据

## 相关文件

- `iGreenApp/src/App.tsx` - 主应用组件，包含 loadTickets 和 getFilteredTickets
- `iGreenApp/src/lib/api.ts` - API 调用层，包含 getMyTickets, getPendingTickets, getCompletedTickets
- `iGreenApp/src/components/TicketList.tsx` - 工单列表组件

## 备注

由于不同视图使用不同 API 获取不同数据，本地 filter 是多余的。修复后：
- Queue 视图 → 显示 getPendingTickets() 返回的 OPEN 工单
- My Work 视图 → 显示 getMyTickets() 返回的该用户工单
- History 视图 → 显示 getCompletedTickets() 返回的已完成工单
