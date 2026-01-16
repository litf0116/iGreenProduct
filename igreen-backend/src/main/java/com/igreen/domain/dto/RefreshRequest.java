package com.igreen.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(
    @NotBlank(message = "Refresh token 不能为空")
    String refreshToken
) {}
