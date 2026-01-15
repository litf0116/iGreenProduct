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
    private Priority priority;
    private Integer responseTimeHours;
    private Integer resolutionTimeHours;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
