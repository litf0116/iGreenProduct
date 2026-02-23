# 工单状态管理系统 - 前后端完整方案

## TL;DR

> **方案**: 后端支持管理端状态查询 + 前端状态映射
> 
> **核心理念**:
> - 后端新增 `adminStatus` 参数，根据管理端状态自动转换为工程师状态列表查询
> - 前端保留管理端状态类型，用于展示和筛选
> - 单一数据源（工程师状态）+ 多视图映射（管理端/工程师端）
> 
> **改动范围**: 后端 2 个文件 + 前端 3 个文件

---

## 状态映射设计

### 管理端状态 → 工程师状态列表

| 管理端状态 | 工程师状态列表 | 说明 |
|-----------|---------------|------|
| `open` | `[OPEN]` | 可抢单 |
| `accepted` | `[ASSIGNED]` | 已分配 |
| `in_process` | `[ASSIGNED, ACCEPTED, DEPARTED, ARRIVED]` | 进行中（复合） |
| `submitted` | `[REVIEW]` | 待审核 |
| `on_hold` | `[ON_HOLD]` | 暂停 |
| `closed` | `[COMPLETED, CANCELLED]` | 已关闭 |

---

## 实施计划

### Wave 1: 后端核心

#### 1.1 新增 AdminTicketStatus 枚举
**文件**: `igreen-backend/src/main/java/com/igreen/domain/enums/AdminTicketStatus.java`

```java
public enum AdminTicketStatus {
    OPEN,           // 可抢单
    ACCEPTED,       // 已分配
    IN_PROCESS,     // 进行中
    SUBMITTED,      // 待审核
    ON_HOLD,        // 暂停
    CLOSED          // 已关闭
}
```

#### 1.2 添加状态映射服务
**文件**: `igreen-backend/src/main/java/com/igreen/domain/service/StatusMappingService.java` (新建)

```java
@Service
public class StatusMappingService {
    
    public List<String> toEngineerStatuses(AdminTicketStatus adminStatus) {
        return switch (adminStatus) {
            case OPEN -> List.of("OPEN");
            case ACCEPTED -> List.of("ASSIGNED");
            case IN_PROCESS -> List.of("ASSIGNED", "ACCEPTED", "DEPARTED", "ARRIVED");
            case SUBMITTED -> List.of("REVIEW");
            case ON_HOLD -> List.of("ON_HOLD");
            case CLOSED -> List.of("COMPLETED", "CANCELLED");
        };
    }
    
    public AdminTicketStatus toAdminStatus(String engineerStatus) {
        return switch (engineerStatus) {
            case "OPEN" -> OPEN;
            case "ASSIGNED" -> ACCEPTED;
            case "ACCEPTED", "DEPARTED", "ARRIVED" -> IN_PROCESS;
            case "REVIEW" -> SUBMITTED;
            case "ON_HOLD" -> ON_HOLD;
            case "COMPLETED", "CANCELLED" -> CLOSED;
            default -> throw new IllegalArgumentException("Unknown status: " + engineerStatus);
        };
    }
}
```

### Wave 2: 后端 API

#### 2.1 修改 TicketController
**文件**: `igreen-backend/src/main/java/com/igreen/domain/controller/TicketController.java`

```java
@GetMapping
public ResponseEntity<Result<PageResult<TicketResponse>>> getTickets(
    // 现有参数...
    @RequestParam(required = false) String status,        // 工程师状态（保留）
    @RequestParam(required = false) AdminTicketStatus adminStatus  // 新增：管理端状态
) {
    List<String> statuses = null;
    if (adminStatus != null) {
        statuses = statusMappingService.toEngineerStatuses(adminStatus);
    } else if (status != null) {
        statuses = List.of(status);
    }
    // 查询...
}
```

#### 2.2 修改 TicketStatsResponse
**文件**: `igreen-backend/src/main/java/com/igreen/domain/dto/TicketStatsResponse.java`

