package com.igreen.domain.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
import com.igreen.domain.dto.*;
import com.igreen.domain.entity.User;
import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;
import com.igreen.domain.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("用户管理控制器测试")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    private User testUser;
    private UserResponse testUserResponse;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user-123")
                .name("Test User")
                .username("testuser")
                .email("test@example.com")
                .role(UserRole.ENGINEER)
                .status(UserStatus.ACTIVE)
                .country("TH")  // Use valid country code from CountryCode enum
                .groupId("group-123")
                .build();

        testUserResponse = new UserResponse(
                testUser.getId(),
                testUser.getName(),
                testUser.getUsername(),
                testUser.getEmail(),
                "+86-13800000000",
                testUser.getRole(),
                testUser.getGroupId(),
                null,
                testUser.getStatus(),
                testUser.getCountry(),
                null
        );
    }

    @Nested
    @DisplayName("获取用户列表")
    class GetAllUsersTests {

        @Test
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        @DisplayName("管理员应能获取所有用户")
        void getAllUsers_AsAdmin_ShouldReturnUsers() throws Exception {
            // Given
            PageResult<UserResponse> pageResult = new PageResult<>(
                    List.of(testUserResponse),
                    1,
                    1,
                    10,
                    false
            );
            when(userService.getAllUsers(0, 10, null)).thenReturn(pageResult);

            // When & Then
            mockMvc.perform(get("/api/users")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.records").isArray())
                    .andExpect(jsonPath("$.data.records[0].id").value("user-123"))
                    .andExpect(jsonPath("$.data.total").value(1));
        }

        @Test
        @DisplayName("非管理员用户应无法获取用户列表")
        void getAllUsers_AsNonAdmin_ShouldReturnForbidden() throws Exception {
            // No need to mock - security should handle this
            mockMvc.perform(get("/api/users")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("获取用户详情")
    class GetUserByIdTests {

        @Test
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        @DisplayName("应能根据ID获取用户详情")
        void getUserById_ShouldReturnUser() throws Exception {
            // Given
            when(userService.getUserById("user-123")).thenReturn(testUserResponse);

            // When & Then
            mockMvc.perform(get("/api/users/user-123"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value("user-123"))
                    .andExpect(jsonPath("$.data.name").value("Test User"))
                    .andExpect(jsonPath("$.data.username").value("testuser"))
                    .andExpect(jsonPath("$.data.email").value("test@example.com"));
        }

        @Test
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        @DisplayName("用户不存在应返回错误")
        void getUserById_WhenUserNotFound_ShouldReturnError() throws Exception {
            // Given
            when(userService.getUserById("nonexistent"))
                    .thenThrow(new BusinessException(ErrorCode.USER_NOT_FOUND));

            // When & Then
            mockMvc.perform(get("/api/users/nonexistent"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }
    }

    @Nested
    @DisplayName("创建用户")
    class CreateUserTests {

        @Test
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        @DisplayName("管理员应能创建用户")
        void createUser_AsAdmin_ShouldReturnUser() throws Exception {
            // Given
            UserCreateRequest request = new UserCreateRequest(
                    "New User",
                    "newuser",
                    "password123",
                    UserRole.ENGINEER,
                    UserStatus.ACTIVE,
                    "group-123",
                    "CN"
            );

            when(userService.createUser(any(UserCreateRequest.class)))
                    .thenReturn(testUserResponse);

            // When & Then
            mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value("user-123"));
        }

        @Test
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        @DisplayName("创建用户时用户名已存在应返回错误")
        void createUser_WhenUsernameExists_ShouldReturnError() throws Exception {
            // Given
            UserCreateRequest request = new UserCreateRequest(
                    "New User",
                    "newuser",
                    "password123",
                    UserRole.ENGINEER,
                    UserStatus.ACTIVE,
                    "group-123",
                    "CN"
            );

            when(userService.createUser(any(UserCreateRequest.class)))
                    .thenThrow(new BusinessException(ErrorCode.USERNAME_EXISTS));

            // When & Then
            mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @DisplayName("非管理员用户应无法创建用户")
        void createUser_AsNonAdmin_ShouldReturnForbidden() throws Exception {
            // Given
            UserCreateRequest request = new UserCreateRequest(
                    "New User",
                    "newuser",
                    "password123",
                    UserRole.ENGINEER,
                    UserStatus.ACTIVE,
                    "group-123",
                    "CN"
            );

            // When & Then
            mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("更新用户")
    class UpdateUserTests {

        @Test
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        @DisplayName("管理员应能更新用户")
        void updateUser_AsAdmin_ShouldReturnUpdatedUser() throws Exception {
            // Given
            UserUpdateRequest request = new UserUpdateRequest(
                    "Updated Name",
                    "updateduser",
                    "group-456",
                    UserStatus.ACTIVE,
                    UserRole.MANAGER,
                    null,
                    "CN"
            );

            when(userService.updateUser(eq("user-123"), any(UserUpdateRequest.class)))
                    .thenReturn(testUserResponse);

            // When & Then
            mockMvc.perform(post("/api/users/user-123")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value("user-123"));
        }
    }

    @Nested
    @DisplayName("删除用户")
    class DeleteUserTests {

        @Test
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        @DisplayName("管理员应能删除用户")
        void deleteUser_AsAdmin_ShouldSucceed() throws Exception {
            // When & Then
            mockMvc.perform(delete("/api/users/user-123"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        @DisplayName("删除不存在的用户应返回错误")
        void deleteUser_WhenUserNotFound_ShouldReturnError() throws Exception {
            // Given
            org.mockito.Mockito.doThrow(new BusinessException(ErrorCode.USER_NOT_FOUND))
                    .when(userService).deleteUser(anyString());

            // When & Then
            mockMvc.perform(delete("/api/users/nonexistent"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }
    }

    @Nested
    @DisplayName("获取工程师列表")
    class GetEngineersTests {

        @Test
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        @DisplayName("应能获取所有工程师")
        void getEngineers_ShouldReturnEngineers() throws Exception {
            // Given
            when(userService.getEngineers()).thenReturn(List.of(testUserResponse));

            // When & Then
            mockMvc.perform(get("/api/users/engineers"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data[0].id").value("user-123"));
        }
    }

    @Nested
    @DisplayName("更新用户国家")
    class UpdateUserCountriesTests {

        @Test
        @WithMockUser(username = "admin", roles = {"ADMIN"})
        @DisplayName("管理员应能更新用户国家")
        void updateUserCountries_AsAdmin_ShouldSucceed() throws Exception {
            // Given
            UserCountryRequest request = new UserCountryRequest("TH,ID,BR,MX"); // Use valid country codes

            when(userService.updateUserCountry(eq("user-123"), anyString()))
                    .thenReturn(testUserResponse);

            // When & Then
            mockMvc.perform(patch("/api/users/user-123/countries")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }
    }
}
