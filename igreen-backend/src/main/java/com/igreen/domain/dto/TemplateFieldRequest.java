package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.igreen.domain.enums.FieldType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TemplateFieldRequest(
    @Size(max = 100, message = "字段名称不能超过100个字符")
    String name,

    @NotNull(message = "字段类型不能为空")
    FieldType type,

    Boolean required
) {}
