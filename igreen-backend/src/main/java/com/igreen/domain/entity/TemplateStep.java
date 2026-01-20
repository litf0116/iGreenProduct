package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@TableName("template_steps")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateStep {

    private String id;
    private String name;
    private String description;
    @TableField("`order`")
    private Integer order;
    private String templateId;
    @Builder.Default
    @TableField(exist = false)
    private List<TemplateField> fields = new ArrayList<>();
    @Builder.Default
    @TableField(exist = false)
    private Template template = null;
}
