package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.github.pagehelper.PageHelper;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
import com.igreen.common.utils.JwtUtils;
import com.igreen.domain.dto.*;
import com.igreen.domain.entity.User;
import com.igreen.domain.enums.CountryCode;
import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;
import com.igreen.domain.mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@DisplayName("用户服务测试")
class UserServiceTest {

    private UserService userService;
    private UserMapper userMapper;
    private PasswordEncoder passwordEncoder;
    private JwtUtils jwtUtils;

    private User testUser;
    private User testAdminUser;  // Add admin user for tests that need ADMIN role

    @BeforeEach
    void setUp() {
        userMapper = mock(UserMapper.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtUtils = mock(JwtUtils.class);

        userService = new UserService(userMapper, passwordEncoder, jwtUtils);

        testUser = User.builder()
                .id("user-123")
                .name("Test User")
                .username("testuser")
                .email("test@example.com")
                .hashedPassword("encoded_password")
                .role(UserRole.ENGINEER)
                .status(UserStatus.ACTIVE)
                .country("TH")  // Use valid country code from CountryCode enum
                .groupId("group-123")
                .build();

        testAdminUser = User.builder()
                .id("admin-123")
                .name("Admin User")
                .username("adminuser")
                .email("admin@example.com")
                .hashedPassword("encoded_password")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .country("TH")
                .groupId("group-123")
                .build();
    }

    @Nested
    @DisplayName("创建用户")
    class CreateUserTests {

        @Test
        @DisplayName("应成功创建新用户")
        void createUser_ShouldReturnUserResponse() {
            // Given
            UserCreateRequest request = new UserCreateRequest(
                    "New User",
                    "newuser",
                    "new@example.com",
                    "password123",
                    UserRole.ENGINEER,
                    UserStatus.ACTIVE,
                    "group-123",
                    "CN"
            );

            when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
            when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
            when(userMapper.insert(any(User.class))).thenReturn(1);

            // When
            UserResponse response = userService.createUser(request);

            // Then
            assertNotNull(response);
            assertEquals("New User", response.name());
            assertEquals("newuser", response.username());
            assertEquals("new@example.com", response.email());
            assertEquals(UserRole.ENGINEER, response.role());
            assertEquals(UserStatus.ACTIVE, response.status());

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userMapper).insert(userCaptor.capture());

            User capturedUser = userCaptor.getValue();
            assertEquals("newuser", capturedUser.getUsername());
            assertEquals("encoded_password", capturedUser.getHashedPassword());
        }

        @Test
        @DisplayName("用户名已存在应抛出异常")
        void createUser_WhenUsernameExists_ShouldThrowException() {
            // Given
            UserCreateRequest request = new UserCreateRequest(
                    "New User",
                    "testuser", // 已存在的用户名
                    "new@example.com",
                    "password123",
                    UserRole.ENGINEER,
                    UserStatus.ACTIVE,
                    "group-123",
                    "CN"
            );

            when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);

            // When & Then
            BusinessException exception = assertThrows(
                    BusinessException.class,
                    () -> userService.createUser(request)
            );

            assertEquals(ErrorCode.USERNAME_EXISTS.getCode(), exception.getCode());
            verify(userMapper, never()).insert(any(User.class));
        }

        @Test
        @DisplayName("邮箱已存在应抛出异常")
        void createUser_WhenEmailExists_ShouldThrowException() {
            // Given
            UserCreateRequest request = new UserCreateRequest(
                    "New User",
                    "newuser",
                    "test@example.com", // 已存在的邮箱
                    "password123",
                    UserRole.ENGINEER,
                    UserStatus.ACTIVE,
                    "group-123",
                    "CN"
            );

            when(userMapper.selectCount(any(LambdaQueryWrapper.class)))
                    .thenReturn(0L) // 第一次检查用户名
                    .thenReturn(1L); // 第二次检查邮箱

            // When & Then
            BusinessException exception = assertThrows(
                    BusinessException.class,
                    () -> userService.createUser(request)
            );

            assertEquals(ErrorCode.EMAIL_EXISTS.getCode(), exception.getCode());
            verify(userMapper, never()).insert(any(User.class));
        }

