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
                null
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
                null
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
                null
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
        LoginRequest request = new LoginRequest("test@example.com", "password123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "$2a$10$encodedpassword")).thenReturn(true);
        when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("jwt-token");

        TokenResponse response = userService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.accessToken());
    }

    @Test
    @DisplayName("Should throw exception when login with invalid email")
    void login_InvalidEmail() {
        LoginRequest request = new LoginRequest("nonexistent@example.com", "password123");

        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.login(request));

        assertEquals(ErrorCode.INVALID_CREDENTIALS.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should throw exception when login with wrong password")
    void login_WrongPassword() {
        LoginRequest request = new LoginRequest("test@example.com", "wrongpassword");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", "$2a$10$encodedpassword")).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.login(request));

        assertEquals(ErrorCode.INVALID_CREDENTIALS.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should throw exception when login with inactive user")
    void login_InactiveUser() {
        testUser.setStatus(UserStatus.INACTIVE);
        LoginRequest request = new LoginRequest("test@example.com", "password123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "$2a$10$encodedpassword")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.login(request));

        assertEquals(ErrorCode.USER_INACTIVE.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should register new user successfully")
    void register_Success() {
        RegisterRequest request = new RegisterRequest(
                "New User",
                "newuser",
                "new@example.com",
                "password123",
                "engineer"
        );

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$newencoded");
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
}
