package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.igreen.domain.enums.Priority;
import com.igreen.domain.enums.TicketType;

import java.time.LocalDateTime;
import java.util.List;

public record TicketResponse(
    String id,
    String title,
    String description,
    String type,
    String status,
    String priority,
    String site,
    String templateId,
    String templateName,
    String assignedTo,
    String assignedToName,
    String createdBy,
    String createdByName,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime createdAt,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime updatedAt,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime dueDate,
    List<String> completedSteps,
    StepData stepData,
    Boolean accepted,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime acceptedAt,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime departureAt,
    String departurePhoto,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime arrivalAt,
    String arrivalPhoto,
    String completionPhoto,
    String cause,
    String solution,
    List<TicketCommentResponse> comments,
    List<String> relatedTicketIds,
    String problemType
) {}
