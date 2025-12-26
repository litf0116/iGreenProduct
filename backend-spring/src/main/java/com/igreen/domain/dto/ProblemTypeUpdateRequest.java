package com.igreen.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProblemTypeUpdateRequest(
        @Size(max = 255) String name,
        String description
) {}