        @Test
        @DisplayName("未指定角色应默认为ENGINEER")
        void createUser_WhenNoRoleSpecified_ShouldDefaultToEngineer() {
            // Given
            UserCreateRequest request = new UserCreateRequest(
                    "New User",
                    "newuser",
                    "new@example.com",
                    "password123",
                    null, // 未指定角色
                    null, // 未指定状态
                    "group-123",
                    "CN"
            );

            when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
            when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
            when(userMapper.insert(any(User.class))).thenReturn(1);

            // When
            UserResponse response = userService.createUser(request);

            // Then
            assertEquals(UserRole.ENGINEER, response.role());
            assertEquals(UserStatus.ACTIVE, response.status());
        }
    }

    @Nested
    @DisplayName("用户登录")
    class LoginTests {

        @Test
        @DisplayName("正确凭证应成功登录")
        void login_WithValidCredentials_ShouldReturnToken() {
            // Given
            LoginRequest request = new LoginRequest("testuser", "password123", "TH");

            when(userMapper.selectList(any(LambdaQueryWrapper.class)))
                    .thenReturn(List.of(testUser));
            when(passwordEncoder.matches("password123", "encoded_password")).thenReturn(true);
            when(jwtUtils.generateToken(anyString(), anyString(), anyString()))
                    .thenReturn("test-jwt-token");

            // When
            TokenResponse response = userService.login(request);

            // Then
            assertNotNull(response);
            assertEquals("test-jwt-token", response.accessToken());
            assertNull(response.refreshToken()); // refreshToken is always null
        }

        @Test
        @DisplayName("用户不存在应抛出异常")
        void login_WhenUserNotFound_ShouldThrowException() {
            // Given
            LoginRequest request = new LoginRequest("nonexistent", "password123", "CN");

            when(userMapper.selectList(any(LambdaQueryWrapper.class)))
                    .thenReturn(List.of());

            // When & Then
            BusinessException exception = assertThrows(
                    BusinessException.class,
                    () -> userService.login(request)
            );

            assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("密码错误应抛出异常")
        void login_WithInvalidPassword_ShouldThrowException() {
            // Given
            LoginRequest request = new LoginRequest("testuser", "wrongpassword", "CN");

            when(userMapper.selectList(any(LambdaQueryWrapper.class)))
                    .thenReturn(List.of(testUser));
            when(passwordEncoder.matches("wrongpassword", "encoded_password")).thenReturn(false);

            // When & Then
            BusinessException exception = assertThrows(
                    BusinessException.class,
                    () -> userService.login(request)
            );

            assertEquals(ErrorCode.INVALID_CREDENTIALS.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("用户状态非ACTIVE应抛出异常")
        void login_WhenUserInactive_ShouldThrowException() {
            // Given
            User inactiveUser = User.builder()
                    .id("user-123")
                    .name("Test User")
                    .username("testuser")
                    .email("test@example.com")
                    .hashedPassword("encoded_password")
                    .role(UserRole.ENGINEER)
                    .status(UserStatus.INACTIVE)
                    .country("TH")  // Use valid country code
                    .groupId("group-123")
                    .build();

            LoginRequest request = new LoginRequest("testuser", "password123", "TH");

            when(userMapper.selectList(any(LambdaQueryWrapper.class)))
                    .thenReturn(List.of(inactiveUser));
            when(passwordEncoder.matches("password123", "encoded_password")).thenReturn(true);

            // When & Then
            BusinessException exception = assertThrows(
                    BusinessException.class,
                    () -> userService.login(request)
            );

            assertEquals(ErrorCode.USER_INACTIVE.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("非管理员用户未设置国家应抛出异常")
        void login_WhenUserHasNoCountry_ShouldThrowException() {
            // Given - user without country set
            User userWithoutCountry = User.builder()
                    .id("user-123")
                    .name("Test User")
                    .username("testuser")
                    .email("test@example.com")
                    .hashedPassword("encoded_password")
                    .role(UserRole.ENGINEER)
                    .status(UserStatus.ACTIVE)
                    .country(null)  // No country set
                    .groupId("group-123")
                    .build();

            LoginRequest request = new LoginRequest("testuser", "password123", null); // country 可选

            when(userMapper.selectList(any(LambdaQueryWrapper.class)))
                    .thenReturn(List.of(userWithoutCountry));
            when(passwordEncoder.matches("password123", "encoded_password")).thenReturn(true);

            // When & Then
            BusinessException exception = assertThrows(
                    BusinessException.class,
                    () -> userService.login(request)
            );

            assertEquals(ErrorCode.COUNTRY_NOT_ALLOWED.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("非管理员用户有国家设置可正常登录")
        void login_WithValidCountry_ShouldSucceed() {
            // Given - user has country set
            LoginRequest request = new LoginRequest("testuser", "password123", null); // 不传 country

            when(userMapper.selectList(any(LambdaQueryWrapper.class)))
                    .thenReturn(List.of(testUser)); // testUser.country = "TH"
            when(passwordEncoder.matches("password123", "encoded_password")).thenReturn(true);
            when(jwtUtils.generateToken(anyString(), anyString(), anyString()))
                    .thenReturn("test-jwt-token");

            // When
            TokenResponse response = userService.login(request);

            // Then
            assertNotNull(response);
            assertEquals("test-jwt-token", response.accessToken());
        }

        @Test
        @DisplayName("管理员用户可以忽略国家验证")
        void login_AsAdmin_ShouldBypassCountryCheck() {
            // Given
            User adminUser = User.builder()
                    .id("user-123")
                    .name("Test User")
                    .username("testuser")
                    .email("test@example.com")
                    .hashedPassword("encoded_password")
                    .role(UserRole.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .country("TH")  // Use valid country code
                    .groupId("group-123")
                    .build();

            LoginRequest request = new LoginRequest("admin", "password123", null); // 未指定国家

            when(userMapper.selectList(any(LambdaQueryWrapper.class)))
                    .thenReturn(List.of(adminUser));
            when(passwordEncoder.matches("password123", "encoded_password")).thenReturn(true);
            when(jwtUtils.generateToken(anyString(), anyString(), anyString()))
                    .thenReturn("admin-token");

            // When
            TokenResponse response = userService.login(request);

            // Then
            assertNotNull(response);
            assertEquals("admin-token", response.accessToken());
        }
    }

    @Nested
    @DisplayName("获取用户")
    class GetUserTests {

        @Test
        @DisplayName("应能根据ID获取用户")
        void getUserById_ShouldReturnUser() {
            // Given
            when(userMapper.selectById("user-123")).thenReturn(testUser);

            // When
            UserResponse response = userService.getUserById("user-123");

            // Then
            assertNotNull(response);
            assertEquals("user-123", response.id());
            assertEquals("Test User", response.name());
            assertEquals("testuser", response.username());
        }

        @Test
        @DisplayName("用户不存在应抛出异常")
        void getUserById_WhenUserNotFound_ShouldThrowException() {
            // Given
            when(userMapper.selectById("nonexistent")).thenReturn(null);

            // When & Then
            BusinessException exception = assertThrows(
                    BusinessException.class,
                    () -> userService.getUserById("nonexistent")
            );

            assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("应能获取分页用户列表")
        void getAllUsers_ShouldReturnPagedUsers() {
            // Given
            PageHelper.startPage(0, 10);
            when(userMapper.selectList(any(LambdaQueryWrapper.class)))
                    .thenReturn(List.of(testUser));
            when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);

            // When
            PageResult<UserResponse> result = userService.getAllUsers(0, 10, null);

            // Then
            assertNotNull(result);
            assertEquals(1, result.total());
            assertEquals(1, result.records().size());
            assertEquals("user-123", result.records().get(0).id());
        }

        @Test
        @DisplayName("应能根据关键词搜索用户")
        void getAllUsers_WithKeyword_ShouldFilterUsers() {
            // Given
            PageHelper.startPage(0, 10);
            when(userMapper.selectList(any(LambdaQueryWrapper.class)))
                    .thenReturn(List.of(testUser));
            when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);

            // When
            PageResult<UserResponse> result = userService.getAllUsers(0, 10, "test");

            // Then
            assertNotNull(result);
            assertEquals(1, result.records().size());
        }

        @Test
        @DisplayName("应能获取所有工程师")
        void getEngineers_ShouldReturnOnlyEngineers() {
            // Given
            User user2 = User.builder()
                    .id("user-456")
                    .name("Test User 2")
                    .username("testuser2")
                    .email("test2@example.com")
                    .hashedPassword("encoded_password")
                    .role(UserRole.ENGINEER)
                    .status(UserStatus.ACTIVE)
                    .country("TH")  // Use valid country code
                    .groupId("group-123")
                    .build();

            // The getEngineers() method queries with role == ENGINEER, so only return engineers
            when(userMapper.selectList(any(LambdaQueryWrapper.class)))
                    .thenReturn(List.of(testUser, user2));

            // When
            List<UserResponse> engineers = userService.getEngineers();

            // Then
            assertNotNull(engineers);
            assertTrue(engineers.stream().allMatch(u -> u.role().equals(UserRole.ENGINEER)));
            assertEquals(2, engineers.size());
        }
    }

    @Nested
    @DisplayName("更新用户")
    class UpdateUserTests {

        @Test
        @DisplayName("应能更新用户信息")
        void updateUser_ShouldReturnUpdatedUser() {
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

            when(userMapper.selectById("user-123")).thenReturn(testUser);
            when(userMapper.updateById(any(User.class))).thenReturn(1);

            // When
            UserResponse response = userService.updateUser("user-123", request);

            // Then
            assertNotNull(response);
            assertEquals("Updated Name", response.name());
            assertEquals(UserRole.MANAGER, response.role());
        }

        @Test
        @DisplayName("更新不存在的用户应抛出异常")
        void updateUser_WhenUserNotFound_ShouldThrowException() {
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

            when(userMapper.selectById("nonexistent")).thenReturn(null);

            // When & Then
            BusinessException exception = assertThrows(
                    BusinessException.class,
                    () -> userService.updateUser("nonexistent", request)
            );

            assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
        }
    }

    @Nested
    @DisplayName("删除用户")
    class DeleteUserTests {

        @Test
        @DisplayName("应能删除用户")
        void deleteUser_ShouldSucceed() {
            // Given
            when(userMapper.selectById("user-123")).thenReturn(testUser);
            when(userMapper.deleteById("user-123")).thenReturn(1);

            // When & Then
            assertDoesNotThrow(() -> userService.deleteUser("user-123"));
            verify(userMapper).deleteById("user-123");
        }

        @Test
        @DisplayName("删除不存在的用户应抛出异常")
        void deleteUser_WhenUserNotFound_ShouldThrowException() {
            // Given
            when(userMapper.selectById("nonexistent")).thenReturn(null);

            // When & Then
            BusinessException exception = assertThrows(
                    BusinessException.class,
                    () -> userService.deleteUser("nonexistent")
            );

            assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
            verify(userMapper, never()).deleteById(anyString());
        }
    }

    @Nested
    @DisplayName("更新用户国家")
    class UpdateUserCountryTests {

        @Test
        @DisplayName("应能更新用户国家配置")
        void updateUserCountry_ShouldReturnUpdatedUser() {
            // Given - Use admin user since only admins can set multiple countries
            when(userMapper.selectById("admin-123")).thenReturn(testAdminUser);
            when(userMapper.updateById(any(User.class))).thenReturn(1);

            // When - Use valid country codes from CountryCode enum
            UserResponse response = userService.updateUserCountry("admin-123", "TH,ID,BR,MX");

            // Then
            assertNotNull(response);
            assertEquals("admin-123", response.id());
        }

        @Test
        @DisplayName("更新不存在用户的国家应抛出异常")
        void updateUserCountry_WhenUserNotFound_ShouldThrowException() {
            // Given
            when(userMapper.selectById("nonexistent")).thenReturn(null);

            // When & Then
            BusinessException exception = assertThrows(
                    BusinessException.class,
                    () -> userService.updateUserCountry("nonexistent", "CN")
            );

            assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
        }
    }
}
