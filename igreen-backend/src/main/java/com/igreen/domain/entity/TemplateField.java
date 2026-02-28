package com.igreen.domain.entity;

import com.igreen.domain.enums.FieldType;
import lombok.*;
import org.apache.commons.lang3.StringUtils;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateField {
    private String id;

    public String getId() {
        if (StringUtils.isNotBlank(id)) {
            id = UUID.randomUUID().toString();
        }
        return id;
    }

    private String name;
    private FieldType type;
    private Boolean required;
    private String options;

}
