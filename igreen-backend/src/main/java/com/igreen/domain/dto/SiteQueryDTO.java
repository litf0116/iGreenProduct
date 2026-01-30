package com.igreen.domain.dto;

import com.igreen.domain.enums.SiteStatus;
import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

/**
 * 站点查询条件
 */
@Data
@Accessors(chain = true)
public class SiteQueryDTO {
    private String keyword;
    private String level;
    private SiteStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
