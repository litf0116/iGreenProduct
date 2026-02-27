package com.igreen.domain.entity;

import com.igreen.domain.enums.FieldType;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateField {
    private String name;
    private FieldType type;
    private Boolean required;
    private String options;
}
