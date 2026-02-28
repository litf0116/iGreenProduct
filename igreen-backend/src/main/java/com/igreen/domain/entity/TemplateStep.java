package com.igreen.domain.entity;

import lombok.*;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateStep {
    public String getId() {
        if (StringUtils.isNotBlank(id)) {
            id = UUID.randomUUID().toString();
        }
        return id;
    }

    private String id;
    private String name;
    private String description;
    private Integer sortOrder;

    @Builder.Default
    private List<TemplateField> fields = new ArrayList<>();


}
