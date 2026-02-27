package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RefreshRequest(
    @NotBlank(message = "Refresh token 不能为空")
    String refreshToken
) {}
