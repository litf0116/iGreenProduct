package com.igreen.domain.entity;

import com.igreen.domain.enums.Priority;
import com.igreen.domain.enums.TicketStatus;
import com.igreen.domain.enums.TicketType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tickets", indexes = {
        @Index(name = "idx_ticket_status", columnList = "status"),
        @Index(name = "idx_ticket_assigned_to", columnList = "assigned_to"),
        @Index(name = "idx_ticket_created_by", columnList = "created_by"),
        @Index(name = "idx_ticket_status_assigned", columnList = "status, assigned_to"),
        @Index(name = "idx_ticket_due_date", columnList = "due_date"),
        @Index(name = "idx_ticket_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Priority priority;

    @Column(length = 255)
    private String site;

    @Column(name = "template_id", nullable = false, length = 36)
    private String templateId;

    @Column(name = "assigned_to", nullable = false, length = 36)
    private String assignedTo;

    @Column(name = "created_by", nullable = false, length = 36)
    private String createdBy;

    @Column(name = "completed_steps", columnDefinition = "TEXT")
    private String completedSteps;

    @Column(name = "step_data", columnDefinition = "TEXT")
    private String stepData;

    @Column
    private Boolean accepted;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "departure_at")
    private LocalDateTime departureAt;

    @Column(name = "departure_photo", length = 500)
    private String departurePhoto;

    @Column(name = "arrival_at")
    private LocalDateTime arrivalAt;

    @Column(name = "arrival_photo", length = 500)
    private String arrivalPhoto;

    @Column(name = "completion_photo", length = 500)
    private String completionPhoto;

    @Column(columnDefinition = "TEXT")
    private String cause;

    @Column(columnDefinition = "TEXT")
    private String solution;

    @Column(name = "related_ticket_ids", columnDefinition = "TEXT")
    private String relatedTicketIds;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", insertable = false, updatable = false)
    private Template template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to", insertable = false, updatable = false)
    private User assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private User creator;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<TicketComment> comments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
