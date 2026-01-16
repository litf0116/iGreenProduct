package com.igreen.domain.controller;

import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.Result;
import com.igreen.common.utils.JwtUtils;
import com.igreen.domain.dto.LoginRequest;
import com.igreen.domain.dto.RefreshRequest;
import com.igreen.domain.dto.RegisterRequest;
import com.igreen.domain.dto.TokenResponse;
import com.igreen.domain.dto.UserResponse;
import com.igreen.domain.entity.User;
import com.igreen.domain.mapper.UserMapper;
import com.igreen.domain.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Tag(name = "认证", description = "用户登录注册接口")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtils jwtUtils;
    private final UserMapper userMapper;

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public ResponseEntity<Result<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = userService.login(request);

        Optional<User> userOpt = userMapper.selectByUsernameAndCountry(request.username(), request.country());
        if (userOpt.isEmpty()) {
            userOpt = userMapper.selectByUsername(request.username());
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String refreshToken = jwtUtils.generateRefreshToken(user.getId(), user.getUsername());
            response = new TokenResponse(
                response.accessToken(),
                refreshToken,
                jwtUtils.getExpirationMs() / 1000
            );
        }

        return ResponseEntity.ok(Result.success(response));
    }

    @Operation(summary = "用户注册")
    @PostMapping("/register")
    public ResponseEntity<Result<TokenResponse>> register(@Valid @RequestBody RegisterRequest request) {
        TokenResponse response = userService.register(request);

        String refreshToken = jwtUtils.generateRefreshToken(
            jwtUtils.extractUserId(response.accessToken()),
            jwtUtils.extractUsername(response.accessToken())
        );
        response = new TokenResponse(
            response.accessToken(),
            refreshToken,
            jwtUtils.getExpirationMs() / 1000
        );

        return ResponseEntity.ok(Result.success(response));
    }

    @Operation(summary = "刷新 Token")
    @PostMapping("/refresh")
    public ResponseEntity<Result<TokenResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        if (!jwtUtils.validateToken(request.refreshToken())) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        String username = jwtUtils.extractUsername(request.refreshToken());
        String userId = jwtUtils.extractUserId(request.refreshToken());

        User user = userMapper.selectByUsername(username)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        String newAccessToken = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        String newRefreshToken = jwtUtils.generateRefreshToken(user.getId(), user.getUsername());

        TokenResponse response = new TokenResponse(
            newAccessToken,
            newRefreshToken,
            jwtUtils.getExpirationMs() / 1000
        );

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
