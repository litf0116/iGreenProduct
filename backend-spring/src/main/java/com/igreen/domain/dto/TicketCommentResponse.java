package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record TicketCommentResponse(
    String id,
    String comment,
    String type,
    String userId,
    String userName,
    String ticketId,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime createdAt
) {}
