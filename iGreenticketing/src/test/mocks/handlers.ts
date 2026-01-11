import { http, HttpResponse } from 'msw';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Mock data
const mockUser = {
  id: '1',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  role: 'ENGINEER' as const,
  status: 'ACTIVE' as const,
  createdAt: '2024-01-01T00:00:00Z',
};

const mockTickets = [
  {
    id: 'TKT-001',
    title: 'Fix broken charger',
    description: 'Charger not working',
    type: 'CORRECTIVE' as const,
    status: 'OPEN' as const,
    priority: 'P2' as const,
    site: 'Site A',
    assignedTo: 'user-1',
    assignedToName: 'John Doe',
    createdBy: 'admin-1',
    createdByName: 'Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    dueDate: '2024-01-15T00:00:00Z',
    completedSteps: [],
  },
];

const mockTemplates = [
  {
    id: 'tpl-1',
    name: 'Standard Maintenance',
    description: 'Routine maintenance checklist',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    steps: [
      {
        id: 'step-1',
        name: 'Inspect Equipment',
        description: 'Check all equipment',
        order: 1,
        templateId: 'tpl-1',
      },
    ],
  },
];

export const handlers = [
  // ========== Auth Handlers ==========
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    const { username, password } = body;

    if (username === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: 'mock-jwt-access-token',
          refreshToken: 'mock-jwt-refresh-token',
          expiresIn: 7200000,
          tokenType: 'Bearer',
        },
        code: '200',
      });
    }

    return HttpResponse.json(
      { success: false, message: 'Invalid credentials', code: '401' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        accessToken: 'mock-jwt-access-token',
        refreshToken: 'mock-jwt-refresh-token',
        expiresIn: 7200000,
        tokenType: 'Bearer',
      },
      code: '201',
    });
  }),

  http.post(`${API_BASE}/auth/refresh`, async ({ request }) => {
    const body = await request.json() as { refreshToken: string };

    if (body.refreshToken === 'mock-jwt-refresh-token' || body.refreshToken === 'expired-refresh-token') {
      return HttpResponse.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: 'new-mock-jwt-access-token',
          refreshToken: 'new-mock-jwt-refresh-token',
          expiresIn: 7200000,
          tokenType: 'Bearer',
        },
        code: '200',
      });
    }

    return HttpResponse.json(
      { success: false, message: 'Invalid refresh token', code: '401' },
      { status: 401 }
    );
  }),

  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: mockUser,
      code: '200',
    });
  }),

  // ========== Tickets Handlers ==========
  http.get(`${API_BASE}/tickets`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const keyword = url.searchParams.get('keyword');

    let filteredTickets = mockTickets;
    if (status) {
      filteredTickets = filteredTickets.filter((t) => t.status === status);
    }
    if (keyword) {
      filteredTickets = filteredTickets.filter((t) =>
        t.title.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: {
        records: filteredTickets,
        total: filteredTickets.length,
        current: 1,
        size: 10,
        hasNext: false,
      },
      code: '200',
    });
  }),

  http.get(`${API_BASE}/tickets/:id`, ({ params }) => {
    const ticket = mockTickets.find((t) => t.id === params.id);
    if (ticket) {
      return HttpResponse.json({
        success: true,
        message: 'Success',
        data: ticket,
        code: '200',
      });
    }
    return HttpResponse.json(
      { success: false, message: 'Ticket not found', code: '404' },
      { status: 404 }
    );
  }),

  http.post(`${API_BASE}/tickets`, async ({ request }) => {
    const body = await request.json();
    const newTicket = {
      id: `TKT-${Date.now()}`,
      ...body,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({
      success: true,
      message: 'Ticket created',
      data: newTicket,
      code: '201',
    });
  }),

  http.put(`${API_BASE}/tickets/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      message: 'Ticket updated',
      data: { id: params.id, ...body },
      code: '200',
    });
  }),

  http.post(`${API_BASE}/tickets/:id/accept`, async ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: 'Ticket accepted',
      data: { id: params.id, status: 'ACCEPTED' },
      code: '200',
    });
  }),

  http.post(`${API_BASE}/tickets/:id/complete`, async ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: 'Ticket completed',
      data: { id: params.id, status: 'COMPLETED' },
      code: '200',
    });
  }),

  // ========== Templates Handlers ==========
  http.get(`${API_BASE}/templates`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: mockTemplates,
      code: '200',
    });
  }),

  http.get(`${API_BASE}/templates/:id`, ({ params }) => {
    const template = mockTemplates.find((t) => t.id === params.id);
    if (template) {
      return HttpResponse.json({
        success: true,
        message: 'Success',
        data: template,
        code: '200',
      });
    }
    return HttpResponse.json(
      { success: false, message: 'Template not found', code: '404' },
      { status: 404 }
    );
  }),

  // ========== Users Handlers ==========
  http.get(`${API_BASE}/users`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: {
        records: [mockUser],
        total: 1,
        current: 1,
        size: 10,
        hasNext: false,
      },
      code: '200',
    });
  }),

  http.get(`${API_BASE}/users/engineers`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: [mockUser],
      code: '200',
    });
  }),

  // ========== Groups Handlers ==========
  http.get(`${API_BASE}/groups`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: [
        {
          id: 'group-1',
          name: 'Team A',
          description: 'Engineering Team A',
          status: 'ACTIVE' as const,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      code: '200',
    });
  }),

  http.get(`${API_BASE}/groups/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: {
        id: params.id,
        name: 'Team A',
        description: 'Engineering Team A',
        status: 'ACTIVE' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      code: '200',
    });
  }),

  // ========== Sites Handlers ==========
  http.get(`${API_BASE}/sites`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: {
        records: [
          {
            id: 'site-1',
            name: 'Site A',
            address: '123 Main St',
            level: 'A',
            status: 'ACTIVE' as const,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
        current: 1,
        size: 10,
        hasNext: false,
      },
      code: '200',
    });
  }),

  // ========== Config Handlers ==========
  http.get(`${API_BASE}/configs/sla-configs`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: [
        {
          id: 'sla-1',
          priority: 'P1' as const,
          responseTimeMinutes: 30,
          completionTimeHours: 4,
        },
      ],
      code: '200',
    });
  }),

  http.get(`${API_BASE}/configs/site-level-configs`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: [
        {
          id: 'slc-1',
          levelName: 'A',
          description: 'Level A sites',
          maxConcurrentTickets: 10,
          escalationTimeHours: 4,
        },
      ],
      code: '200',
    });
  }),

  http.get(`${API_BASE}/configs/problem-types`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: [
        {
          id: 'pt-1',
          name: 'Hardware Issue',
          description: 'Hardware related problems',
        },
      ],
      code: '200',
    });
  }),

  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: { status: 'UP', version: '1.0.0' },
      code: '200',
    });
  }),
];
