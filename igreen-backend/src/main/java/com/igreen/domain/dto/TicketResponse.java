package com.igreen.domain.dto;

import java.util.List;

public record TicketResponse(
        Long id,
        String title,
        String description,
        String type,
        String status,
        String priority,
        String site,
        String siteName,      // 新增：站点名称
        String siteAddress,   // 新增：站点地址
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
