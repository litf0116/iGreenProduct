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

    /**
     * 站点名称
     */
    @ExcelProperty("Site Name")
    private String name;

    /**
     * 站点地址
     */
    @ExcelProperty("Address")
    private String address;

    /**
     * 站点等级
     * 可选，有效值: A/B/C/normal
     */
    @ExcelProperty("Level")
    private String level;

    /**
     * 站点状态
     * 可选，有效值: online/offline/under_construction
     */
    @ExcelProperty("Status")
    private String status;
}
