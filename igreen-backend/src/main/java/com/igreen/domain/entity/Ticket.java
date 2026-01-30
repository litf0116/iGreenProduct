package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@TableName("tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    private Long id;
    private String title;
    private String description;
    private String type;
    private String status;
    private String priority;
    private String site;
    private String templateId;
    private String assignedTo;
    private String createdBy;
    private String completedSteps;
    private String stepData;
    private Boolean accepted;
    private LocalDateTime acceptedAt;
    private LocalDateTime departureAt;
    private String departurePhoto;
    private LocalDateTime arrivalAt;
    private String arrivalPhoto;
    private String completionPhoto;
    private String cause;
    private String solution;
    private String relatedTicketIds;
    private String problemType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime dueDate;
    @Builder.Default
    @TableField(exist = false)
    private Template template = null;
    @Builder.Default
    @TableField(exist = false)
    private User assignee = null;
    @Builder.Default
    @TableField(exist = false)
    private User creator = null;
    @Builder.Default
    @TableField(exist = false)
    private List<TicketComment> comments = new ArrayList<>();
    @Builder.Default
    @TableField(exist = false)
    private String assignedToName = null;
    @Builder.Default
    @TableField(exist = false)
    private String createdByName = null;
    @Builder.Default
    @TableField(exist = false)
    private String templateName = null;
}
