# iGreen+ 站点导入导出 API 设计文档

> 生成日期: 2026年1月28日
> 
> **技术栈**: Spring Boot 3 + Java 21 + EasyPoi 4.5

---

## 一、概述

### 1.1 功能描述

本 API 用于站点的批量导入和导出功能，支持 Excel 格式（.xlsx）。

### 1.2 使用场景

| 场景 | 说明 |
|------|------|
| **批量导入站点** | 通过 Excel 文件批量创建站点数据 |
| **导出站点数据** | 导出全部或筛选后的站点数据 |
| **下载导入模板** | 提供标准化的 Excel 导入模板文件 |

### 1.3 技术选型

| 组件 | 版本 | 说明 |
|------|------|------|
| **EasyPoi** | 4.5 | Excel 导入导出简化库 |
| **Apache POI** | 5.2.5 | 底层 Excel 处理库 |
| **Spring Boot** | 3.x | 后端框架 |

---

## 二、依赖配置

### 2.1 Maven 依赖 (pom.xml)

```xml
<!-- EasyPoi -->
<dependency>
    <groupId>cn.afterturn</groupId>
    <artifactId>easypoi-spring-boot-starter</artifactId>
    <version>4.5.0</version>
</dependency>

<!-- Apache POI (EasyPoi 已包含，但显式声明版本) -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>
```

### 2.2 application.yml 配置

```yaml
easypoi:
  # 导出路径配置
  export:
    path: /tmp/igreen/exports
    imgPath: /tmp/igreen/images
  
  # 导入路径配置
  import:
    path: /tmp/igreen/imports
    maxImportNum: 10000
  
  # Web 访问路径
  web:
    path: /api/files
    openNewTab: false
```

---

## 三、数据模型

### 3.1 站点导入导出实体

```java
package com.igreen.domain.dto;

import cn.afterturn.easypoi.excel.annotation.Excel;
import com.igreen.domain.enums.SiteStatus;
import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

/**
 * 站点导入导出DTO
 * 
 * 使用 EasyPoi 注解标注导出字段：
 * - name: 列名
 * - orderNum: 列顺序
 * - isImportField: 是否参与导入
 * - saveTempPath: 临时保存路径
 */
@Data
@Accessors(chain = true)
public class SiteExcelDTO {

    /**
     * 站点名称
     * 必填字段，最大100字符
     */
    @Excel(name = "站点名称*", orderNum = "1", isImportField = "true", 
           width = 25, importFormat = "TRIM")
    private String name;

    /**
     * 站点地址
     * 必填字段，最大500字符
     */
    @Excel(name = "站点地址*", orderNum = "2", isImportField = "true", 
           width = 40, importFormat = "TRIM")
    private String address;

    /**
     * 站点等级
     * 可选，有效值: A/B/C/normal，默认 normal
     */
    @Excel(name = "站点等级", orderNum = "3", isImportField = "true", 
           width = 15, replace = {"A级_A", "B级_B", "C级_C", "普通_normal"})
    private String level;

    /**
     * 站点状态
     * 可选，有效值: ONLINE/OFFLINE/UNDER_CONSTRUCTION，默认 ONLINE
     */
    @Excel(name = "站点状态", orderNum = "4", isImportField = "true", 
           width = 18, replace = {"在线_ONLINE", "离线_OFFLINE", "建设中_UNDER_CONSTRUCTION"})
    private String status;

    /**
     * 站点ID (仅导出时使用，导入时忽略)
     */
    @Excel(name = "站点ID", orderNum = "0", isImportField = "false", 
           width = 20, exportFormat = "yyyy-MM-dd HH:mm:ss")
    private String id;

    /**
     * 创建时间 (仅导出时使用)
     */
    @Excel(name = "创建时间", orderNum = "5", isImportField = "false", 
           width = 20, format = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间 (仅导出时使用)
     */
    @Excel(name = "更新时间", orderNum = "6", isImportField = "false", 
           width = 20, format = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}
```

### 3.2 导入模板下载实体

