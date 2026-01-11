package com.igreen.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record UserCountryRequest(
    @NotBlank(message = "国家不能为空")
    String country
) {}
