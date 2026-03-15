package com.igreen.domain.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;
import lombok.experimental.Accessors;

/**
 * 站点导入模板DTO (仅包含必填字段，用于生成模板文件)
 */
@Data
@Accessors(chain = true)
public class SiteTemplateDTO {

    @ExcelProperty("Site Code")
    private String code;

    @ExcelProperty("Site Name")
    private String name;

    @ExcelProperty("Address")
    private String address;

    @ExcelProperty("Level")
    private String level;

    @ExcelProperty("Status")
    private String status;
}
