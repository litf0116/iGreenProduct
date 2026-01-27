package com.igreen.domain.dto;

import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;

public record UserResponse(
        String id,
        String name,
        String username,
        String email,
        String phone,
        UserRole role,
        String groupId,
        String groupName,
        UserStatus status,
        String country,
        String createdAt
) {}
