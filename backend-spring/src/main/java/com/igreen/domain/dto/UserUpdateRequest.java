package com.igreen.domain.dto;

import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;

public record UserUpdateRequest(
    String name,
    String username,
    String groupId,
    UserStatus status
) {}
