# 任务清单：JPA 到 MyBatis Plus 迁移

**变更 ID**: 20260111_jpa_to_mybatisplus

## 任务概览

| 阶段 | 任务数 | 预计工时 |
|------|--------|----------|
| 准备阶段 | 4 | 2 人天 |
| 基础框架 | 4 | 1 人天 |
| 核心模块迁移 | 8 | 5 人天 |
| 业务模块迁移 | 6 | 4 人天 |
| 测试阶段 | 4 | 2 人天 |
| 清理阶段 | 2 | 1 人天 |
| **总计** | **28** | **15 人天** |

---

## 阶段 1：准备阶段

### 任务 1.1：分析当前项目 JPA 使用情况

**描述**: 分析当前项目中 JPA 的使用模式，识别所有 Repository 和自定义查询。

**验收标准**:
- [ ] 列出所有 12 个 Repository
- [ ] 识别所有自定义 @Query 方法
- [ ] 识别所有 @EntityGraph 使用
- [ ] 输出分析报告

**依赖**: 无

**负责人**: litengfei  
**工时**: 0.5 人天

---

### 任务 1.2：设计 Mapper 接口规范

**描述**: 制定统一的 Mapper 接口命名规范和方法签名。

**验收标准**:
- [ ] 定义基础 Mapper 接口模板
- [ ] 制定 XML 文件命名规范
- [ ] 定义 ResultMap 命名规范
- [ ] 输出接口规范文档

**依赖**: 1.1

**负责人**: litengfei  
**工时**: 0.5 人天

---

### 任务 1.3：确认项目依赖配置

**描述**: 确认 pom.xml 中 MyBatis Plus 依赖和 PageHelper 配置正确，JPA 依赖保留用于 ddl-auto。

**验收标准**:
- [ ] MyBatis Plus 版本确认 (3.5.5)
- [ ] 添加 PageHelper 依赖 (1.4.7)
- [ ] application.yml 配置 PageHelper
- [ ] JPA 依赖保留用于 `ddl-auto: update`
- [ ] JPA Repository 依赖移除

**依赖**: 无

**负责人**: litengfei  
**工时**: 0.5 人天

---

### 任务 1.4：创建数据库配置说明文档

**描述**: 记录当前数据库连接配置和 ddl-auto 设置，说明 JPA 用于自动建表。

**验收标准**:
- [ ] 记录 datasource 配置
- [ ] 记录 jpa.hibernate.ddl-auto 配置
- [ ] 说明 JPA 用于自动建表，MyBatis Plus 用于数据访问

**依赖**: 无

**负责人**: litengfei  
**工时**: 0.5 人天

---

## 阶段 2：基础框架

### 任务 2.1：创建 MyBatis Plus 配置类

**描述**: 创建 MybatisPlusConfig 配置类，配置分页插件和自动填充。

**验收标准**:
- [ ] 配置 MybatisPlusInterceptor
- [ ] 配置 PaginationInnerInterceptor (MYSQL)
- [ ] 配置 MetaObjectHandler (createdAt, updatedAt)
- [ ] 单元测试验证配置

**文件**:
- `src/main/java/com/igreen/common/config/MybatisPlusConfig.java`

**依赖**: 1.3

**负责人**: litengfei  
**工时**: 0.5 人天

---

### 任务 2.2：配置 Mapper 扫描

**描述**: 在主应用类或配置类中添加 Mapper 扫描注解。

**验收标准**:
- [ ] 添加 @MapperScan 注解
- [ ] 配置扫描路径: `com.igreen.domain.mapper`
- [ ] 验证扫描生效

**文件**:
- `src/main/java/com/igreen/Application.java` (或 config)

**依赖**: 2.1

**负责人**: litengfei  
**工时**: 0.25 人天

---

### 任务 2.3：创建基础 Mapper 接口

**描述**: 创建 BaseMapper 接口，扩展 MyBatis Plus 的 BaseMapper，添加项目通用方法。

**验收标准**:
- [ ] 创建 `com.igreen.domain.mapper.BaseMapper` 接口
- [ ] 继承 `com.baomidou.mybatisplus.core.mapper.BaseMapper<T>`
- [ ] 定义通用方法扩展:
  - `selectBatchIds(List<String> ids)` - 批量查询
  - `logicalDeleteById(String id)` - 逻辑删除
  - `logicalDeleteBatchIds(List<String> ids)` - 批量逻辑删除
  - `countValid()` - 统计有效记录
