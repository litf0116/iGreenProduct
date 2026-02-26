package com.igreen.domain.dto;

import java.math.BigDecimal;

public record SiteLevelConfigResponse(String id, String levelName, String description, BigDecimal slaMultiplier) {
}