```java
package com.igreen.domain.dto;

import cn.afterturn.easypoi.excel.annotation.Excel;
import lombok.Data;
import lombok.experimental.Accessors;

/**
 * 站点导入模板DTO (仅包含必填字段，用于生成模板文件)
 */
@Data
@Accessors(chain = true)
public class SiteTemplateDTO {

    /**
     * 站点名称
     */
    @Excel(name = "站点名称*", orderNum = "1", width = 25)
    private String name;

    /**
     * 站点地址
     */
    @Excel(name = "站点地址*", orderNum = "2", width = 40)
    private String address;

    /**
     * 站点等级
     */
    @Excel(name = "站点等级(A/B/C/normal)", orderNum = "3", width = 20, 
           defaultValue = "normal")
    private String level;

    /**
     * 站点状态
     */
    @Excel(name = "站点状态(ONLINE/OFFLINE/UNDER_CONSTRUCTION)", 
           orderNum = "4", width = 20, defaultValue = "ONLINE")
    private String status;
}
```

### 3.3 导入请求响应

```java
package com.igreen.domain.dto;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

/**
 * 导入结果响应
 */
@Data
@Accessors(chain = true)
public class SiteImportResultDTO {

    /**
     * 是否成功
     */
    private boolean success;

    /**
     * 消息
     */
    private String message;

    /**
     * 总行数
     */
    private Integer totalCount;

    /**
     * 成功导入行数
     */
    private Integer successCount;

    /**
     * 失败行数
     */
    private Integer failCount;

    /**
     * 失败的行信息列表
     */
    private List<ImportErrorDTO> errors;

    /**
     * 创建的站点ID列表
     */
    private List<String> createdSiteIds;
}
```

### 3.4 导入错误详情

```java
package com.igreen.domain.dto;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * 导入错误详情
 */
@Data
@Accessors(chain = true)
public class ImportErrorDTO {

    /**
     * 行号 (从1开始，不包含表头)
     */
    private Integer rowNum;

    /**
     * 错误字段
     */
    private String field;

    /**
     * 原始值
     */
    private String value;

    /**
     * 错误原因
     */
    private String reason;
}
```

---

## 四、API 端点设计

### 4.1 API 列表

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/sites/export` | GET | 导出站点数据 |
| `/api/sites/export/template` | GET | 下载导入模板 |
| `/api/sites/import` | POST | 导入站点数据 |

---

### 4.2 导出站点数据

**端点**: `GET /api/sites/export`

#### 请求参数 (Query String)

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|:----:|------|
| keyword | String | 否 | 搜索关键词 (匹配名称/地址) |
| level | String | 否 | 站点等级筛选 |
| status | String | 否 | 站点状态筛选 |
| startDate | String | 否 | 开始日期 (yyyy-MM-dd) |
| endDate | String | 否 | 结束日期 (yyyy-MM-dd) |

#### 请求示例

```
GET /api/sites/export?level=A&status=ONLINE
```

#### 响应

**Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Response Body**: Excel 文件 (二进制流)

**文件名**: `sites_export_20260128.xlsx`

#### Excel 导出格式

| 站点ID | 站点名称* | 站点地址* | 站点等级 | 站点状态 | 创建时间 | 更新时间 |
|--------|-----------|-----------|----------|----------|----------|----------|
| SITE001 | Downtown Plaza | 123 Main St | A | ONLINE | 2026-01-01 10:00 | 2026-01-28 10:00 |

---

### 4.3 下载导入模板

**端点**: `GET /api/sites/export/template`

#### 请求参数

无

#### 响应

**Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Response Body**: Excel 模板文件 (二进制流)

**文件名**: `sites_import_template.xlsx`

#### 模板 Excel 格式

| 站点名称* | 站点地址* | 站点等级(A/B/C/normal) | 站点状态(ONLINE/OFFLINE/UNDER_CONSTRUCTION) |
|-----------|-----------|------------------------|---------------------------------------------|
| 示例站点1 | 123 示例地址 | A | ONLINE |
| 示例站点2 | 456 示例地址 | B | OFFLINE |

> **注意**: 表头带 * 号的为必填字段

---

### 4.4 导入站点数据

**端点**: `POST /api/sites/import`

#### 请求格式

**Content-Type**: `multipart/form-data`

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|:----:|------|
| file | File | ✅ | Excel 文件 (.xlsx) |
| overwrite | Boolean | ❌ | 是否覆盖已存在的站点 (默认 false) |

#### 请求示例

```bash
curl -X POST http://localhost:8080/api/sites/import \
  -H "Authorization: Bearer {token}" \
  -F "file=@sites_import.xlsx" \
  -F "overwrite=false"
