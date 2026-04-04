package com.igreen.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * 工单模板数据结构
 * 存储在 Ticket.templateData 字段中（JSON 格式）
 * 
 * 包含两部分数据：
 * 1. 模板快照：id, name, type, steps 定义
 * 2. 用户填写数据：steps 中的 status, completed, timestamp, value
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TemplateData {
    
    /**
     * 模板快照：原始模板ID
     */
    private String id;
    
    /**
     * 模板快照：模板名称
     */
    private String name;
    
    /**
     * 工单类型（corrective, planned, preventive, problem）
     */
    private String type;
    
    /**
     * 步骤列表（包含模板快照 + 用户填写数据）
     */
    @Builder.Default
    private List<TemplateStepData> steps = new ArrayList<>();
}