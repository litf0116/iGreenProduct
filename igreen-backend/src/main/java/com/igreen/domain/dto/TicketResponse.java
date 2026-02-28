package com.igreen.domain.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.igreen.domain.entity.TemplateStepValue;

import java.util.List;

public record TicketResponse(@JsonSerialize(using = ToStringSerializer.class) Long id, String title, String description, String type,
                             String status, String priority, String siteId, String siteName, String siteAddress, String templateId,
                             String templateName, String assignedTo, String assignedToName, String createdBy, String createdByName,
                             String createdAt, String updatedAt, String dueDate, List<String> completedSteps,
                             List<TemplateStepValue> stepValues, Boolean accepted, String acceptedAt, String acceptedUserId,
                             String acceptedUserName, String departureAt, String departurePhoto, String arrivalAt, String arrivalPhoto,
                             String completionPhoto, String cause, String solution, List<TicketCommentResponse> comments,
                             List<String> relatedTicketIds, String problemType) {
}
