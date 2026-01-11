# 设计文档：JPA 到 MyBatis Plus 迁移

## 0. 迁移策略：保留 JPA 自动建表

**重要说明**: 本次迁移保留 JPA 用于 `ddl-auto: update` 自动建表，数据访问层迁移到 MyBatis Plus。

### 迁移范围
- ✓ JPA Entity + ddl-auto (保留)
- ✓ MyBatis Plus Mapper (新增)
- ✓ 实体类无需 @JsonIgnore (MyBatis Plus 不使用懒加载)

### 保留 JPA 自动建表的优势
- 开发阶段快速迭代，表结构自动更新
- 无需手动维护 SQL 脚本
- 降低迁移风险

### 1.1 目录结构

```
backend-spring/
├── src/main/java/com/igreen/
│   ├── domain/
│   │   ├── entity/           # JPA 实体 (保留，用于 ddl-auto)
│   │   ├── mapper/           # MyBatis Plus Mapper 接口 (新增)
│   │   ├── repository/       # JPA Repository (待删除)
│   │   ├── service/          # Service 层
│   │   ├── controller/       # Controller 层
│   │   └── dto/              # DTO
│   ├── common/
│   │   └── config/
│   └── ...
├── src/main/resources/
│   ├── mapper/               # XML 映射文件 (新增)
│   ├── application.yml
│   └── ...
```

### 1.2 包名规范

- **Mapper 接口**: `com.igreen.domain.mapper`
- **XML 文件**: `resources/mapper/{Entity}Mapper.xml`

## 2. 实体类处理

### 2.1 实体类保留 JPA 注解

实体类保持 JPA 注解不变，用于 `ddl-auto: update` 自动建表。

