# Excel 导入导出优化 (EasyExcel)

## TL;DR

> 将现有的 Apache POI 纯手写 Excel 导入导出功能迁移到阿里巴巴 EasyExcel (与 sl_product 项目一致)，代码更简洁、性能更好。

**预计工作量**: 2-3 小时
**文件修改数**: 4-5 个

---

## 背景

### 当前实现

- **框架**: Apache POI 5.2.5 (纯 POI)
- **文件**: `SiteImportExportService.java` (~350 行)
- **方式**: 手动创建 Workbook/Sheet/Row/Cell，代码冗长

### 迁移目标

- **框架**: 阿里巴巴 EasyExcel 3.3.3 (与 sl_product 一致)
- **方式**: 注解驱动 + 流式读取
- **代码量**: ~120 行 (减少 65%)
- **优势**: 低内存、高性能、API 简洁

---

## 实施步骤

### 步骤 1: 添加 EasyPoi 依赖

**文件**: `pom.xml`

```xml
<!-- 移除 -->
<!-- Apache POI for Excel import/export (pure POI, no EasyPoi) -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>5.2.5</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>

<!-- 新增 -->
<dependency>
    <groupId>cn.afterturn</groupId>
    <artifactId>easypoi-spring-boot-starter</artifactId>
    <version>4.5.0</version>
</dependency>
```

### 步骤 2: 修改 SiteExcelDTO

**文件**: `src/main/java/com/igreen/domain/dto/SiteExcelDTO.java`

添加 @Excel 注解:

```java
@Data
public class SiteExcelDTO implements Serializable {
    @Excel(name = "站点编号", orderNum = "1")
    private String siteNo;
    
    @Excel(name = "站点名称", orderNum = "2")
    private String siteName;
    
    @Excel(name = "地址", orderNum = "3")
    private String address;
    
    @Excel(name = "联系人", orderNum = "4")
    private String contactPerson;
    
    @Excel(name = "联系电话", orderNum = "5")
    private String contactPhone;
    
    @Excel(name = "状态", orderNum = "6", replace = {"在线_online", "离线_offline", "建设中_under_construction"})
    private String status;
}
```

### 步骤 3: 修改 SiteTemplateDTO

**文件**: `src/main/java/com/igreen/domain/dto/SiteTemplateDTO.java`

添加 @Excel 注解:

```java
@Data
public class SiteTemplateDTO implements Serializable {
    @Excel(name = "站点编号", orderNum = "1", isColumnHidden = true)
    private String siteNo;
    
    @Excel(name = "站点名称", orderNum = "2", isColumnHidden = true)
    private String siteName;
    
    // ... 其他字段
}
```

### 步骤 4: 重构 SiteImportExportService

**文件**: `src/main/java/com/igreen/domain/service/SiteImportExportService.java`

**核心修改**:

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class SiteImportExportService {

    private final SiteMapper siteMapper;
    private final IExportService exportService;
    private final IImportService importService;

    /**
     * 导出站点数据
     */
    public void exportSites(SiteQueryDTO query, HttpServletResponse response) {
        // 1. 查询数据
        List<Site> sites = querySites(query);
        
        // 2. 转换为 DTO
        List<SiteExcelDTO> dtos = sites.stream()
            .map(this::toExcelDTO)
            .collect(Collectors.toList());
        
        // 3. 使用 EasyPoi 导出
        String fileName = "sites_export_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".xlsx";
        
        ExportParams exportParams = new ExportParams("站点数据", "站点导出");
        exportParams.setType(ExcelType.XSSF);
        
        exportService.exportExcel(exportParams, SiteExcelDTO.class, dtos, fileName, response);
    }

    /**
     * 下载导入模板
     */
    public void downloadTemplate(HttpServletResponse response) {
        List<SiteTemplateDTO> templates = createTemplateData();
        
        String fileName = "sites_import_template.xlsx";
        ExportParams exportParams = new ExportParams("导入模板", "站点导入模板");
        
        exportService.exportExcel(exportParams, SiteTemplateDTO.class, templates, fileName, response);
    }

    /**
     * 导入站点数据
     */
    @Transactional(rollbackFor = Exception.class)
    public SiteImportResultDTO importSites(MultipartFile file, boolean overwrite) {
        ImportParams importParams = new ImportParams();
        importParams.setHeadRows(1);
        importParams.setTitleRows(1);
        
        // 导入并返回结果
        List<SiteTemplateDTO> list = importService.importExcel(file, SiteTemplateDTO.class, importParams);
        
        // 处理导入数据...
        // 返回 SiteImportResultDTO
    }
}
```

### 步骤 5: 添加 EasyPoi 配置 (可选)

**文件**: `src/main/java/com/igreen/common/config/EasyPoiConfig.java`

```java
@Configuration
public class EasyPoiConfig {
    /**
     * EasyPoi 配置
     */
    @Bean
    public IEasyPoiConfig easierPoiConfig() {
        return () -> ExcelType.XSSF;
    }
}
```

---

## 需要修改的文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `pom.xml` | 修改 | 添加 easypoi 依赖，移除 poi 依赖 |
| `SiteExcelDTO.java` | 修改 | 添加 @Excel 注解 |
| `SiteTemplateDTO.java` | 修改 | 添加 @ExcelProperty 注解 (EasyExcel) |
| `SiteImportExportService.java` | 重构 | 使用 EasyExcel API 重写 |
| `SiteImportResultDTO.java` | 新增 | 导入结果 DTO (如不存在) |

---

## 验收标准

- [x] 项目编译成功 (2026-01-30)
- [x] 站点导出功能正常 (使用小写状态值)
- [x] 站点导入模板下载正常
- [x] 站点数据导入正常 (支持 overwrite 模式)
- [x] 状态值统一为小写 (online/offline/under_construction)

---

## 风险点

1. **依赖冲突**: EasyPoi 依赖的 POI 版本与现有项目可能冲突
   - 解决: 使用 EasyPoi 提供的 BOM 或显式指定版本
2. **复杂样式**: 原 POI 支持复杂单元格样式
   - 解决: EasyPoi 支持有限样式，如需复杂样式可保留少量 POI 代码
3. **现有功能回归**: 迁移可能导致现有功能异常
   - 解决: 在测试环境验证完整导入导出流程

---

## 回滚方案

如迁移失败，可通过以下方式回滚:
1. 恢复 `pom.xml` 中的 POI 依赖
2. 恢复 `SiteImportExportService.java` 的原始代码
3. 从 git 历史中恢复 DTO 文件
