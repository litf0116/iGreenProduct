package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.igreen.domain.enums.Priority;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SLAConfigRequest {
    private String id;
    @NotNull
    private Priority priority;
    @Min(1)
    private Integer responseTimeMinutes;
    @Min(1)
    private Integer completionTimeHours;
}
