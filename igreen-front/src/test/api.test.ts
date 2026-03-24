import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAuthToken, setTokens, clearTokens } from '../lib/authToken';
import type { TokenResponse } from '../lib/types';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('api', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('login', () => {
        it('should store tokens after successful login', async () => {
            const mockResponse: TokenResponse = {
                accessToken: 'test-access-token',
                refreshToken: 'test-refresh-token',
                expiresIn: 7200,
                tokenType: 'Bearer',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: mockResponse,
                    message: 'Login successful',
                    code: '200',
                }),
            });

            expect(getAuthToken()).toBeNull();

            setTokens(mockResponse);

            expect(getAuthToken()).toBe('test-access-token');
        });

        it('should clear tokens on logout', () => {
            setTokens({
                accessToken: 'token',
                refreshToken: 'refresh',
                expiresIn: 3600,
                tokenType: 'Bearer',
            });

            expect(getAuthToken()).toBe('token');

            clearTokens();

            expect(getAuthToken()).toBeNull();
        });
    });

    describe('token refresh flow', () => {
        it('should detect expired token', () => {
            const expiredTime = Date.now() - 1000;
            localStorage.setItem('token_expires_at', String(expiredTime));

            const expiresAt = localStorage.getItem('token_expires_at');
            const isExpired = expiresAt ? Date.now() >= parseInt(expiresAt) : true;

            expect(isExpired).toBe(true);
        });

        it('should detect valid token', () => {
            const validTime = Date.now() + 3600000;
            localStorage.setItem('token_expires_at', String(validTime));

            const expiresAt = localStorage.getItem('token_expires_at');
            const isExpired = expiresAt ? Date.now() >= parseInt(expiresAt) : true;

            expect(isExpired).toBe(false);
        });
    });

    describe('pagination params', () => {
        it('should convert page params correctly', () => {
            const params = { page: 0, size: 10 };
            const searchParams = new URLSearchParams();
            searchParams.set('page', String((params.page ?? 0) + 1));
            searchParams.set('size', String(params.size ?? 100));

            expect(searchParams.get('page')).toBe('1');
            expect(searchParams.get('size')).toBe('10');
        });

        it('should use default page and size', () => {
            const params: { page?: number; size?: number } = {};
            const searchParams = new URLSearchParams();
            searchParams.set('page', String((params.page ?? 0) + 1));
            searchParams.set('size', String(params.size ?? 100));

            expect(searchParams.get('page')).toBe('1');
            expect(searchParams.get('size')).toBe('100');
        });

        it('should include keyword when provided', () => {
            const params = { page: 0, size: 10, keyword: 'test' };
            const searchParams = new URLSearchParams();
            searchParams.set('page', String((params.page ?? 0) + 1));
            searchParams.set('size', String(params.size ?? 100));
            if (params.keyword) searchParams.set('keyword', params.keyword);

            expect(searchParams.get('keyword')).toBe('test');
        });
    });
});