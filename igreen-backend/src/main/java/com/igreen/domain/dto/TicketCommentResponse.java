package com.igreen.domain.dto;

public record TicketCommentResponse(
        String id,
        String comment,
        String type,
        String userId,
        String userName,
        String ticketId,
        String createdAt
) {}
