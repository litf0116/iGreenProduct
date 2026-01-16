package com.igreen.domain.dto;

import com.igreen.domain.enums.Priority;
import com.igreen.domain.enums.TicketType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public record TicketCreateRequest(
    @NotBlank @NotNull String title,
    String description,
    @NotNull String type,
    String site,
    String priority,
    @NotBlank String templateId,
    @NotBlank String assignedTo,
    @NotNull LocalDateTime dueDate,
    String problemType,
    List<String> relatedTicketIds
) {}
