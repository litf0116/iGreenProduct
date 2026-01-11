# 规范增量：Repository 层迁移

**规范 ID**: 20260111_jpa_to_mybatisplus/001  
**规范类型**: 功能增强  
**版本**: 1.0.0

## 变更概述

将数据访问层从 JPA Repository 迁移到 MyBatis Plus Mapper，保留实体类用于 `ddl-auto` 自动建表。

## 新增需求

### REPO-001: 基础 Mapper 接口定义

**需求描述**: 创建统一的基础 Mapper 接口，扩展 MyBatis Plus 的 BaseMapper，添加项目通用方法。

**验收标准**:
- 创建 `com.igreen.domain.mapper.BaseMapper<T>` 接口
- 继承 `com.baomidou.mybatisplus.core.mapper.BaseMapper<T>`
- 定义通用方法扩展:
  - `List<T> selectBatchIds(List<String> ids)` - 批量查询
  - `int logicalDeleteById(String id)` - 逻辑删除
  - `int logicalDeleteBatchIds(List<String> ids)` - 批量逻辑删除
  - `long countValid()` - 统计有效记录数
- 所有业务 Mapper 必须继承此接口

**实现位置**:
- `src/main/java/com/igreen/domain/mapper/BaseMapper.java`
- `src/main/resources/mapper/BaseMapper.xml` (如需要)

**关联任务**: 2.3

---

### REPO-002: UserMapper 接口定义

**需求描述**: 创建 User 实体对应的 Mapper 接口。

**验收标准**:
- 创建 `com.igreen.domain.mapper.UserMapper` 接口
- 继承 `BaseMapper<User>`
- **简单查询使用 Wrapper** (基类已有方法):
  - `selectById()`, `selectList(wrapper)`, `selectCount(wrapper)`
- **自定义查询方法** (需要 XML 实现):
  - `Optional<User> selectByUsername(String username)` - 简单查询可省略，使用 Wrapper
  - `Page<User> selectAll(Pageable pageable)` - 分页查询可省略，使用 Wrapper
  - `Page<User> searchByKeyword(String keyword, Pageable pageable)` - 可省略，使用 Wrapper
  - `Optional<User> selectByIdWithGroup(String id)` - 多表关联，**需要 XML + DTO**
  - `List<UserStatisticsDTO> selectUserStatisticsByGroup()` - 统计查询，**需要 XML + DTO**

**实现位置**:
- `src/main/java/com/igreen/domain/mapper/UserMapper.java`
- `src/main/resources/mapper/UserMapper.xml`
- `src/main/java/com/igreen/domain/dto/UserStatisticsDTO.java`

**关联任务**: 3.1

---

### REPO-003: TicketMapper 接口定义

**需求描述**: 创建 Ticket 实体对应的 Mapper 接口，包含复杂的关联查询。

**验收标准**:
- 创建 `com.igreen.domain.mapper.TicketMapper` 接口
- 继承 `BaseMapper<Ticket>`
- **简单查询使用 Wrapper** (基类已有方法):
  - `selectById()`, `selectList(wrapper)`, `insert()`, `updateById()`, `deleteById()`
- **自定义查询方法** (需要 XML 实现):
  - `TicketDTO selectByIdWithDetails(String id)` - 多表关联，**需要 XML + DTO**
  - `Page<TicketDTO> selectTicketsWithDetails(String status, Pageable pageable)` - 多表关联
  - `TicketStatisticsDTO selectTicketStatistics()` - 聚合统计，**需要 XML + DTO**
  - `Page<TicketDTO> selectTicketListWithPagination(...)` - 复杂分页查询
  - `List<TicketDTO> selectTicketsByDateRange(...)` - 日期范围查询

**实现位置**:
- `src/main/java/com/igreen/domain/mapper/TicketMapper.java`
- `src/main/resources/mapper/TicketMapper.xml`
- `src/main/java/com/igreen/domain/dto/TicketDTO.java`
- `src/main/java/com/igreen/domain/dto/TicketStatisticsDTO.java`

**关联任务**: 4.2

---

### REPO-004: TemplateMapper 系列接口定义

**需求描述**: 创建 Template, TemplateStep, TemplateField 对应的 Mapper 接口。

