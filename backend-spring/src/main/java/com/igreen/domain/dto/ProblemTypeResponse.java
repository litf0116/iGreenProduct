package com.igreen.domain.dto;

import jakarta.validation.constraints.Size;

public record ProblemTypeResponse(
        String id,
        @Size(max = 255) String name,
        String description
) {}
