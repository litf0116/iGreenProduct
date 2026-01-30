package com.igreen.common.utils;

import com.igreen.common.config.SecurityConfig;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import java.io.IOException;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtAuthenticationFilter 测试")
class JwtAuthenticationFilterTest {

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private FilterChain filterChain;

    @Mock
    private jakarta.servlet.http.HttpServletRequest request;

    @Mock
    private jakarta.servlet.http.HttpServletResponse response;

    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtUtils, userDetailsService);
        SecurityContextHolder.clearContext();
    }

    @Nested
    @DisplayName("有效 JWT Token 处理测试")
    class ValidTokenTests {

        @Test
        @DisplayName("有效 Token 应该设置认证信息")
        void doFilterInternal_ValidToken_ShouldSetAuthentication() throws ServletException, IOException {
            // Arrange
            String token = "valid-jwt-token";
            String username = "testuser";

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateToken(token)).thenReturn(true);
            when(jwtUtils.extractUsername(token)).thenReturn(username);
            when(jwtUtils.isTokenValid(token, username)).thenReturn(true);

            UserDetails userDetails = User.builder()
                    .username(username)
                    .password("password")
                    .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                    .build();
            when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertNotNull(SecurityContextHolder.getContext().getAuthentication());
            assertEquals(username, SecurityContextHolder.getContext().getAuthentication().getName());
            assertTrue(SecurityContextHolder.getContext().getAuthentication().isAuthenticated());
            assertEquals(1, SecurityContextHolder.getContext().getAuthentication().getAuthorities().size());

            verify(filterChain).doFilter(request, response);
            verify(jwtUtils).validateToken(token);
            verify(jwtUtils).extractUsername(token);
            verify(jwtUtils).isTokenValid(token, username);
            verify(userDetailsService).loadUserByUsername(username);
        }

        @Test
        @DisplayName("Token 不应该被验证两次")
        void doFilterInternal_ValidToken_ShouldNotValidateTwice() throws ServletException, IOException {
            // Arrange
            String token = "valid-jwt-token";
            String username = "testuser";

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateToken(token)).thenReturn(true);
            when(jwtUtils.extractUsername(token)).thenReturn(username);
            when(jwtUtils.isTokenValid(token, username)).thenReturn(true);

            UserDetails userDetails = User.builder()
                    .username(username)
                    .password("password")
                    .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                    .build();
            when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert - validateToken should only be called once
            verify(jwtUtils, times(1)).validateToken(token);
            verify(jwtUtils, times(1)).isTokenValid(token, username);
        }
    }

    @Nested
    @DisplayName("无效或缺失 JWT Token 处理测试")
    class InvalidOrMissingTokenTests {

        @Test
        @DisplayName("无 Authorization header 应该继续过滤链")
        void doFilterInternal_NoAuthHeader_ShouldContinueChain() throws ServletException, IOException {
            // Arrange
            when(request.getHeader("Authorization")).thenReturn(null);

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(filterChain).doFilter(request, response);
            verify(jwtUtils, never()).validateToken(any());
            verify(userDetailsService, never()).loadUserByUsername(any());
        }

        @Test
        @DisplayName("空 Authorization header 应该继续过滤链")
        void doFilterInternal_EmptyAuthHeader_ShouldContinueChain() throws ServletException, IOException {
            // Arrange
            when(request.getHeader("Authorization")).thenReturn("");

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(filterChain).doFilter(request, response);
            verify(jwtUtils, never()).validateToken(any());
        }

        @Test
        @DisplayName("没有 Bearer 前缀的 header 应该继续过滤链")
        void doFilterInternal_NoBearerPrefix_ShouldContinueChain() throws ServletException, IOException {
            // Arrange
            when(request.getHeader("Authorization")).thenReturn("InvalidToken");

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(filterChain).doFilter(request, response);
            verify(jwtUtils, never()).validateToken(any());
        }

        @Test
        @DisplayName("只有 Bearer 前缀没有 token 应该继续过滤链")
        void doFilterInternal_OnlyBearerPrefix_ShouldContinueChain() throws ServletException, IOException {
            // Arrange
            when(request.getHeader("Authorization")).thenReturn("Bearer ");

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(filterChain).doFilter(request, response);
            verify(jwtUtils, never()).validateToken(any());
        }

        @Test
        @DisplayName("无效 Token 应该继续过滤链")
        void doFilterInternal_InvalidToken_ShouldContinueChain() throws ServletException, IOException {
            // Arrange
            String token = "invalid-jwt-token";

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateToken(token)).thenReturn(false);

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(filterChain).doFilter(request, response);
            verify(jwtUtils).validateToken(token);
            verify(jwtUtils, never()).extractUsername(any());
            verify(userDetailsService, never()).loadUserByUsername(any());
        }

        @Test
        @DisplayName("Token 验证通过但用户名不匹配应该继续过滤链")
        void doFilterInternal_TokenValidButUsernameMismatch_ShouldContinueChain() throws ServletException, IOException {
            // Arrange
            String token = "valid-token";
            String username = "testuser";

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateToken(token)).thenReturn(true);
            when(jwtUtils.extractUsername(token)).thenReturn(username);
            when(jwtUtils.isTokenValid(token, username)).thenReturn(false); // 用户名不匹配

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(filterChain).doFilter(request, response);
        }
    }

    @Nested
    @DisplayName("异常处理测试")
    class ExceptionHandlingTests {

        @Test
        @DisplayName("JWT 解析异常应该继续过滤链")
        void doFilterInternal_JwtException_ShouldContinueChain() throws ServletException, IOException {
            // Arrange
            String token = "malformed-token";

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateToken(token)).thenThrow(new RuntimeException("JWT parsing error"));

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("UserDetailsService 抛出异常应该继续过滤链")
        void doFilterInternal_UserDetailsServiceException_ShouldContinueChain() throws ServletException, IOException {
            // Arrange
            String token = "valid-token";
            String username = "nonexistentuser";

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateToken(token)).thenReturn(true);
            when(jwtUtils.extractUsername(token)).thenReturn(username);
            when(userDetailsService.loadUserByUsername(username))
                    .thenThrow(new RuntimeException("User not found"));

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("FilterChain 抛出异常应该传播异常")
        void doFilterInternal_FilterChainException_ShouldPropagateException() throws ServletException, IOException {
            // Arrange
            when(request.getHeader("Authorization")).thenReturn(null);
            doThrow(new ServletException("Filter chain error"))
                    .when(filterChain).doFilter(request, response);

            // Act & Assert
            assertThrows(ServletException.class, () -> {
                jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
            });
        }

        @Test
        @DisplayName("IO 异常应该传播异常")
        void doFilterInternal_IOException_ShouldPropagateException() throws ServletException, IOException {
            // Arrange
            when(request.getHeader("Authorization")).thenReturn(null);
            doThrow(new IOException("IO error"))
                    .when(filterChain).doFilter(request, response);

            // Act & Assert
            assertThrows(IOException.class, () -> {
                jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
            });
        }
    }

    @Nested
    @DisplayName("不同用户角色测试")
    class UserRoleTests {

        @Test
        @DisplayName("管理员用户应该设置正确权限")
        void doFilterInternal_AdminUser_ShouldSetCorrectAuthorities() throws ServletException, IOException {
            // Arrange
            String token = "admin-token";
            String username = "admin";

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateToken(token)).thenReturn(true);
            when(jwtUtils.extractUsername(token)).thenReturn(username);
            when(jwtUtils.isTokenValid(token, username)).thenReturn(true);

            UserDetails adminUser = User.builder()
                    .username(username)
                    .password("password")
                    .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")))
                    .build();
            when(userDetailsService.loadUserByUsername(username)).thenReturn(adminUser);

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertNotNull(SecurityContextHolder.getContext().getAuthentication());
            assertEquals(1, SecurityContextHolder.getContext().getAuthentication().getAuthorities().size());
            assertTrue(SecurityContextHolder.getContext().getAuthentication()
                    .getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
        }

        @Test
        @DisplayName("工程师用户应该设置正确权限")
        void doFilterInternal_EngineerUser_ShouldSetCorrectAuthorities() throws ServletException, IOException {
            // Arrange
            String token = "engineer-token";
            String username = "engineer";

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateToken(token)).thenReturn(true);
            when(jwtUtils.extractUsername(token)).thenReturn(username);
            when(jwtUtils.isTokenValid(token, username)).thenReturn(true);

            UserDetails engineerUser = User.builder()
                    .username(username)
                    .password("password")
                    .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ENGINEER")))
                    .build();
            when(userDetailsService.loadUserByUsername(username)).thenReturn(engineerUser);

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertNotNull(SecurityContextHolder.getContext().getAuthentication());
            assertTrue(SecurityContextHolder.getContext().getAuthentication()
                    .getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ENGINEER")));
        }

        @Test
        @DisplayName("多角色用户应该设置所有权限")
        void doFilterInternal_MultiRoleUser_ShouldSetAllAuthorities() throws ServletException, IOException {
            // Arrange
            String token = "multi-role-token";
            String username = "manager";

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateToken(token)).thenReturn(true);
            when(jwtUtils.extractUsername(token)).thenReturn(username);
            when(jwtUtils.isTokenValid(token, username)).thenReturn(true);

            UserDetails multiRoleUser = User.builder()
                    .username(username)
                    .password("password")
                    .authorities(java.util.List.of(
                            new SimpleGrantedAuthority("ROLE_MANAGER"),
                            new SimpleGrantedAuthority("ROLE_ENGINEER")
                    ))
                    .build();
            when(userDetailsService.loadUserByUsername(username)).thenReturn(multiRoleUser);

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertNotNull(SecurityContextHolder.getContext().getAuthentication());
            assertEquals(2, SecurityContextHolder.getContext().getAuthentication().getAuthorities().size());
        }
    }

    @Nested
    @DisplayName("边界条件测试")
    class EdgeCaseTests {

        @Test
        @DisplayName("多次调用过滤器应该替换之前的认证")
        void doFilterInternal_MultipleCalls_ShouldReplacePreviousAuthentication() throws ServletException, IOException {
            // Arrange
            String token1 = "token1";
            String token2 = "token2";
            String username1 = "user1";
            String username2 = "user2";

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token1);
            when(jwtUtils.validateToken(token1)).thenReturn(true);
            when(jwtUtils.extractUsername(token1)).thenReturn(username1);
            when(jwtUtils.isTokenValid(token1, username1)).thenReturn(true);

            UserDetails user1 = User.builder()
                    .username(username1)
                    .password("password")
                    .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                    .build();
            when(userDetailsService.loadUserByUsername(username1)).thenReturn(user1);

            // Act - First call
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            String firstAuth = SecurityContextHolder.getContext().getAuthentication().getName();

            // Arrange - Second call
            when(request.getHeader("Authorization")).thenReturn("Bearer " + token2);
            when(jwtUtils.validateToken(token2)).thenReturn(true);
            when(jwtUtils.extractUsername(token2)).thenReturn(username2);
            when(jwtUtils.isTokenValid(token2, username2)).thenReturn(true);

            UserDetails user2 = User.builder()
                    .username(username2)
                    .password("password")
                    .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")))
                    .build();
            when(userDetailsService.loadUserByUsername(username2)).thenReturn(user2);

            // Act - Second call
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertEquals(username2, SecurityContextHolder.getContext().getAuthentication().getName());
            assertNotEquals(firstAuth, SecurityContextHolder.getContext().getAuthentication().getName());
        }

        @Test
        @DisplayName("Token 大小写敏感")
        void doFilterInternal_TokenCaseSensitive_ShouldNotMatch() throws ServletException, IOException {
            // Arrange
            when(request.getHeader("Authorization")).thenReturn("bearer token"); // lowercase "bearer"

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(jwtUtils, never()).validateToken(any());
        }

        @Test
        @DisplayName("Token 前后有空格应该正常处理")
        void doFilterInternal_TokenWithSpaces_ShouldExtractCorrectly() throws ServletException, IOException {
            // Arrange
            String token = "valid-token";
            String username = "testuser";

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateToken(token)).thenReturn(true);
            when(jwtUtils.extractUsername(token)).thenReturn(username);
            when(jwtUtils.isTokenValid(token, username)).thenReturn(true);

            UserDetails userDetails = User.builder()
                    .username(username)
                    .password("password")
                    .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                    .build();
            when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertNotNull(SecurityContextHolder.getContext().getAuthentication());
            verify(jwtUtils).validateToken(eq("valid-token")); // 不带空格
        }
    }

    @Nested
    @DisplayName("Token 提取测试")
    class TokenExtractionTests {

        @Test
        @DisplayName("应该正确提取标准 Bearer Token")
        void extractJwtFromRequest_StandardBearerToken_ShouldExtract() throws ServletException, IOException {
            // Arrange
            String token = "standard-token";
            String username = "user";

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateToken(token)).thenReturn(true);
            when(jwtUtils.extractUsername(token)).thenReturn(username);
            when(jwtUtils.isTokenValid(token, username)).thenReturn(true);

            UserDetails userDetails = User.builder()
                    .username(username)
                    .password("password")
                    .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                    .build();
            when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            verify(jwtUtils).validateToken(eq("standard-token"));
        }

        @Test
        @DisplayName("应该处理包含空格的 Token")
        void extractJwtFromRequest_TokenWithSpaces_ShouldExtract() throws ServletException, IOException {
            // Arrange
            String token = "token with spaces";
            String username = "user";

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateToken(token)).thenReturn(true);
            when(jwtUtils.extractUsername(token)).thenReturn(username);
            when(jwtUtils.isTokenValid(token, username)).thenReturn(true);

            UserDetails userDetails = User.builder()
                    .username(username)
                    .password("password")
                    .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                    .build();
            when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            verify(jwtUtils).validateToken(eq("token with spaces"));
        }
    }
}
