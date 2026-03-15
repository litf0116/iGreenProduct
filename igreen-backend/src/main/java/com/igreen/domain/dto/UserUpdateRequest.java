package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserUpdateRequest {
    private String name;
    private String username;
    private String groupId;
    private UserStatus status;
    private UserRole role;
    @Size(min = 6, max = 100, message = "密码长度必须在6-100个字符之间")
    private String password;
    private String country;
}
