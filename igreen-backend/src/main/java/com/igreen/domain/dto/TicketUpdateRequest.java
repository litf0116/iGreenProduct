package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TicketUpdateRequest(
    String title,
    String description,
    String type,
    String siteId,
    String status,
    String priority,
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
