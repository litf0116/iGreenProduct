package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserProfileUpdateRequest(
        String name,
        @Size(max = 20, message = "电话号码长度不能超过20个字符")
        String phone
) {}
