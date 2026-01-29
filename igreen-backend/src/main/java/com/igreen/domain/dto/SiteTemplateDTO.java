package com.igreen.domain.dto;

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
    private String name;

    /**
     * 站点地址
     */
    private String address;

    /**
     * 站点等级
     */
    private String level;

    /**
     * 站点状态
     */
    private String status;
}