```java
@Entity
@Table(name = "tickets", indexes = {
        @Index(name = "idx_ticket_status", columnList = "status"),
        @Index(name = "idx_ticket_assigned_to", columnList = "assigned_to")
})
public class Ticket {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 500)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus status;

    // JPA 注解保留用于 ddl-auto
    // 无需 @JsonIgnore (MyBatis Plus 不涉及懒加载)

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### 2.2 MyBatis Plus 优势

使用 MyBatis Plus 的优势:
- 无懒加载问题，无需 @JsonIgnore
- 显式 JOIN，SQL 清晰可控
- 支持动态 SQL
- 性能可预测

### 2.1 基础 Mapper 接口

```java
package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BaseMapper<T> extends com.baomidou.mybatisplus.core.mapper.BaseMapper<T> {

    /**
     * 根据 ID 批量查询
     */
    List<T> selectBatchIds(@Param("ids") List<String> ids);

    /**
     * 逻辑删除 (更新 deleted 字段)
     */
    int logicalDeleteById(@Param("id") String id);

    /**
     * 批量逻辑删除
     */
    int logicalDeleteBatchIds(@Param("ids") List<String> ids);

    /**
     * 统计有效记录数 (排除已删除)
     */
    long countValid();
}
```

### 2.2 各实体 Mapper 定义

#### TicketMapper

```java
package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.Ticket;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface TicketMapper extends BaseMapper<Ticket> {

    Ticket selectByIdWithDetails(@Param("id") String id);

    List<Ticket> selectByStatus(@Param("status") String status);

    Page<Ticket> selectByAssignedTo(@Param("userId") String userId, Pageable pageable);

    Page<Ticket> selectByFilters(
            @Param("type") String type,
            @Param("status") String status,
            @Param("priority") String priority,
            @Param("assignedTo") String assignedTo,
            @Param("createdAfter") LocalDateTime createdAfter,
            Pageable pageable
    );

    Page<Ticket> selectByAssignedToWithDetails(@Param("userId") String userId, Pageable pageable);

    Page<Ticket> selectByStatusWithDetails(@Param("status") String status, Pageable pageable);

    long countByAssignedToAndStatus(@Param("userId") String userId, @Param("status") String status);
}
```

#### UserMapper

```java
package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper extends BaseMapper<User> {

    Optional<User> selectByUsername(@Param("username") String username);

    List<User> selectAllByUsername(@Param("username") String username);

    Optional<User> selectByUsernameAndCountry(@Param("username") String username, @Param("country") String country);

    Optional<User> selectByEmail(@Param("email") String email);

    List<User> selectByRole(@Param("role") String role);

    List<User> selectByStatus(@Param("status") String status);

    List<User> selectByGroupId(@Param("groupId") String groupId);

    Page<User> selectAll(Pageable pageable);

    Page<User> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    List<User> selectByRoleAndStatus(@Param("role") String role, @Param("status") String status);

    Optional<User> selectByIdWithGroup(@Param("id") String id);
}
```

#### TemplateMapper / TemplateStepMapper / TemplateFieldMapper

```java
package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.Template;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface TemplateMapper extends BaseMapper<Template> {

    Optional<Template> selectByIdWithSteps(@Param("id") String id);

    Optional<Template> selectByIdWithStepsAndFields(@Param("id") String id);

    Optional<Template> selectByName(@Param("name") String name);

    boolean existsByName(@Param("name") String name);
}
```

## 3. XML 映射文件设计

### 3.1 TicketMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.igreen.domain.mapper.TicketMapper">

    <!-- 结果映射 -->
    <resultMap id="TicketResultMap" type="com.igreen.domain.entity.Ticket">
        <id property="id" column="id"/>
        <result property="title" column="title"/>
        <result property="description" column="description"/>
        <result property="type" column="type"/>
        <result property="status" column="status"/>
        <result property="priority" column="priority"/>
        <result property="site" column="site"/>
        <result property="templateId" column="template_id"/>
        <result property="assignedTo" column="assigned_to"/>
        <result property="createdBy" column="created_by"/>
        <result property="completedSteps" column="completed_steps"/>
        <result property="stepData" column="step_data"/>
        <result property="accepted" column="accepted"/>
        <result property="acceptedAt" column="accepted_at"/>
        <result property="departureAt" column="departure_at"/>
        <result property="departurePhoto" column="departure_photo"/>
        <result property="arrivalAt" column="arrival_at"/>
        <result property="arrivalPhoto" column="arrival_photo"/>
        <result property="completionPhoto" column="completion_photo"/>
        <result property="cause" column="cause"/>
        <result property="solution" column="solution"/>
        <result property="relatedTicketIds" column="related_ticket_ids"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
        <result property="dueDate" column="due_date"/>
    </resultMap>

    <!-- 关联查询结果映射 -->
    <resultMap id="TicketWithDetailsResultMap" type="com.igreen.domain.entity.Ticket" extends="TicketResultMap">
        <association property="template" javaType="com.igreen.domain.entity.Template">
            <id property="id" column="template_id"/>
            <result property="name" column="template_name"/>
        </association>
        <association property="assignee" javaType="com.igreen.domain.entity.User">
            <id property="id" column="assignee_id"/>
            <result property="name" column="assignee_name"/>
        </association>
        <association property="creator" javaType="com.igreen.domain.entity.User">
            <id property="id" column="creator_id"/>
            <result property="name" column="creator_name"/>
        </association>
    </resultMap>

    <!-- 基础列 -->
    <sql id="Base_Column_List">
        id, title, description, type, status, priority, site,
        template_id, assigned_to, created_by, completed_steps,
        step_data, accepted, accepted_at, departure_at,
        departure_photo, arrival_at, arrival_photo,
        completion_photo, cause, solution, related_ticket_ids,
        created_at, updated_at, due_date
    </sql>

    <!-- 自定义查询：带详情 -->
    <select id="selectByIdWithDetails" resultMap="TicketWithDetailsResultMap">
        SELECT t.*,
               tmpl.name as template_name,
               assignee.id as assignee_id, assignee.name as assignee_name,
               creator.id as creator_id, creator.name as creator_name
        FROM tickets t
        LEFT JOIN templates tmpl ON t.template_id = tmpl.id
        LEFT JOIN users assignee ON t.assigned_to = assignee.id
        LEFT JOIN users creator ON t.created_by = creator.id
        WHERE t.id = #{id}
    </select>

    <!-- 条件筛选查询 -->
    <select id="selectByFilters" resultMap="TicketWithDetailsResultMap">
        SELECT t.*,
               assignee.id as assignee_id, assignee.name as assignee_name,
               creator.id as creator_id, creator.name as creator_name
        FROM tickets t
        LEFT JOIN users assignee ON t.assigned_to = assignee.id
        LEFT JOIN users creator ON t.created_by = creator.id
        <where>
            <if test="type != null">
                AND t.type = #{type}
            </if>
            <if test="status != null">
                AND t.status = #{status}
            </if>
            <if test="priority != null">
                AND t.priority = #{priority}
            </if>
            <if test="assignedTo != null">
                AND t.assigned_to = #{assignedTo}
            </if>
            <if test="createdAfter != null">
                AND t.created_at >= #{createdAfter}
            </if>
        </where>
    </select>

    <!-- 按用户分配查询 -->
    <select id="selectByAssignedToWithDetails" resultMap="TicketWithDetailsResultMap">
        SELECT t.*,
               assignee.id as assignee_id, assignee.name as assignee_name,
               creator.id as creator_id, creator.name as creator_name
        FROM tickets t
        LEFT JOIN users assignee ON t.assigned_to = assignee.id
        LEFT JOIN users creator ON t.created_by = creator.id
        WHERE t.assigned_to = #{userId}
    </select>

    <!-- 统计查询 -->
    <select id="countByAssignedToAndStatus" resultType="long">
        SELECT COUNT(*)
        FROM tickets
        WHERE assigned_to = #{userId} AND status = #{status}
    </select>

</mapper>
```

