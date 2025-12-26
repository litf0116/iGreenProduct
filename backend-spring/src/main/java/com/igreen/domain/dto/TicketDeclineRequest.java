package com.igreen.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record TicketDeclineRequest(
    @NotBlank String reason
) {}
