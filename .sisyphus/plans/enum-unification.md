# 前后端枚举值统一工作计划

## 问题概述

当前前后端枚举值存在大小写不一致问题：
- **后端**: 返回大写枚举值 (`OPEN`, `ENGINEER`, `PLANNED`)
- **前端**: 混合使用大小写 (`status === "OPEN"` vs `status === "assigned"`)

这导致多个功能无法正常工作：
1. 工程师过滤失败 (`u.role === "engineer"` 无法匹配 `ENGINEER`)
2. 状态判断失败 (`ticket.status === "assigned"` 无法匹配 `ASSIGNED`)
3. 优先级显示问题
4. 过滤器不工作

## 决策结果

| 枚举类型 | 方案 | 格式示例 |
|---------|------|----------|
| **TicketStatus** | 改为小写 | `open`, `assigned`, `completed` |
| **TicketType** | 改为小写 | `planned`, `corrective`, `problem` |
| **UserRole** | 改为小写 | `admin`, `manager`, `engineer` |
| **UserStatus** | 改为小写 | `active`, `inactive` |
| **CommentType** | 改为小写 | `accept`, `decline`, `cancel` |
| **SiteStatus** | 改为小写蛇形 | `online`, `offline`, `under_construction` |
| **GroupStatus** | 改为小写 | `active`, `inactive` |
| **FieldType** | 改为小写 | `text`, `number`, `photo` |
| **Priority** | 从后台 API 获取 | `P1`, `P2`, `P3`, `P4` |

## 实施步骤

### 阶段 1: 新增 Priority API (从后台获取)

#### 1.1 新增优先级列表接口

```java
// ConfigController.java
@Operation(summary = "获取所有优先级配置")
@GetMapping("/priorities")
public ResponseEntity<Result<List<PriorityResponse>>> getPriorities() {
    List<PriorityResponse> priorities = configService.getAllPriorities();
    return ResponseEntity.ok(Result.success(priorities));
}
```

#### 1.2 创建 PriorityResponse DTO

```java
public record PriorityResponse(
    String value,      // "P1", "P2", "P3", "P4"
    String name,       // "P1 - Critical" / "P1 - วิกฤต"
    String description // 优先级描述
) {}
```

#### 1.3 前端修改

```typescript
// api.ts
getPriorities: async (): Promise<Priority[]> => {
  const response = await kyInstance.get('api/configs/priorities').json<{ data: Priority[] }>();
  return response.data;
},

// CreateTicket.tsx
const priorities = await api.getPriorities();  // 从 API 获取
```

---

### 阶段 2: 修改后端枚举类 (小写)

修改所有枚举类的 `@JsonValue` 返回值，改为小写：

#### 2.1 TicketType.java
```java
public enum TicketType {
    PLANNED, PREVENTIVE, CORRECTIVE, PROBLEM;

    @JsonValue
    public String getValue() {
        return name().toLowerCase();  // 返回小写: "planned", "preventive"...
    }

    @JsonCreator
    public static TicketType fromValue(String value) {
        if (value == null) return PLANNED;
        try {
            return valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return PLANNED;
        }
    }
}
```

#### 2.2 TicketStatus.java
```java
public enum TicketStatus {
    OPEN, ASSIGNED, ACCEPTED, IN_PROGRESS, DEPARTED, 
    ARRIVED, SUBMITTED, REVIEW, COMPLETED, ON_HOLD, CANCELLED, DECLINED;

    @JsonValue
    public String getValue() {
        String name = name().toLowerCase();
        return name
            .replace("in_progress", "in_progress")
            .replace("on_hold", "on_hold")
            .replace("cancelled", "cancelled")
            .replace("declined", "declined");
    }
}
```

#### 2.3 UserRole.java
```java
public enum UserRole {
    ADMIN, MANAGER, ENGINEER;

    @JsonValue
    public String getValue() {
        return name().toLowerCase();  // "admin", "manager", "engineer"
    }
}
```

