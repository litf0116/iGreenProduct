package com.igreen.domain.dto;

import com.igreen.domain.enums.Priority;

public record SLAConfigResponse(
        String id,
        Priority priority,
        Integer responseTimeMinutes,
        Integer completionTimeHours
) {}
