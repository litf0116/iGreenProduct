package com.igreen.domain.service;

import com.igreen.domain.dto.*;
import com.igreen.domain.entity.Site;
import com.igreen.domain.enums.SiteStatus;
import com.igreen.domain.mapper.SiteMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.InputStream;
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
            List<SiteExcelDTO> list = parseExcel(file.getInputStream());

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
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(sheetName);

            // 创建表头行
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // 设置表头
            if (!list.isEmpty()) {
                T first = list.get(0);
                if (first instanceof SiteExcelDTO) {
                    String[] headers = {"ID", "站点名称", "站点地址", "站点等级", "站点状态", "创建时间", "更新时间"};
                    for (int i = 0; i < headers.length; i++) {
                        Cell cell = headerRow.createCell(i);
                        cell.setCellValue(headers[i]);
                        cell.setCellStyle(headerStyle);
                    }

                    // 填充数据
                    int rowNum = 1;
                    for (T item : list) {
                        SiteExcelDTO dto = (SiteExcelDTO) item;
                        Row row = sheet.createRow(rowNum++);
                        int col = 0;
                        row.createCell(col++).setCellValue(dto.getId() != null ? dto.getId() : "");
                        row.createCell(col++).setCellValue(dto.getName() != null ? dto.getName() : "");
                        row.createCell(col++).setCellValue(dto.getAddress() != null ? dto.getAddress() : "");
                        row.createCell(col++).setCellValue(dto.getLevel() != null ? dto.getLevel() : "");
                        row.createCell(col++).setCellValue(dto.getStatus() != null ? dto.getStatus() : "");
                        row.createCell(col++).setCellValue(dto.getCreatedAt() != null ? dto.getCreatedAt().toString() : "");
                        row.createCell(col++).setCellValue(dto.getUpdatedAt() != null ? dto.getUpdatedAt().toString() : "");
                    }
                } else if (first instanceof SiteTemplateDTO) {
                    String[] headers = {"站点名称*", "站点地址*", "站点等级(A/B/C/normal)", "站点状态(ONLINE/OFFLINE/UNDER_CONSTRUCTION)"};
                    for (int i = 0; i < headers.length; i++) {
                        Cell cell = headerRow.createCell(i);
                        cell.setCellValue(headers[i]);
                        cell.setCellStyle(headerStyle);
                    }

                    // 填充数据
                    int rowNum = 1;
                    for (T item : list) {
                        SiteTemplateDTO dto = (SiteTemplateDTO) item;
                        Row row = sheet.createRow(rowNum++);
                        int col = 0;
                        row.createCell(col++).setCellValue(dto.getName() != null ? dto.getName() : "");
                        row.createCell(col++).setCellValue(dto.getAddress() != null ? dto.getAddress() : "");
                        row.createCell(col++).setCellValue(dto.getLevel() != null ? dto.getLevel() : "");
                        row.createCell(col++).setCellValue(dto.getStatus() != null ? dto.getStatus() : "");
                    }
                }
            }

            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition",
                "attachment;filename=" + URLEncoder.encode(fileName, StandardCharsets.UTF_8.name()));

            workbook.write(response.getOutputStream());

        } catch (Exception e) {
            log.error("导出Excel失败", e);
            throw new RuntimeException("导出失败: " + e.getMessage());
        }
    }

    private List<SiteExcelDTO> parseExcel(InputStream inputStream) throws Exception {
        List<SiteExcelDTO> result = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) return result;

            // 跳过表头行，从第2行开始读取
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;

                SiteExcelDTO dto = new SiteExcelDTO();
                dto.setName(getCellStringValue(row.getCell(0)));
                dto.setAddress(getCellStringValue(row.getCell(1)));
                dto.setLevel(getCellStringValue(row.getCell(2)));
                dto.setStatus(getCellStringValue(row.getCell(3)));

                result.add(dto);
            }
        }

        return result;
    }

    private boolean isRowEmpty(Row row) {
        for (int i = 0; i < 4; i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String value = getCellStringValue(cell);
                if (value != null && !value.isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toString();
                }
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
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
