package com.igreen.domain.dto;

import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

/**
 * 站点导入导出DTO
 */
@Data
@Accessors(chain = true)
public class SiteExcelDTO {

    /**
     * 站点ID (仅导出时使用，导入时忽略)
     */
    private String id;

    /**
     * 站点名称
     * 必填字段，最大100字符
     */
    private String name;

    /**
     * 站点地址
     * 必填字段，最大500字符
     */
    private String address;

    /**
     * 站点等级
     * 可选，有效值: A/B/C/normal，默认 normal
     */
    private String level;

    /**
     * 站点状态
     * 可选，有效值: ONLINE/OFFLINE/UNDER_CONSTRUCTION，默认 ONLINE
     */
    private String status;

    /**
     * 创建时间 (仅导出时使用)
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间 (仅导出时使用)
     */
    private LocalDateTime updatedAt;
}
