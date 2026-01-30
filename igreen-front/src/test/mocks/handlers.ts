import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:8000';
const API_BASE = `${API_BASE_URL}/api`;

const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

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

const createSuccessResponse = <T>(data: T) => ({
  success: true,
  message: 'Success',
  data,
  code: '200',
});

const createErrorResponse = (message: string, status: number = 400) =>
  HttpResponse.json(
    { success: false, message, code: String(status) },
    { status }
  );

export const handlers = [
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

    return createErrorResponse('Invalid credentials', 401);
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

    return createErrorResponse('Invalid refresh token', 401);
  }),

  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json(
      createSuccessResponse(mockUser)
    );
  }),

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

    return HttpResponse.json(
      createSuccessResponse({
        records: filteredTickets,
        total: filteredTickets.length,
        current: 1,
        size: 10,
        hasNext: false,
      })
    );
  }),

  http.get(`${API_BASE}/tickets/:id`, ({ params }) => {
    const ticket = mockTickets.find((t) => t.id === params.id);
    if (ticket) {
      return HttpResponse.json(createSuccessResponse(ticket));
    }
    return createErrorResponse('Ticket not found', 404);
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
    return HttpResponse.json(
      createSuccessResponse({ id: params.id, ...body })
    );
  }),

  http.post(`${API_BASE}/tickets/:id/accept`, async ({ params }) => {
    return HttpResponse.json(
      createSuccessResponse({ id: params.id, status: 'ACCEPTED' })
    );
  }),

  http.post(`${API_BASE}/tickets/:id/complete`, async ({ params }) => {
    return HttpResponse.json(
      createSuccessResponse({ id: params.id, status: 'COMPLETED' })
    );
  }),

  http.get(`${API_BASE}/templates`, () => {
    return HttpResponse.json(createSuccessResponse(mockTemplates));
  }),

  http.get(`${API_BASE}/templates/:id`, ({ params }) => {
    const template = mockTemplates.find((t) => t.id === params.id);
    if (template) {
      return HttpResponse.json(createSuccessResponse(template));
    }
    return createErrorResponse('Template not found', 404);
  }),

  http.get(`${API_BASE}/users`, () => {
    return HttpResponse.json(
      createSuccessResponse({
        records: [mockUser],
        total: 1,
        current: 1,
        size: 10,
        hasNext: false,
      })
    );
  }),

  http.get(`${API_BASE}/users/engineers`, () => {
    return HttpResponse.json(createSuccessResponse([mockUser]));
  }),

  http.get(`${API_BASE}/groups`, () => {
    return HttpResponse.json(
      createSuccessResponse([
        {
          id: 'group-1',
          name: 'Team A',
          description: 'Engineering Team A',
          status: 'ACTIVE' as const,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ])
    );
  }),

  http.get(`${API_BASE}/groups/:id`, ({ params }) => {
    return HttpResponse.json(
      createSuccessResponse({
        id: params.id,
        name: 'Team A',
        description: 'Engineering Team A',
        status: 'ACTIVE' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      })
    );
  }),

  http.get(`${API_BASE}/sites`, () => {
    return HttpResponse.json(
      createSuccessResponse({
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
      })
    );
  }),

  http.get(`${API_BASE}/configs/sla-configs`, () => {
    return HttpResponse.json(
      createSuccessResponse([
        {
          id: 'sla-1',
          priority: 'P1' as const,
          responseTimeMinutes: 30,
          completionTimeHours: 4,
        },
      ])
    );
  }),

  http.get(`${API_BASE}/configs/site-level-configs`, () => {
    return HttpResponse.json(
      createSuccessResponse([
        {
          id: 'slc-1',
          levelName: 'A',
          description: 'Level A sites',
          maxConcurrentTickets: 10,
          escalationTimeHours: 4,
        },
      ])
    );
  }),

  http.get(`${API_BASE}/configs/problem-types`, () => {
    return HttpResponse.json(
      createSuccessResponse([
        {
          id: 'pt-1',
          name: 'Hardware Issue',
          description: 'Hardware related problems',
        },
      ])
    );
  }),

  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json(
      createSuccessResponse({ status: 'UP', version: '1.0.0' })
    );
  }),

  http.delete(`${API_BASE}/users/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE}/users/:id`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(createSuccessResponse({ id: '1', ...body }));
  }),

  http.delete(`${API_BASE}/groups/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE}/groups/:id`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(createSuccessResponse({ id: 'group-1', ...body }));
  }),

  http.delete(`${API_BASE}/sites/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE}/sites/:id`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(createSuccessResponse({ id: 'site-1', ...body }));
  }),

  http.delete(`${API_BASE}/templates/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE}/templates/:id`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(createSuccessResponse({ id: 'tpl-1', ...body }));
  }),

  http.post(`${API_BASE}/tickets/:id/decline`, async ({ request, params }) => {
    return HttpResponse.json(
      createSuccessResponse({ id: params.id, status: 'DECLINED' })
    );
  }),

  http.post(`${API_BASE}/tickets/:id/cancel`, async ({ request, params }) => {
    return HttpResponse.json(
      createSuccessResponse({ id: params.id, status: 'CANCELLED' })
    );
  }),

  http.post(`${API_BASE}/tickets/:id/depart`, async ({ request, params }) => {
    return HttpResponse.json(
      createSuccessResponse({ id: params.id, status: 'IN_PROGRESS', departureAt: new Date().toISOString() })
    );
  }),

  http.post(`${API_BASE}/tickets/:id/arrive`, async ({ request, params }) => {
    return HttpResponse.json(
      createSuccessResponse({ id: params.id, status: 'IN_PROGRESS', arrivalAt: new Date().toISOString() })
    );
  }),

  http.post(`${API_BASE}/tickets/:id/submit`, async ({ request, params }) => {
    return HttpResponse.json(
      createSuccessResponse({ id: params.id, status: 'SUBMITTED' })
    );
  }),

  http.post(`${API_BASE}/tickets/:id/review`, async ({ request, params }) => {
    return HttpResponse.json(
      createSuccessResponse({ id: params.id, status: 'COMPLETED' })
    );
  }),

  http.get(`${API_BASE}/tickets/:ticketId/comments`, () => {
    return HttpResponse.json(createSuccessResponse([]));
  }),

  http.post(`${API_BASE}/tickets/:ticketId/comments`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      createSuccessResponse({
        id: `comment-${Date.now()}`,
        ...body,
        userId: '1',
        userName: 'Test User',
        createdAt: new Date().toISOString(),
      })
    );
  }),

  http.get(`${API_BASE}/tickets/my`, () => {
    return HttpResponse.json(
      createSuccessResponse({
        records: mockTickets,
        total: mockTickets.length,
        current: 1,
        size: 20,
        hasNext: false,
      })
    );
  }),

  http.get(`${API_BASE}/tickets/pending`, () => {
    return HttpResponse.json(createSuccessResponse(mockTickets));
  }),

  http.get(`${API_BASE}/tickets/completed`, () => {
    return HttpResponse.json(
      createSuccessResponse({
        records: [],
        total: 0,
        current: 1,
        size: 20,
        hasNext: false,
      })
    );
  }),

  http.get(`${API_BASE}/tickets/stats`, () => {
    return HttpResponse.json(
      createSuccessResponse({
        total: 10,
        open: 3,
        inProgress: 4,
        submitted: 1,
        completed: 2,
        onHold: 0,
      })
    );
  }),

  http.post(`${API_BASE}/files/upload`, async () => {
    return HttpResponse.json(
      createSuccessResponse({
        id: 'file-1',
        url: 'https://example.com/files/photo.jpg',
        name: 'photo.jpg',
        type: 'image/jpeg',
        size: 102400,
      })
    );
  }),

  http.delete(`${API_BASE}/files/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API_BASE}/configs/sla-configs/:id`, () => {
    return HttpResponse.json(
      createSuccessResponse({
        id: 'sla-1',
        priority: 'P1' as const,
        responseTimeMinutes: 30,
        completionTimeHours: 4,
      })
    );
  }),

  http.post(`${API_BASE}/configs/sla-configs`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(createSuccessResponse({ id: 'sla-new', ...body }));
  }),

  http.delete(`${API_BASE}/configs/sla-configs/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE}/configs/problem-types`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(createSuccessResponse({ id: 'pt-new', ...body }));
  }),

  http.post(`${API_BASE}/configs/problem-types/:id`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(createSuccessResponse({ id: 'pt-1', ...body }));
  }),

  http.delete(`${API_BASE}/configs/problem-types/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE}/configs/site-level-configs`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(createSuccessResponse({ id: 'slc-new', ...body }));
  }),

  http.post(`${API_BASE}/configs/site-level-configs/:id`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(createSuccessResponse({ id: 'slc-1', ...body }));
  }),

  http.delete(`${API_BASE}/configs/site-level-configs/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch(`${API_BASE}/users/:id/countries`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(createSuccessResponse({ id: '1', ...body }));
  }),

  http.get(`${API_BASE}/groups/:groupId/members`, () => {
    return HttpResponse.json(createSuccessResponse([mockUser]));
  }),

  http.get(`${API_BASE}/sites/stats`, () => {
    return HttpResponse.json(
      createSuccessResponse({
        totalSites: 100,
        onlineSites: 80,
        offlineSites: 15,
        vipSites: 5,
      })
    );
  }),
];
