package com.igreen.domain.dto;

import jakarta.validation.constraints.Size;

public record SiteLevelConfigUpdateRequest(
        @Size(max = 255) String name,
        String description,
        Double slaMultiplier
) {}
