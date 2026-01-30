# Excel 导入导出优化学习笔记

## 执行摘要

**日期**: 2026-01-30
**状态**: 已完成 (迁移到 EasyExcel)
**框架**: 阿里巴巴 EasyExcel 3.3.3

---

## 关键决策

### 1. 选择 EasyExcel 而非 EasyPoi

**参考项目**: sl_product 使用阿里巴巴 EasyExcel

| 特性 | Apache POI (原) | EasyPoi | **EasyExcel (选用)** |
|------|-----------------|---------|---------------------|
| **包路径** | org.apache.poi | cn.afterturn | com.alibaba |
| **内存占用** | 高 | 中 | **低** |
| **API 简洁度** | 复杂 | 简洁 | **非常简洁** |
| **sl_product 使用** | ❌ | ❌ | **✅ 是** |
| **代码行数** | ~350 | ~100 | **~120** |

### 2. 迁移决策原因

1. **性能优先**: EasyExcel 内存占用极低 (3M Excel 仅需几 MB)
2. **统一规范**: 与 sl_product 保持一致
3. **API 简洁**: 注解驱动，流式读取

---

## 技术发现

### EasyExcel vs EasyPoi 注解对比

```java
// EasyPoi 注解
@Excel(name = "站点名称", orderNum = "2", width = 25)
private String name;

// EasyExcel 注解 (更简洁)
@ExcelProperty("站点名称")
private String name;
```

### EasyExcel 核心 API

```java
// 导出 (极其简洁)
EasyExcel.write(response.getOutputStream(), SiteExcelDTO.class)
    .sheet("站点数据")
    .doWrite(dtos);

// 导入 (流式读取)
EasyExcel.read(file.getInputStream(), SiteExcelDTO.class, new ReadListener<SiteExcelDTO>() {
    @Override
    public void invoke(SiteExcelDTO data, AnalysisContext context) {
        list.add(data);
    }
    
    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        // 读取完成
    }
}).sheet().doRead();
```

### DTO 注解示例

```java
@Data
public class SiteExcelDTO {
    @ExcelProperty("ID")
    private String id;
    
    @ExcelProperty("站点名称")
    private String name;
    
    @ExcelProperty("站点地址")
    private String address;
    
    @ExcelProperty("站点等级")
    private String level;
    
    @ExcelProperty("站点状态")
    private String status;
    
    @ExcelProperty("创建时间")
    private LocalDateTime createdAt;
    
    @ExcelProperty("更新时间")
    private LocalDateTime updatedAt;
}
```

---

## 修改的文件

| 文件 | 修改内容 |
|------|---------|
| `pom.xml` | 添加 `easyexcel:3.3.3` |
| `SiteExcelDTO.java` | `@ExcelProperty` 注解 |
| `SiteTemplateDTO.java` | `@ExcelProperty` 注解 |
| `SiteImportExportService.java` | EasyExcel API 重写 |

---

## 状态值规范

| 字段 | 值 (小写) | 说明 |
|------|----------|------|
| status | online/offline/under_construction | 与前端约定一致 |
| level | A/B/C/normal | 站点等级 |

---

## 未来改进建议

1. **大数据导入**: 使用 `ExcelReaderBuilder.headRowNumber()` 分批读取
2. **导入校验**: 使用 `@ExcelProperty` + `@TableName` 注解
3. **异步导出**: 集成消息队列处理大文件

---

## 依赖配置

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>easyexcel</artifactId>
    <version>3.3.3</version>
</dependency>
```