#### 2.4 其他枚举类
- `UserStatus.java`: `ACTIVE` → `active`, `INACTIVE` → `inactive`
- `SiteStatus.java`: `ONLINE` → `online`, `OFFLINE` → `offline`, `UNDER_CONSTRUCTION` → `under_construction`
- `GroupStatus.java`: `ACTIVE` → `active`, `INACTIVE` → `inactive`
- `CommentType.java`: `GENERAL` → `general`, `COMMENT` → `comment`, `ACCEPT` → `accept`, `DECLINE` → `decline`, `CANCEL` → `cancel`, `SYSTEM` → `system`
- `FieldType.java`: `TEXT` → `text`, `NUMBER` → `number`, `DATE` → `date`, `LOCATION` → `location`, `PHOTO` → `photo`, `SIGNATURE` → `signature`

---

### 阶段 3: 修改前端类型定义

更新 `types.ts` 中的类型定义：

```typescript
export type TicketStatus = 
  | 'open' | 'assigned' | 'accepted' | 'in_progress' | 'departed'
  | 'arrived' | 'submitted' | 'review' | 'completed' | 'on_hold' 
  | 'cancelled' | 'declined';

export type TicketType = 'planned' | 'preventive' | 'corrective' | 'problem';

export type UserRole = 'admin' | 'manager' | 'engineer';

export type UserStatus = 'active' | 'inactive';

export type CommentType = 'general' | 'comment' | 'accept' | 'decline' | 'cancel' | 'system';

export type SiteStatus = 'online' | 'offline' | 'under_construction';

export type GroupStatus = 'active' | 'inactive';

export type FieldType = 'text' | 'number' | 'date' | 'location' | 'photo' | 'signature' | 'face_recognition';
```

### 阶段 3: 修改前端组件中的硬编码值

#### 3.1 CreateTicket.jsx / CreateTicket.tsx
```javascript
// 修改前
.filter((u) => u.role === "ENGINEER")

// 修改后
.filter((u) => u.role === "engineer")
```

#### 3.2 App.tsx
```javascript
// 修改前
tickets.filter((t) => t.status === "OPEN")
tickets.filter((t) => t.status === "IN_PROGRESS" || t.status === "ACCEPTED")
tickets.filter((t) => t.status === "COMPLETED")

// 修改后
tickets.filter((t) => t.status === "open")
tickets.filter((t) => t.status === "in_progress" || t.status === "accepted")
tickets.filter((t) => t.status === "completed")
```

#### 3.3 Dashboard.tsx
```javascript
// Priority 保持 P1/P2/P3/P4，不做修改
if (priority === "P1" || priority === "P2" || priority === "P3" || priority === "P4")
```

#### 3.4 TicketDetail.jsx / TicketDetail.tsx
```javascript
// 修改前
ticket.status === "OPEN"
ticket.status === "ASSIGNED"
ticket.status === "CANCELLED"
ticket.status === "new"
comment.type === "accept"
ticket.type === "problem"

// 修改后
ticket.status === "open"
ticket.status === "assigned"
ticket.status === "cancelled"
ticket.status === "open"
comment.type === "accept"
ticket.type === "problem"
```

#### 3.5 MyTasks.tsx
```javascript
// 修改前
selectedTicket.status === "new" || selectedTicket.status === "assigned"

// 修改后
selectedTicket.status === "open" || selectedTicket.status === "assigned"
```

#### 3.6 Priority 获取方式 (从后台 API)
```typescript
// CreateTicket.tsx - 修改前
const priorities: Priority[] = ["P1", "P2", "P3", "P4"];

useEffect(() => {
  api.getPriorities().then(setPriorities);
}, []);
```

#### 3.6 SystemSettings.tsx
```javascript
// Priority 保持 P1/P2/P3/P4，不做修改
config.priority === "P1" || config.priority === "P2"
config.priority === "P3"
```

#### 3.7 GroupManager.tsx
```javascript
// 后端已改为小写，前端已经是小写，无需修改
group.status === "active"
user.status === "active"
```

#### 3.8 SiteManagement.tsx
```javascript
// 后端已改为小写，前端已经是小写，无需修改
sites.filter((s) => s.status === "online")
sites.filter((s) => s.status === "offline")
```

