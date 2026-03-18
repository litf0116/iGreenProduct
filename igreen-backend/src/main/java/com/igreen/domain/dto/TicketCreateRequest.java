package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TicketCreateRequest {
    @NotBlank
    @NotNull
    private String title;
    private String description;
    @NotNull
    private String type;
    private String siteId;
    private String priority;
    @NotBlank
    private String templateId;
    @NotBlank
    private String assignedTo;
    @NotNull
    private LocalDateTime dueDate;
    private String problemType;
    private List<String> relatedTicketIds;
    private List<String> attachmentIds;
}
