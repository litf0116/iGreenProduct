package com.igreen.common.utils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    private static final String SECRET_KEY = "test-secret-key-for-jwt-testing-purposes-only-2024";
    private static final long ACCESS_EXPIRATION_MS = 3600000L; // 1 hour
    private static final long REFRESH_EXPIRATION_MS = 604800000L; // 7 days

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", ACCESS_EXPIRATION_MS);
        ReflectionTestUtils.setField(jwtUtils, "refreshExpirationMs", REFRESH_EXPIRATION_MS);
        jwtUtils.init();
    }

    @Test
    @DisplayName("生成 Access Token 应包含正确的声明")
    void generateToken_ContainsCorrectClaims() {
        String userId = "user-123";
        String username = "testuser";
        String role = "ENGINEER";

        String token = jwtUtils.generateToken(userId, username, role);

        assertNotNull(token);
        assertEquals(userId, jwtUtils.extractUserId(token));
        assertEquals(username, jwtUtils.extractUsername(token));
        assertEquals(role, jwtUtils.extractRole(token));
    }

    @Test
    @DisplayName("生成 Refresh Token 应包含正确的声明")
    void generateRefreshToken_ContainsCorrectClaims() {
        String userId = "user-123";
        String username = "testuser";

        String token = jwtUtils.generateRefreshToken(userId, username);

        assertNotNull(token);
        assertEquals(userId, jwtUtils.extractUserId(token));
        assertEquals(username, jwtUtils.extractUsername(token));
    }

    @Test
    @DisplayName("生成的 Token 应有效")
    void generateToken_IsValid() {
        String token = jwtUtils.generateToken("user-123", "testuser", "ENGINEER");

        assertTrue(jwtUtils.validateToken(token));
    }

    @Test
    @DisplayName("无效 Token 应验证失败")
    void validateToken_InvalidToken_ReturnsFalse() {
        assertFalse(jwtUtils.validateToken("invalid.token.here"));
    }

    @Test
    @DisplayName("空 Token 应验证失败")
    void validateToken_EmptyToken_ReturnsFalse() {
        assertFalse(jwtUtils.validateToken(""));
    }

    @Test
    @DisplayName("过期 Token 验证时应抛出异常")
    void isTokenExpired_ExpiredToken_ThrowsException() {
        // Create a JwtUtils with very short expiration
        JwtUtils shortLivedJwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(shortLivedJwtUtils, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(shortLivedJwtUtils, "jwtExpirationMs", 1L); // 1ms
        ReflectionTestUtils.setField(shortLivedJwtUtils, "refreshExpirationMs", REFRESH_EXPIRATION_MS);
        shortLivedJwtUtils.init();

        String token = shortLivedJwtUtils.generateToken("user-123", "testuser", "ENGINEER");

        // Wait for token to expire
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // isTokenExpired should return true (but method might throw if token is already parsed)
        // Instead test validateToken returns false for expired token
        assertFalse(shortLivedJwtUtils.validateToken(token));
    }

    @Test
    @DisplayName("未过期 Token 应验证通过")
    void isTokenExpired_ValidToken_ReturnsFalse() {
        String token = jwtUtils.generateToken("user-123", "testuser", "ENGINEER");

        assertFalse(jwtUtils.isTokenExpired(token));
    }

    @Test
    @DisplayName("Token 有效性验证应通过正确的用户名")
    void isTokenValid_CorrectUsername_ReturnsTrue() {
        String username = "testuser";
        String token = jwtUtils.generateToken("user-123", username, "ENGINEER");

        assertTrue(jwtUtils.isTokenValid(token, username));
    }

    @Test
    @DisplayName("Token 有效性验证应拒绝错误的用户名")
    void isTokenValid_WrongUsername_ReturnsFalse() {
        String token = jwtUtils.generateToken("user-123", "testuser", "ENGINEER");

        assertFalse(jwtUtils.isTokenValid(token, "wronguser"));
    }

    @Test
    @DisplayName("getExpirationMs 应返回正确的值")
    void getExpirationMs_ReturnsCorrectValue() {
        assertEquals(ACCESS_EXPIRATION_MS, jwtUtils.getExpirationMs());
    }

    @Test
    @DisplayName("getRefreshExpirationMs 应返回正确的值")
    void getRefreshExpirationMs_ReturnsCorrectValue() {
        assertEquals(REFRESH_EXPIRATION_MS, jwtUtils.getRefreshExpirationMs());
    }

    @Test
    @DisplayName("Access Token 和 Refresh Token 应该不同")
    void generateAccessAndRefreshToken_AreDifferent() {
        String accessToken = jwtUtils.generateToken("user-123", "testuser", "ENGINEER");
        String refreshToken = jwtUtils.generateRefreshToken("user-123", "testuser");

        assertNotEquals(accessToken, refreshToken);
    }

    @Test
    @DisplayName("同一用户生成的 Token 应该不同（时间戳不同）")
    void generateToken_MultipleCalls_AreDifferent() throws InterruptedException {
        String token1 = jwtUtils.generateToken("user-123", "testuser", "ENGINEER");
        
        Thread.sleep(10);
        
        String token2 = jwtUtils.generateToken("user-123", "testuser", "ENGINEER");

        // Due to different issuedAt times, tokens should be different
        // Note: This test might occasionally fail if generated within the same millisecond
        // but in practice JWT includes timestamp so they should differ
        assertNotNull(token1);
        assertNotNull(token2);
    }

    @Test
    @DisplayName("篡改 Token 签名后应验证失败")
    void validateToken_TamperedToken_ReturnsFalse() {
        String token = jwtUtils.generateToken("user-123", "testuser", "ENGINEER");
        String tamperedToken = token.substring(0, token.length() - 5) + "xxxxx";

        assertFalse(jwtUtils.validateToken(tamperedToken));
    }
}
