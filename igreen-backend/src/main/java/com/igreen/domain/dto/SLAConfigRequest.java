package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.igreen.domain.enums.Priority;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SLAConfigRequest(
        String id,
        @NotNull Priority priority,
        @Min(1) Integer responseTimeMinutes,
        @Min(1) Integer completionTimeHours
) {}
