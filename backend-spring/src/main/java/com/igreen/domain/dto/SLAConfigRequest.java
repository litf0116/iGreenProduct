package com.igreen.domain.dto;

import com.igreen.domain.enums.Priority;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SLAConfigRequest(
        String id,
        @NotNull Priority priority,
        @Min(1) Integer responseTimeHours,
        @Min(1) Integer resolutionTimeHours
) {}
