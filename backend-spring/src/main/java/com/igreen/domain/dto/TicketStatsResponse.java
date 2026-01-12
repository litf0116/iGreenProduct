package com.igreen.domain.dto;

public record TicketStatsResponse(
    int total,
    int open,
    int inProgress,
    int submitted,
    int completed,
    int onHold
) {}