## 4. Service 层改造

### 4.1 查询策略

**策略说明**:
- **简单查询**: 使用 MyBatis Plus 封装的 `LambdaQueryWrapper`、`QueryWrapper`
- **复杂查询**: 使用 XML 动态 SQL，结果映射到 DTO

```
┌─────────────────────────────────────────────────────────────┐
│                     查询策略选择                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  简单查询 (单表、条件少)          复杂查询 (多表、统计)        │
│  ┌─────────────────────┐        ┌─────────────────────┐     │
│  │ LambdaQueryWrapper  │        │ XML + ResultMap     │     │
│  │ • eq/ne/gt/lt      │        │ • 多表 JOIN         │     │
│  │ • like/in/between  │        │ • 聚合统计          │     │
│  │ • orderBy/groupBy  │        │ • 复杂条件          │     │
│  │ • select columns   │        │ • 映射到 DTO        │     │
│  └─────────────────────┘        └─────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 LambdaQueryWrapper 使用示例

```java
// 单表简单查询
public List<User> getActiveUsers() {
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(User::getStatus, "ACTIVE")
           .orderByDesc(User::getCreatedAt)
           .last("LIMIT 10");
    return userMapper.selectList(wrapper);
}

// 条件查询
public PageResult<TicketResponse> getTickets(int page, int size, String status, String keyword) {
    // 开启分页
    PageHelper.startPage(page, size);
    
    LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(Ticket::getStatus, status)
           .like(Ticket::getTitle, keyword)
           .orderByDesc(Ticket::getCreatedAt);
    
    List<Ticket> tickets = ticketMapper.selectList(wrapper);
    
    // 使用 PageResult.of(PageInfo) 直接转换
    return PageResult.of(new PageInfo<>(tickets));
}
```

#### 4.2.1 PageHelper 分页查询规范

**使用规则**:
1. `PageHelper.startPage(pageNum, pageSize)` 必须写在查询语句之前
2. 使用 `try-finally` 确保 `PageHelper.clearPage()` 被调用
3. 使用 `PageResult.of(PageInfo)` 直接转换为统一响应

```java
// 完整分页查询示例
public PageResult<TicketDTO> getTicketList(int page, int size, String status, String keyword) {
    // 1. 开启分页 (必须在查询之前)
    PageHelper.startPage(page, size);
    
    try {
        // 2. 构建查询条件
        LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(status != null, Ticket::getStatus, status)
               .like(keyword != null, Ticket::getTitle, keyword)
               .orderByDesc(Ticket::getCreatedAt);
        
        // 3. 执行查询
        List<Ticket> tickets = ticketMapper.selectList(wrapper);
        
        // 4. 转换为 DTO
        List<TicketDTO> ticketDTOs = tickets.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        // 5. 使用 PageResult.of(PageInfo) 直接转换
        PageInfo<Ticket> pageInfo = new PageInfo<>(tickets);
        return PageResult.of(pageInfo, ticketDTOs);
    } finally {
        // 6. 清理 ThreadLocal (重要!)
        PageHelper.clearPage();
    }
}
```

**参数说明**:
- `pageNum`: 当前页码，从 1 开始
- `pageSize`: 每页数量

**PageResult 转换**:
```java
// 方式1: 直接从 PageInfo 转换 (推荐)
PageInfo<Ticket> pageInfo = new PageInfo<>(tickets);
return PageResult.of(pageInfo);

