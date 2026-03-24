import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getAuthToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    isTokenExpired,
    getTokenExpiresAt,
} from '../lib/authToken';
import type { TokenResponse } from '../lib/types';

describe('authToken', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('getAuthToken', () => {
        it('should return null when no token is stored', () => {
            expect(getAuthToken()).toBeNull();
        });

        it('should return the stored access token', () => {
            localStorage.setItem('auth_token', 'test-access-token');
            expect(getAuthToken()).toBe('test-access-token');
        });
    });

    describe('getRefreshToken', () => {
        it('should return null when no refresh token is stored', () => {
            expect(getRefreshToken()).toBeNull();
        });

        it('should return the stored refresh token', () => {
            localStorage.setItem('refresh_token', 'test-refresh-token');
            expect(getRefreshToken()).toBe('test-refresh-token');
        });
    });

    describe('setTokens', () => {
        it('should store all tokens in localStorage', () => {
            const tokens: TokenResponse = {
                accessToken: 'access-token-123',
                refreshToken: 'refresh-token-456',
                expiresIn: 7200,
                tokenType: 'Bearer',
            };

            setTokens(tokens);

            expect(localStorage.getItem('auth_token')).toBe('access-token-123');
            expect(localStorage.getItem('refresh_token')).toBe('refresh-token-456');
            expect(localStorage.getItem('token_expires_at')).not.toBeNull();
        });

        it('should calculate expiration time with 5 minute buffer', () => {
            const tokens: TokenResponse = {
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                expiresIn: 3600, // 1 hour
                tokenType: 'Bearer',
            };

            const beforeSet = Date.now();
            setTokens(tokens);
            const afterSet = Date.now();

            const expiresAt = parseInt(localStorage.getItem('token_expires_at') || '0');
            const expectedMin = beforeSet + (3600 * 1000) - (5 * 60 * 1000);
            const expectedMax = afterSet + (3600 * 1000) - (5 * 60 * 1000);

            expect(expiresAt).toBeGreaterThanOrEqual(expectedMin);
            expect(expiresAt).toBeLessThanOrEqual(expectedMax);
        });
    });

    describe('clearTokens', () => {
        it('should remove all tokens from localStorage', () => {
            localStorage.setItem('auth_token', 'access-token');
            localStorage.setItem('refresh_token', 'refresh-token');
            localStorage.setItem('token_expires_at', '1234567890');

            clearTokens();

            expect(localStorage.getItem('auth_token')).toBeNull();
            expect(localStorage.getItem('refresh_token')).toBeNull();
            expect(localStorage.getItem('token_expires_at')).toBeNull();
        });
    });

    describe('isTokenExpired', () => {
        it('should return true when no expiration is stored', () => {
            expect(isTokenExpired()).toBe(true);
        });

        it('should return true when token is expired', () => {
            const pastTime = Date.now() - 10000; // 10 seconds ago
            localStorage.setItem('token_expires_at', String(pastTime));

            expect(isTokenExpired()).toBe(true);
        });

        it('should return false when token is not expired', () => {
            const futureTime = Date.now() + 3600000; // 1 hour from now
            localStorage.setItem('token_expires_at', String(futureTime));

            expect(isTokenExpired()).toBe(false);
        });
    });

    describe('getTokenExpiresAt', () => {
        it('should return null when no expiration is stored', () => {
            expect(getTokenExpiresAt()).toBeNull();
        });

        it('should return the expiration timestamp as number', () => {
            const expiresAt = Date.now() + 3600000;
            localStorage.setItem('token_expires_at', String(expiresAt));

            expect(getTokenExpiresAt()).toBe(expiresAt);
        });
    });
});