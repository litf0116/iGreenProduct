package com.igreen.domain.controller;

import com.igreen.common.result.Result;
import com.igreen.common.utils.JwtUtils;
import com.igreen.domain.dto.LoginRequest;
import com.igreen.domain.dto.RegisterRequest;
import com.igreen.domain.dto.TokenResponse;
import com.igreen.domain.dto.UserResponse;
import com.igreen.domain.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Tag(name = "认证", description = "用户登录注册接口")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtils jwtUtils;

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public ResponseEntity<Result<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = userService.login(request);
        return ResponseEntity.ok(Result.success(response));
    }

    @Operation(summary = "用户注册")
    @PostMapping("/register")
    public ResponseEntity<Result<TokenResponse>> register(@Valid @RequestBody RegisterRequest request) {
        TokenResponse response = userService.register(request);
        return ResponseEntity.ok(Result.success(response));
    }

    @Operation(summary = "获取当前用户信息")
    @GetMapping("/me")
    public ResponseEntity<Result<UserResponse>> getCurrentUser(HttpServletRequest request) {
        String userId = getCurrentUserId(request);
        return ResponseEntity.ok(Result.success(userService.getCurrentUser(userId)));
    }

    private String getCurrentUserId(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            return jwtUtils.extractUserId(token);
        }
        throw new RuntimeException("Invalid token");
    }
}
