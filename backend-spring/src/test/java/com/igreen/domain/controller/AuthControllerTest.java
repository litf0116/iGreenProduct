package com.igreen.domain.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.Result;
import com.igreen.common.utils.JwtUtils;
import com.igreen.domain.dto.LoginRequest;
import com.igreen.domain.dto.RefreshRequest;
import com.igreen.domain.dto.RegisterRequest;
import com.igreen.domain.dto.TokenResponse;
import com.igreen.domain.entity.User;
import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;
import com.igreen.domain.repository.UserRepository;
import com.igreen.domain.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("test-user-id")
                .name("Test User")
                .username("testuser")
                .email("test@example.com")
                .hashedPassword("$2a$10$encodedpassword")
                .role(UserRole.ENGINEER)
                .status(UserStatus.ACTIVE)
                .country("CN")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("登录成功应返回双 Token")
    void login_Success_ReturnsDualTokens() throws Exception {
        LoginRequest request = new LoginRequest("testuser", "password123", "CN");

        when(userRepository.findByUsernameAndCountry("testuser", "CN")).thenReturn(Optional.of(testUser));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userService.login(any(LoginRequest.class))).thenReturn(new TokenResponse("access-token", null, 0));
        when(jwtUtils.generateRefreshToken(anyString(), anyString())).thenReturn("refresh-token");
        when(jwtUtils.getExpirationMs()).thenReturn(7200000L);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"))
                .andExpect(jsonPath("$.data.expiresIn").value(7200))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"));
    }

    @Test
    @DisplayName("登录成功应包含正确的 Token 类型")
    void login_Success_TokenTypeIsBearer() throws Exception {
        LoginRequest request = new LoginRequest("testuser", "password123", "CN");

        when(userRepository.findByUsernameAndCountry("testuser", "CN")).thenReturn(Optional.of(testUser));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userService.login(any(LoginRequest.class))).thenReturn(new TokenResponse("access-token", null, 0));
        when(jwtUtils.generateRefreshToken(anyString(), anyString())).thenReturn("refresh-token");
        when(jwtUtils.getExpirationMs()).thenReturn(3600000L);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"));
    }

    @Test
    @DisplayName("注册成功应返回双 Token")
    void register_Success_ReturnsDualTokens() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "New User",
                "newuser",
                "password123",
                "password123",
                "CN",
                "engineer"
        );

        when(userService.register(any(RegisterRequest.class))).thenReturn(new TokenResponse("access-token", null, 0));
        when(jwtUtils.extractUserId(anyString())).thenReturn("new-user-id");
        when(jwtUtils.extractUsername(anyString())).thenReturn("newuser");
        when(jwtUtils.generateRefreshToken(anyString(), anyString())).thenReturn("refresh-token");
        when(jwtUtils.getExpirationMs()).thenReturn(7200000L);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"))
                .andExpect(jsonPath("$.data.expiresIn").value(7200));
    }

    @Test
    @DisplayName("刷新 Token 成功应返回新的双 Token")
    void refresh_Success_ReturnsNewDualTokens() throws Exception {
        RefreshRequest request = new RefreshRequest("valid-refresh-token");

        when(jwtUtils.validateToken("valid-refresh-token")).thenReturn(true);
        when(jwtUtils.extractUsername("valid-refresh-token")).thenReturn("testuser");
        when(jwtUtils.extractUserId("valid-refresh-token")).thenReturn("test-user-id");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("new-access-token");
        when(jwtUtils.generateRefreshToken(anyString(), anyString())).thenReturn("new-refresh-token");
        when(jwtUtils.getExpirationMs()).thenReturn(7200000L);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accessToken").value("new-access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("new-refresh-token"))
                .andExpect(jsonPath("$.data.expiresIn").value(7200));
    }

    @Test
    @DisplayName("无效的 Refresh Token 应返回错误")
    void refresh_InvalidToken_ReturnsError() throws Exception {
        RefreshRequest request = new RefreshRequest("invalid-refresh-token");

        when(jwtUtils.validateToken("invalid-refresh-token")).thenReturn(false);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.INVALID_TOKEN.getCode()));
    }

    @Test
    @DisplayName("空 Refresh Token 应返回错误")
    void refresh_EmptyToken_ReturnsError() throws Exception {
        RefreshRequest request = new RefreshRequest("");

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("刷新时用户不存在应返回错误")
    void refresh_UserNotFound_ReturnsError() throws Exception {
        RefreshRequest request = new RefreshRequest("valid-refresh-token");

        when(jwtUtils.validateToken("valid-refresh-token")).thenReturn(true);
        when(jwtUtils.extractUsername("valid-refresh-token")).thenReturn("nonexistent");
        when(jwtUtils.extractUserId("valid-refresh-token")).thenReturn("nonexistent-id");
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.USER_NOT_FOUND.getCode()));
    }

    @Test
    @DisplayName("登录请求参数为空应返回错误")
    void login_NullRequest_ReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("注册请求缺少必填字段应返回错误")
    void register_MissingRequiredFields_ReturnsBadRequest() throws Exception {
        String invalidRequest = """
                {
                    "name": "",
                    "username": "ab",
                    "password": "123",
                    "confirmPassword": "123",
                    "country": ""
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequest))
                .andExpect(status().isBadRequest());
    }
}
