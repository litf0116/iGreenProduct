package com.igreen.domain.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@EqualsAndHashCode(callSuper = true)
@Data
public class TemplateStepValue extends TemplateStep {
    private List<TemplateFieldValue> fieldValues = new ArrayList<>();
    // 使用 field name 作为key 值 作为value的 map
    private Map<String,String> fieldValueMap = new HashMap<String,String>();
    private Boolean completed;
    private String status;
    private String timestamp;
}
