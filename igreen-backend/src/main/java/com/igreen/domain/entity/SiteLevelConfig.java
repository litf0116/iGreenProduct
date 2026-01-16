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

    private String id;
    @TableField("level_name")
    private String levelName;
    private String description;
    @TableField("max_concurrent_tickets")
    private Integer maxConcurrentTickets;
    @TableField("escalation_time_hours")
    private Integer escalationTimeHours;
    @TableField("created_at")
    private java.time.LocalDateTime createdAt;
    @TableField("updated_at")
    private java.time.LocalDateTime updatedAt;
}
