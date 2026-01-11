package com.igreen.domain.dto;

import jakarta.validation.constraints.Size;

public record SiteLevelConfigUpdateRequest(
        @Size(max = 50) String levelName,
        String description,
        Integer maxConcurrentTickets,
        Integer escalationTimeHours
) {}
