package com.igreen.domain.entity;

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
    private Integer order;
    private String templateId;
    @Builder.Default
    private List<TemplateField> fields = new ArrayList<>();
    @Builder.Default
    private Template template = null;
}
