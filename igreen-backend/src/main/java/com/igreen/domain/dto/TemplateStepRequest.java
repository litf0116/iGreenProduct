package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TemplateStepRequest {
    @Size(max = 100, message = "步骤名称不能超过100个字符")
    private String name;

    @Size(max = 500, message = "步骤描述不能超过500个字符")
    private String description;

    private Integer order;

    @Valid
    private List<TemplateFieldRequest> fields;
}