- [ ] 所有实体 Mapper 继承此接口

**文件**:
- `src/main/java/com/igreen/domain/mapper/BaseMapper.java`

**依赖**: 2.1

**负责人**: litengfei  
**工时**: 0.25 人天

---

### 任务 2.4：创建统一 ResultMap 模板

**描述**: 创建 XML 映射文件的通用模板和 ResultMap 定义。

**验收标准**:
- [ ] 创建 `mapper/BaseResultMap.xml` 模板
- [ ] 定义通用列模板 `<sql id="Base_Column_List">`
- [ ] 定义通用 ResultMap
- [ ] 各实体 Mapper XML 引用此模板

**文件**:
- `src/main/resources/mapper/BaseResultMap.xml`

**依赖**: 2.1, 2.3

**负责人**: litengfei  
**工时**: 0.25 人天

---

## 阶段 3：核心模块迁移

### 任务 3.1：User 模块迁移

**描述**: 迁移 User 相关的 Repository 到 MyBatis Plus。

**验收标准**:
- [ ] 创建 UserMapper 接口 (继承 BaseMapper)
- [ ] 创建 UserMapper.xml (只定义复杂查询)
- [ ] 简单查询使用 LambdaQueryWrapper (不写 XML)
- [ ] 复杂查询使用 XML + DTO (selectByIdWithGroup, selectUserStatisticsByGroup)
- [ ] 创建 UserStatisticsDTO 用于统计查询
- [ ] UserService 改造并测试通过

**文件**:
- `src/main/java/com/igreen/domain/mapper/UserMapper.java`
- `src/main/resources/mapper/UserMapper.xml`
- `src/main/java/com/igreen/domain/dto/UserStatisticsDTO.java`

**依赖**: 阶段 2

**负责人**: litengfei  
**工时**: 1 人天

---

### 任务 3.2：Group 模块迁移

**描述**: 迁移 Group 相关的 Repository 到 MyBatis Plus。

**验收标准**:
- [ ] 创建 GroupMapper 接口
- [ ] 创建 GroupMapper.xml
- [ ] GroupService 改造并测试通过

**文件**:
- `src/main/java/com/igreen/domain/mapper/GroupMapper.java`
- `src/main/resources/mapper/GroupMapper.xml`

**依赖**: 3.1

**负责人**: litengfei  
**工时**: 0.5 人天

---

### 任务 3.3：Site 模块迁移

**描述**: 迁移 Site 相关的 Repository 到 MyBatis Plus。

**验收标准**:
- [ ] 创建 SiteMapper 接口
- [ ] 创建 SiteMapper.xml
- [ ] SiteService 改造并测试通过

**文件**:
- `src/main/java/com/igreen/domain/mapper/SiteMapper.java`
- `src/main/resources/mapper/SiteMapper.xml`

**依赖**: 3.1

**负责人**: litengfei  
**工时**: 0.5 人天

---

### 任务 3.4：Config 模块迁移

**描述**: 迁移 SLAConfig 和 SiteLevelConfig 相关的 Repository 到 MyBatis Plus。

**验收标准**:
- [ ] 创建 SLAConfigMapper 接口
- [ ] 创建 SiteLevelConfigMapper 接口
- [ ] 创建对应的 XML 文件
- [ ] ConfigService 改造并测试通过

**文件**:
- `src/main/java/com/igreen/domain/mapper/SLAConfigMapper.java`
- `src/main/java/com/igreen/domain/mapper/SiteLevelConfigMapper.java`
- `src/main/resources/mapper/SLAConfigMapper.xml`
- `src/main/resources/mapper/SiteLevelConfigMapper.xml`

**依赖**: 3.1

**负责人**: litengfei  
**工时**: 1 人天

---

### 任务 3.5：ProblemType 模块迁移

**描述**: 迁移 ProblemType 相关的 Repository 到 MyBatis Plus。

**验收标准**:
- [ ] 创建 ProblemTypeMapper 接口
- [ ] 创建 ProblemTypeMapper.xml
- [ ] ProblemTypeService 改造并测试通过

