package com.igreen.domain.dto;

import com.igreen.domain.enums.Priority;
import com.igreen.domain.enums.TicketType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record TicketCreateRequest(
    @NotBlank @NotNull String title,
    String description,
    @NotNull TicketType type,
    String site,
    Priority priority,
    @NotBlank String templateId,
    @NotBlank String assignedTo,
    @NotNull LocalDateTime dueDate,
    String problemType,
    List<String> relatedTicketIds
) {}
