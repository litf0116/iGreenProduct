package com.igreen.domain.entity;

import com.igreen.domain.enums.Priority;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sla_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SLAConfig {

    @Id
    @Column(length = 36)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Priority priority;

    @Column(name = "response_time_minutes", nullable = false)
    private Integer responseTimeMinutes;

    @Column(name = "completion_time_hours", nullable = false)
    private Integer completionTimeHours;
}
