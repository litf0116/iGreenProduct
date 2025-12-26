package com.igreen.domain.dto;

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
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    LocalDateTime dueDate,
    List<String> completedSteps,
    StepData stepData,
    Boolean accepted,
    LocalDateTime acceptedAt,
    LocalDateTime departureAt,
    String departurePhoto,
    LocalDateTime arrivalAt,
    String arrivalPhoto,
    String completionPhoto,
    String cause,
    String solution,
    List<TicketCommentResponse> comments,
    List<String> relatedTicketIds
) {}
