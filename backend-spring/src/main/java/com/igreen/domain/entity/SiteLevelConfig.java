package com.igreen.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "site_level_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteLevelConfig {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "level_name", nullable = false, unique = true, length = 50)
    private String levelName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "max_concurrent_tickets")
    private Integer maxConcurrentTickets;

    @Column(name = "escalation_time_hours")
    private Integer escalationTimeHours;
}
