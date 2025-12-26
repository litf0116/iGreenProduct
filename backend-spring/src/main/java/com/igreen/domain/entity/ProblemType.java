package com.igreen.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "problem_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemType {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
}
