# 提案：JPA 迁移至 MyBatis Plus

**提案 ID**: 20260111_jpa_to_mybatisplus  
**提案日期**: 2026-01-11  
**状态**: 草稿  

## 摘要

当前项目使用 Spring Data JPA 进行数据访问，但团队对 JPA 不够熟悉。希望迁移到 MyBatis Plus，保留 JPA 的 `ddl-auto: update` 自动建表功能，同时使用 MyBatis Plus 的 Mapper 方式进行数据操作。

## 背景与动机

### 当前技术栈

- **数据库访问层**: Spring Data JPA (JpaRepository)
- **ORM**: Hibernate
- **自动建表**: `spring.jpa.hibernate.ddl-auto: update`
- **MyBatis Plus**: 已在 pom.xml 中引入 (3.5.5)，但未实际使用

### 痛点

1. 团队对 JPA/Hibernate 不熟悉
2. 复杂的关联查询需要使用 `@EntityGraph` 或 `@Query`，理解成本高
3. JPA 的懒加载和代理对象在 JSON 序列化时容易出现 `LazyInitializationException`
4. 动态 SQL 编写受限

### 迁移目标

1. 保留 `ddl-auto: update` 自动建表能力
2. 使用 MyBatis Plus 的 `BaseMapper` 进行数据访问
3. 手动编写 XML/注解 SQL，团队更易维护
4. 保持现有 Service 层业务逻辑不变

## 方案对比

| 维度 | JPA (当前) | MyBatis Plus (目标) |
|------|------------|---------------------|
| 学习成本 | 高 (Hibernate 复杂) | 低 (接近原生 SQL) |
| 动态 SQL | 有限 (@Query) | 完全支持 |
| 性能优化 | 自动优化 | 手动可控 |
| 懒加载 | 自动但易出问题 | 需要显式 JOIN |
| 自动建表 | 原生支持 | 需要额外配置 |
| 代码量 | 较少 (Repository 自动生成) | 稍多 (需写 Mapper) |

## 迁移范围

### 需要迁移的模块

| 模块 | 实体数量 | Repository 数量 | 说明 |
|------|----------|-----------------|------|
| Ticket | 1 | 2 | Ticket, TicketComment |
| User | 1 | 1 | User |
| Template | 3 | 3 | Template, TemplateStep, TemplateField |
| Site | 1 | 1 | Site |
| Group | 1 | 1 | Group |
| Config | 2 | 2 | SLAConfig, SiteLevelConfig |
| ProblemType | 1 | 1 | ProblemType |
| File | 1 | 1 | File |

**总计**: 11 个实体, 12 个 Repository

### 不迁移的部分

- Controller 层 (保持 REST API 不变)
- Service 层 (业务逻辑不变，只更换注入的 Repository)
- DTO 层 (保持不变)
- 实体类 (保留 JPA 注解用于 `ddl-auto` 自动建表，无需 @JsonIgnore)

## 技术方案

### 方案架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Controller Layer                         │
│                   (保持不变)                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│                   (更换注入源)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Repository Layer                          │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │   JpaRepository │ ✗ │  MyBatis Plus BaseMapper + XML   │ │
│  │   (删除)        │    │  (新实现)                       │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Entity Layer                             │
│                   (保留 JPA 注解 + @JsonIgnore)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database                                 │
│                   (MySQL)                                    │
└─────────────────────────────────────────────────────────────┘
```

### 关键实现细节

#### 1. 实体类保留 JPA 注解用于自动建表

实体类保持 JPA 注解不变，用于 `ddl-auto: update` 自动维护表结构。关联字段添加 `@JsonIgnore` 避免序列化循环。

```java
@Entity
@Table(name = "tickets")
public class Ticket {
    @Id
    @Column(length = 36)
    private String id;

    // 关联字段添加 @JsonIgnore，避免序列化循环
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to", insertable = false, updatable = false)
    @JsonIgnore
    private User assignee;
}
```

#### 2. 创建 MyBatis Plus Mapper

```java
@Mapper
public interface TicketMapper extends BaseMapper<Ticket> {
    // 自定义查询方法
    Ticket selectByIdWithDetails(@Param("id") String id);
    Page<Ticket> selectByFilters(...);
}
```

#### 2. 创建 MyBatis Plus Mapper

```java
@Mapper
public interface TicketMapper extends BaseMapper<Ticket> {
    // 自定义查询方法
    Ticket selectByIdWithDetails(@Param("id") String id);
    Page<Ticket> selectByFilters(...);
}
```

#### 3. XML 映射文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.igreen.domain.mapper.TicketMapper">
    <!-- 自定义查询 -->
</mapper>
```

#### 4. Service 层改造

```java
@Service
public class TicketService {
    private final TicketMapper ticketMapper;  // 替换 TicketRepository
    // 业务逻辑保持不变
}
```

### 配置调整

#### application.yml

```yaml
spring:
  datasource:
    # 保持不变
  jpa:
    hibernate:
      ddl-auto: update  # 保留自动建表
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true

mybatis-plus:
  mapper-locations: classpath*:/mapper/**/*.xml
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

## 迁移步骤

1. **准备阶段**
   - 添加 MyBatis Plus 依赖 (已完成)
   - 配置 Mapper 扫描
   - 创建基础 Mapper 接口

2. **逐模块迁移** (按依赖顺序)
   - User → Group → Site
   - Config → ProblemType
   - Template → TemplateStep → TemplateField
   - File → Ticket → TicketComment

3. **测试验证**
   - 单元测试 (Mock Mapper)
   - 集成测试 (实际数据库)
   - API 端到端测试

4. **清理阶段**
   - 移除 JPA 依赖
   - 删除旧的 Repository 文件
   - 实体类添加 `@JsonIgnore` 注解 (防止循环引用)

## 风险与缓解

| 风险 | 级别 | 缓解措施 |
|------|------|----------|
| 迁移过程中功能 regression | 高 | 充分的测试覆盖 |
| 性能下降 | 中 | 使用 MyBatis Plus 原生优化 |
| 关联查询遗漏 | 中 | 逐模块对比验证 |
| 性能不达标 | 低 | 500ms 阈值监控 |

## 时间估算

| 阶段 | 工作量 | 说明 |
|------|--------|------|
| 准备阶段 | 2 人天 | 配置、基础框架 |
| 模块迁移 | 8-10 人天 | 12 个 Repository |
| 测试验证 | 3 人天 | 单元+集成测试 |
| 清理优化 | 1 人天 | 移除旧代码 |
| **总计** | **14-16 人天** | |

## 验收标准

- [ ] 所有 API 端点功能正常
- [ ] 单元测试通过率 ≥ 90%
- [ ] 集成测试覆盖核心业务流程
- [ ] 迁移后无 JPA 懒加载问题
- [ ] JPA Repository 逐步移除
- [ ] 所有查询响应时间 < 500ms
- [ ] 代码审查通过

## 备选方案

**方案 A: 渐进式迁移**  
保留 JPA Repository，新增 MyBatis Plus Mapper，逐步切换。

**方案 B: 一次性迁移**  
直接移除 JPA Repository，完全使用 MyBatis Plus。

**当前推荐**: 方案 A，渐进式迁移风险最低。

## 开放问题

1. ~~是否需要保留 JPA 依赖作为备份？~~ → **保留，用于 ddl-auto**
2. Mapper XML 文件的组织结构偏好？
3. ~~是否需要自定义 BaseMapper 扩展方法？~~ → **需要自定义，添加通用方法**
4. 性能基准测试的阈值要求？

---

**提案人**: litengfei  
**评审**: 待定
