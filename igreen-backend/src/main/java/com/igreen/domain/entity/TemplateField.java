package com.igreen.domain.entity;

import com.igreen.domain.enums.FieldType;
import lombok.*;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateField {
    private String id;
    private String name;
    private FieldType type;
    private String description;
    private Boolean required;
    private String options;
    private Map<String, Object> config;
}