package com.igreen.domain.dto;

public record UserResponse(
        String id,
        String name,
        String username,
        String email,
        String phone,
        String role,      // 小写: "admin", "manager", "engineer"
        String groupId,
        String groupName,
        String status,    // 小写: "active", "inactive"
        String country,
        String createdAt
) {}