// 方式2: 自定义 records 转换
return PageResult.of(pageInfo, ticketDTOs);
```

---

### 4.3 复杂查询：XML + DTO 映射

当查询涉及多表 JOIN、聚合统计或需要返回特定字段组合时，使用 XML 实现并映射到 DTO。

#### 4.3.1 定义 DTO

```java
// TicketDTO.java - 用于多表查询结果
@Data
@Builder
public class TicketDTO {
    private String id;
    private String title;
    private String status;
    private String templateName;      // 来自模板表
    private String assigneeName;      // 来自用户表
    private String creatorName;       // 来自用户表
    private Long commentCount;        // 统计数量
    private String siteName;          // 来自站点表
}
```

#### 4.3.2 Mapper 接口定义

```java
// TicketMapper.java
@Mapper
public interface TicketMapper extends BaseMapper<Ticket> {
    
    // 简单查询用 Wrapper (基类已有)
    
    // 复杂查询：多表关联
    List<TicketDTO> selectTicketsWithDetails(@Param("status") String status);
    
    // 统计查询
    TicketStatisticsDTO selectTicketStatistics();
    
    // 带分页的复杂查询
    List<TicketDTO> selectTicketListWithPagination(
            @Param("status") String status,
            @Param("keyword") String keyword
    );
}
```

**注意**: Mapper 接口不需要定义分页参数，分页由 `PageHelper.startPage()` 在 Service 层控制。

#### 4.3.3 XML 实现

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.igreen.domain.mapper.TicketMapper">

    <!-- DTO 结果映射 -->
    <resultMap id="TicketDTOResultMap" type="com.igreen.domain.dto.TicketDTO">
        <id property="id" column="id"/>
        <result property="title" column="title"/>
        <result property="status" column="status"/>
        <result property="templateName" column="template_name"/>
        <result property="assigneeName" column="assignee_name"/>
        <result property="creatorName" column="creator_name"/>
        <result property="commentCount" column="comment_count"/>
        <result property="siteName" column="site_name"/>
    </resultMap>

    <!-- 多表关联查询 - 使用 JOIN 替代子查询 -->
    <select id="selectTicketsWithDetails" resultMap="TicketDTOResultMap">
        SELECT 
            t.id,
            t.title,
            t.status,
            tmpl.name as template_name,
            assignee.name as assignee_name,
            creator.name as creator_name,
            s.name as site_name
        FROM tickets t
        LEFT JOIN templates tmpl ON t.template_id = tmpl.id
        LEFT JOIN users assignee ON t.assigned_to = assignee.id
        LEFT JOIN users creator ON t.created_by = creator.id
        LEFT JOIN sites s ON t.site = s.id
        <where>
            <if test="status != null">
                AND t.status = #{status}
            </if>
        </where>
        ORDER BY t.created_at DESC
    </select>

    <!-- 统计查询 - 使用 JOIN 替代子查询 -->
    <select id="selectTicketStatistics" resultType="com.igreen.domain.dto.TicketStatisticsDTO">
        SELECT 
            COUNT(*) as total_count,
            SUM(CASE WHEN t.status = 'OPEN' THEN 1 ELSE 0 END) as open_count,
            SUM(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_count,
            SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_count,
            SUM(CASE WHEN t.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_count,
            AVG(DATEDIFF(t.updated_at, t.created_at)) as avg_completion_days
        FROM tickets t
    </select>

    <!-- 带分页的复杂查询 - 使用 JOIN 替代子查询 -->
    <select id="selectTicketListWithPagination" resultMap="TicketDTOResultMap">
        SELECT 
            t.id,
            t.title,
            t.status,
            tmpl.name as template_name,
            assignee.name as assignee_name,
            creator.name as creator_name,
            c.comment_count
        FROM tickets t
        LEFT JOIN templates tmpl ON t.template_id = tmpl.id
        LEFT JOIN users assignee ON t.assigned_to = assignee.id
        LEFT JOIN users creator ON t.created_by = creator.id
        LEFT JOIN (
            SELECT ticket_id, COUNT(*) as comment_count 
            FROM ticket_comments 
            GROUP BY ticket_id
        ) c ON t.id = c.ticket_id
        <where>
            <if test="status != null">
                AND t.status = #{status}
            </if>
            <if test="keyword != null and keyword != ''">
                AND (t.title LIKE CONCAT('%', #{keyword}, '%')
                     OR t.description LIKE CONCAT('%', #{keyword}, '%'))
            </if>
        </where>
        ORDER BY t.created_at DESC
    </select>

    <!-- 用户工单统计 - 多表 JOIN 聚合 -->
    <select id="selectUserTicketStatistics" resultType="com.igreen.domain.dto.UserTicketStatisticsDTO">
        SELECT 
            u.id as user_id,
            u.name as user_name,
            u.username,
            COUNT(t.id) as ticket_count,
            SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_count,
            SUM(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_count,
            AVG(CASE WHEN t.status = 'COMPLETED' THEN DATEDIFF(t.updated_at, t.created_at) ELSE NULL END) as avg_completion_days
        FROM users u
        LEFT JOIN tickets t ON t.assigned_to = u.id
        WHERE u.status = 'ACTIVE'
        GROUP BY u.id, u.name, u.username
        ORDER BY ticket_count DESC
    </select>

</mapper>
```

