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

    /**
     * 站点ID (仅导出时使用，导入时忽略)
     */
    @ExcelProperty("ID")
    @ColumnWidth(20)
    private String id;

    /**
     * 站点名称
     */
    @ExcelProperty("站点名称")
    @ColumnWidth(25)
    private String name;

    /**
     * 站点地址
     */
    @ExcelProperty("站点地址")
    @ColumnWidth(40)
    private String address;

    /**
     * 站点等级
     * 可选，有效值: A/B/C/normal，默认 normal
     */
    @ExcelProperty("站点等级")
    @ColumnWidth(15)
    private String level;

    /**
     * 站点状态
     * 可选，有效值: online/offline/under_construction，默认 online
     */
    @ExcelProperty("站点状态")
    @ColumnWidth(15)
    private String status;

    /**
     * 创建时间 (仅导出时使用)
     */
    @ExcelProperty("创建时间")
    @ColumnWidth(20)
    private LocalDateTime createdAt;

    /**
     * 更新时间 (仅导出时使用)
     */
    @ExcelProperty("更新时间")
    @ColumnWidth(20)
    private LocalDateTime updatedAt;
}
