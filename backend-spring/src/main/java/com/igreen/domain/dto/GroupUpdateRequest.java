package com.igreen.domain.dto;

import com.igreen.domain.enums.GroupStatus;

public record GroupUpdateRequest(
        String name,
        String description,
        String tags,
        GroupStatus status
) {}