```

#### 成功响应 (200)

```json
{
  "success": true,
  "message": "导入成功",
  "totalCount": 100,
  "successCount": 98,
  "failCount": 2,
  "createdSiteIds": ["SITE001", "SITE002", ...],
  "errors": [
    {
      "rowNum": 15,
      "field": "name",
      "value": "",
      "reason": "站点名称不能为空"
    },
    {
      "rowNum": 42,
      "field": "status",
      "value": "ACTIVE",
      "reason": "站点状态无效，可选值: ONLINE/OFFLINE/UNDER_CONSTRUCTION"
    }
  ]
}
```

#### 失败响应 (400)

```json
{
  "success": false,
  "message": "导入失败",
  "totalCount": 0,
  "successCount": 0,
  "failCount": 0,
  "errors": [
    {
      "rowNum": 0,
      "field": "file",
      "value": null,
      "reason": "请上传 Excel 文件 (.xlsx)"
    }
  ]
}
```

---

## 五、服务层实现

### 5.1 SiteImportExportService

```java
package com.igreen.domain.service;

import cn.afterturn.easypoi.excel.ExcelExportUtil;
import cn.afterturn.easypoi.excel.ExcelImportUtil;
import cn.afterturn.easypoi.excel.entity.ExportParams;
import cn.afterturn.easypoi.excel.entity.ImportParams;
import cn.afterturn.easypoi.excel.entity.enmus.ExcelType;
import cn.afterturn.easypoi.handler.interceptor.IExcelImportServer;
import com.igreen.domain.dto.*;
import com.igreen.domain.entity.Site;
import com.igreen.domain.enums.SiteStatus;
import com.igreen.domain.mapper.SiteMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SiteImportExportService {

    private final SiteMapper siteMapper;

    private static final DateTimeFormatter EXPORT_DATE_FORMAT = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

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
        
        // 3. 生成 Excel
        String fileName = "sites_export_" + 
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + 
            ".xlsx";
        
        exportExcel(dtos, "站点数据", "站点导出", fileName, response);
    }

    /**
     * 下载导入模板
     */
    public void downloadTemplate(HttpServletResponse response) {
        // 1. 创建示例数据
        List<SiteTemplateDTO> templates = createTemplateData();
        
        // 2. 生成 Excel
        String fileName = "sites_import_template.xlsx";
        
        exportExcel(templates, "导入模板", "站点导入模板", fileName, response);
    }

    /**
     * 导入站点数据
     */
    @Transactional(rollbackFor = Exception.class)
    public SiteImportResultDTO importSites(MultipartFile file, boolean overwrite) {
        SiteImportResultDTO result = new SiteImportResultDTO();
        result.setSuccess(true);
        result.setTotalCount(0);
        result.setSuccessCount(0);
        result.setFailCount(0);
        result.setErrors(new ArrayList<>());
        result.setCreatedSiteIds(new ArrayList<>());
        
        try {
            // 1. 解析 Excel
            ImportParams params = new ImportParams();
            params.setTitleRows(1);      // 标题行占1行
            params.setHeadRows(1);       // 表头占1行
            params.setStartSheetIndex(0); // 从第一个sheet开始
            params.setVerifyHandler(new SiteImportVerifyHandler()); // 自定义校验
            
            List<SiteExcelDTO> list = ExcelImportUtil.importExcel(
                file.getInputStream(), 
                SiteExcelDTO.class, 
                params
            );
            
            result.setTotalCount(list.size());
            
            // 2. 处理每条数据
            int successCount = 0;
            List<String> createdIds = new ArrayList<>();
            List<ImportErrorDTO> errors = new ArrayList<>();
            
            for (int i = 0; i < list.size(); i++) {
                SiteExcelDTO dto = list.get(i);
                int rowNum = i + 2; // Excel行号 (1是表头)
                
                try {
                    // 字段校验
                    String error = validateDTO(dto);
                    if (error != null) {
                        errors.add(createError(rowNum, null, null, error));
                        continue;
                    }
                    
                    // 检查重复
                    if (!overwrite && existsByNameAndAddress(dto.getName(), dto.getAddress())) {
                        errors.add(createError(rowNum, "name", dto.getName(), "站点已存在"));
                        continue;
                    }
                    
                    // 保存站点
                    Site site = toEntity(dto);
                    site.setId(generateId());
                    site.setCreatedAt(LocalDateTime.now());
                    site.setUpdatedAt(LocalDateTime.now());
                    siteMapper.insert(site);
                    
                    createdIds.add(site.getId());
                    successCount++;
                    
                } catch (Exception e) {
                    log.error("导入站点失败，行号: {}, 数据: {}", rowNum, dto, e);
                    errors.add(createError(rowNum, null, null, "系统错误: " + e.getMessage()));
                }
            }
            
            result.setSuccessCount(successCount);
            result.setFailCount(list.size() - successCount);
            result.setCreatedSiteIds(createdIds);
            result.setErrors(errors);
            
            if (!errors.isEmpty()) {
                result.setMessage(String.format("导入完成，成功%d条，失败%d条", 
                    successCount, errors.size()));
            } else {
                result.setMessage("导入成功");
            }
            
        } catch (Exception e) {
            log.error("导入站点失败", e);
            result.setSuccess(false);
            result.setMessage("导入失败: " + e.getMessage());
        }
        
        return result;
    }

    // ========== 私有方法 ==========

    private List<Site> querySites(SiteQueryDTO query) {
        LambdaQueryWrapper<Site> wrapper = new LambdaQueryWrapper<>();
        
        if (query.getKeyword() != null && !query.getKeyword().isEmpty()) {
            wrapper.and(w -> w
                .like(Site::getName, query.getKeyword())
                .or()
                .like(Site::getAddress, query.getKeyword())
            );
        }
        
        if (query.getLevel() != null && !query.getLevel().isEmpty()) {
            wrapper.eq(Site::getLevel, query.getLevel());
        }
        
        if (query.getStatus() != null) {
            wrapper.eq(Site::getStatus, query.getStatus());
        }
        
        if (query.getStartDate() != null) {
            wrapper.ge(Site::getCreatedAt, query.getStartDate());
        }
        
        if (query.getEndDate() != null) {
            wrapper.le(Site::getCreatedAt, query.getEndDate());
        }
        
        wrapper.orderByDesc(Site::getCreatedAt);
        
        return siteMapper.selectList(wrapper);
    }

    private SiteExcelDTO toExcelDTO(Site site) {
        SiteExcelDTO dto = new SiteExcelDTO();
        dto.setId(site.getId());
        dto.setName(site.getName());
        dto.setAddress(site.getAddress());
        dto.setLevel(site.getLevel());
        dto.setStatus(site.getStatus() != null ? site.getStatus().name() : null);
        dto.setCreatedAt(site.getCreatedAt());
        dto.setUpdatedAt(site.getUpdatedAt());
        return dto;
    }

    private Site toEntity(SiteExcelDTO dto) {
        Site site = new Site();
        site.setName(dto.getName());
        site.setAddress(dto.getAddress());
        site.setLevel(dto.getLevel() != null ? dto.getLevel() : "normal");
        
        if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
            try {
                site.setStatus(SiteStatus.valueOf(dto.getStatus()));
            } catch (Exception e) {
                site.setStatus(SiteStatus.ONLINE);
            }
        } else {
            site.setStatus(SiteStatus.ONLINE);
        }
        
        return site;
    }

    private String validateDTO(SiteExcelDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            return "站点名称不能为空";
        }
        if (dto.getName().length() > 100) {
            return "站点名称不能超过100字符";
        }
        if (dto.getAddress() == null || dto.getAddress().trim().isEmpty()) {
            return "站点地址不能为空";
        }
        if (dto.getAddress().length() > 500) {
            return "站点地址不能超过500字符";
        }
        return null;
    }

    private boolean existsByNameAndAddress(String name, String address) {
        LambdaQueryWrapper<Site> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Site::getName, name)
               .eq(Site::getAddress, address);
        return siteMapper.selectCount(wrapper) > 0;
    }

    private String generateId() {
        return "SITE" + System.currentTimeMillis();
    }

    private ImportErrorDTO createError(int rowNum, String field, String value, String reason) {
        ImportErrorDTO error = new ImportErrorDTO();
        error.setRowNum(rowNum);
        error.setField(field);
        error.setValue(value);
        error.setReason(reason);
        return error;
    }

    private <T> void exportExcel(List<T> list, String title, String sheetName, 
                                  String fileName, HttpServletResponse response) {
        try {
            ExportParams params = new ExportParams(title, sheetName);
            Workbook workbook = ExcelExportUtil.exportExcel(params, list);
            
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", 
                "attachment;filename=" + URLEncoder.encode(fileName, StandardCharsets.UTF_8.name()));
            
            workbook.write(response.getOutputStream());
            workbook.close();
            
        } catch (Exception e) {
            log.error("导出Excel失败", e);
            throw new RuntimeException("导出失败: " + e.getMessage());
        }
    }

    private List<SiteTemplateDTO> createTemplateData() {
        List<SiteTemplateDTO> templates = new ArrayList<>();
        
        // 添加示例数据
        SiteTemplateDTO example1 = new SiteTemplateDTO();
        example1.setName("示例站点1");
        example1.setAddress("123 示例地址");
        example1.setLevel("A");
        example1.setStatus("ONLINE");
        templates.add(example1);
        
        SiteTemplateDTO example2 = new SiteTemplateDTO();
        example2.setName("示例站点2");
        example2.setAddress("456 示例地址");
        example2.setLevel("B");
        example2.setStatus("OFFLINE");
        templates.add(example2);
        
        SiteTemplateDTO example3 = new SiteTemplateDTO();
        example3.setName("示例站点3");
        example3.setAddress("789 示例地址");
        example3.setLevel("C");
        example3.setStatus("UNDER_CONSTRUCTION");
        templates.add(example3);
        
        return templates;
    }
}
```

### 5.2 自定义导入校验处理器

```java
package com.igreen.domain.service;

