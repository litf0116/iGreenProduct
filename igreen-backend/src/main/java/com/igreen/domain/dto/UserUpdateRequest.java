package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserUpdateRequest(
        String name,
        String username,
        String groupId,
        UserStatus status,
        UserRole role,
        @Size(min = 6, max = 100, message = "密码长度必须在6-100个字符之间")
        String password,
        String country
) {}