#### 3.9 CreateTicket.tsx
```javascript
// 修改前
tickets.filter(t => t.type === "corrective")
g.status === "active"
u.role === "engineer"

// 修改后 (后端改为小写后，这些比较也需要是小写)
tickets.filter(t => t.type === "corrective")
g.status === "active"
u.role === "engineer"
```

### 阶段 4: 测试验证

#### 4.1 API 测试
```bash
# 验证后端返回小写枚举值
curl http://localhost:8000/api/tickets | jq '.data.records[0].status'
# 应输出: "open"

curl http://localhost:8000/api/users | jq '.data.records[0].role'
# 应输出: "admin"

# 验证 Priority 从 API 获取
curl http://localhost:8000/api/configs/priorities
# 应输出: [{"value":"P1","name":"P1 - Critical"}, ...]
```

#### 4.2 功能测试
- [ ] 登录后 Dashboard 统计正常显示
- [ ] Create Ticket 中 Assign To 下拉菜单显示工程师列表
- [ ] Create Ticket 中 Ticket Type 下拉菜单正常工作
- [ ] Priority 下拉菜单从后台加载 (P1, P2, P3, P4)
- [ ] Ticket 详情页状态显示正确
- [ ] 过滤器按状态/优先级筛选正常工作
- [ ] 过滤器按用户角色筛选正常工作

## 需要修改的文件清单

### 后端 (13 个文件)

**新增 Priority API:**
- `src/main/java/com/igreen/domain/dto/PriorityResponse.java` (新增)
- `src/main/java/com/igreen/domain/service/ConfigService.java` (添加 getAllPriorities 方法)

**修改枚举类 (9 个文件):**
- `src/main/java/com/igreen/domain/enums/TicketType.java`
- `src/main/java/com/igreen/domain/enums/TicketStatus.java`
- `src/main/java/com/igreen/domain/enums/UserRole.java`
- `src/main/java/com/igreen/domain/enums/UserStatus.java`
- `src/main/java/com/igreen/domain/enums/SiteStatus.java`
- `src/main/java/com/igreen/domain/enums/GroupStatus.java`
- `src/main/java/com/igreen/domain/enums/CommentType.java`
- `src/main/java/com/igreen/domain/enums/FieldType.java`
- `src/main/java/com/igreen/domain/enums/Priority.java` (保持 P1/P2/P3/P4，只添加翻译方法)

### 前端 (10+ 个文件)
- `src/lib/types.ts`
- `src/lib/api.ts` (添加 getPriorities API)
- `src/App.tsx`
- `src/components/CreateTicket.jsx`
- `src/components/CreateTicket.tsx`
- `src/components/Dashboard.tsx`
- `src/components/TicketDetail.jsx`
- `src/components/TicketDetail.tsx`
- `src/components/MyTasks.tsx`
- `src/components/GroupManager.tsx`
- `src/components/SiteManagement.tsx`

## 回滚计划

如果修改后出现问题：
1. 后端回滚: 修改枚举类的 `getValue()` 方法恢复大写
2. 前端回滚: 将所有比较值改回大写
3. 数据库中的数据不需要修改（数据库存储的是枚举名的大写形式，由 Java 枚举处理）

## 风险评估

### 高风险
- 修改枚举序列化会影响所有 API 响应
- 前后端需要同步修改，否则会出问题

### 中风险
- 可能遗漏某些使用枚举的地方
- 第三方集成可能受影响

### 低风险
- 内部类型定义可以随时调整
- 前端有类型定义保护

## 建议实施方式

1. **分批次修改**: 先修改后端，测试通过后再修改前端
2. **备份配置**: 在修改前备份相关文件
3. **充分测试**: 每个阶段都要进行功能测试
4. **文档记录**: 记录修改位置和原因，方便后续维护

## 时间估算

- 后端修改: 2-3 小时
- 前端修改: 3-4 小时
- 测试验证: 2-3 小时
- **总计: 7-10 小时**
