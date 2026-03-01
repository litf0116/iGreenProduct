package com.igreen.domain.dto;

/**
 * 工单统计响应
 * 使用管理端状态作为统计维度
 */
public record TicketStatsResponse(
    int total,
    int open,
    int inProgress,
    int submitted,
    int onHold,
    int closed
) {}
