package com.igreen.domain.entity;

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
    private String name;
    private Integer responseTimeHours;
    private Integer resolutionTimeHours;
    private Priority priority;
    private Integer responseTimeMinutes;
    private Integer completionTimeHours;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
