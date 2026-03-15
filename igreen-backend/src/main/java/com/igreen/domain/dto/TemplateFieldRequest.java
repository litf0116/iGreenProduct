package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.igreen.domain.enums.FieldType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TemplateFieldRequest {
    @Size(max = 100, message = "字段名称不能超过100个字符")
    private String name;

    @NotNull(message = "字段类型不能为空")
    private FieldType type;

    private Boolean required;
}