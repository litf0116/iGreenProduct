/**
 * Ky HTTP 客户端实例配置
 * 基于 Fetch API 的现代化 HTTP 客户端
 */
import ky, { HTTPError } from 'ky';
import type { TokenResponse } from './types';
import {
  getAuthToken,
  getRefreshToken,
  isTokenExpired,
  setTokens,
  clearTokens,
} from './authToken';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: string;
}

async function refreshToken(): Promise<string> {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  const response = await ky.post(`${API_BASE_URL}/api/auth/refresh`, {
    json: { refreshToken: refreshTokenValue },
    throwHttpErrors: true,
  });

  const result: ApiResponse<TokenResponse> = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Refresh failed');
  }

  setTokens(result.data);
  return result.data.accessToken;
}

async function performTokenRefresh(): Promise<string> {
  try {
    const newToken = await refreshToken();
    return newToken;
  } catch (error) {
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw error;
  }
}

export const kyInstance = ky.create({
  prefixUrl: '/',
  timeout: 30000,
  throwHttpErrors: false,
  retry: {
    limit: 2,
    methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
    afterStatusCodes: {
      401: true,
    },
    backoffLimit: 10000,
    delay: (attemptCount) => 300 * (2 ** (attemptCount - 1)),
    retryOnTimeout: false,
  },
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = getAuthToken();

        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }

        // Only set Content-Type for JSON requests (not FormData)
        const contentType = request.headers.get('Content-Type');
        if (!contentType) {
          request.headers.set('Content-Type', 'application/json');
        }
        request.headers.set('Accept', 'application/json');
      },
    ],

    beforeRetry: [
      async ({ request, error, retryCount }) => {
        const httpError = error as HTTPError | undefined;

        if (httpError && httpError.response?.status === 401) {
          if (request.url.includes('/api/auth/refresh')) {
            return;
          }

          if (request.url.includes('/api/auth/me') || request.url.includes('/api/auth/login')) {
            clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw error;
          }

          const newToken = await performTokenRefresh();

          const headers = new Headers(request.headers);
          headers.set('Authorization', `Bearer ${newToken}`);

          return new Request(request, { headers });
        }
      },
    ],

    afterResponse: [
      async (request, options, response) => {
        const clonedForStatusCheck = response.clone();

        if (!response.ok) {
          let errorMessage = `HTTP Error: ${response.status}`;
          try {
            const errorBody: ApiResponse<unknown> = await clonedForStatusCheck.json();
            if (errorBody.message) {
              errorMessage = errorBody.message;
            }
          } catch {
            try {
              errorMessage = await clonedForStatusCheck.text();
            } catch {
              errorMessage = response.statusText || errorMessage;
            }
          }

          const error = new HTTPError(response, request, options, errorMessage);
          (error as any).isApiError = true;
          throw error;
        }

        try {
          const clonedForSuccess = response.clone();
          const apiResponse: ApiResponse<unknown> = await clonedForSuccess.json();

          if (!apiResponse.success) {
            const error = new HTTPError(response, request, options, apiResponse.message || 'API Error');
            (error as any).isApiError = true;
            throw error;
          }

          return new Response(JSON.stringify(apiResponse.data), {
            status: 200,
            headers: response.headers,
          });
        } catch (parseError) {
          if (parseError instanceof HTTPError) {
            throw parseError;
          }
          return response;
        }
      },
    ],

    beforeError: [
      async (error) => {
        const httpError = error as HTTPError & { isApiError?: boolean };

        if (httpError.response) {
          let message = httpError.message;

          if (!httpError.isApiError) {
            try {
              const clone = httpError.response.clone();
              const body: ApiResponse<unknown> = await clone.json();
              message = body.message || message;
            } catch {
              try {
                message = await httpError.response.text();
              } catch {
                message = httpError.response.statusText || message;
              }
            }
          }

          httpError.message = message;

          if (httpError.response.status === 401 && !httpError.request.url.includes('/auth/refresh')) {
            clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }

        return httpError;
      },
    ],
  },
});

export { ky };
export type { ApiResponse };
