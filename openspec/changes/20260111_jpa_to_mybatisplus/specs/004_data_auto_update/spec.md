# 规范增量：数据库自动更新

**规范 ID**: 20260111_jpa_to_mybatisplus/004  
**规范类型**: 功能保留  
**版本**: 1.0.0

## 变更概述

保留 JPA 的 `ddl-auto: update` 自动建表功能，同时数据访问层迁移到 MyBatis Plus。

## 保留需求

### AUTO-001: JPA ddl-auto 自动建表

**需求描述**: 保留 JPA 实体类和 `ddl-auto: update` 配置用于自动建表。

**验收标准**:
- 实体类保留 `@Entity`, `@Table`, `@Column` 等 JPA 注解
- `application.yml` 中保留 `spring.jpa.hibernate.ddl-auto: update`
- 表结构变更时自动更新
- 无需手动执行 DDL 语句

**实现配置**:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true
```

**说明**: 实体类仅用于建表，实际数据访问使用 MyBatis Plus Mapper。

---

### AUTO-002: 实体类保留 JPA 注解

**需求描述**: 实体类保留完整的 JPA 注解定义，用于 Hibernate 自动建表。

**验收标准**:
- `@Entity` 注解保留
- `@Table` 注解保留，包含索引定义
- `@Column` 注解保留
- `@Id`, `@Enumerated`, `@ManyToOne`, `@OneToMany` 等保留
- `@PrePersist`, `@PreUpdate` 保留

**示例**:
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

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

---

### AUTO-003: 关联字段 @JsonIgnore

**需求描述**: 实体类中的关联字段添加 `@JsonIgnore`，防止序列化循环。

**验收标准**:
- `@ManyToOne` 和 `@OneToMany` 字段添加 `@JsonIgnore`
- API 响应无循环引用问题
- 无 `InvalidDefinitionException`

**示例**:
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "assigned_to", insertable = false, updatable = false)
@JsonIgnore
private User assignee;
```

---

## 修改需求

### AUTO-M001: 实体类职责分离

**需求描述**: 实体类不再用于数据访问，仅用于定义表结构和自动建表。

**验收标准**:
- 数据访问通过 MyBatis Plus Mapper 进行
- Service 层不直接使用 JpaRepository
- 实体类可被 Mapper 返回，但不再依赖 JPA 的延迟加载

**说明**: 这是一种职责分离策略，JPA 负责"定义"，MyBatis Plus 负责"操作"。

---

## 技术约束

### TC-001: 注解保留规则

**约束描述**: 以下 JPA 注解必须保留。

**规则**:
- `@Entity` - 标记实体类
- `@Table` - 定义表名和索引
- `@Column` - 定义列属性
- `@Id` - 定义主键
- `@Enumerated` - 定义枚举映射
- `@PrePersist`, `@PreUpdate` - 定义自动时间戳

---

### TC-002: 注解移除规则

**约束描述**: 以下 JPA 注解可以移除或替换。

**规则**:
- `@OneToMany`, `@ManyToOne` 保留用于建表，但添加 `@JsonIgnore`
- `@JoinColumn` 保留用于建表
- `@Transactional` 由 Service 层控制，与 Repository 解耦

---

## 开发流程

### DEV-001: 新增实体字段流程

**流程描述**: 当需要新增字段时的开发流程。

1. 在实体类中添加字段和 `@Column` 注解
2. 重启应用，`ddl-auto: update` 自动创建列
3. 创建对应的 Mapper XML 映射 (如需要)
4. 更新 Service 层使用新字段
5. 更新 DTO 层

**优势**: 无需手动编写 DDL 语句

---

### DEV-002: 新增实体流程

**流程描述**: 当需要创建新实体时的开发流程。

1. 创建实体类，添加 JPA 注解
2. 重启应用，`ddl-auto: update` 自动创建表
3. 创建对应的 Mapper 接口和 XML
4. 在 Service 层使用

---

## 兼容性

### COMP-001: 表结构兼容性

**要求描述**: 保持与现有数据库结构的兼容性。

**要求**:
- `ddl-auto: update` 不会删除现有数据
- 仅添加新列或新表
- 索引定义与现有索引一致

---

### COMP-002: 数据访问兼容性

**要求描述**: MyBatis Plus 与 JPA 共存时的数据访问兼容性。

**要求**:
- 两套框架操作同一张表
- 数据一致性由事务保证
- 避免同时使用两种方式操作同一数据

---

## 验收标准

| 检查项 | 验收标准 |
|--------|----------|
| ddl-auto 功能 | 表结构变更时自动更新 |
| 数据完整性 | 迁移过程中数据不丢失 |
| 关联字段 | 添加 `@JsonIgnore`，无循环序列化 |
| 建表速度 | 启动时间无明显增加 |
| 兼容性 | 与现有数据库结构兼容 |
