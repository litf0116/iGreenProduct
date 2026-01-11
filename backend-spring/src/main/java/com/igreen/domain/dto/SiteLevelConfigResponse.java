package com.igreen.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SiteLevelConfigResponse(
        String id,
        @NotBlank @Size(max = 50) String levelName,
        String description,
        Integer maxConcurrentTickets,
        Integer escalationTimeHours
) {}
