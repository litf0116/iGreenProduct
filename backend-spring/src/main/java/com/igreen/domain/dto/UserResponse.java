package com.igreen.domain.dto;

import java.time.LocalDateTime;

public record UserResponse(
    String id,
    String name,
    String username,
    String email,
    String role,
    String groupId,
    String groupName,
    String status,
    String country,
    LocalDateTime createdAt
) {}
