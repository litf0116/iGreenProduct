package com.igreen.domain.dto;

public record SiteStats(
        Long totalSites,
        Long onlineSites,
        Long offlineSites,
        Long vipSites
) {}
