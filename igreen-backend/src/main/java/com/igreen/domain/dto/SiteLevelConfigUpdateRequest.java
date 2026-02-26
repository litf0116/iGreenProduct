package com.igreen.domain.dto;

import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record SiteLevelConfigUpdateRequest(String id, @Size(max = 50) String levelName, String description, BigDecimal slaMultiplier) {
}
