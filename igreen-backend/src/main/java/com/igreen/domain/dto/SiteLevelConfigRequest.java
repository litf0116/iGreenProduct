package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SiteLevelConfigRequest(String id, @NotBlank @Size(max = 50) String levelName, String description, BigDecimal slaMultiplier) {}



