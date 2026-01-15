package com.igreen.domain.dto;

import com.igreen.domain.enums.GroupStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GroupCreateRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 1000) String description,
        String tags,
        GroupStatus status
) {}
