package com.igreen.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * 工单步骤数据结构
 * 
 * 包含两部分数据：
 * 1. 模板快照字段：id, name
 * 2. 用户数据字段：status, completed, timestamp
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TemplateStepData {
    
    // ==================== 模板快照字段 ====================
    
    /**
     * 模板快照：步骤ID
     */
    private String id;
    
    /**
     * 模板快照：步骤名称
     */
    private String name;
    
    // ==================== 用户数据字段 ====================
    
    /**
     * 步骤状态：pending, pass, fail, na
     */
    private String status;
    
    /**
     * 步骤是否完成
     */
    private Boolean completed;
    
    /**
     * 完成时间戳
     */
    private String timestamp;
    
    /**
     * 字段列表（包含模板快照 + 用户填写值）
     */
    @Builder.Default
    private List<TemplateFieldData> fields = new ArrayList<>();
}