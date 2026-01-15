package com.igreen.domain.dto;

import com.igreen.domain.enums.SiteStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SiteCreateRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 1000) String address,
        @Size(max = 50) String level,
        SiteStatus status
) {}