**文件**:
- `src/main/java/com/igreen/domain/mapper/ProblemTypeMapper.java`
- `src/main/resources/mapper/ProblemTypeMapper.xml`

**依赖**: 3.1

**负责人**: litengfei  
**工时**: 0.5 人天

---

### 任务 3.6：Template 模块迁移

**描述**: 迁移 Template, TemplateStep, TemplateField 相关的 Repository 到 MyBatis Plus。

**验收标准**:
- [ ] 创建 TemplateMapper, TemplateStepMapper, TemplateFieldMapper 接口
- [ ] 创建对应的 XML 文件
- [ ] 迁移关联查询 (findByIdWithStepsAndFields)
- [ ] TemplateService 改造并测试通过

**文件**:
- `src/main/java/com/igreen/domain/mapper/TemplateMapper.java`
- `src/main/java/com/igreen/domain/mapper/TemplateStepMapper.java`
- `src/main/java/com/igreen/domain/mapper/TemplateFieldMapper.java`
- `src/main/resources/mapper/TemplateMapper.xml`
- `src/main/resources/mapper/TemplateStepMapper.xml`
- `src/main/resources/mapper/TemplateFieldMapper.xml`

**依赖**: 3.1

**负责人**: litengfei  
**工时**: 1.5 人天

---

## 阶段 4：业务模块迁移

### 任务 4.1：File 模块迁移

**描述**: 迁移 File 相关的 Repository 到 MyBatis Plus。

**验收标准**:
- [ ] 创建 FileMapper 接口
- [ ] 创建 FileMapper.xml
- [ ] FileService 改造并测试通过

**文件**:
- `src/main/java/com/igreen/domain/mapper/FileMapper.java`
- `src/main/resources/mapper/FileMapper.xml`

**依赖**: 阶段 3

**负责人**: litengfei  
**工时**: 0.5 人天

---

### 任务 4.2：Ticket 模块迁移

**描述**: 迁移 Ticket 相关的 Repository 到 MyBatis Plus (核心模块)。

**验收标准**:
- [ ] 创建 TicketMapper 接口 (继承 BaseMapper)
- [ ] 创建 TicketMapper.xml (复杂查询使用 JOIN)
- [ ] 简单查询使用 LambdaQueryWrapper (状态查询、关键词搜索等)
- [ ] 复杂查询使用 XML + JOIN + DTO:
  - selectByIdWithDetails → TicketDTO (多表 JOIN)
  - selectTicketStatistics → TicketStatisticsDTO (聚合统计)
  - selectTicketsWithDetails → List<TicketDTO> (多表 JOIN)
- [ ] 禁止使用 SELECT 子查询，改为 JOIN + GROUP BY
- [ ] 创建 TicketDTO, TicketStatisticsDTO
- [ ] TicketService 改造并测试通过

