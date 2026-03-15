package com.igreen.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String name;
    private String username;
    private String email;
    private String phone;
    private String role;
    private String groupId;
    private String groupName;
    private String status;
    private String country;
    private String createdAt;
}
