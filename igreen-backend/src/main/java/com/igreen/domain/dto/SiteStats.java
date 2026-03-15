package com.igreen.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteStats {
    private Long totalSites;
    private Long onlineSites;
    private Long offlineSites;
    private Long vipSites;
}
