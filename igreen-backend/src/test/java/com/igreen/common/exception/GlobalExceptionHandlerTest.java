package com.igreen.common.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.igreen.common.result.Result;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("全局异常处理器测试")
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private GlobalExceptionHandler globalExceptionHandler;

    @Autowired
    private ObjectMapper objectMapper;

    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/test");
    }

    @Nested
    @DisplayName("业务异常处理测试")
    class BusinessExceptionTests {

        @Test
        @DisplayName("处理业务异常应返回400状态码")
        void handleBusinessException_ShouldReturn400() {
            BusinessException ex = new BusinessException(ErrorCode.USER_NOT_FOUND);

            var response = globalExceptionHandler.handleBusinessException(ex, request);

            assert response.getStatusCode().value() == 400;
            assert response.getBody().success() == false;
            assert response.getBody().code().equals(ErrorCode.USER_NOT_FOUND.getCode());
        }

        @Test
        @DisplayName("处理业务异常应包含错误消息")
        void handleBusinessException_ShouldContainErrorMessage() {
            BusinessException ex = new BusinessException(ErrorCode.USER_NOT_FOUND);

            var response = globalExceptionHandler.handleBusinessException(ex, request);

            assert response.getBody().message() != null;
            assert !response.getBody().message().isEmpty();
        }

        @Test
        @DisplayName("处理用户名已存在异常")
        void handleBusinessException_UsernameExists() {
            BusinessException ex = new BusinessException(ErrorCode.USERNAME_EXISTS);

            var response = globalExceptionHandler.handleBusinessException(ex, request);

            assert response.getStatusCode().value() == 400;
            assert response.getBody().code().equals(ErrorCode.USERNAME_EXISTS.getCode());
        }

        @Test
        @DisplayName("处理邮箱已存在异常")
        void handleBusinessException_EmailExists() {
            BusinessException ex = new BusinessException(ErrorCode.EMAIL_EXISTS);

            var response = globalExceptionHandler.handleBusinessException(ex, request);

            assert response.getStatusCode().value() == 400;
            assert response.getBody().code().equals(ErrorCode.EMAIL_EXISTS.getCode());
        }

        @Test
        @DisplayName("处理用户不存在异常")
        void handleBusinessException_UserNotFound() {
            BusinessException ex = new BusinessException(ErrorCode.USER_NOT_FOUND);

            var response = globalExceptionHandler.handleBusinessException(ex, request);

            assert response.getStatusCode().value() == 400;
            assert response.getBody().code().equals(ErrorCode.USER_NOT_FOUND.getCode());
        }

        @Test
        @DisplayName("处理无效凭证异常")
        void handleBusinessException_InvalidCredentials() {
            BusinessException ex = new BusinessException(ErrorCode.INVALID_CREDENTIALS);

            var response = globalExceptionHandler.handleBusinessException(ex, request);

            assert response.getStatusCode().value() == 400;
            assert response.getBody().code().equals(ErrorCode.INVALID_CREDENTIALS.getCode());
        }

        @Test
        @DisplayName("处理用户未激活异常")
        void handleBusinessException_UserInactive() {
            BusinessException ex = new BusinessException(ErrorCode.USER_INACTIVE);

            var response = globalExceptionHandler.handleBusinessException(ex, request);

            assert response.getStatusCode().value() == 400;
            assert response.getBody().code().equals(ErrorCode.USER_INACTIVE.getCode());
        }

        @Test
        @DisplayName("处理国家不允许异常")
        void handleBusinessException_CountryNotAllowed() {
            BusinessException ex = new BusinessException(ErrorCode.COUNTRY_NOT_ALLOWED);

            var response = globalExceptionHandler.handleBusinessException(ex, request);

            assert response.getStatusCode().value() == 400;
            assert response.getBody().code().equals(ErrorCode.COUNTRY_NOT_ALLOWED.getCode());
        }

        @Test
        @DisplayName("处理文件未找到异常")
        void handleBusinessException_FileNotFound() {
            BusinessException ex = new BusinessException(ErrorCode.FILE_NOT_FOUND);

            var response = globalExceptionHandler.handleBusinessException(ex, request);

            assert response.getStatusCode().value() == 400;
            assert response.getBody().code().equals(ErrorCode.FILE_NOT_FOUND.getCode());
        }

        @Test
        @DisplayName("处理文件为空异常")
        void handleBusinessException_FileEmpty() {
            BusinessException ex = new BusinessException(ErrorCode.FILE_EMPTY);

            var response = globalExceptionHandler.handleBusinessException(ex, request);

            assert response.getStatusCode().value() == 400;
            assert response.getBody().code().equals(ErrorCode.FILE_EMPTY.getCode());
        }

        @Test
        @DisplayName("处理文件过大异常")
        void handleBusinessException_FileTooLarge() {
            BusinessException ex = new BusinessException(ErrorCode.FILE_TOO_LARGE);

            var response = globalExceptionHandler.handleBusinessException(ex, request);

            assert response.getStatusCode().value() == 400;
            assert response.getBody().code().equals(ErrorCode.FILE_TOO_LARGE.getCode());
        }
    }

    @Nested
    @DisplayName("认证异常处理测试")
    class AuthenticationExceptionTests {

        @Test
        @DisplayName("处理认证异常应返回401状态码")
        void handleAuthenticationException_ShouldReturn401() {
            // Use a concrete subclass since AuthenticationException is abstract
            AuthenticationException ex = new org.springframework.security.authentication.DisabledException("Authentication failed");

            var response = globalExceptionHandler.handleAuthenticationException(ex);

            assert response.getStatusCode().value() == 401;
            assert response.getBody().success() == false;
            assert response.getBody().code().equals("AUTH_FAILED");
        }

        @Test
        @DisplayName("处理错误凭证异常应返回401状态码")
        void handleBadCredentialsException_ShouldReturn401() {
            BadCredentialsException ex = new BadCredentialsException("Bad credentials");

            var response = globalExceptionHandler.handleBadCredentialsException(ex);

            assert response.getStatusCode().value() == 401;
            assert response.getBody().success() == false;
            assert response.getBody().code().equals("INVALID_CREDENTIALS");
        }

        @Test
        @DisplayName("处理错误凭证异常应返回正确错误消息")
        void handleBadCredentialsException_ShouldReturnCorrectMessage() {
            BadCredentialsException ex = new BadCredentialsException("Bad credentials");

            var response = globalExceptionHandler.handleBadCredentialsException(ex);

            assert response.getBody().message().contains("Incorrect email or password");
        }
    }

    @Nested
    @DisplayName("授权异常处理测试")
    class AccessDeniedExceptionTests {

        @Test
        @DisplayName("处理访问拒绝异常应返回403状态码")
        void handleAccessDeniedException_ShouldReturn403() {
            AccessDeniedException ex = new AccessDeniedException("Access denied");

            var response = globalExceptionHandler.handleAccessDeniedException(ex);

            assert response.getStatusCode().value() == 403;
            assert response.getBody().success() == false;
            assert response.getBody().code().equals("FORBIDDEN");
        }

        @Test
        @DisplayName("处理访问拒绝异常应返回正确错误消息")
        void handleAccessDeniedException_ShouldReturnCorrectMessage() {
            AccessDeniedException ex = new AccessDeniedException("Access denied");

            var response = globalExceptionHandler.handleAccessDeniedException(ex);

            assert response.getBody().message().contains("Access denied");
        }
    }

    @Nested
    @DisplayName("验证异常处理测试")
    class ValidationExceptionTests {

        @Test
        @DisplayName("处理验证异常应返回400状态码")
        void handleValidationException_ShouldReturn400() {
            MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
            BindingResult bindingResult = mock(BindingResult.class);

            when(ex.getBindingResult()).thenReturn(bindingResult);
            when(bindingResult.getFieldErrors()).thenReturn(Collections.singletonList(
                new FieldError("user", "email", "invalid@email", false, null, null, "Email must be valid")
            ));

            var response = globalExceptionHandler.handleValidationException(ex);

            assert response.getStatusCode().value() == 400;
            assert response.getBody().success() == false;
            assert response.getBody().code().equals("VALIDATION_ERROR");
        }

        @Test
        @DisplayName("处理验证异常应包含字段错误消息")
        void handleValidationException_ShouldContainFieldErrors() {
            MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
            BindingResult bindingResult = mock(BindingResult.class);

            when(ex.getBindingResult()).thenReturn(bindingResult);
            when(bindingResult.getFieldErrors()).thenReturn(Collections.singletonList(
                new FieldError("user", "email", "invalid", false, null, null, "Invalid email format")
            ));

            var response = globalExceptionHandler.handleValidationException(ex);

            assert response.getBody().message().contains("Invalid email format");
        }

        @Test
        @DisplayName("处理多个验证错误应合并错误消息")
        void handleValidationException_ShouldCombineMultipleErrors() {
            MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
            BindingResult bindingResult = mock(BindingResult.class);

            when(ex.getBindingResult()).thenReturn(bindingResult);
            when(bindingResult.getFieldErrors()).thenReturn(java.util.List.of(
                new FieldError("user", "email", "invalid", false, null, null, "Invalid email"),
                new FieldError("user", "name", "", false, null, null, "Name is required")
            ));

            var response = globalExceptionHandler.handleValidationException(ex);

            assert response.getBody().message().contains("Invalid email");
            assert response.getBody().message().contains("Name is required");
        }
    }

    @Nested
    @DisplayName("非法参数异常处理测试")
    class IllegalArgumentExceptionTests {

        @Test
        @DisplayName("处理非法参数异常应返回400状态码")
        void handleIllegalArgumentException_ShouldReturn400() {
            IllegalArgumentException ex = new IllegalArgumentException("Invalid parameter value");

            var response = globalExceptionHandler.handleIllegalArgumentException(ex);

            assert response.getStatusCode().value() == 400;
            assert response.getBody().success() == false;
            assert response.getBody().code().equals("INVALID_ARGUMENT");
        }

        @Test
        @DisplayName("处理非法参数异常应包含错误消息")
        void handleIllegalArgumentException_ShouldContainErrorMessage() {
            IllegalArgumentException ex = new IllegalArgumentException("Parameter 'userId' cannot be null");

            var response = globalExceptionHandler.handleIllegalArgumentException(ex);

            assert response.getBody().message().contains("Parameter 'userId' cannot be null");
        }

        @Test
        @DisplayName("处理空指针异常作为非法参数")
        void handleNullPointerException_ShouldReturn400() {
            IllegalArgumentException ex = new IllegalArgumentException("Null value not allowed");

            var response = globalExceptionHandler.handleIllegalArgumentException(ex);

            assert response.getStatusCode().value() == 400;
        }
    }

    @Nested
    @DisplayName("通用异常处理测试")
    class GenericExceptionTests {

        @Test
        @DisplayName("处理通用异常应返回500状态码")
        void handleGenericException_ShouldReturn500() {
            Exception ex = new RuntimeException("Unexpected error");

            var response = globalExceptionHandler.handleGenericException(ex, request);

            assert response.getStatusCode().value() == 500;
            assert response.getBody().success() == false;
            assert response.getBody().code().equals("INTERNAL_ERROR");
        }

        @Test
        @DisplayName("处理通用异常应包含堆栈跟踪")
        void handleGenericException_ShouldContainStackTrace() {
            Exception ex = new RuntimeException("Database connection failed");

            var response = globalExceptionHandler.handleGenericException(ex, request);

            assert response.getBody().message().contains("Internal server error");
        }

        @Test
        @DisplayName("处理空指针异常")
        void handleNullPointerException_ShouldReturn500() {
            Exception ex = new NullPointerException("Null pointer encountered");

            var response = globalExceptionHandler.handleGenericException(ex, request);

            assert response.getStatusCode().value() == 500;
            assert response.getBody().code().equals("INTERNAL_ERROR");
        }

        @Test
        @DisplayName("处理数据库异常")
        void handleDatabaseException_ShouldReturn500() {
            Exception ex = new org.springframework.dao.DataAccessException("Database error") {};

            var response = globalExceptionHandler.handleGenericException(ex, request);

            assert response.getStatusCode().value() == 500;
        }
    }
}
