package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.igreen.domain.enums.SiteStatus;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SiteUpdateRequest(
        String name,
        String address,
        String level,
        SiteStatus status
) {}
