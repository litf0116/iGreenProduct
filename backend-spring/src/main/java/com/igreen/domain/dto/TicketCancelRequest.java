package com.igreen.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record TicketCancelRequest(
    @NotBlank String reason
) {}
