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

    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sla_multiplier", nullable = false)
    private Double slaMultiplier;
}
