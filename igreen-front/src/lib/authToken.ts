/**
 * Token 管理模块
 * 处理 Token 的存储、获取、刷新和过期检测
 */
import type {TokenResponse} from './types';

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    TOKEN_EXPIRES_AT: 'token_expires_at',
} as const;

export function getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    if (!expiresAt) return true;
    return Date.now() >= parseInt(expiresAt);
}

export function setTokens(tokens: TokenResponse): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    const expiresAt = Date.now() + (tokens.expiresIn * 1000) - (5 * 60 * 1000);
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, String(expiresAt));
}

export function clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
}

export function getTokenExpiresAt(): number | null {
    const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    return expiresAt ? parseInt(expiresAt) : null;
}
