package com.igreen.domain.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单导出 Excel DTO
 */
@Data
public class TicketExcelDTO {

    @ExcelProperty("Ticket ID")
    @ColumnWidth(15)
    private String id;

    @ExcelProperty("Title")
    @ColumnWidth(30)
    private String title;

    @ExcelProperty("Type")
    @ColumnWidth(12)
    private String type;

    @ExcelProperty("Status")
    @ColumnWidth(12)
    private String status;

    @ExcelProperty("Priority")
    @ColumnWidth(10)
    private String priority;

    @ExcelProperty("Site Name")
    @ColumnWidth(25)
    private String siteName;

    @ExcelProperty("Site Address")
    @ColumnWidth(35)
    private String siteAddress;

    @ExcelProperty("Assigned Group")
    @ColumnWidth(20)
    private String assignedToName;

    @ExcelProperty("Accepted By")
    @ColumnWidth(20)
    private String acceptedUserName;

    @ExcelProperty("Created By")
    @ColumnWidth(20)
    private String createdByName;

    @ExcelProperty("Created At")
    @ColumnWidth(20)
    private String createdAt;

    @ExcelProperty("Due Date")
    @ColumnWidth(20)
    private String dueDate;

    @ExcelProperty("Completed At")
    @ColumnWidth(20)
    private String completedAt;
}