### 4.4 JOIN vs 子查询 选择

**原则**: 优先使用 JOIN，子查询仅在必要时使用。

| 场景 | 推荐方式 | 原因 |
|------|----------|------|
| 多表关联获取字段 | JOIN | JOIN 执行效率更高，可利用索引 |
| 聚合统计 | JOIN + GROUP BY | 避免重复扫描 |
| 存在性检查 | EXISTS 子查询 | EXISTS 在找到匹配后立即返回 |
| 关联数据计数 | JOIN + GROUP BY 或 子查询 | 根据数据量选择 |

**示例对比**:

```sql
-- ❌ 不推荐：子查询（多次扫描表）
SELECT t.*, 
       (SELECT COUNT(*) FROM ticket_comments WHERE ticket_id = t.id) as comment_count
FROM tickets t

-- ✓ 推荐：JOIN（单次扫描，效率更高）
SELECT t.id, t.title, t.status, c.comment_count
FROM tickets t
LEFT JOIN (
    SELECT ticket_id, COUNT(*) as comment_count 
    FROM ticket_comments 
    GROUP BY ticket_id
) c ON t.id = c.ticket_id
```

### 4.5 查询策略对比

| 查询类型 | 推荐方式 | 示例 |
|----------|----------|------|
| 按 ID 查询 | `selectById()` | `userMapper.selectById(id)` |
| 按状态查询 | `LambdaQueryWrapper` | `wrapper.eq(User::getStatus, status)` |
| 关键词搜索 | `LambdaQueryWrapper` | `wrapper.like(User::getName, keyword)` |
| 分页查询 | `PageHelper` | `PageHelper.startPage()` + `PageInfo` |
| 多表关联 | XML + DTO + JOIN | `selectTicketsWithDetails()` |
| 聚合统计 | XML + DTO | `selectTicketStatistics()` |
| 复杂条件组合 | XML + DTO | 多条件动态 SQL |

