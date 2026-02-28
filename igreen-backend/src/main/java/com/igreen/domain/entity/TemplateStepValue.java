package com.igreen.domain.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class TemplateStepValue extends TemplateStep {
    private List<TemplateFieldValue> fieldValues = new ArrayList<>();
    private Boolean completed;
    private String status;
    private String timestamp;
}
