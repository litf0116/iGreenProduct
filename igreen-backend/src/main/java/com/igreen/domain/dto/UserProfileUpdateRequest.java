package com.igreen.domain.dto;

import jakarta.validation.constraints.Size;

public record UserProfileUpdateRequest(
        String name,
        @Size(max = 20, message = "电话号码长度不能超过20个字符")
        String phone
) {}
