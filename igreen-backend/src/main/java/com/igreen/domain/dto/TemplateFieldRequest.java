package com.igreen.domain.dto;

import com.igreen.domain.enums.FieldType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TemplateFieldRequest(
    @Size(max = 100, message = "字段名称不能超过100个字符")
    String name,

    @NotNull(message = "字段类型不能为空")
    FieldType type,

    Boolean required,

    @Size(max = 1000, message = "字段选项不能超过1000个字符")
    String options
) {}
