package com.igreen.domain.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateTemplateRequest(
    @NotBlank(message = "模板名称不能为空")
    @Size(max = 100, message = "模板名称不能超过100个字符")
    String name,

    @Size(max = 500, message = "模板描述不能超过500个字符")
    String description,

    @Valid
    List<TemplateStepRequest> steps
) {}
