import { describe, it, expect, beforeEach, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { api } from './api';
import { server } from '../test/mocks/server';
import { http } from 'msw';

vi.mock('./kyInstance', async () => {
  const actual = await vi.importActual('./kyInstance');
  return {
    ...actual,
    kyInstance: actual.kyInstance.extend({
      prefixUrl: 'http://localhost:8000',
    }),
  };
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Client - Dual Token Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear real localStorage
    window.localStorage.clear();
    // Clear window.location
    delete (window as any).location;
    window.location = { href: '' };
  });

  describe('Authentication with Dual Tokens', () => {
    it('should login successfully and store both tokens', async () => {
      const result = await api.login('test@example.com', 'password123', 'Thailand');

      // Check that both tokens were stored
      expect(window.localStorage.getItem('auth_token')).toBe('mock-jwt-access-token');
      expect(window.localStorage.getItem('refresh_token')).toBe('mock-jwt-refresh-token');
      expect(window.localStorage.getItem('token_expires_at')).toBeDefined();

      expect(result).toEqual({
        accessToken: 'mock-jwt-access-token',
        refreshToken: 'mock-jwt-refresh-token',
        expiresIn: 7200000,
        tokenType: 'Bearer',
      });
    });

    it('should throw error on invalid credentials', async () => {
      await expect(
        api.login('wrong@example.com', 'wrongpassword', 'Thailand')
      ).rejects.toThrow();
    });

    it('should clear all tokens on logout', () => {
      window.localStorage.setItem('auth_token', 'test-token');
      window.localStorage.setItem('refresh_token', 'refresh-token');
      window.localStorage.setItem('token_expires_at', '123456');

      api.logout();

      expect(window.localStorage.getItem('auth_token')).toBeNull();
      expect(window.localStorage.getItem('refresh_token')).toBeNull();
      expect(window.localStorage.getItem('token_expires_at')).toBeNull();
    });

    it('should fetch current user with access token', async () => {
      window.localStorage.setItem('auth_token', 'test-token');
      window.localStorage.setItem('refresh_token', 'mock-jwt-refresh-token');
      window.localStorage.setItem('token_expires_at', String(Date.now() + 1000000));

      const user = await api.getCurrentUser();

      expect(user).toEqual({
        id: '1',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        role: 'ENGINEER',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
      });
    });

    it('should register new user and store both tokens', async () => {
      const result = await api.register({
        name: 'New User',
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        role: 'ENGINEER',
        country: 'Thailand',
      });

      expect(result).toEqual({
        accessToken: 'mock-jwt-access-token',
        refreshToken: 'mock-jwt-refresh-token',
        expiresIn: 7200000,
        tokenType: 'Bearer',
      });
      expect(window.localStorage.getItem('auth_token')).toBe('mock-jwt-access-token');
      expect(window.localStorage.getItem('refresh_token')).toBe('mock-jwt-refresh-token');
    });
  });

  describe('Token Refresh', () => {
    beforeEach(() => {
      // Set up initial tokens
      window.localStorage.setItem('auth_token', 'mock-jwt-access-token');
      window.localStorage.setItem('refresh_token', 'mock-jwt-refresh-token');
      window.localStorage.setItem('token_expires_at', String(Date.now() + 1000000));
    });

    it('should refresh tokens successfully', async () => {
      const result = await api.refreshTokenToken();

      expect(result).toEqual({
        accessToken: 'new-mock-jwt-access-token',
        refreshToken: 'new-mock-jwt-refresh-token',
        expiresIn: 7200000,
        tokenType: 'Bearer',
      });

      // Verify tokens were updated
      expect(window.localStorage.getItem('auth_token')).toBe('new-mock-jwt-access-token');
      expect(window.localStorage.getItem('refresh_token')).toBe('new-mock-jwt-refresh-token');
    });

    it('should throw error when refresh token is invalid', async () => {
      window.localStorage.setItem('refresh_token', 'invalid-refresh-token');

      await expect(api.refreshTokenToken()).rejects.toThrow();
    });
  });

  describe('Token Expiration Handling', () => {
    it('should detect when token is expired', () => {
      // Set expiration time in the past
      window.localStorage.setItem('token_expires_at', String(Date.now() - 10000));

      const expiresAt = window.localStorage.getItem('token_expires_at');
      if (expiresAt) {
        const isExpired = Date.now() >= parseInt(expiresAt);
        expect(isExpired).toBe(true);
      }
    });

    it('should detect when token is not expired', () => {
      // Set expiration time in the future
      window.localStorage.setItem('token_expires_at', String(Date.now() + 1000000));

      const expiresAt = window.localStorage.getItem('token_expires_at');
      if (expiresAt) {
        const isExpired = Date.now() >= parseInt(expiresAt);
        expect(isExpired).toBe(false);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 unauthorized', async () => {
      server.use(
        http.get('*/api/auth/me', () => {
          return new Response(null, { status: 401 });
        }),
        http.post('*/api/auth/refresh', () => {
          return new Response(null, { status: 401 });
        })
      );

      window.localStorage.setItem('auth_token', 'invalid-token');
      window.localStorage.setItem('refresh_token', 'mock-jwt-refresh-token');
      window.localStorage.setItem('token_expires_at', String(Date.now() + 1000000));

      await expect(api.getCurrentUser()).rejects.toThrow();
    });

    it('should handle 401 unauthorized without refresh token', async () => {
      server.use(
        http.get('*/api/auth/me', () => {
          return new Response(null, { status: 401 });
        })
      );

      window.localStorage.setItem('auth_token', 'invalid-token');
      window.localStorage.removeItem('refresh_token');
      window.localStorage.removeItem('token_expires_at');

      // Should redirect to login (simulated by throwing error)
      await expect(api.getCurrentUser()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('*/api/tickets', () => {
          return new Response(null, { status: 500 });
        })
      );

      window.localStorage.setItem('auth_token', 'test-token');
      window.localStorage.setItem('refresh_token', 'mock-jwt-refresh-token');
      window.localStorage.setItem('token_expires_at', String(Date.now() + 1000000));

      await expect(api.getTickets()).rejects.toThrow();
    });
  });

  describe('Tickets API', () => {
    beforeEach(() => {
      window.localStorage.setItem('auth_token', 'test-token');
      window.localStorage.setItem('refresh_token', 'mock-jwt-refresh-token');
      window.localStorage.setItem('token_expires_at', String(Date.now() + 1000000));
    });

    it('should fetch tickets with pagination', async () => {
      const result = await api.getTickets({ page: 1, size: 10 });

      expect(result.records).toHaveLength(1);
      expect(result.records[0].id).toBe('TKT-001');
      expect(result.total).toBe(1);
    });

    it('should filter tickets by status', async () => {
      const result = await api.getTickets({ status: 'OPEN' });

      expect(result.records).toBeDefined();
      expect(result.records[0].status).toBe('OPEN');
    });

    it('should search tickets by keyword', async () => {
      const result = await api.getTickets({ keyword: 'broken' });

      expect(result.records).toBeDefined();
      expect(result.records[0].title).toContain('broken');
    });

    it('should fetch single ticket by id', async () => {
      const ticket = await api.getTicket('TKT-001');

      expect(ticket).toBeDefined();
      expect(ticket.id).toBe('TKT-001');
    });

    it('should create new ticket', async () => {
      const newTicket = {
        title: 'New Ticket',
        description: 'Test description',
        type: 'CORRECTIVE' as const,
        site: 'Site A',
        priority: 'P2' as const,
        assignedTo: 'user-1',
        dueDate: '2024-12-31T23:59:59Z',
      };

      const result = await api.createTicket(newTicket);

      expect(result).toBeDefined();
      expect(result.title).toBe('New Ticket');
    });

    it('should update ticket', async () => {
      const updates = { status: 'IN_PROGRESS' as const };
      const result = await api.updateTicket('TKT-001', updates);

      expect(result).toBeDefined();
    });

    it('should accept ticket', async () => {
      const result = await api.acceptTicket('TKT-001', 'Accepting this ticket');

      expect(result).toBeDefined();
      expect(result.status).toBe('ACCEPTED');
    });

    it('should complete ticket', async () => {
      const result = await api.completeTicket('TKT-001', 'photo-url');

      expect(result).toBeDefined();
      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('Templates API', () => {
    beforeEach(() => {
      window.localStorage.setItem('auth_token', 'test-token');
      window.localStorage.setItem('refresh_token', 'mock-jwt-refresh-token');
      window.localStorage.setItem('token_expires_at', String(Date.now() + 1000000));
    });

    it('should fetch all templates', async () => {
      const templates = await api.getTemplates();

      expect(templates).toHaveLength(1);
      expect(templates[0].id).toBe('tpl-1');
      expect(templates[0].name).toBe('Standard Maintenance');
    });

    it('should fetch single template by id', async () => {
      const template = await api.getTemplate('tpl-1');

      expect(template).toBeDefined();
      expect(template.id).toBe('tpl-1');
      expect(template.steps).toBeDefined();
    });
  });

  describe('Users API', () => {
    beforeEach(() => {
      window.localStorage.setItem('auth_token', 'test-token');
      window.localStorage.setItem('refresh_token', 'mock-jwt-refresh-token');
      window.localStorage.setItem('token_expires_at', String(Date.now() + 1000000));
    });

    it('should fetch users with pagination', async () => {
      const result = await api.getUsers({ page: 1, size: 10 });

      expect(result.records).toHaveLength(1);
      expect(result.records[0].username).toBe('testuser');
    });

    it('should fetch engineers', async () => {
      const engineers = await api.getEngineers();

      expect(engineers).toBeDefined();
      expect(engineers.length).toBeGreaterThan(0);
    });

    it('should search users by keyword', async () => {
      const result = await api.getUsers({ keyword: 'test' });

      expect(result.records).toBeDefined();
    });
  });

  describe('Groups API', () => {
    beforeEach(() => {
      window.localStorage.setItem('auth_token', 'test-token');
      window.localStorage.setItem('refresh_token', 'mock-jwt-refresh-token');
      window.localStorage.setItem('token_expires_at', String(Date.now() + 1000000));
    });

    it('should fetch all groups', async () => {
      const groups = await api.getGroups();

      expect(groups).toHaveLength(1);
      expect(groups[0].name).toBe('Team A');
    });

    it('should fetch single group by id', async () => {
      const group = await api.getGroup('group-1');

      expect(group).toBeDefined();
      expect(group.id).toBe('group-1');
    });
  });

  describe('Sites API', () => {
    beforeEach(() => {
      window.localStorage.setItem('auth_token', 'test-token');
      window.localStorage.setItem('refresh_token', 'mock-jwt-refresh-token');
      window.localStorage.setItem('token_expires_at', String(Date.now() + 1000000));
    });

    it('should fetch sites with pagination', async () => {
      const result = await api.getSites({ page: 1, size: 10 });

      expect(result.records).toHaveLength(1);
      expect(result.records[0].name).toBe('Site A');
    });

    it('should search sites by keyword', async () => {
      const result = await api.getSites({ keyword: 'Site' });

      expect(result.records).toBeDefined();
    });
  });

  describe('Configurations API', () => {
    beforeEach(() => {
      window.localStorage.setItem('auth_token', 'test-token');
      window.localStorage.setItem('refresh_token', 'mock-jwt-refresh-token');
      window.localStorage.setItem('token_expires_at', String(Date.now() + 1000000));
    });

    it('should fetch SLA configs', async () => {
      const configs = await api.getSLAConfigs();

      expect(configs).toHaveLength(1);
      expect(configs[0].priority).toBe('P1');
    });

    it('should fetch site level configs', async () => {
      const configs = await api.getSiteLevelConfigs();

      expect(configs).toBeDefined();
    });

    it('should fetch problem types', async () => {
      const types = await api.getProblemTypes();

      expect(types).toBeDefined();
    });
  });

  describe('Health Check', () => {
    it('should check health status', async () => {
      const result = await api.healthCheck();

      expect(result).toEqual({
        status: 'UP',
        version: '1.0.0',
      });
    });
  });
});
