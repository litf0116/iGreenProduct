package com.igreen.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "姓名不能为空")
    @Size(min = 1, max = 255, message = "姓名长度必须在1-255之间")
    String name,

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 100, message = "用户名长度必须在3-100之间")
    String username,

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 100, message = "密码长度必须在6-100之间")
    String password,

    @NotBlank(message = "确认密码不能为空")
    String confirmPassword,

    @NotBlank(message = "国家不能为空")
    @Size(max = 100, message = "国家长度不能超过100")
    String country,

    String role
) {}