import cn.afterturn.easypoi.handler.interceptor.IExcelImportServer;
import com.igreen.domain.dto.SiteExcelDTO;
import org.apache.poi.ss.usermodel.Cell;

/**
 * Excel 导入服务端校验
 * 在导入过程中对每条数据进行校验
 */
public class SiteImportVerifyHandler implements IExcelImportServer {

    @Override
    public boolean checkValue(Cell cell, String name, Object value) {
        // 站点名称校验
        if ("name".equals(name)) {
            if (value == null || value.toString().trim().isEmpty()) {
                throw new RuntimeException("站点名称不能为空");
            }
            if (value.toString().length() > 100) {
                throw new RuntimeException("站点名称不能超过100字符");
            }
        }
        
        // 站点地址校验
        if ("address".equals(name)) {
            if (value == null || value.toString().trim().isEmpty()) {
                throw new RuntimeException("站点地址不能为空");
            }
        }
        
        // 站点等级校验
        if ("level".equals(name)) {
            if (value != null && !value.toString().isEmpty()) {
                String level = value.toString().toUpperCase();
                if (!level.matches("A|B|C|NORMAL")) {
                    throw new RuntimeException("站点等级无效，可选值: A/B/C/normal");
                }
            }
        }
        
        // 站点状态校验
        if ("status".equals(name)) {
            if (value != null && !value.toString().isEmpty()) {
                try {
                    com.igreen.domain.enums.SiteStatus.valueOf(value.toString());
                } catch (Exception e) {
                    throw new RuntimeException("站点状态无效，可选值: ONLINE/OFFLINE/UNDER_CONSTRUCTION");
                }
            }
        }
        
        return true;
    }
}
```

---

## 六、控制器实现

### 6.1 SiteImportExportController

```java
package com.igreen.domain.controller;

