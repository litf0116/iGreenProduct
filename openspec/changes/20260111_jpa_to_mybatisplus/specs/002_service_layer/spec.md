# 规范增量：Service 层改造

**规范 ID**: 20260111_jpa_to_mybatisplus/002  
**规范类型**: 功能修改  
**版本**: 1.0.0

## 变更概述

将 Service 层中的 JPA Repository 依赖替换为 MyBatis Plus Mapper，业务逻辑保持不变。

## 新增需求

### SERV-001: Service 依赖注入改造

**需求描述**: Service 类中将 JPA Repository 替换为 MyBatis Plus Mapper。

**验收标准**:
- `TicketService` 注入 `TicketMapper` 和 `TicketCommentMapper`
- `UserService` 注入 `UserMapper`
- `TemplateService` 注入 `TemplateMapper`, `TemplateStepMapper`, `TemplateFieldMapper`
- 其他 Service 相应改造
- 注入方式使用构造器注入 (`@RequiredArgsConstructor`)

**示例**:
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {
    private final TicketMapper ticketMapper;
    private final TicketCommentMapper ticketCommentMapper;
    private final UserMapper userMapper;
}
```

**关联任务**: 3.1 - 4.5

---

### SERV-002: 查询策略实现

**需求描述**: 根据查询复杂度选择合适的实现方式。

**验收标准**:
- **简单查询**: 使用 `LambdaQueryWrapper`
- **复杂查询**: 使用 XML + DTO

**策略说明**:

| 查询类型 | 实现方式 | 示例 |
|----------|----------|------|
| 单表主键查询 | `selectById()` | `userMapper.selectById(id)` |
| 单表条件查询 | `LambdaQueryWrapper` | `wrapper.eq(User::getStatus, status)` |
| 单表分页查询 | `PageHelper` | `PageHelper.startPage()` + `PageInfo` |
| 多表关联查询 | XML + DTO | `selectTicketsWithDetails()` |
| 聚合统计查询 | XML + DTO | `selectStatistics()` |

**示例 - 简单查询**:
```java
@Transactional(readOnly = true)
public List<TicketResponse> getTicketsByStatus(String status) {
    LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(Ticket::getStatus, status)
           .orderByDesc(Ticket::getCreatedAt);
    return ticketMapper.selectList(wrapper).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
}
```

**示例 - 复杂查询 (多表 JOIN)**:
```java
@Transactional(readOnly = true)
public TicketStatisticsDTO getStatistics() {
    return ticketMapper.selectTicketStatistics();
}

@Transactional(readOnly = true)
public List<TicketDTO> getTicketsWithDetails(String status) {
    return ticketMapper.selectTicketsWithDetails(status);
}
```

**关联任务**: 3.1 - 4.5

---

### SERV-002: 查询方法适配

**需求描述**: 将 JPA 查询方法调用适配为 MyBatis Plus 方法调用。

**验收标准**:
- **简单查询**: 使用 Wrapper 方法
  - `findById()` → `selectById()`
  - `findAll()` → `selectList(null)`
  - `save()` → `insert(entity)`
  - `count()` → `selectCount(wrapper)`
- **复杂查询**: 使用自定义方法
  - 自定义查询方法调用方式不变
  - 多表关联查询使用 XML + DTO

**示例**:
```java
// Before (JPA)
Page<Ticket> ticketPage = ticketRepository.findByFilters(...);

// After - 简单查询 (MyBatis Plus + PageHelper)
PageHelper.startPage(page, size);
try {
    List<Ticket> tickets = ticketMapper.selectList(wrapper);
    PageInfo<Ticket> pageInfo = new PageInfo<>(tickets);
    return PageResult.of(tickets, pageInfo.getTotal(), page, size);
} finally {
    PageHelper.clearPage();
}

// After - 复杂查询 (MyBatis Plus + XML + JOIN)
TicketDTO result = ticketMapper.selectByIdWithDetails(id);
```

**关联任务**: 3.1 - 4.5

---

### SERV-003: 分页查询适配

**需求描述**: 将 Spring Data JPA 的分页适配为 PageHelper。

**验收标准**:
- 使用 `com.github.pagehelper.PageHelper`
- 使用 `com.github.pagehelper.PageInfo`
- `PageHelper.startPage(page, size)` 必须在查询之前调用
- 使用 `try-finally` 确保 `PageHelper.clearPage()` 被调用
- 分页参数从 1 开始 (与 JPA 一致)

**示例**:
```java
// Before (JPA)
PageRequest pageRequest = PageRequest.of(page - 1, size);
Page<Ticket> ticketPage = ticketRepository.findByFilters(...);

// After (PageHelper + PageResult)
PageHelper.startPage(page, size);
try {
    List<Ticket> tickets = ticketMapper.selectList(wrapper);
    return PageResult.of(new PageInfo<>(tickets));
} finally {
    PageHelper.clearPage();
}
```

**关联任务**: 4.2

---

### SERV-004: 条件查询构造

**需求描述**: 使用 MyBatis Plus 的条件构造器进行动态查询。

**验收标准**:
- 使用 `LambdaQueryWrapper<T>` 进行条件查询
- 使用类型安全的列引用 (`Entity::getField`)
- 支持动态条件拼接

**示例**:
```java
LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(status != null, Ticket::getStatus, status)
       .like(keyword != null, Ticket::getTitle, keyword)
       .orderByDesc(Ticket::getCreatedAt)
       .select(Ticket::getId, Ticket::getTitle, Ticket::getStatus);
