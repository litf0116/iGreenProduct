package com.igreen.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.igreen.domain.enums.FieldType;
import lombok.*;

import java.util.Map;

/**
 * 工单字段数据结构
 * <p>
 * 包含两部分数据：
 * 1. 模板快照字段：id, name, type, required, description, config
 * 2. 用户数据字段：value
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TemplateFieldData {

    // ==================== 模板快照字段 ====================

    /**
     * 模板快照：字段ID
     */
    private String id;

    /**
     * 模板快照：字段名称
     */
    private String name;

    /**
     * 模板快照：字段类型
     */
    private FieldType type;

    /**
     * 模板快照：是否必填
     */
    private Boolean required;

    /**
     * 模板快照：字段描述
     */
    private String description;

    /**
     * 模板快照：扩展配置
     */
    private Map<String, Object> config;


    // ==================== 用户数据字段 ====================

    /**
     * 用户填写的值
     * <p>
     * 支持类型：
     * - String: TEXT, NUMBER, DATE, LOCATION, PHOTO, SIGNATURE
     * - List<String>: PHOTOS（多张照片）
     * - Map/InspectionValue: INSPECTION（包含 status, evidencePhotos, cause, beforePhotos, afterPhotos）
     */
    private Object value;

    /**
     * 字段值填写时间戳
     */
    private String timestamp;
}
