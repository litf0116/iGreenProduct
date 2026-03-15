package com.igreen.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteLevelConfigResponse {
    private String id;
    private String levelName;
    private String description;
    private BigDecimal slaMultiplier;
}