```

**关联任务**: 4.2

---

## 修改需求

### SERV-M001: 异常处理适配

**需求描述**: 适配 JPA 的 `Optional` 异常抛出方式。

**验收标准**:
- Mapper 返回 `null` 时抛出业务异常
- 保持原有的错误码和错误信息

**示例**:
```java
// JPA: Optional 处理
User user = userRepository.findById(id)
    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

// MyBatis Plus: null 检查
User user = userMapper.selectById(id);
if (user == null) {
    throw new BusinessException(ErrorCode.USER_NOT_FOUND);
}
```

**关联任务**: 3.1 - 4.5

---

### SERV-M002: 事务管理保持

**需求描述**: 保持现有的 `@Transactional` 事务管理配置。

**验收标准**:
- `@Transactional` 注解保持不变
- 事务传播行为保持一致
- 只读事务配置保持不变

**关联任务**: 3.1 - 4.5

---

### SERV-M003: DTO 映射

**需求描述**: 复杂查询结果映射到 DTO。

**验收标准**:
- 多表查询创建对应的 DTO 类
- XML 中使用 `<resultMap>` 映射
- Service 层直接返回 DTO

**示例**:
```java
// DTO 定义
@Data
@Builder
public class TicketDTO {
    private String id;
    private String title;
    private String templateName;
    private String assigneeName;
    private Long commentCount;
}

// Service 使用
@Transactional(readOnly = true)
public List<TicketDTO> getTicketsWithDetails(String status) {
    return ticketMapper.selectTicketsWithDetails(status);
}
```

**关联任务**: 4.2

---

## 技术约束

### TC-001: 保持业务逻辑不变

**约束描述**: Service 层的业务逻辑代码应尽量保持不变。

**约束规则**:
- 只修改数据访问代码
- 业务规则、校验逻辑保持原样
- 返回值类型和结构保持一致

---

### TC-002: 查询策略选择

**约束描述**: 根据查询复杂度选择实现方式。

**约束规则**:
- 简单查询 (单表、条件少) → `LambdaQueryWrapper`
- 复杂查询 (多表、统计) → XML + DTO
- 禁止在 XML 中写简单的单表查询
- 禁止用 Wrapper 写复杂的多表查询

**决策树**:
```
查询需要多表 JOIN 吗？
├─ 是 → 使用 XML + JOIN + DTO
└─ 否 → 查询条件是否复杂？
    ├─ 是 (子查询/聚合) → 使用 XML + JOIN + GROUP BY + DTO
    └─ 否 → 使用 LambdaQueryWrapper
```

**注意**: 子查询仅用于 `EXISTS` 存在性检查，其他场景优先使用 JOIN。

---

### TC-003: 返回值适配

**约束描述**: 适配 JPA 和 MyBatis Plus 的返回值差异。

**约束规则**:
- JPA `Optional<T>` → MyBatis Plus `T` + null 检查
- JPA `Page<T>` → `PageResult.of(PageInfo)`
- JPA `List<T>` → MyBatis Plus `List<T>`
- 多表查询 → DTO 类

**PageInfo 常用方法** (配合 PageResult 使用):
| 方法 | 说明 |
|------|------|
| `getList()` | 数据列表 (records) |
| `getTotal()` | 总记录数 |
| `getPageNum()` | 当前页码 |
| `getPageSize()` | 每页数量 |
| `isHasNextPage()` | 是否有下一页 (hasNext) |
| `isHasPreviousPage()` | 是否有上一页 |

---

## 兼容性要求

### COMP-001: DTO 兼容性

**要求描述**: Service 层返回的 DTO 结构保持不变。

**验收标准**:
- `TicketResponse`, `UserResponse` 等 DTO 结构不变
- 字段名称和类型保持一致
- JSON 序列化结果不变

---

### COMP-002: API 响应兼容性

**要求描述**: API 响应格式保持不变。

**验收标准**:
- REST API 路径不变
- 请求参数格式不变
- 响应数据结构不变
- 状态码保持一致

---

## 测试要求

### TEST-001: Service 单元测试

**需求描述**: 更新 Service 单元测试，使用 Mock Mapper。

**验收标准**:
- `@Mock` 注解用于 Mapper 接口
- `@InjectMocks` 保持不变
- 验证 Mapper 方法被正确调用
- 测试通过率 ≥ 90%

**示例**:
```java
@ExtendWith(MockitoExtension.class)
class TicketServiceTest {
    @Mock
    private TicketMapper ticketMapper;
    // ...
}
```

**关联任务**: 5.1

---

### TEST-002: Service 集成测试

**需求描述**: 创建 Service 集成测试。

**验收标准**:
- 测试真实的数据库交互
- 测试事务管理
- 测试分页查询

**关联任务**: 5.2
