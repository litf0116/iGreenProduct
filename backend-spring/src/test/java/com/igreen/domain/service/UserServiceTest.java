package com.igreen.domain.service;

import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.utils.JwtUtils;
import com.igreen.domain.dto.LoginRequest;
import com.igreen.domain.dto.RegisterRequest;
import com.igreen.domain.dto.TokenResponse;
import com.igreen.domain.dto.UserCreateRequest;
import com.igreen.domain.dto.UserResponse;
import com.igreen.domain.dto.UserUpdateRequest;
import com.igreen.domain.entity.User;
import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;
import com.igreen.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

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
    @DisplayName("Should create user successfully")
    void createUser_Success() {
        UserCreateRequest request = new UserCreateRequest(
                "Test User",
                "testuser",
                "test@example.com",
                "password123",
                UserRole.ENGINEER,
                null,
                "CN"
        );

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$encodedpassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("new-user-id");
            return user;
        });

        UserResponse response = userService.createUser(request);

        assertNotNull(response);
        assertEquals("Test User", response.name());
        assertEquals("testuser", response.username());
        assertEquals("test@example.com", response.email());
        assertEquals("ENGINEER", response.role());
        assertEquals("ACTIVE", response.status());
        assertEquals("CN", response.country());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when username exists")
    void createUser_UsernameExists() {
        UserCreateRequest request = new UserCreateRequest(
                "Test User",
                "existinguser",
                "test@example.com",
                "password123",
                UserRole.ENGINEER,
                null,
                "CN"
        );

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.createUser(request));

        assertEquals(ErrorCode.USERNAME_EXISTS.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should throw exception when email exists")
    void createUser_EmailExists() {
        UserCreateRequest request = new UserCreateRequest(
                "Test User",
                "testuser",
                "existing@example.com",
                "password123",
                UserRole.ENGINEER,
                null,
                "CN"
        );

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.createUser(request));

        assertEquals(ErrorCode.EMAIL_EXISTS.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void login_Success() {
        LoginRequest request = new LoginRequest("testuser", "password123", "CN");

        when(userRepository.findAllByUsername("testuser")).thenReturn(Collections.singletonList(testUser));
        when(passwordEncoder.matches("password123", "$2a$10$encodedpassword")).thenReturn(true);
        when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("jwt-token");

        TokenResponse response = userService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.accessToken());
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void login_UserNotFound() {
        LoginRequest request = new LoginRequest("nonexistent", "password123", "CN");

        when(userRepository.findAllByUsername("nonexistent")).thenReturn(Collections.emptyList());

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.login(request));

        assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should throw exception when login with wrong password")
    void login_WrongPassword() {
        LoginRequest request = new LoginRequest("testuser", "wrongpassword", "CN");

        when(userRepository.findAllByUsername("testuser")).thenReturn(Collections.singletonList(testUser));
        when(passwordEncoder.matches("wrongpassword", "$2a$10$encodedpassword")).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.login(request));

        assertEquals(ErrorCode.INVALID_CREDENTIALS.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should throw exception when login with inactive user")
    void login_InactiveUser() {
        testUser.setStatus(UserStatus.INACTIVE);
        LoginRequest request = new LoginRequest("testuser", "password123", "CN");

        when(userRepository.findAllByUsername("testuser")).thenReturn(Collections.singletonList(testUser));
        when(passwordEncoder.matches("password123", "$2a$10$encodedpassword")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.login(request));

        assertEquals(ErrorCode.USER_INACTIVE.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should throw exception when username is blank")
    void login_UsernameRequired() {
        LoginRequest request = new LoginRequest("", "password123", "CN");

        when(userRepository.findAllByUsername("")).thenReturn(Collections.emptyList());

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.login(request));

        assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should throw exception when password is blank")
    void login_PasswordRequired() {
        LoginRequest request = new LoginRequest("testuser", "", "CN");

        when(userRepository.findAllByUsername("testuser")).thenReturn(Collections.singletonList(testUser));
        when(passwordEncoder.matches("", "$2a$10$encodedpassword")).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.login(request));

        assertEquals(ErrorCode.INVALID_CREDENTIALS.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should login successfully when engineer country matches")
    void login_EngineerCountryMatch() {
        LoginRequest request = new LoginRequest("testuser", "password123", "CN");

        when(userRepository.findAllByUsername("testuser")).thenReturn(Collections.singletonList(testUser));
        when(passwordEncoder.matches("password123", "$2a$10$encodedpassword")).thenReturn(true);
        when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("jwt-token");

        TokenResponse response = userService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.accessToken());
    }

    @Test
    @DisplayName("Should throw exception when engineer country does not match")
    void login_EngineerCountryMismatch() {
        LoginRequest request = new LoginRequest("testuser", "password123", "US");

        when(userRepository.findAllByUsername("testuser")).thenReturn(Collections.singletonList(testUser));
        when(passwordEncoder.matches("password123", "$2a$10$encodedpassword")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.login(request));

        assertEquals(ErrorCode.COUNTRY_NOT_ALLOWED.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should login successfully when admin has no country restriction")
    void login_AdminNoCountryRestriction() {
        testUser.setRole(UserRole.ADMIN);
        testUser.setCountry("CN,US,JP");
        LoginRequest request = new LoginRequest("testuser", "password123", "DE");

        when(userRepository.findAllByUsername("testuser")).thenReturn(Collections.singletonList(testUser));
        when(passwordEncoder.matches("password123", "$2a$10$encodedpassword")).thenReturn(true);
        when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("jwt-token");

        TokenResponse response = userService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.accessToken());
    }

    @Test
    @DisplayName("Should throw exception when manager country does not match")
    void login_ManagerCountryMismatch() {
        testUser.setRole(UserRole.MANAGER);
        LoginRequest request = new LoginRequest("testuser", "password123", "US");

        when(userRepository.findAllByUsername("testuser")).thenReturn(Collections.singletonList(testUser));
        when(passwordEncoder.matches("password123", "$2a$10$encodedpassword")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.login(request));

        assertEquals(ErrorCode.COUNTRY_NOT_ALLOWED.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should login successfully when manager country matches")
    void login_ManagerCountryMatch() {
        testUser.setRole(UserRole.MANAGER);
        testUser.setCountry("US");
        LoginRequest request = new LoginRequest("testuser", "password123", "US");

        when(userRepository.findAllByUsername("testuser")).thenReturn(Collections.singletonList(testUser));
        when(passwordEncoder.matches("password123", "$2a$10$encodedpassword")).thenReturn(true);
        when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("jwt-token");

        TokenResponse response = userService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.accessToken());
    }

    @Test
    @DisplayName("Should register new user successfully")
    void register_Success() {
        RegisterRequest request = new RegisterRequest(
                "New User",
                "newuser",
                "password123",
                "password123",
                "CN",
                "engineer"
        );

        when(userRepository.existsByUsernameAndCountry("newuser", "CN")).thenReturn(false);
        when(userRepository.existsByNameAndCountry("New User", "CN")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$newencoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("new-user-id");
            return user;
        });
        when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("jwt-token");

        TokenResponse response = userService.register(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.accessToken());
    }

    @Test
    @DisplayName("Should throw exception when password mismatch")
    void register_PasswordMismatch() {
        RegisterRequest request = new RegisterRequest(
                "New User",
                "newuser",
                "password123",
                "differentpassword",
                "CN",
                "engineer"
        );

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.register(request));

        assertEquals(ErrorCode.PASSWORD_MISMATCH.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should throw exception when country is required")
    void register_CountryRequired() {
        RegisterRequest request = new RegisterRequest(
                "New User",
                "newuser",
                "password123",
                "password123",
                "",
                "engineer"
        );

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.register(request));

        assertEquals(ErrorCode.COUNTRY_REQUIRED.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should throw exception when username exists in country")
    void register_UsernameExistsInCountry() {
        RegisterRequest request = new RegisterRequest(
                "New User",
                "existinguser",
                "password123",
                "password123",
                "CN",
                "engineer"
        );

        when(userRepository.existsByUsernameAndCountry("existinguser", "CN")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.register(request));

        assertEquals(ErrorCode.USERNAME_EXISTS.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should throw exception when name exists in country")
    void register_NameExistsInCountry() {
        RegisterRequest request = new RegisterRequest(
                "Existing User",
                "newuser",
                "password123",
                "password123",
                "CN",
                "engineer"
        );

        when(userRepository.existsByUsernameAndCountry("newuser", "CN")).thenReturn(false);
        when(userRepository.existsByNameAndCountry("Existing User", "CN")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.register(request));

        assertEquals(ErrorCode.NAME_EXISTS.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should throw exception when role is invalid")
    void register_InvalidRole() {
        RegisterRequest request = new RegisterRequest(
                "New User",
                "newuser",
                "password123",
                "password123",
                "CN",
                "invalid_role"
        );

        when(userRepository.existsByUsernameAndCountry("newuser", "CN")).thenReturn(false);
        when(userRepository.existsByNameAndCountry("New User", "CN")).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.register(request));

        assertEquals(ErrorCode.INVALID_ROLE.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should use default role when role is null")
    void register_DefaultRole() {
        RegisterRequest request = new RegisterRequest(
                "New User",
                "newuser",
                "password123",
                "password123",
                "CN",
                null
        );

        when(userRepository.existsByUsernameAndCountry("newuser", "CN")).thenReturn(false);
        when(userRepository.existsByNameAndCountry("New User", "CN")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$newencoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("new-user-id");
            return user;
        });
        when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("jwt-token");

        TokenResponse response = userService.register(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.accessToken());
        verify(userRepository).save(argThat(user -> user.getRole() == UserRole.ENGINEER));
    }

    @Test
    @DisplayName("Should get user by ID successfully")
    void getUserById_Success() {
        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(testUser));

        UserResponse response = userService.getUserById("test-user-id");

        assertNotNull(response);
        assertEquals("test-user-id", response.id());
        assertEquals("Test User", response.name());
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void getUserById_NotFound() {
        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.getUserById("nonexistent"));

        assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should update user successfully")
    void updateUser_Success() {
        UserUpdateRequest request = new UserUpdateRequest(
                "Updated Name",
                "updateduser",
                null,
                null
        );

        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsername("updateduser")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserResponse response = userService.updateUser("test-user-id", request);

        assertNotNull(response);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should delete user successfully")
    void deleteUser_Success() {
        when(userRepository.existsById("test-user-id")).thenReturn(true);
        doNothing().when(userRepository).deleteById("test-user-id");

        assertDoesNotThrow(() -> userService.deleteUser("test-user-id"));
        verify(userRepository).deleteById("test-user-id");
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent user")
    void deleteUser_NotFound() {
        when(userRepository.existsById("nonexistent")).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.deleteUser("nonexistent"));

        assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should update engineer country successfully")
    void updateUserCountry_EngineerSuccess() {
        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserResponse response = userService.updateUserCountry("test-user-id", "US");

        assertNotNull(response);
        verify(userRepository).save(argThat(user -> "US".equals(user.getCountry())));
    }

    @Test
    @DisplayName("Should throw exception when engineer country is empty")
    void updateUserCountry_EngineerEmptyCountry() {
        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(testUser));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.updateUserCountry("test-user-id", ""));

        assertEquals(ErrorCode.COUNTRY_REQUIRED.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should throw exception when engineer country contains comma")
    void updateUserCountry_EngineerMultipleCountries() {
        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(testUser));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.updateUserCountry("test-user-id", "CN,US"));

        assertEquals(ErrorCode.INVALID_COUNTRY_CODE.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should update admin country with multiple countries successfully")
    void updateUserCountry_AdminMultipleCountries() {
        testUser.setRole(UserRole.ADMIN);
        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserResponse response = userService.updateUserCountry("test-user-id", "CN,US,JP");

        assertNotNull(response);
        verify(userRepository).save(argThat(user -> "CN,US,JP".equals(user.getCountry())));
    }

    @Test
    @DisplayName("Should throw exception when admin country has empty segment")
    void updateUserCountry_AdminEmptySegment() {
        testUser.setRole(UserRole.ADMIN);
        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(testUser));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.updateUserCountry("test-user-id", "CN,,US"));

        assertEquals(ErrorCode.INVALID_COUNTRY_CODE.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should throw exception when user not found for country update")
    void updateUserCountry_UserNotFound() {
        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.updateUserCountry("nonexistent", "CN"));

        assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
    }
}
