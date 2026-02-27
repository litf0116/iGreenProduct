package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TemplateStepRequest(
    @Size(max = 100, message = "步骤名称不能超过100个字符")
    String name,

    @Size(max = 500, message = "步骤描述不能超过500个字符")
    String description,

    Integer order,

    @Valid
    List<TemplateFieldRequest> fields
) {}
