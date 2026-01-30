package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.igreen.domain.enums.GroupStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GroupUpdateRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 1000) String description,
        @JsonProperty("tags") String[] tags,
        GroupStatus status
) {}
