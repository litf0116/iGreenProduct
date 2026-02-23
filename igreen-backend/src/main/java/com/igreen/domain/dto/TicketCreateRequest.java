package com.igreen.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public record TicketCreateRequest(
    @NotBlank @NotNull String title,
    String description,
    @NotNull String type,
    String siteId,
    String priority,
    @NotBlank String templateId,
    @NotBlank String assignedTo,
    @NotNull LocalDateTime dueDate,
    String problemType,
    List<String> relatedTicketIds
) {}
