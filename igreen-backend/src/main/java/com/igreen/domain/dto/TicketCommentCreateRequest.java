package com.igreen.domain.dto;

import com.igreen.domain.enums.CommentType;
import jakarta.validation.constraints.NotBlank;

public record TicketCommentCreateRequest(
    @NotBlank String comment,
    CommentType type
) {}
