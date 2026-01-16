package com.igreen.domain.dto;

import com.igreen.domain.enums.Priority;
import com.igreen.domain.enums.TicketStatus;
import com.igreen.domain.enums.TicketType;

import java.util.List;

public record TicketResponse(
        String id,
        String title,
        String description,
        TicketType type,
        TicketStatus status,
        Priority priority,
        String site,
        String templateId,
        String templateName,
        String assignedTo,
        String assignedToName,
        String createdBy,
        String createdByName,
        String createdAt,
        String updatedAt,
        String dueDate,
        List<String> completedSteps,
        StepData stepData,
        Boolean accepted,
        String acceptedAt,
        String departureAt,
        String departurePhoto,
        String arrivalAt,
        String arrivalPhoto,
        String completionPhoto,
        String cause,
        String solution,
        List<TicketCommentResponse> comments,
        List<String> relatedTicketIds,
        String problemType
) {}
