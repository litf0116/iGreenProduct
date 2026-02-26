package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

@TableName("site_level_configs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteLevelConfig {

    @TableField("id")
    private String id;
    @TableField("level_name")
    private String levelName;
    @TableField("description")
    private String description;
    @TableField("sla_multiplier")
    private java.math.BigDecimal slaMultiplier;
    @TableField("created_at")
    private java.time.LocalDateTime createdAt;
    @TableField("updated_at")
    private java.time.LocalDateTime updatedAt;
}
