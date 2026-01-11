# 规范增量：测试覆盖

**规范 ID**: 20260111_jpa_to_mybatisplus/003  
**规范类型**: 质量保障  
**版本**: 1.0.0

## 变更概述

确保迁移后的代码具有充分的测试覆盖，包括单元测试、集成测试和端到端测试。

## 新增需求

### TEST-001: 单元测试迁移

**需求描述**: 将所有使用 JPA Repository Mock 的单元测试迁移为使用 MyBatis Plus Mapper Mock。

**验收标准**:
- `TicketServiceTest` 已迁移
- `UserServiceTest` 已迁移
- 其他 Service 测试已迁移
- 测试通过率 ≥ 90%
- 无编译错误

**实现位置**:
- `src/test/java/com/igreen/domain/service/TicketServiceTest.java`
- `src/test/java/com/igreen/domain/service/UserServiceTest.java`

**关联任务**: 5.1

---

### TEST-002: Mapper 单元测试

**需求描述**: 为 Mapper 接口创建单元测试。

**验收标准**:
- 每个自定义查询方法有对应的测试
- 使用 `@MockBean` 或 `@Mock` 模拟数据库
- 测试覆盖率达到 80% 以上

**实现位置**:
- `src/test/java/com/igreen/domain/mapper/`

**关联任务**: 5.1

---

### TEST-003: 集成测试基类

**需求描述**: 创建 Mapper 集成测试基类。

**验收标准**:
- 创建 `BaseMapperTest` 基类
- 配置 `@SpringBootTest` 和 `@Transactional`
- 提供测试数据初始化方法
- 其他测试类继承此基类

**示例**:
```java
@SpringBootTest
@Transactional
@ActiveProfiles("test")
abstract class BaseMapperTest {
    @Autowired
    protected DataSource dataSource;

    @BeforeEach
    void setUp() {
        // 初始化测试数据
    }
}
```

**实现位置**:
- `src/test/java/com/igreen/domain/mapper/BaseMapperTest.java`

**关联任务**: 5.2

---

### TEST-004: 关键查询集成测试

**需求描述**: 为关键业务查询创建集成测试。

**验收标准**:
- `TicketMapper.selectByIdWithDetails()` 集成测试
- `UserMapper.selectByUsername()` 集成测试
- `TemplateMapper.selectByIdWithStepsAndFields()` 集成测试
- 分页查询集成测试
- 关联查询集成测试

**关联任务**: 5.2

---

### TEST-005: API 端到端测试

**需求描述**: 执行完整的 API 端到端测试。

**验收标准**:
- 所有 REST API 端点测试通过
- 验证响应数据结构
- 验证性能无明显下降 (>20% 性能下降需预警)
- 无 `LazyInitializationException`

**测试工具**:
- Postman / Insomnia
- curl 脚本
- 或集成测试框架

**关联任务**: 5.3

---

## 修改需求

### TEST-M001: 测试 Mock 对象更新

**需求描述**: 更新测试中的 Mock 对象类型。

**验收标准**:
- `@Mock` 注解目标从 Repository 改为 Mapper
- Mock 方法调用与 Mapper 接口一致
- `verify()` 验证调用正确的 Mapper 方法

**示例**:
```java
// Before
@Mock
private TicketRepository ticketRepository;

// After
@Mock
private TicketMapper ticketMapper;
```

**关联任务**: 5.1

---

### TEST-M002: 测试数据初始化更新

**需求描述**: 更新测试数据初始化逻辑。

**验收标准**:
- 使用 `mapper.insert()` 保存测试数据
- 使用 `mapper.deleteById()` 清理测试数据
- 避免使用 JPA Repository 方法

**关联任务**: 5.1, 5.2

---

## 质量指标

### QUAL-001: 测试覆盖率

**要求描述**: 代码测试覆盖率要求。

**要求**:
- 单元测试覆盖率 ≥ 80%
- Service 层测试覆盖率 ≥ 90%
- Mapper 自定义方法测试覆盖率 = 100%

**测量工具**: JaCoCo

---

### QUAL-002: 测试稳定性

**要求描述**: 测试用例应稳定可靠。

