package com.igreen.domain.service;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import com.igreen.common.exception.BusinessException;
import com.igreen.domain.dto.*;
import com.igreen.domain.entity.Site;
import com.igreen.domain.enums.SiteStatus;
import com.igreen.domain.mapper.SiteMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 站点导入导出服务 (使用阿里巴巴 EasyExcel)
 */
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

        // 3. 生成文件名
        String fileName = "sites_export_" +
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) +
            ".xlsx";

        try {
            // 4. 设置响应头
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            response.setHeader("Content-Disposition",
                "attachment;filename=" + URLEncoder.encode(fileName, StandardCharsets.UTF_8.name()));

            // 5. 使用 EasyExcel 导出
            EasyExcel.write(response.getOutputStream(), SiteExcelDTO.class)
                .sheet("站点数据")
                .doWrite(dtos);

        } catch (IOException e) {
            log.error("导出站点数据失败", e);
            throw new BusinessException("导出失败: " + e.getMessage(), "EXPORT_FAILED");
        }
    }

    /**
     * 下载导入模板
     */
    public void downloadTemplate(HttpServletResponse response) {
        // 1. 创建示例数据
        List<SiteTemplateDTO> templates = createTemplateData();

        // 2. 生成文件名
        String fileName = "sites_import_template.xlsx";

        try {
            // 3. 设置响应头
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            response.setHeader("Content-Disposition",
                "attachment;filename=" + URLEncoder.encode(fileName, StandardCharsets.UTF_8.name()));

            // 4. 使用 EasyExcel 导出模板
            EasyExcel.write(response.getOutputStream(), SiteTemplateDTO.class)
                .sheet("导入模板")
                .doWrite(templates);

        } catch (IOException e) {
            log.error("导出导入模板失败", e);
            throw new BusinessException("模板导出失败: " + e.getMessage(), "TEMPLATE_EXPORT_FAILED");
        }
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
            // 1. 使用 EasyExcel 解析 Excel (使用 SiteTemplateDTO，因为模板只有4列)
            List<SiteTemplateDTO> list = new ArrayList<>();

            EasyExcel.read(file.getInputStream(), SiteTemplateDTO.class, new ReadListener<SiteTemplateDTO>() {
                @Override
                public void invoke(SiteTemplateDTO data, AnalysisContext context) {
                    list.add(data);
                }

                @Override
                public void doAfterAllAnalysed(AnalysisContext context) {
                    log.info("读取完成，共读取 {} 条数据", list.size());
                }
            }).headRowNumber(1).sheet().doRead();

            log.info("共读取 {} 条数据", list.size());

            result.setTotalCount(list.size());

            // 2. 处理每条数据
            int successCount = 0;
            List<String> createdIds = new ArrayList<>();
            List<ImportErrorDTO> errors = new ArrayList<>();

            for (int i = 0; i < list.size(); i++) {
                SiteTemplateDTO dto = list.get(i);
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
        // 状态使用小写值 (与前端约定)
        dto.setStatus(site.getStatus() != null ? site.getStatus().name().toLowerCase() : null);
        dto.setCreatedAt(site.getCreatedAt());
        dto.setUpdatedAt(site.getUpdatedAt());
        return dto;
    }

    private Site toEntity(SiteTemplateDTO dto) {
        Site site = new Site();
        site.setName(dto.getName());
        site.setAddress(dto.getAddress());
        site.setLevel(dto.getLevel() != null ? dto.getLevel() : "normal");

        if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
            try {
                // 状态值可能是大写或小写，尝试转换
                String statusValue = dto.getStatus().toUpperCase();
                site.setStatus(SiteStatus.valueOf(statusValue));
            } catch (Exception e) {
                site.setStatus(SiteStatus.ONLINE);
            }
        } else {
            site.setStatus(SiteStatus.ONLINE);
        }

        return site;
    }

    private String validateDTO(SiteTemplateDTO dto) {
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

    private List<SiteTemplateDTO> createTemplateData() {
        List<SiteTemplateDTO> templates = new ArrayList<>();

        // 添加示例数据
        SiteTemplateDTO example1 = new SiteTemplateDTO();
        example1.setName("示例站点1");
        example1.setAddress("123 示例地址");
        example1.setLevel("A");
        example1.setStatus("online");
        templates.add(example1);

        SiteTemplateDTO example2 = new SiteTemplateDTO();
        example2.setName("示例站点2");
        example2.setAddress("456 示例地址");
        example2.setLevel("B");
        example2.setStatus("offline");
        templates.add(example2);

        SiteTemplateDTO example3 = new SiteTemplateDTO();
        example3.setName("示例站点3");
        example3.setAddress("789 示例地址");
        example3.setLevel("C");
        example3.setStatus("under_construction");
        templates.add(example3);

        return templates;
    }
}
