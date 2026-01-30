package com.igreen.domain.controller;

import com.igreen.common.result.Result;
import com.igreen.domain.dto.SiteImportResultDTO;
import com.igreen.domain.dto.SiteQueryDTO;
import com.igreen.domain.enums.SiteStatus;
import com.igreen.domain.service.SiteImportExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
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
            @Parameter(description = "开始日期 (yyyy-MM-dd)") 
            @RequestParam(required = false) String startDate,
            @Parameter(description = "结束日期 (yyyy-MM-dd)") 
            @RequestParam(required = false) String endDate,
            HttpServletResponse response) {
        
        SiteQueryDTO query = new SiteQueryDTO();
        query.setKeyword(keyword);
        query.setLevel(level);
        
        if (status != null && !status.isEmpty()) {
            try {
                query.setStatus(SiteStatus.valueOf(status));
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
                return Result.error("请上传 Excel 文件 (.xlsx)", "400");
            }

            SiteImportResultDTO result = siteImportExportService.importSites(file, overwrite);

            if (result.isSuccess()) {
                return Result.success(result);
            } else {
                return Result.error(result.getMessage(), "400");
            }

        } catch (Exception e) {
            log.error("导入站点失败", e);
            return Result.error("导入失败: " + e.getMessage(), "500");
        }
    }
}