**验收标准**:
- 创建 `TemplateMapper`, `TemplateStepMapper`, `TemplateFieldMapper` 接口
- 各接口继承对应的 `BaseMapper<T>`
- TemplateMapper 定义：
  - `Optional<Template> selectByIdWithSteps(String id)`
  - `Optional<Template> selectByIdWithStepsAndFields(String id)`
  - `Optional<Template> selectByName(String name)`
  - `boolean existsByName(String name)`
- TemplateStepMapper 定义：
  - `List<TemplateStep> selectByTemplateIdOrderByOrderAsc(String templateId)`
- TemplateFieldMapper 定义：
  - `List<TemplateField> selectByStepId(String stepId)`

**实现位置**:
- `src/main/java/com/igreen/domain/mapper/{Template,TemplateStep,TemplateField}Mapper.java`
- `src/main/resources/mapper/{Template,TemplateStep,TemplateField}Mapper.xml`

**关联任务**: 3.6

---

### REPO-005: 其他业务 Mapper 接口

**需求描述**: 创建 Group, Site, Config, ProblemType, File, TicketComment 对应的 Mapper 接口。

**验收标准**:
- 创建以下 Mapper 接口：
  - GroupMapper
  - SiteMapper
  - SLAConfigMapper
  - SiteLevelConfigMapper
  - ProblemTypeMapper
  - FileMapper
  - TicketCommentMapper
- 各接口继承对应的 `BaseMapper<T>`
- 迁移原有 Repository 中的所有查询方法

**实现位置**:
- `src/main/java/com/igreen/domain/mapper/*.java`
- `src/main/resources/mapper/*.xml`

**关联任务**: 3.2 - 3.5, 4.1, 4.3

---

## 修改需求

### REPO-M001: 移除 JPA Repository

**需求描述**: 迁移完成后移除所有 JPA Repository 文件。

**验收标准**:
- 删除 `src/main/java/com/igreen/domain/repository/` 目录
- 所有 import 语句已更新为 Mapper
- 项目编译无错误

**关联任务**: 6.1

---

### REPO-M002: 实体类添加 @JsonIgnore

**需求描述**: 在实体类的关联字段上添加 `@JsonIgnore`，防止循环序列化。

**验收标准**:
- Ticket: template, assignee, creator, comments
- Template: steps, tickets
- TemplateStep: template, fields
- TemplateField: step
- User: group, assignedTickets, createdTickets
- TicketComment: ticket, user

**关联任务**: 6.1b

---

## 移除需求

### REPO-D001: 移除 JpaRepository 依赖

**需求描述**: 清理 Service 层中对 JpaRepository 的依赖。

**验收标准**:
- Service 类中不再注入 JpaRepository
- 所有数据访问通过 Mapper 接口进行
- 编译通过

---

## 技术约束

### TC-001: XML 命名规范

**约束描述**: Mapper XML 文件命名和结构规范。

**约束规则**:
- XML 文件名与 Mapper 接口名一致 (如 `UserMapper.xml`)
- 命名空间与 Mapper 接口全限定名一致
- ResultMap ID 使用 PascalCase (如 `UserResultMap`)
- SQL ID 使用 camelCase (如 `selectById`)

---

### TC-002: 查询策略规范

**约束描述**: 根据查询复杂度选择合适的实现方式。

**约束规则**:

| 查询类型 | 实现方式 | 示例 |
|----------|----------|------|
| 单表主键查询 | `selectById()` | `userMapper.selectById(id)` |
| 单表简单条件查询 | `LambdaQueryWrapper` | `wrapper.eq(User::getStatus, status)` |
| 单表复杂条件查询 | `LambdaQueryWrapper` | `wrapper.and(w -> w.eq().or().like())` |
| 单表分页查询 | `LambdaQueryWrapper` | `selectPage(page, wrapper)` |
| 多表关联查询 | XML + JOIN + DTO | `selectTicketsWithDetails()` |
| 聚合统计查询 | XML + JOIN + GROUP BY + DTO | `selectStatistics()` |

**说明**:
- 简单查询优先使用 MyBatis Plus 封装的 Wrapper 方法
- 复杂查询 (多表 JOIN、统计、子查询) 使用 XML 实现
- **多表查询优先使用 JOIN，子查询仅在必要时使用**
- XML 查询结果映射到专门的 DTO 类

---

### TC-002-1: JOIN 优化规范

