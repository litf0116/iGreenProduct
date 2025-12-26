package com.igreen.domain.entity;

import com.igreen.domain.enums.FieldType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "template_fields")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateField {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FieldType type;

    @Column(nullable = false)
    private Boolean required;

    @Column(columnDefinition = "TEXT")
    private String options;

    @Column(name = "step_id", nullable = false, length = 36)
    private String stepId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", insertable = false, updatable = false)
    private TemplateStep step;
}
