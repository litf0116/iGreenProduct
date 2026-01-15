package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.math.BigDecimal;

@TableName("site_level_configs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteLevelConfig {

    private String id;
    private String levelName;
    private String description;
    private BigDecimal slaMultiplier;
}