---

### 4.6 带分页的复杂查询

对于需要分页的复杂查询 (多表关联)，使用 `PageHelper` + XML 实现：

```java
@Transactional(readOnly = true)
public PageResult<TicketDTO> getTicketListWithPagination(int page, int size, String status, String keyword) {
    // 1. 开启分页
    PageHelper.startPage(page, size);
    
    try {
        // 2. 执行复杂查询
        List<TicketDTO> tickets = ticketMapper.selectTicketListWithPagination(status, keyword);
        
        // 3. 获取分页信息
        PageInfo<TicketDTO> pageInfo = new PageInfo<>(tickets);
        
        // 4. 返回结果
        return PageResult.of(tickets, pageInfo.getTotal(), page, size);
    } finally {
        PageHelper.clearPage();
    }
}
```

Mapper 接口 (无需分页参数):
```java
List<TicketDTO> selectTicketListWithPagination(
        @Param("status") String status,
        @Param("keyword") String keyword
);
```

---

### 4.7 改造示例：TicketService

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketMapper ticketMapper;
    private final UserMapper userMapper;
    private final TicketCommentMapper ticketCommentMapper;

    // ========== 简单查询：使用 Wrapper + PageHelper ==========

    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByStatus(String status) {
        LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Ticket::getStatus, status)
               .orderByDesc(Ticket::getCreatedAt);
        return ticketMapper.selectList(wrapper).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getTickets(int page, int size, String status, String keyword) {
        // 开启分页
        PageHelper.startPage(page, size);
        
        try {
            LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(status != null, Ticket::getStatus, status)
                   .like(keyword != null, Ticket::getTitle, keyword)
                   .orderByDesc(Ticket::getCreatedAt);
            
            List<Ticket> tickets = ticketMapper.selectList(wrapper);
            
            List<TicketResponse> ticketResponses = tickets.stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
            
            // 使用 PageResult.of(PageInfo) 直接转换
            return PageResult.of(new PageInfo<>(tickets), ticketResponses);
        } finally {
            PageHelper.clearPage();
        }
    }

    // ========== 复杂查询：使用 XML + DTO ==========

    @Transactional(readOnly = true)
    public List<TicketDTO> getTicketsWithDetails(String status) {
        return ticketMapper.selectTicketsWithDetails(status);
    }

    @Transactional(readOnly = true)
    public TicketStatisticsDTO getStatistics() {
        return ticketMapper.selectTicketStatistics();
    }

    // ========== 带分页的复杂查询 ==========

    @Transactional(readOnly = true)
    public PageResult<TicketDTO> getTicketListWithPagination(int page, int size, String status, String keyword) {
        PageHelper.startPage(page, size);
        
        try {
            List<TicketDTO> tickets = ticketMapper.selectTicketListWithPagination(status, keyword);
            return PageResult.of(new PageInfo<>(tickets));
        } finally {
            PageHelper.clearPage();
        }
    }
}
```

    @Transactional(readOnly = true)
    public PageResult<TicketDTO> getTicketListWithPagination(int page, int size, String status, String keyword) {
        Page<TicketDTO> ticketPage = new Page<>(page, size);
        IPage<TicketDTO> result = ticketMapper.selectTicketListWithPagination(status, keyword, ticketPage);
        return PageResult.of(result.getRecords(), result.getTotal(), page, size);
    }
}
```

## 5. 配置类设计

### 5.1 MyBatis Plus 配置

**注意**: 本项目使用 **PageHelper** 进行分页，无需配置 MyBatis Plus 分页拦截器。

