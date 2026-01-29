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
