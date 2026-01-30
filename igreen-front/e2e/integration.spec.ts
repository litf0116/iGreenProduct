/**
 * Integration E2E Tests - Real API Calls
 * 
 * These tests use real API calls to the backend (http://localhost:8000)
 * instead of mocking responses. They test the full integration between
 * frontend and backend.
 * 
 * Prerequisites:
 * - Backend must be running: cd igreen-backend && mvn spring-boot:run
 * - Frontend must be running: pnpm dev
 * - Database must be initialized
 * 
 * Run with: pnpm test:e2e integration.spec.ts
 */

import { test, expect } from '@playwright/test';
import { E2E_TIMEOUTS } from './constants';

const API_BASE_URL = 'http://localhost:8000';

test.describe('Integration Tests - Real API', () => {
  let authToken: string;
  let refreshToken: string;

  test.beforeAll(async ({ request }) => {
    // Login to get real tokens (with retry for rate limiting)
    let response;
    let retries = 3;
    while (retries > 0) {
      response = await request.post(`${API_BASE_URL}/api/auth/login`, {
        data: JSON.stringify({
          username: 'admin',
          password: 'password123',
          country: 'Thailand',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok()) break;
      
      const body = await response.json();
      // If rate limited, wait and retry
      if (body.code === 'RATE_LIMIT_EXCEEDED') {
        // Use built-in sleep for test context
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        retries--;
        continue;
      }
      break;
    }

    if (response && response.ok()) {
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.accessToken).toBeDefined();
      authToken = body.data.accessToken;
      refreshToken = body.data.refreshToken;
    } else {
      // Skip if backend not available
      test.skip(true, 'Backend not available');
    }
  });

  test('should login with real API', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
      data: {
        username: 'admin',
        password: 'password123',
        country: 'Thailand',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toBeDefined();
    expect(body.data.refreshToken).toBeDefined();
    expect(body.data.tokenType).toBe('Bearer');
  });

  test('should get current user with real API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.username).toBe('admin');
    expect(body.data.role).toBe('ADMIN');
  });

  test('should fetch templates from real API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/templates`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should fetch groups from real API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/groups`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should fetch sites from real API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/sites?page=1&size=10`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.records).toBeDefined();
    expect(Array.isArray(body.data.records)).toBe(true);
  });

  test('should fetch tickets from real API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/tickets?page=0&size=10`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.records).toBeDefined();
    expect(Array.isArray(body.data.records)).toBe(true);
  });

  test('should fetch users from real API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/users?page=0&size=10`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.records).toBeDefined();
  });

  test('should fetch SLA configs from real API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/configs/sla-configs`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should fetch problem types from real API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/configs/problem-types`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should fetch site level configs from real API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/configs/site-level-configs`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should fetch site stats from real API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/sites/stats`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  test('should fetch ticket stats from real API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/tickets/stats`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  test('should handle unauthorized access', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/users`, {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    });

    // Backend returns 403 for invalid token
    expect([401, 403]).toContain(response.status());
  });

  test('should handle login with invalid credentials', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
      data: JSON.stringify({
        username: 'invalid',
        password: 'wrongpassword',
        country: 'Thailand',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Should fail (4xx status)
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

/**
 * Frontend Integration Tests
 * 
 * Note: These tests require the frontend to be properly configured
 * with auth handling. For full E2E testing, use the main test files
 * with mocked authentication.
 */
test.describe('Frontend Integration - Manual Verification', () => {
  test.beforeAll(async ({ request }) => {
    // Verify backend is running
    const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
      data: JSON.stringify({
        username: 'admin',
        password: 'password123',
        country: 'Thailand',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // Skip if backend not running - this is for manual verification
    test.skip(!response.ok(), 'Backend not running - skipping frontend tests');
  });

  test('frontend can connect to backend', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    
    // Verify login form is displayed
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });
});
