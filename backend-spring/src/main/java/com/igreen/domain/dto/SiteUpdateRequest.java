package com.igreen.domain.dto;

import com.igreen.domain.enums.SiteStatus;

public record SiteUpdateRequest(
        String name,
        String address,
        String level,
        SiteStatus status
) {}