```java
public record TicketStatsResponse(
    int total,
    int open,
    int accepted,
    int inProcess,
    int submitted,
    int onHold,
    int closed
) {}
```

#### 2.3 修改 TicketService
**文件**: `igreen-backend/src/main/java/com/igreen/domain/service/TicketService.java`

更新 `getTicketStats()` 方法使用新的统计字段。

### Wave 3: 前端类型

#### 3.1 新增 AdminTicketStatus 类型
**文件**: `igreen-front/src/lib/types.ts`

```typescript
// 管理端状态（展示和筛选用）
export type AdminTicketStatus = 
  | 'open' 
  | 'accepted' 
  | 'in_process' 
  | 'submitted' 
  | 'on_hold' 
  | 'closed';

// 工程师端状态（API 传输用）
export type EngineerTicketStatus = 
  | 'open' 
  | 'assigned' 
  | 'accepted' 
  | 'departed' 
  | 'arrived' 
  | 'review' 
  | 'completed' 
  | 'on_hold' 
  | 'cancelled';
```

#### 3.2 新增状态映射
**文件**: `igreen-front/src/lib/statusMapping.ts` (新建)

```typescript
import type { AdminTicketStatus, EngineerTicketStatus };

export const STATUS_MAPPING: Record<EngineerTicketStatus, AdminTicketStatus> = {
  'open': 'open',
  'assigned': 'accepted',
  'accepted': 'in_process',
  'departed': 'in_process',
  'arrived': 'in_process',
  'review': 'submitted',
  'completed': 'closed',
  'on_hold': 'on_hold',
  'cancelled': 'closed',
};

export function toAdminStatus(status: EngineerTicketStatus): AdminTicketStatus {
  return STATUS_MAPPING[status];
}

export function getAdminStatusLabel(status: AdminTicketStatus): string {
  const labels: Record<AdminTicketStatus, string> = {
    'open': '待接单',
    'accepted': '已分配',
    'in_process': '进行中',
    'submitted': '待审核',
    'on_hold': '暂停',
    'closed': '已关闭',
  };
  return labels[status];
}
```

### Wave 4: 前端 API

#### 4.1 更新 API 方法
**文件**: `igreen-front/src/lib/api.ts`

```typescript
getTickets: async (params?: {
  // ...
  adminStatus?: AdminTicketStatus;  // 新增
  status?: EngineerTicketStatus;   // 保留
}): Promise<...>
```

### Wave 5: 前端 Dashboard

#### 5.1 更新筛选器
**文件**: `igreen-front/src/components/Dashboard.tsx`

```typescript
// 使用管理端状态
const ADMIN_STATUSES: AdminTicketStatus[] = [
  'open', 'accepted', 'in_process', 'submitted', 'on_hold', 'closed'
];
```

#### 5.2 更新状态显示
使用 `toAdminStatus()` 转换函数在表格中显示管理端状态。

### Wave 6: 国际化

#### 6.1 补充 i18n
**文件**: `igreen-front/src/lib/i18n.ts`

```typescript
// 添加
inProcess: "进行中",
closed: "已关闭",
```

---

## 改动文件清单

| 模块 | 文件 | 改动类型 |
|------|------|----------|
| 后端 | `AdminTicketStatus.java` | 新建 |
| 后端 | `StatusMappingService.java` | 新建 |
| 后端 | `TicketController.java` | 修改 |
| 后端 | `TicketStatsResponse.java` | 修改 |
| 后端 | `TicketService.java` | 修改 |
| 前端 | `types.ts` | 修改 |
| 前端 | `statusMapping.ts` | 新建 |
| 前端 | `api.ts` | 修改 |
| 前端 | `Dashboard.tsx` | 修改 |
| 前端 | `i18n.ts` | 修改 |

---

## 验证

完成后验证：
1. ✅ Dashboard 筛选器显示 6 个管理端状态
2. ✅ 筛选结果正确（后端正确转换为工程师状态查询）
3. ✅ 统计数据正确
4. ✅ 状态显示正确映射
5. ✅ 国际化完整
