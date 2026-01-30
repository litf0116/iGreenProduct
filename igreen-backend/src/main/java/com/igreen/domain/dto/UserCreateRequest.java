package com.igreen.domain.dto;

import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(
        @NotBlank @Size(min = 1, max = 255) String name,
        @NotBlank @Size(min = 3, max = 100) String username,
        @NotBlank @Size(min = 6, max = 100) String password,
        UserRole role,
        UserStatus status,
        String groupId,
        String country
) {}
