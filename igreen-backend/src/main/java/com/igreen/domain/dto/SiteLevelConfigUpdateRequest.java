package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SiteLevelConfigUpdateRequest(String id, @Size(max = 50) String levelName, String description, BigDecimal slaMultiplier) {
}
