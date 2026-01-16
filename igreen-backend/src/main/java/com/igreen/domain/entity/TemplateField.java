package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.igreen.domain.enums.FieldType;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@TableName("template_fields")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateField {

    private String id;
    private String name;
    private FieldType type;
    private Boolean required;
    private String options;
    private String stepId;
    @Builder.Default
    @TableField(exist = false)
    private TemplateStep step = null;
}
