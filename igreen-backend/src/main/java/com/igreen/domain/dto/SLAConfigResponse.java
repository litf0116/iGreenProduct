package com.igreen.domain.dto;

import com.igreen.domain.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SLAConfigResponse {
    private String id;
    private Priority priority;
    private Integer responseTimeMinutes;
    private Integer completionTimeHours;
}