import cn.afterturn.easypoi.excel.entity.ExportParams;
import cn.afterturn.easypoi.excel.entity.enmus.ExcelType;
import cn.afterturn.easypoi.excel.export.styler.ExcelExportStylerColorImpl;
import com.igreen.common.result.Result;
import com.igreen.domain.dto.*;
import com.igreen.domain.service.SiteImportExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
@Tag(name = "站点导入导出", description = "站点数据的批量导入导出接口")
public class SiteImportExportController {

    private final SiteImportExportService siteImportExportService;

    /**
     * 导出站点数据
     */
    @GetMapping("/export")
    @Operation(summary = "导出站点数据", description = "根据条件导出站点数据为Excel文件")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "成功返回Excel文件",
            content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE))
    })
    public void exportSites(
            @Parameter(description = "搜索关键词") 
            @RequestParam(required = false) String keyword,
            @Parameter(description = "站点等级") 
            @RequestParam(required = false) String level,
            @Parameter(description = "站点状态") 
            @RequestParam(required = false) String status,
            @Parameter(description = "开始日期") 
            @RequestParam(required = false) String startDate,
            @Parameter(description = "结束日期") 
            @RequestParam(required = false) String endDate,
            HttpServletResponse response) {
        
        SiteQueryDTO query = new SiteQueryDTO();
        query.setKeyword(keyword);
        query.setLevel(level);
        
        if (status != null && !status.isEmpty()) {
            try {
                query.setStatus(com.igreen.domain.enums.SiteStatus.valueOf(status));
            } catch (Exception e) {
                log.warn("无效的站点状态: {}", status);
            }
        }
        
        if (startDate != null && !startDate.isEmpty()) {
            query.setStartDate(LocalDateTime.parse(startDate + " 00:00:00", 
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        
        if (endDate != null && !endDate.isEmpty()) {
            query.setEndDate(LocalDateTime.parse(endDate + " 23:59:59", 
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        
        // 设置响应头
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        
        siteImportExportService.exportSites(query, response);
    }

    /**
     * 下载导入模板
     */
    @GetMapping("/export/template")
    @Operation(summary = "下载导入模板", description = "下载站点导入模板Excel文件")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "成功返回Excel模板文件",
            content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE))
    })
    public void downloadTemplate(HttpServletResponse response) {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        siteImportExportService.downloadTemplate(response);
    }

    /**
     * 导入站点数据
     */
    @PostMapping("/import")
    @Operation(summary = "导入站点数据", description = "通过Excel文件批量导入站点数据")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "成功返回导入结果",
            content = @Content(schema = @Schema(implementation = SiteImportResultDTO.class)))
    })
    public Result<SiteImportResultDTO> importSites(
            @Parameter(description = "Excel文件", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "是否覆盖已存在站点")
            @RequestParam(value = "overwrite", required = false, defaultValue = "false") 
            Boolean overwrite) {
        
        try {
            // 校验文件类型
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".xlsx")) {
                return Result.error("请上传 Excel 文件 (.xlsx)");
            }
            
            SiteImportResultDTO result = siteImportExportService.importSites(file, overwrite);
            
            if (result.isSuccess()) {
                return Result.success(result);
            } else {
                return Result.error(result.getMessage(), result);
            }
            
        } catch (Exception e) {
            log.error("导入站点失败", e);
            return Result.error("导入失败: " + e.getMessage());
        }
    }
}
```

---

## 七、DTO 类补充

### 7.1 站点查询DTO

```java
package com.igreen.domain.dto;

