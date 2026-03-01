package com.igreen.domain.entity;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateStep {
    private String id;
    private String name;
    private String description;
    private Integer sortOrder;

    @Builder.Default
    private List<TemplateField> fields = new ArrayList<>();
}