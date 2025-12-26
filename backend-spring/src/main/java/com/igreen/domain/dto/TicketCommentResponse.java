package com.igreen.domain.dto;

import java.time.LocalDateTime;

public record TicketCommentResponse(
    String id,
    String comment,
    String type,
    String userId,
    String userName,
    String ticketId,
    LocalDateTime createdAt
) {}
