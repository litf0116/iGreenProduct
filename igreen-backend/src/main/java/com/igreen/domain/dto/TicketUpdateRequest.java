package com.igreen.domain.dto;

import com.igreen.domain.enums.Priority;
import com.igreen.domain.enums.TicketStatus;
import com.igreen.domain.enums.TicketType;

import java.time.LocalDateTime;
import java.util.List;

public record TicketUpdateRequest(
    String title,
    String description,
    TicketType type,
    String site,
    TicketStatus status,
    Priority priority,
    String assignedTo,
    LocalDateTime dueDate,
    List<String> completedSteps,
    StepData stepData,
    LocalDateTime departureAt,
    String departurePhoto,
    LocalDateTime arrivalAt,
    String arrivalPhoto,
    String completionPhoto,
    String cause,
    String solution,
    List<String> relatedTicketIds
) {}
