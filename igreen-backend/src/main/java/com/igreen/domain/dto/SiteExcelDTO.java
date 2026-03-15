package com.igreen.domain.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import com.alibaba.excel.annotation.write.style.HeadRowHeight;
import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

/**
 * 站点导入导出DTO
 * 注意：导入时EasyExcel根据@ExcelProperty的value（表头名）匹配列
 */
@Data
@Accessors(chain = true)
@HeadRowHeight(25)
public class SiteExcelDTO {

    @ExcelProperty("ID")
    @ColumnWidth(20)
    private String id;

    @ExcelProperty("Site Code")
    @ColumnWidth(20)
    private String code;

    @ExcelProperty("Site Name")
    @ColumnWidth(25)
    private String name;

    @ExcelProperty("Address")
    @ColumnWidth(40)
    private String address;

    @ExcelProperty("Level")
    @ColumnWidth(15)
    private String level;

    @ExcelProperty("Status")
    @ColumnWidth(15)
    private String status;

    @ExcelProperty("Created At")
    @ColumnWidth(20)
    private LocalDateTime createdAt;

    @ExcelProperty("Updated At")
    @ColumnWidth(20)
    private LocalDateTime updatedAt;
}
