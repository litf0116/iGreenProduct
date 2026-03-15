package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TicketUpdateRequest {
    private String title;
    private String description;
    private String type;
    private String siteId;
    private String status;
    private String priority;
    private String assignedTo;
    private LocalDateTime dueDate;
    private List<String> completedSteps;
    private Map<String, Object> templateData;
    private LocalDateTime departureAt;
    private String departurePhoto;
    private LocalDateTime arrivalAt;
    private String arrivalPhoto;
    private String completionPhoto;
    private String cause;
    private String solution;
    private List<String> relatedTicketIds;
    private String problemType;
}