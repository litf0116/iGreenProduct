package com.igreen.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank String username,
    @NotBlank String password,
    String country  // country 可选，小程序登录不传 country
) {}
