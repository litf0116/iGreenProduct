package com.igreen.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record SiteLevelConfigRequest(String id, @NotBlank @Size(max = 50) String levelName, String description, BigDecimal slaMultiplier) {
}