```java
package com.igreen.common.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class MybatisPlusConfig {

    @Bean
    public MetaObjectHandler metaObjectHandler() {
        return new MetaObjectHandler() {
            @Override
            public void insertFill(MetaObject metaObject) {
                this.strictInsertFill(metaObject, "createdAt", LocalDateTime.class, LocalDateTime.now());
                this.strictInsertFill(metaObject, "updatedAt", LocalDateTime.class, LocalDateTime.now());
            }

            @Override
            public void updateFill(MetaObject metaObject) {
                this.strictUpdateFill(metaObject, "updatedAt", LocalDateTime.class, LocalDateTime.now());
            }
        };
    }
}
```

### 5.2 PageHelper 配置

#### 5.2.1 pom.xml 依赖

```xml
<!-- PageHelper 分页插件 -->
<dependency>
    <groupId>com.github.pagehelper</groupId>
    <artifactId>pagehelper-spring-boot-starter</artifactId>
    <version>1.4.7</version>
</dependency>
```

#### 5.2.2 application.yml 配置

PageHelper 是物理分页，需要在 `application.yml` 中配置：

```yaml
pagehelper:
  helperDialect: mysql
  reasonable: true
  supportMethodsArguments: true
  params: count=countSql
```

**或者使用自动配置** (Spring Boot Starter):

```xml
<dependency>
    <groupId>com.github.pagehelper</groupId>
    <artifactId>pagehelper-spring-boot-starter</artifactId>
    <version>1.4.7</version>
</dependency>
```

## 6. 测试策略

### 6.1 单元测试 (Mock)

```java
@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketMapper ticketMapper;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private TicketService ticketService;

    @Test
    void testGetTicketById() {
        // Given
        String ticketId = "test-id";
        Ticket mockTicket = Ticket.builder()
                .id(ticketId)
                .title("Test Ticket")
                .build();
        when(ticketMapper.selectByIdWithDetails(ticketId)).thenReturn(mockTicket);

        // When
        TicketResponse result = ticketService.getTicketById(ticketId);

        // Then
        assertNotNull(result);
        assertEquals(ticketId, result.id());
        verify(ticketMapper).selectByIdWithDetails(ticketId);
    }
}
```

### 6.2 集成测试

```java
@SpringBootTest
@ActiveProfiles("test")
class TicketMapperIntegrationTest {

    @Autowired
    private TicketMapper ticketMapper;

    @Test
    void testSelectByIdWithDetails() {
        // Given
        Ticket ticket = new Ticket();
        ticket.setId(UUID.randomUUID().toString());
        ticket.setTitle("Integration Test");
        ticketMapper.insert(ticket);

        // When
        Ticket result = ticketMapper.selectByIdWithDetails(ticket.getId());

        // Then
        assertNotNull(result);
        assertEquals("Integration Test", result.getTitle());
    }
}
```

## 7. 迁移检查清单

### 7.1 准备阶段

- [ ] pom.xml 确认 MyBatis Plus 依赖
- [ ] application.yml 配置 MyBatis Plus
- [ ] 创建 MybatisPlusConfig 配置类
- [ ] 配置 Mapper 扫描路径

### 7.2 迁移阶段

- [ ] 创建 UserMapper + UserMapper.xml
- [ ] 创建 GroupMapper + GroupMapper.xml
- [ ] 创建 SiteMapper + SiteMapper.xml
- [ ] 创建 ConfigMapper (SLAConfig, SiteLevelConfig)
- [ ] 创建 ProblemTypeMapper
- [ ] 创建 TemplateMapper + TemplateStepMapper + TemplateFieldMapper
- [ ] 创建 FileMapper
- [ ] 创建 TicketMapper + TicketCommentMapper

### 7.3 Service 改造阶段

- [ ] UserService 改造
- [ ] GroupService 改造
- [ ] SiteService 改造
- [ ] ConfigService 改造
- [ ] ProblemTypeService 改造
- [ ] TemplateService 改造
- [ ] FileService 改造
- [ ] TicketService 改造

### 7.4 测试阶段

- [ ] 单元测试迁移
- [ ] 集成测试覆盖
- [ ] API 端到端测试

### 7.5 清理阶段

- [ ] 移除 JPA Repository
- [ ] 移除 JPA 依赖 (可选)
- [ ] 清理无用的 import