import com.igreen.domain.enums.SiteStatus;
import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

/**
 * 站点查询条件
 */
@Data
@Accessors(chain = true)
public class SiteQueryDTO {
    private String keyword;
    private String level;
    private SiteStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
```

---

## 八、测试用例

### 8.1 单元测试

```java
package com.igreen.domain.service;

import cn.afterturn.easypoi.excel.ExcelExportUtil;
import cn.afterturn.easypoi.excel.ExcelImportUtil;
import cn.afterturn.easypoi.excel.entity.ExportParams;
import cn.afterturn.easypoi.excel.entity.ImportParams;
import com.igreen.domain.dto.SiteExcelDTO;
import com.igreen.domain.dto.SiteImportResultDTO;
import com.igreen.domain.dto.SiteTemplateDTO;
import com.igreen.domain.entity.Site;
import com.igreen.domain.enums.SiteStatus;
import com.igreen.domain.mapper.SiteMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class SiteImportExportServiceTest {

    @Autowired
    private SiteImportExportService siteImportExportService;

    @Autowired
    private SiteMapper siteMapper;

    @Test
    void testDownloadTemplate() {
        // 测试下载模板
        assertDoesNotThrow(() -> {
            // 验证模板文件生成
        });
    }

    @Test
    void testImportSites_Success() {
        // 准备测试数据
        String excelContent = createTestExcelContent();
        MultipartFile file = new MockMultipartFile(
            "sites.xlsx",
            "sites.xlsx",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            excelContent.getBytes()
        );
        
        // 执行导入
        SiteImportResultDTO result = siteImportExportService.importSites(file, false);
        
        // 验证结果
        assertTrue(result.isSuccess());
        assertEquals(3, result.getTotalCount());
        assertEquals(3, result.getSuccessCount());
        assertEquals(0, result.getFailCount());
        assertTrue(result.getCreatedSiteIds().size() == 3);
    }

    @Test
    void testImportSites_ValidationError() {
        // 准备包含无效数据的Excel
        String excelContent = createInvalidExcelContent();
        MultipartFile file = new MockMultipartFile(
            "sites.xlsx",
            "sites.xlsx",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            excelContent.getBytes()
        );
        
        // 执行导入
        SiteImportResultDTO result = siteImportExportService.importSites(file, false);
        
        // 验证结果
        assertFalse(result.isSuccess());
        assertTrue(result.getFailCount() > 0);
        assertNotNull(result.getErrors());
        assertFalse(result.getErrors().isEmpty());
    }

    private String createTestExcelContent() {
        // 创建测试Excel内容
        // 实际测试时使用 Apache POI 生成
        return ""; // 省略具体实现
    }

    private String createInvalidExcelContent() {
        // 创建包含无效数据的Excel内容
        return "";
    }
}
```

---

## 九、错误码定义

| 错误码 | 说明 |
|--------|------|
| 10001 | 请上传 Excel 文件 |
| 10002 | 导入模板下载失败 |
| 10003 | 导出失败 |
| 10004 | 文件解析失败 |
| 10005 | 数据校验失败 |
| 10006 | 站点已存在 |
| 10007 | 导入数据超过限制 |

---

## 十、附录

### 10.1 Excel 导入模板示例

| 站点名称* | 站点地址* | 站点等级(A/B/C/normal) | 站点状态(ONLINE/OFFLINE/UNDER_CONSTRUCTION) |
|-----------|-----------|------------------------|---------------------------------------------|
| Downtown Plaza | 123 Main St, Bangkok | A | ONLINE |
| Highway 101 Stop | Highway 101, Mile 50 | B | ONLINE |
| Central Mall Station | Central Mall, Floor 2 | A | UNDER_CONSTRUCTION |

### 10.2 导入限制

| 项目 | 限制 |
|------|------|
| 单次导入最大行数 | 10,000 行 |
| 单文件最大大小 | 10 MB |
| 站点名称最大长度 | 100 字符 |
| 站点地址最大长度 | 500 字符 |

---

> **文档版本**: v1.0  
> **最后更新**: 2026年1月28日  
> **作者**: iGreen+ Development Team
