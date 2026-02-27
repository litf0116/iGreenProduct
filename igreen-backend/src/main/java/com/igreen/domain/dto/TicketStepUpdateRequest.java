package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@Builder

@NoArgsConstructor
@AllArgsConstructor
public class TicketStepUpdateRequest {

    private Boolean completed;

    private String description;

    private String status; // pass, fail, na

    private String cause;

    private String photoUrl;

    private List<String> photoUrls;

    private String beforePhotoUrl;

    private List<String> beforePhotoUrls;

    private String afterPhotoUrl;

    private List<String> afterPhotoUrls;

    private String timestamp;
}
