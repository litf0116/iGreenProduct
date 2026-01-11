package com.igreen.domain.dto;

import com.igreen.domain.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(
    @NotBlank @Size(min = 1, max = 255) String name,
    @NotBlank @Size(min = 3, max = 100) String username,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 6, max = 100) String password,
    UserRole role,
    String groupId,
    String country
) {}