**要求**:
- 无随机失败的测试
- 测试执行时间 < 5分钟 (单元测试)
- 测试之间无相互依赖
- 可独立运行每个测试

---

### QUAL-003: 测试数据管理

**要求描述**: 测试数据管理规范。

**要求**:
- 使用 `@Transactional` 回滚测试数据
- 测试数据不污染生产数据库
- 使用 H2 内存数据库进行快速测试

---

## 测试场景

### SCENARIO-001: CRUD 操作测试

**场景描述**: 验证 Mapper 的基本 CRUD 操作。

**测试用例**:
- `testInsert()` - 测试插入操作
- `testSelectById()` - 测试按 ID 查询
- `testUpdateById()` - 测试更新操作
- `testDeleteById()` - 测试删除操作

**验收标准**: 所有 CRUD 操作正常

---

### SCENARIO-002: 关联查询测试

**场景描述**: 验证关联查询的正确性。

**测试用例**:
- `testSelectByIdWithDetails()` - Ticket 关联查询
- `testSelectByIdWithGroup()` - User 关联查询
- `testSelectByIdWithStepsAndFields()` - Template 关联查询

**验收标准**: 关联数据正确映射，无 N+1 问题

---

### SCENARIO-003: 分页查询测试

**场景描述**: 验证分页查询的正确性。

**测试用例**:
- `testSelectPage()` - 基本分页
- `testSelectPageWithCondition()` - 带条件分页
- `testSelectPageWithSort()` - 带排序分页

**验收标准**:
- 分页结果数量正确
- 总数计算正确
- 页码计算正确

---

### SCENARIO-004: JOIN 查询测试

**场景描述**: 验证多表 JOIN 查询的正确性和性能。

**测试用例**:
- `testSelectTicketsWithDetails()` - 多表 JOIN 查询
- `testSelectTicketStatistics()` - 聚合统计查询
- `testSelectUserTicketStatistics()` - 用户相关统计

**验收标准**:
- JOIN 结果正确
- 无重复数据
- 性能可接受 (对比原 JPA 查询)

**性能基准**:
| 查询类型 | 预期性能 | 阈值 |
|----------|----------|------|
| 单表查询 | < 50ms | < 100ms |
| 双表 JOIN | < 100ms | < 200ms |
| 三表以上 JOIN | < 200ms | < 500ms |
| 聚合统计 | < 200ms | < 500ms |

---

### SCENARIO-005: 性能测试

**场景描述**: 验证查询性能满足要求。

**测试用例**:
- `testSimpleQueryPerformance()` - 简单查询性能
- `testJoinQueryPerformance()` - JOIN 查询性能
- `testPaginationPerformance()` - 分页查询性能

**验收标准**:
- 简单查询 < 50ms
- JOIN 查询 < 200ms
- 分页查询 < 100ms

**基准对比**:
- MyBatis Plus 查询性能应不低于原 JPA 查询
- JOIN 查询性能应优于子查询方案

---

### SCENARIO-006: 动态查询测试

**场景描述**: 验证动态条件查询的正确性。

**测试用例**:
- `testSelectByFilters_AllNull()` - 全空条件
- `testSelectByFilters_SingleCondition()` - 单条件
- `testSelectByFilters_MultipleConditions()` - 多条件
- `testSelectByFilters_KeywordSearch()` - 关键词搜索

**验收标准**: 动态条件正确拼接

---

## 测试环境

### ENV-001: 测试配置文件

**要求描述**: 使用独立的测试配置文件。

**要求**:
- `application-test.yml` 配置测试数据库
- 使用 H2 内存数据库
- 日志级别调整

**配置示例**:
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop
```

---

### ENV-002: 测试数据准备

**要求描述**: 提供测试数据准备工具。

**要求**:
- `TestDataFactory` 工厂类
- 常用测试数据构建方法
- 测试数据清理机制

---

## 验收标准总结

| 测试类型 | 覆盖率要求 | 执行时间 | 稳定性要求 |
|----------|------------|----------|------------|
| 单元测试 | ≥ 80% | < 5min | 100% 稳定 |
| 集成测试 | ≥ 70% | < 10min | 95% 稳定 |
| 端到端测试 | 全部 API | < 30min | 100% 稳定 |