**SQL 规范**:
```sql
-- ❌ 禁止：SELECT 子查询
SELECT t.*, (SELECT COUNT(*) FROM comments WHERE ticket_id = t.id) as count
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

**文件**:
- `src/main/java/com/igreen/domain/mapper/TicketMapper.java`
- `src/main/resources/mapper/TicketMapper.xml`
- `src/main/java/com/igreen/domain/dto/TicketDTO.java`
- `src/main/java/com/igreen/domain/dto/TicketStatisticsDTO.java`

**依赖**: 3.6, 4.1

**负责人**: litengfei  
**工时**: 2 人天

---

### 任务 4.3：TicketComment 模块迁移

**描述**: 迁移 TicketComment 相关的 Repository 到 MyBatis Plus。

**验收标准**:
- [ ] 创建 TicketCommentMapper 接口
- [ ] 创建 TicketCommentMapper.xml
- [ ] 迁移关联查询 (findByTicketIdWithUser)
- [ ] TicketService 中的 comment 相关方法测试通过

**文件**:
- `src/main/java/com/igreen/domain/mapper/TicketCommentMapper.java`
- `src/main/resources/mapper/TicketCommentMapper.xml`

**依赖**: 4.2

**负责人**: litengfei  
**工时**: 0.5 人天

---

### 任务 4.4：Auth 模块检查

**描述**: 检查并确保认证相关的 Mapper 使用正常。

**验收标准**:
- [ ] 检查 UserMapper 的认证查询方法
- [ ] 检查自定义查询方法
- [ ] 登录/注册功能测试通过

**依赖**: 3.1, 4.2

**负责人**: litengfei  
**工时**: 0.5 人天

---

### 任务 4.5：Controller 层验证

**描述**: 验证所有 API 端点正常工作。

**验收标准**:
- [ ] Swagger 文档检查
- [ ] 所有 REST API 端到端测试
- [ ] 无 LazyInitializationException

**依赖**: 4.1 - 4.4

**负责人**: litengfei  
**工时**: 0.5 人天

---

## 阶段 5：测试阶段

### 任务 5.1：单元测试迁移

**描述**: 将所有使用 JPA Repository Mock 的测试改为使用 MyBatis Plus Mapper Mock。

**验收标准**:
- [ ] 更新 TicketServiceTest
- [ ] 更新 UserServiceTest
- [ ] 更新其他 Service Test
- [ ] 测试通过率 ≥ 90%

**文件**:
- `src/test/java/com/igreen/domain/service/*.java`

**依赖**: 阶段 4

**负责人**: litengfei  
**工时**: 1 人天

---

### 任务 5.2：集成测试

**描述**: 创建集成测试，验证 MyBatis Plus 与数据库的实际交互。

**验收标准**:
- [ ] 创建 Mapper 集成测试基类
- [ ] 覆盖关键查询方法
- [ ] 验证关联查询正确性

**文件**:
- `src/test/java/com/igreen/domain/mapper/*.java`

**依赖**: 5.1

**负责人**: litengfei  
**工时**: 0.5 人天

---

### 任务 5.3：API 端到端测试

**描述**: 执行完整的 API 端到端测试。

**验收标准**:
- [ ] 使用 Postman/curl 测试所有 API
- [ ] 验证响应数据结构正确
- [ ] 验证性能无明显下降

**依赖**: 4.5

**负责人**: litengfei  
**工时**: 0.5 人天

---

### 任务 5.4：回归测试

**描述**: 执行完整的回归测试套件。

**验收标准**:
- [ ] 执行所有单元测试
- [ ] 执行所有集成测试
- [ ] 执行所有端到端测试
- [ ] 无阻断性 bug

**依赖**: 5.1, 5.2, 5.3

**负责人**: litengfei  
**工时**: 0.5 人天

---

## 阶段 6：清理阶段

### 任务 6.1：移除 JPA Repository

**描述**: 删除所有不再使用的 JPA Repository 文件。

**验收标准**:
- [ ] 删除 `src/main/java/com/igreen/domain/repository/` 目录
- [ ] 清理 Service 层中的 JPA Repository import
- [ ] 项目编译通过

**依赖**: 阶段 5

**负责人**: litengfei  
**工时**: 0.5 人天

---

### 任务 6.2：代码审查

**描述**: 进行代码审查，确保代码质量。

**验收标准**:
- [ ] 代码风格一致
- [ ] 命名规范符合要求
- [ ] 异常处理完善
- [ ] 无硬编码 SQL 注入风险

**依赖**: 6.1, 6.1b

**负责人**: litengfei  
**工时**: 0.25 人天

---

### 任务 6.3：文档更新

**描述**: 更新项目文档，记录技术栈变更。

**验收标准**:
- [ ] 更新 README.md
- [ ] 更新 AGENTS.md (Build/Test 命令)
- [ ] 更新 API 文档

**依赖**: 6.1, 6.2

**负责人**: litengfei  
**工时**: 0.25 人天

---

## 里程碑

| 里程碑 | 完成任务 | 预计日期 |
|--------|----------|----------|
| M1: 准备完成 | 任务 1.1 - 1.4 | Day 1 |
| M2: 框架完成 | 任务 2.1 - 2.4 | Day 2 |
| M3: 核心模块完成 | 任务 3.1 - 3.6 | Day 7 |
| M4: 业务模块完成 | 任务 4.1 - 4.5 | Day 11 |
| M5: 测试完成 | 任务 5.1 - 5.4 | Day 14 |
| M6: 迁移完成 | 任务 6.1 - 6.3 | Day 15 |

---

## 风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 复杂查询迁移遗漏 | 高 | 逐模块对比验证 |
| 性能不达标 | 中 | 500ms 阈值监控 |
| 测试覆盖不足 | 高 | 增加集成测试 |
| 迁移过程 regression | 中 | 充分的测试覆盖 |
