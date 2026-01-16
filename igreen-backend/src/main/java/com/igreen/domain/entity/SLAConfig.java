package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.igreen.domain.enums.Priority;
import lombok.*;

import java.time.LocalDateTime;

@TableName("sla_configs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SLAConfig {

    private String id;
    private Priority priority;
    @TableField("response_time_minutes")
    private Integer responseTimeMinutes;
    @TableField("completion_time_hours")
    private Integer completionTimeHours;
    @TableField("created_at")
    private LocalDateTime createdAt;
    @TableField("updated_at")
    private LocalDateTime updatedAt;
}
