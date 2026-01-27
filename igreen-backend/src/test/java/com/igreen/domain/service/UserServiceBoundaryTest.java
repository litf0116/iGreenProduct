package com.igreen.domain.service;

import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
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
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService 边界条件测试补充")
class UserServiceBoundaryTest {

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user-123")
                .name("Test User")
                .username("testuser")
                .email("test@example.com")
                .hashedPassword("$2a$10$encodedpassword")
                .role(UserRole.ENGINEER)
                .status(UserStatus.ACTIVE)
                .country("TH")
                .groupId("group-123")
                .build();
    }

    @Nested
    @DisplayName("register 方法边界测试")
    class RegisterBoundaryTests {

        @Test
        @DisplayName("注册时密码为8位应成功")
        void register_PasswordExactly8Digits_ShouldSucceed() {
            RegisterRequest request = new RegisterRequest(
                    "New User", "newuser", "Pass1234", "Pass1234", "TH", "engineer");

            when(userMapper.selectCount(any())).thenReturn(0L);
            when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("token");
            when(passwordEncoder.encode(anyString())).thenReturn("encoded");

            assertDoesNotThrow(() -> userService.register(request));
        }

        @Test
        @DisplayName("注册时密码少于8位应失败")
        void register_PasswordLessThan8_ShouldThrow() {
            RegisterRequest request = new RegisterRequest(
                    "New User", "newuser", "Pass123", "Pass123", "TH", "engineer");

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.register(request));

            assertEquals(ErrorCode.PASSWORD_TOO_WEAK.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("注册时密码只有数字应失败")
        void register_PasswordOnlyNumbers_ShouldThrow() {
            RegisterRequest request = new RegisterRequest(
                    "New User", "newuser", "12345678", "12345678", "TH", "engineer");

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.register(request));

            assertEquals(ErrorCode.PASSWORD_TOO_WEAK.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("注册时密码只有字母应失败")
        void register_PasswordOnlyLetters_ShouldThrow() {
            RegisterRequest request = new RegisterRequest(
                    "New User", "newuser", "abcdefgh", "abcdefgh", "TH", "engineer");

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.register(request));

            assertEquals(ErrorCode.PASSWORD_TOO_WEAK.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("注册时国家为空应失败")
        void register_NullCountry_ShouldThrow() {
            RegisterRequest request = new RegisterRequest(
                    "New User", "newuser", "Password1", "Password1", null, "engineer");

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.register(request));

            assertEquals(ErrorCode.COUNTRY_REQUIRED.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("注册时国家为空白应失败")
        void register_EmptyCountry_ShouldThrow() {
            RegisterRequest request = new RegisterRequest(
                    "New User", "newuser", "Password1", "Password1", "  ", "engineer");

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.register(request));

            assertEquals(ErrorCode.COUNTRY_REQUIRED.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("注册时用户名重复应失败")
        void register_DuplicateUsername_ShouldThrow() {
            RegisterRequest request = new RegisterRequest(
                    "New User", "existing", "Password1", "Password1", "TH", "engineer");

            when(userMapper.selectCount(any())).thenReturn(1L);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.register(request));

            assertEquals(ErrorCode.USERNAME_EXISTS.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("注册时姓名重复应失败")
        void register_DuplicateName_ShouldThrow() {
            RegisterRequest request = new RegisterRequest(
                    "Existing Name", "newuser", "Password1", "Password1", "TH", "engineer");

            when(userMapper.selectCount(any())).thenReturn(0L, 1L);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.register(request));

            assertEquals(ErrorCode.NAME_EXISTS.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("注册时角色无效应失败")
        void register_InvalidRole_ShouldThrow() {
            RegisterRequest request = new RegisterRequest(
                    "New User", "newuser", "Password1", "Password1", "TH", "invalid_role");

            when(userMapper.selectCount(any())).thenReturn(0L);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.register(request));

            assertEquals(ErrorCode.INVALID_ROLE.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("注册时角色为null应使用默认角色ENGINEER")
        void register_NullRole_ShouldUseDefault() {
            RegisterRequest request = new RegisterRequest(
                    "New User", "newuser", "Password1", "Password1", "TH", null);

            when(userMapper.selectCount(any())).thenReturn(0L);
            when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("token");
            when(passwordEncoder.encode(anyString())).thenReturn("encoded");

            assertDoesNotThrow(() -> userService.register(request));
        }
    }

    @Nested
    @DisplayName("login 方法边界测试")
    class LoginBoundaryTests {

        @Test
        @DisplayName("登录时用户不存在应失败")
        void login_UserNotFound_ShouldThrow() {
            LoginRequest request = new LoginRequest("nonexistent", "password", "TH");

            when(userMapper.selectList(any())).thenReturn(Collections.emptyList());

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.login(request));

            assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("登录时密码错误应失败")
        void login_WrongPassword_ShouldThrow() {
            LoginRequest request = new LoginRequest("testuser", "wrongpassword", "TH");

            when(userMapper.selectList(any())).thenReturn(Collections.singletonList(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.login(request));

            assertEquals(ErrorCode.INVALID_CREDENTIALS.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("登录时用户状态为非活跃应失败")
        void login_InactiveUser_ShouldThrow() {
            testUser.setStatus(UserStatus.INACTIVE);
            LoginRequest request = new LoginRequest("testuser", "password", "TH");

            when(userMapper.selectList(any())).thenReturn(Collections.singletonList(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.login(request));

            assertEquals(ErrorCode.USER_INACTIVE.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("登录时非ADMIN用户未设置国家应失败")
        void login_NonAdminWithoutCountry_ShouldThrow() {
            testUser.setRole(UserRole.ENGINEER);
            testUser.setCountry(null);  // User has no country set
            LoginRequest request = new LoginRequest("testuser", "password", null);  // country 可选

            when(userMapper.selectList(any())).thenReturn(Collections.singletonList(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.login(request));

            assertEquals(ErrorCode.COUNTRY_NOT_ALLOWED.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("登录时非ADMIN用户有国家设置应成功")
        void login_NonAdminWithCountry_ShouldSucceed() {
            testUser.setRole(UserRole.ENGINEER);
            testUser.setCountry("TH");  // User has country set
            LoginRequest request = new LoginRequest("testuser", "password", null);  // 不传 country

            when(userMapper.selectList(any())).thenReturn(Collections.singletonList(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
            when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("token");

            assertDoesNotThrow(() -> userService.login(request));
        }

        @Test
        @DisplayName("登录时ADMIN用户不需要国家验证")
        void login_AdminUser_ShouldBypassCountryCheck() {
            testUser.setRole(UserRole.ADMIN);
            LoginRequest request = new LoginRequest("testuser", "password", null);

            when(userMapper.selectList(any())).thenReturn(Collections.singletonList(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
            when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("token");

            assertDoesNotThrow(() -> userService.login(request));
        }

        @Test
        @DisplayName("登录时MANAGER用户需要国家验证")
        void login_ManagerUser_ShouldValidateCountry() {
            testUser.setRole(UserRole.MANAGER);
            testUser.setCountry("TH");
            LoginRequest request = new LoginRequest("testuser", "password", "TH");

            when(userMapper.selectList(any())).thenReturn(Collections.singletonList(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
            when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("token");

            assertDoesNotThrow(() -> userService.login(request));
        }
    }

    @Nested
    @DisplayName("updateUserCountry 方法边界测试")
    class UpdateUserCountryBoundaryTests {

        @Test
        @DisplayName("更新国家时用户不存在应失败")
        void updateUserCountry_UserNotFound_ShouldThrow() {
            when(userMapper.selectById(anyString())).thenReturn(null);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.updateUserCountry("nonexistent", "TH"));

            assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("更新国家时非ADMIN用户国家为空应失败")
        void updateUserCountry_NonAdminNullCountry_ShouldThrow() {
            when(userMapper.selectById(anyString())).thenReturn(testUser);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.updateUserCountry("user-123", null));

            assertEquals(ErrorCode.COUNTRY_REQUIRED.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("更新国家时非ADMIN用户国家包含逗号应失败")
        void updateUserCountry_NonAdminMultipleCountries_ShouldThrow() {
            when(userMapper.selectById(anyString())).thenReturn(testUser);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.updateUserCountry("user-123", "TH,ID"));

            assertEquals(ErrorCode.INVALID_COUNTRY_CODE.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("更新国家时非ADMIN用户国家代码无效应失败")
        void updateUserCountry_NonAdminInvalidCountry_ShouldThrow() {
            when(userMapper.selectById(anyString())).thenReturn(testUser);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.updateUserCountry("user-123", "INVALID"));

            assertEquals(ErrorCode.INVALID_COUNTRY_CODE.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("更新国家时非ADMIN用户使用国家名称应成功")
        void updateUserCountry_NonAdminCountryName_ShouldSucceed() {
            when(userMapper.selectById(anyString())).thenReturn(testUser);

            assertDoesNotThrow(() -> userService.updateUserCountry("user-123", "Thailand"));
        }

        @Test
        @DisplayName("更新国家时ADMIN用户使用多个国家应成功")
        void updateUserCountry_AdminMultipleCountries_ShouldSucceed() {
            testUser.setRole(UserRole.ADMIN);
            when(userMapper.selectById(anyString())).thenReturn(testUser);

            assertDoesNotThrow(() -> userService.updateUserCountry("user-123", "TH,ID,BR,MX"));
        }

        @Test
        @DisplayName("更新国家时ADMIN用户使用无效国家代码应失败")
        void updateUserCountry_AdminInvalidCountry_ShouldThrow() {
            testUser.setRole(UserRole.ADMIN);
            when(userMapper.selectById(anyString())).thenReturn(testUser);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.updateUserCountry("user-123", "INVALID"));

            assertEquals(ErrorCode.INVALID_COUNTRY_CODE.getCode(), exception.getCode());
        }
    }

    @Nested
    @DisplayName("updateUser 方法边界测试")
    class UpdateUserBoundaryTests {

        @Test
        @DisplayName("更新用户时用户不存在应失败")
        void updateUser_UserNotFound_ShouldThrow() {
            UserUpdateRequest request = new UserUpdateRequest(null, null, null, null, null, null, null);

            when(userMapper.selectById(anyString())).thenReturn(null);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.updateUser("nonexistent", request));

            assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("更新用户时用户名重复应失败")
        void updateUser_DuplicateUsername_ShouldThrow() {
            UserUpdateRequest request = new UserUpdateRequest(null, "existing", null, null, null, null, null);

            when(userMapper.selectById(anyString())).thenReturn(testUser);
            when(userMapper.selectCount(any())).thenReturn(1L);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> userService.updateUser("user-123", request));

            assertEquals(ErrorCode.USERNAME_EXISTS.getCode(), exception.getCode());
        }

        @Test
        @DisplayName("更新用户时用户名相同不应检查重复")
        void updateUser_SameUsername_ShouldNotCheckDuplicate() {
            UserUpdateRequest request = new UserUpdateRequest(null, "testuser", null, null, null, null, null);

            when(userMapper.selectById(anyString())).thenReturn(testUser);

            assertDoesNotThrow(() -> userService.updateUser("user-123", request));
            verify(userMapper, never()).selectCount(any());
        }
    }

    @Nested
    @DisplayName("getAllUsers 方法边界测试")
    class GetAllUsersBoundaryTests {

        @Test
        @DisplayName("获取用户列表时关键字为空应返回所有用户")
        void getAllUsers_NullKeyword_ShouldReturnAll() {
            when(userMapper.selectList(any())).thenReturn(Collections.singletonList(testUser));

            assertDoesNotThrow(() -> userService.getAllUsers(0, 10, null));
        }

        @Test
        @DisplayName("获取用户列表时关键字为空白应返回所有用户")
        void getAllUsers_BlankKeyword_ShouldReturnAll() {
            when(userMapper.selectList(any())).thenReturn(Collections.singletonList(testUser));

            assertDoesNotThrow(() -> userService.getAllUsers(0, 10, "  "));
        }

        @Test
        @DisplayName("获取用户列表时关键字不为空应按关键字筛选")
        void getAllUsers_WithKeyword_ShouldFilter() {
            when(userMapper.selectList(any())).thenReturn(Collections.singletonList(testUser));

            assertDoesNotThrow(() -> userService.getAllUsers(0, 10, "test"));
        }

        @Test
        @DisplayName("获取用户列表时应按创建时间倒序排列")
        void getAllUsers_ShouldOrderByCreatedAtDesc() {
            when(userMapper.selectList(any())).thenReturn(Collections.singletonList(testUser));

            assertDoesNotThrow(() -> userService.getAllUsers(0, 10, null));
        }
    }
}
