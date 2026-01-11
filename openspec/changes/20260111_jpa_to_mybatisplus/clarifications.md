# 需要澄清的问题列表

**变更 ID**: 20260111_jpa_to_mybatisplus  
**创建日期**: 2026-01-11  
**状态**: 大部分确认

---

## 已确认问题

### Q1: PageHelper 依赖配置 ✅

**决策**: 添加 PageHelper 依赖

**配置**:
```xml
<dependency>
    <groupId>com.github.pagehelper</groupId>
    <artifactId>pagehelper-spring-boot-starter</artifactId>
    <version>1.4.7</version>
</dependency>
```

`application.yml` 配置:
```yaml
pagehelper:
  helperDialect: mysql
  reasonable: true
  supportMethodsArguments: true
```

---

### Q3: 自定义 BaseMapper 扩展方法 ✅

**决策**: 可以自定义 BaseMapper，添加项目通用方法

**自定义方法**:
- 批量查询、逻辑删除等

```java
@Mapper
public interface BaseMapper<T> extends com.baomidou.mybatisplus.core.mapper.BaseMapper<T> {
    List<T> selectBatchIds(List<String> ids);
    int logicalDeleteById(String id);
    int logicalDeleteBatchIds(List<String> ids);
    long countValid();
}
```

---

### Q5: @JsonIgnore 范围 ✅

**决策**: 使用 MyBatis Plus 后无需 @JsonIgnore

**原因**:
- MyBatis Plus 不使用 JPA 懒加载
- 不存在循环序列化问题
- 无需在实体类添加 @JsonIgnore

**注意**: 保留 JPA 注解用于 ddl-auto，但不用于数据访问

---

### Q6: JPA Repository 移除顺序 ✅

**决策**: 渐进式迁移，逐步移除 Repository

**策略**:
1. 迁移过程中 JPA Repository 和 MyBatis Plus Mapper 可以共存
2. 每个模块迁移完成后移除对应的 Repository
3. Service 层逐步切换为使用 Mapper

---

### Q10: 批量操作支持 ✅

**决策**: 不需要批量操作支持

**原因**: 当前业务场景不需要批量插入/删除操作

---

## 已确认问题汇总

| 问题 | 决策 | 状态 |
|------|------|------|
| Q1: PageHelper | 添加依赖 | ✅ |
| Q3: 自定义 BaseMapper | 需要自定义 | ✅ |
| Q5: @JsonIgnore | 不需要 | ✅ |
| Q6: Repository 移除 | 渐进式移除 | ✅ |
| Q10: 批量操作 | 不需要 | ✅ |

---

## 待确认问题

---

### Q2: Mapper XML 文件组织结构

**问题描述**:
提案中未明确 Mapper XML 文件的组织结构。

**当前状态**:
- 提到 `resources/mapper/**/*.xml`
- 未明确是否按模块分包

**需要确认**:
- [ ] 方案 A: 所有 XML 放在 `resources/mapper/` 统一管理
- [ ] 方案 B: 按模块分包，如 `resources/mapper/user/`, `resources/mapper/ticket/`

---

### Q4: 性能基准测试阈值 ✅ 已确认

**决策**: 响应时间阈值 500ms

| 接口类型 | 可接受阈值 |
|----------|------------|
| 单表查询 (无分页) | < 500ms |
| 单表查询 (分页) | < 500ms |
| 双表 JOIN | < 500ms |
| 三表以上 JOIN | < 500ms |
| 聚合统计 | < 500ms |

**性能下降要求**: >20% 性能下降需预警

---

### Q7: 测试数据初始化方式

**问题描述**:
测试数据初始化方式不明确。

**当前状态**:
- 未明确是否需要 `TestDataFactory`
- 未明确是否使用 `@Sql` 初始化测试数据

**需要确认**:
- [ ] 是否需要创建测试数据工厂类？
- [ ] 测试数据是否需要回滚 (@Transactional)?
- [ ] 是否使用 H2 内存数据库进行测试？

---

### Q8: API 向后兼容性

**问题描述**:
未明确 API 响应结构是否保持完全一致。

**当前状态**:
- 提到"保持现有 Service 层业务逻辑不变"
- 提到"DTO 层保持不变"
- `PageResult` 已添加 `of(PageInfo)` 方法

**需要确认**:
- [ ] 日期格式是否保持一致？
- [ ] 枚举值是否保持字符串格式？

---

### Q9: 枚举类型处理

**问题描述**:
JPA 使用 `@Enumerated` 处理枚举，迁移后如何处理。

**当前状态**:
- 实体类保留 `@Enumerated(EnumType.STRING)`
- 数据库存储枚举值的字符串形式

**需要确认**:
- [ ] 枚举是否保持不变？
- [ ] XML 查询中是否需要转换枚举？

---

## 优先级排序 (更新后)

| 优先级 | 问题 | 影响范围 |
|----------|------|----------|
| P1 | Q4: 性能阈值 | 测试 |
| P2 | Q2: XML 组织结构 | 规范 |
| P2 | Q7: 测试数据初始化 | 测试 |
| P2 | Q8: API 向后兼容 | 接口 |
| P3 | Q9: 枚举类型处理 | 细节 |

---

## 响应格式

请针对剩余问题给出确认：

```markdown
### Q2: Mapper XML 文件组织结构
- [ ] 方案 A: 统一管理
- [ ] 方案 B: 按模块分包

### Q7: 测试数据初始化
- [ ] 需要 TestDataFactory
- [ ] 使用 @Transactional 回滚
- [ ] 使用 H2 内存数据库

### Q8: API 向后兼容性
- 日期格式: [格式]
- 枚举格式: [字符串/其他]

### Q9: 枚举类型处理
- [ ] 枚举保持不变
- [ ] XML 中需要转换枚举
```

---

## 优先级排序

| 优先级 | 问题 | 影响范围 |
|--------|------|----------|
| P0 | Q1: PageHelper 依赖 | 配置 |
| P0 | Q3: 自定义 BaseMapper | 架构 |
| P1 | Q4: 性能阈值 | 测试 |
| P1 | Q5: @JsonIgnore 范围 | 实体类 |
| P1 | Q6: Repository 移除顺序 | 迁移策略 |
| P2 | Q2: XML 组织结构 | 规范 |
| P2 | Q7: 测试数据初始化 | 测试 |
| P2 | Q8: API 向后兼容 | 接口 |
| P3 | Q9: 枚举类型处理 | 细节 |
| P3 | Q10: 批量操作 | 扩展功能 |

---

## 响应格式

请针对每个问题 (Q1-Q10) 给出确认：

```markdown
### Q1: PageHelper 依赖配置
- [ ] 确认添加依赖
- 版本: [版本号]
- 配置方式: [starter/manual]

### Q2: Mapper XML 文件组织结构
- [ ] 方案 A: 统一管理
- [ ] 方案 B: 按模块分包

...以此类推
```
