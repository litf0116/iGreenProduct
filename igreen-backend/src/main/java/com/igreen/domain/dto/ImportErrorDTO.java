package com.igreen.domain.dto;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * 导入错误详情
 */
@Data
@Accessors(chain = true)
public class ImportErrorDTO {

    /**
     * 行号 (从1开始，不包含表头)
     */
    private Integer rowNum;

    /**
     * 错误字段
     */
    private String field;

    /**
     * 原始值
     */
    private String value;

    /**
     * 错误原因
     */
    private String reason;
}
