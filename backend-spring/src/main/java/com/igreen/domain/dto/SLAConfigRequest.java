package com.igreen.domain.dto;

import com.igreen.domain.enums.Priority;
import jakarta.validation.constraints.Min;

public record SLAConfigRequest(
        Priority priority,
        @Min(1) Integer responseTimeMinutes,
        @Min(1) Integer completionTimeHours
) {}