**约束描述**: 多表查询必须使用 JOIN，禁止使用子查询（存在性检查除外）。

**约束规则**:
- 关联查询使用 `LEFT JOIN` 或 `INNER JOIN`
- 聚合统计使用 `JOIN + GROUP BY`
- 子查询仅用于 `EXISTS` 存在性检查
- 禁止在 SELECT 列表中使用子查询

**示例对比**:
```sql
-- ❌ 禁止：SELECT 子查询
SELECT t.*,
       (SELECT COUNT(*) FROM comments WHERE ticket_id = t.id) as comment_count
FROM tickets t

-- ✓ 推荐：JOIN + GROUP BY
SELECT t.id, t.title, t.status, c.comment_count
FROM tickets t
LEFT JOIN (
    SELECT ticket_id, COUNT(*) as comment_count
    FROM ticket_comments
    GROUP BY ticket_id
) c ON t.id = c.ticket_id
```

---

### TC-002-2: 索引优化规范

**约束描述**: JOIN 查询必须确保关联字段有索引。

**约束规则**:
- 外键字段必须有索引
- 关联查询优先使用有索引的字段
- 大表 JOIN 考虑分页优化

**检查清单**:
- [ ] `tickets.template_id` 有索引
- [ ] `tickets.assigned_to` 有索引
- [ ] `tickets.created_by` 有索引
- [ ] `tickets.site` 有索引
- [ ] `ticket_comments.ticket_id` 有索引

---

### TC-003: 结果映射规范

**约束描述**: 关联查询和 DTO 映射的规范。

**约束规则**:
- 单表查询返回实体类 (Entity)
- 多表查询返回 DTO 类
- 使用 `<resultMap>` 定义复杂映射
- 使用 `<association>` 映射一对一关联
- 避免在 SQL 中使用 `SELECT *`

---

### TC-004: DTO 命名规范

**约束描述**: 用于多表查询的 DTO 命名规范。

**约束规则**:
- 命名格式: `{Entity}DTO` 或 `{Feature}DTO`
- 示例: `TicketDTO`, `UserStatisticsDTO`, `TicketDetailDTO`
- 放置位置: `com.igreen.domain.dto` 包
- **DTO 字段应包含表关联后的业务含义字段**

---

### TC-005: JOIN 查询规范

**约束描述**: 多表查询的 SQL 编写规范。

**约束规则**:
- 使用 `LEFT JOIN` 保留主表所有记录
- 使用 `INNER JOIN` 仅返回匹配记录
- 聚合查询使用 `GROUP BY`
- 子查询仅用于 `EXISTS` 存在性检查

**SQL 模板**:
```sql
SELECT 
    main.id,
    main.title,
    ref1.name as ref1_name,
    ref2.name as ref2_name,
    agg.agg_value
FROM main_table main
LEFT JOIN ref_table1 ref1 ON main.ref1_id = ref1.id
LEFT JOIN ref_table2 ref2 ON main.ref2_id = ref2.id
LEFT JOIN (
    SELECT ref_id, COUNT(*) as agg_value
    FROM agg_table
    GROUP BY ref_id
) agg ON main.id = agg.ref_id
WHERE main.status = #{status}
ORDER BY main.created_at DESC
```

### PERF-001: 分页查询

**要求描述**: 分页查询必须使用 MyBatis Plus 分页插件。

**验收标准**:
- 使用 `Page<T>` 作为分页参数
- 返回 `Page<T>` 结果
- 分页插件已配置并生效

---

### PERF-002: 关联查询优化

**要求描述**: 关联查询需要显式指定列，避免 N+1 查询问题。

**验收标准**:
- 关联查询使用 JOIN 而不是多次查询
- 关联查询结果通过 ResultMap 映射
- 无 LazyInitializationException

---

## 保留需求

### REPO-KEEP-001: JPA ddl-auto 自动建表

**需求描述**: 保留 JPA 实体类和 `ddl-auto: update` 配置用于自动建表。

**验收标准**:
- 实体类保留 `@Entity`, `@Table`, `@Column` 等 JPA 注解
- `application.yml` 中保留 `spring.jpa.hibernate.ddl-auto: update`
- 表结构变更时自动更新

**说明**: 实体类仅用于建表，实际数据访问使用 MyBatis Plus Mapper。
