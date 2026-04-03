package com.igreen.domain.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String title;
    private String description;
    private String type;
    private String status;
    private String priority;
    private String siteId;
    private String siteName;
    private String siteAddress;
    private String templateId;
    private String templateName;
    private String assignedTo;
    private String assignedToName;
    private String createdBy;
    private String createdByName;
    private String createdAt;
    private String updatedAt;
    private String dueDate;
    private List<String> completedSteps;
    private Map<String, Object> templateData;
    private Integer completedStepsCount;
    private Integer totalStepsCount;
    private Integer progressPercentage;
    private Boolean accepted;
    private String acceptedAt;
    private String acceptedUserId;
    private String acceptedUserName;
    private String departureAt;
    private String departurePhoto;
    private String arrivalAt;
    private String arrivalPhoto;
    private String completionPhoto;
    private String cause;
    private String solution;
    private List<TicketCommentResponse> comments;
    private List<String> relatedTicketIds;
    private String problemType;
    private String country;
    private List<String> attachmentIds;
}