/**
 * API Client for iGreen+ Ticketing System
 * 连接到 Spring Boot 后端API
 * 支持双token认证（Access Token + Refresh Token）
 */
import type {
  User,
  Template,
  Ticket,
  Group,
  Site,
  TicketComment,
  SLAConfig,
  ProblemType,
  SiteLevelConfig,
  TemplateStep,
  TemplateField,
  TokenResponse,
  PageParams,
  PageResult,
  TicketStatsResponse,
} from "./types";
import { DEFAULT_PAGE_SIZE } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Token 存储键
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRES_AT: 'token_expires_at',
};

function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
  if (!expiresAt) return true;
  return Date.now() >= parseInt(expiresAt);
}

function setTokens(tokens: TokenResponse) {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  // 设置过期时间（当前时间 + expiresIn，提前5分钟刷新）
  const expiresAt = Date.now() + (tokens.expiresIn * 1000) - (5 * 60 * 1000);
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, String(expiresAt));
}

function clearTokens() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: string;
}

interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
  hasNext: boolean;
}

// 标记是否正在刷新 token，防止并发刷新
let isRefreshing = false;
// 存储等待刷新完成的回调
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

async function refreshToken(): Promise<string> {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });

  if (!response.ok) {
    throw new Error(`Refresh failed: ${response.status}`);
  }

  const result: ApiResponse<TokenResponse> = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Refresh failed');
  }

  setTokens(result.data);
  return result.data.accessToken;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      // Token 过期，尝试刷新
      const newToken = await attemptTokenRefresh();
      if (newToken) {
        // 刷新成功，重试原请求
        const originalRequest = response.headers.get('X-Retry-Original-URL');
        if (originalRequest) {
          const retryResponse = await fetch(`${API_BASE_URL}${originalRequest}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`,
            },
          });
          return handleResponse<T>(retryResponse);
        }
      }

      // 刷新失败，清除 token 并跳转登录
      clearTokens();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${errorText}`);
  }
  const result: ApiResponse<T> = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'API Error');
  }
  return result.data;
}

async function attemptTokenRefresh(): Promise<string | null> {
  if (isRefreshing) {
    // 如果正在刷新，等待刷新完成
    return new Promise((resolve) => {
      addRefreshSubscriber((token) => resolve(token));
    });
  }

  isRefreshing = true;
  try {
    const newToken = await refreshToken();
    isRefreshing = false;
    onRefreshed(newToken);
    return newToken;
  } catch (error) {
    isRefreshing = false;
    clearTokens();
    return null;
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  let token = getAuthToken();

  // 检查 token 是否即将过期，提前刷新
  if (token && isTokenExpired() && getRefreshToken()) {
    token = await attemptTokenRefresh();
    if (!token) {
      throw new Error('Token refresh failed');
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 记录原始请求 URL，用于 401 重试
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // 如果 401，在响应头标记原始 URL
  if (response.status === 401) {
    const clonedResponse = response.clone();
    const newResponse = new Response(clonedResponse.body, {
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
      headers: {
        ...Object.fromEntries(clonedResponse.headers.entries()),
        'X-Retry-Original-URL': url,
      },
    });
    return handleResponse(newResponse);
  }

  return handleResponse(response);
}

export const api = {
  // ========== Authentication ==========
  login: async (username: string, password: string, country: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, country }),
    });

    const result = await handleResponse<TokenResponse>(response);
    setTokens(result);
    return result;
  },

  register: async (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    role?: string;
    country?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<TokenResponse>(response);
    setTokens(result);
    return result;
  },

  logout: () => {
    clearTokens();
  },

  getCurrentUser: async (): Promise<User> => {
    return fetchWithAuth('/api/auth/me');
  },

  // 手动刷新 token
  refreshTokenToken: async (): Promise<TokenResponse> => {
    const newAccessToken = await refreshToken();
    return {
      accessToken: newAccessToken,
      refreshToken: getRefreshToken()!,
      expiresIn: 7200000,
      tokenType: 'Bearer',
    };
  },

  // ========== Users ==========
  getUsers: async (params?: PageParams & {
    keyword?: string;
  }): Promise<PageResult<User>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(params?.page ?? 0));
    queryParams.append('size', String(params?.size ?? DEFAULT_PAGE_SIZE));
    if (params?.keyword) queryParams.append('keyword', params.keyword);

    return fetchWithAuth(`/api/users?${queryParams}`);
  },

  getUser: async (id: string): Promise<User> => {
    return fetchWithAuth(`/api/users/${id}`);
  },

  createUser: async (user: Partial<User> & { password?: string }): Promise<User> => {
    return fetchWithAuth('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    return fetchWithAuth(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteUser: async (id: string): Promise<void> => {
    return fetchWithAuth(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },

  getEngineers: async (): Promise<User[]> => {
    return fetchWithAuth('/api/users/engineers');
  },

  // ========== Groups ==========
  getGroups: async (): Promise<Group[]> => {
    return fetchWithAuth('/api/groups');
  },

  getGroup: async (id: string): Promise<Group> => {
    return fetchWithAuth(`/api/groups/${id}`);
  },

  createGroup: async (group: Partial<Group>): Promise<Group> => {
    return fetchWithAuth('/api/groups', {
      method: 'POST',
      body: JSON.stringify(group),
    });
  },

  updateGroup: async (id: string, updates: Partial<Group>): Promise<Group> => {
    return fetchWithAuth(`/api/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteGroup: async (id: string): Promise<void> => {
    return fetchWithAuth(`/api/groups/${id}`, {
      method: 'DELETE',
    });
  },

  getGroupMembers: async (groupId: string): Promise<User[]> => {
    return fetchWithAuth(`/api/groups/${groupId}/members`);
  },

  // ========== Sites ==========
  getSites: async (params?: PageParams & {
    keyword?: string;
  }): Promise<PageResult<Site>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(params?.page ?? 0));
    queryParams.append('size', String(params?.size ?? DEFAULT_PAGE_SIZE));
    if (params?.keyword) queryParams.append('keyword', params.keyword);

    return fetchWithAuth(`/api/sites?${queryParams}`);
  },

  getSite: async (id: string): Promise<Site> => {
    return fetchWithAuth(`/api/sites/${id}`);
  },

  createSite: async (site: Partial<Site>): Promise<Site> => {
    return fetchWithAuth('/api/sites', {
      method: 'POST',
      body: JSON.stringify(site),
    });
  },

  updateSite: async (id: string, updates: Partial<Site>): Promise<Site> => {
    return fetchWithAuth(`/api/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteSite: async (id: string): Promise<void> => {
    return fetchWithAuth(`/api/sites/${id}`, {
      method: 'DELETE',
    });
  },

  // ========== Templates ==========
  getTemplates: async (): Promise<Template[]> => {
    return fetchWithAuth('/api/templates');
  },

  getTemplate: async (id: string): Promise<Template> => {
    return fetchWithAuth(`/api/templates/${id}`);
  },

  createTemplate: async (template: {
    name: string;
    description?: string;
    steps?: Array<{
      name: string;
      description?: string;
      order?: number;
      fields?: Array<{
        name: string;
        type: string;
        required?: boolean;
        options?: string;
      }>;
    }>;
  }): Promise<Template> => {
    return fetchWithAuth('/api/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  },

  updateTemplate: async (id: string, template: {
    name?: string;
    description?: string;
    steps?: Array<{
      name: string;
      description?: string;
      order?: number;
      fields?: Array<{
        name: string;
        type: string;
        required?: boolean;
        options?: string;
      }>;
    }>;
  }): Promise<Template> => {
    return fetchWithAuth(`/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  },

  deleteTemplate: async (id: string): Promise<void> => {
    return fetchWithAuth(`/api/templates/${id}`, {
      method: 'DELETE',
    });
  },

  // ========== Tickets ==========
  getTickets: async (params?: PageParams & {
    type?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    keyword?: string;
  }): Promise<PageResult<Ticket>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(params?.page ?? 0));
    queryParams.append('size', String(params?.size ?? DEFAULT_PAGE_SIZE));
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    if (params?.keyword) queryParams.append('keyword', params.keyword);

    return fetchWithAuth(`/api/tickets?${queryParams}`);
  },

  getTicket: async (id: string): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}`);
  },

  createTicket: async (ticket: Partial<Ticket>): Promise<Ticket> => {
    return fetchWithAuth('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  },

  updateTicket: async (id: string, updates: Partial<Ticket>): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteTicket: async (id: string): Promise<void> => {
    return fetchWithAuth(`/api/tickets/${id}`, {
      method: 'DELETE',
    });
  },

  acceptTicket: async (id: string, comment?: string): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  declineTicket: async (id: string, reason: string): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  cancelTicket: async (id: string, reason: string): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  departTicket: async (id: string, departurePhoto?: string): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}/depart`, {
      method: 'POST',
      body: JSON.stringify({ departurePhoto }),
    });
  },

  arriveTicket: async (id: string, arrivalPhoto?: string): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}/arrive`, {
      method: 'POST',
      body: JSON.stringify({ arrivalPhoto }),
    });
  },

  submitTicket: async (id: string, stepData: Record<string, any>): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ data: stepData }),
    });
  },

  completeTicket: async (id: string, completionPhoto?: string): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ completionPhoto }),
    });
  },

  reviewTicket: async (id: string, cause?: string): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ cause }),
    });
  },

  getTicketComments: async (ticketId: string): Promise<TicketComment[]> => {
    return fetchWithAuth(`/api/tickets/${ticketId}/comments`);
  },

  addComment: async (
    ticketId: string,
    comment: string,
    type: string = "GENERAL"
  ): Promise<TicketComment> => {
    return fetchWithAuth(`/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, type }),
    });
  },

  getMyTickets: async (params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<PageResult<Ticket>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(params?.page ?? 0));
    queryParams.append('size', String(params?.size ?? 20));
    if (params?.status) queryParams.append('status', params.status);

    return fetchWithAuth(`/api/tickets/my?${queryParams}`);
  },

  getPendingTickets: async (): Promise<Ticket[]> => {
    return fetchWithAuth('/api/tickets/pending');
  },

  getCompletedTickets: async (params?: {
    page?: number;
    size?: number;
  }): Promise<PageResult<Ticket>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(params?.page ?? 0));
    queryParams.append('size', String(params?.size ?? 20));

    return fetchWithAuth(`/api/tickets/completed?${queryParams}`);
  },

  // ========== Ticket Stats ==========
  getTicketStats: async (type?: string): Promise<TicketStatsResponse> => {
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    return fetchWithAuth(`/api/tickets/stats?${queryParams}`);
  },

  // ========== File Upload ==========
  uploadFile: async (file: File, fieldType?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (fieldType) {
      formData.append('fieldType', fieldType);
    }

    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return handleResponse<{
      id: string;
      url: string;
      name: string;
      type: string;
      size: number;
    }>(response);
  },

  deleteFile: async (id: string): Promise<void> => {
    return fetchWithAuth(`/api/files/${id}`, {
      method: 'DELETE',
    });
  },

  // ========== Configurations ==========
  getSLAConfigs: async (): Promise<SLAConfig[]> => {
    return fetchWithAuth('/api/configs/sla-configs');
  },

  createSLAConfig: async (config: SLAConfigRequest): Promise<SLAConfig> => {
    return fetchWithAuth('/api/configs/sla-configs', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  deleteSLAConfig: async (id: string): Promise<void> => {
    return fetchWithAuth(`/api/configs/sla-configs/${id}`, {
      method: 'DELETE',
    });
  },

  getProblemTypes: async (): Promise<ProblemType[]> => {
    return fetchWithAuth('/api/configs/problem-types');
  },

  createProblemType: async (type: ProblemTypeRequest): Promise<ProblemType> => {
    return fetchWithAuth('/api/configs/problem-types', {
      method: 'POST',
      body: JSON.stringify(type),
    });
  },

  updateProblemType: async (
    id: string,
    updates: ProblemTypeRequest
  ): Promise<ProblemType> => {
    return fetchWithAuth(`/api/configs/problem-types/${id}`, {
      method: 'POST',
      body: JSON.stringify(updates),
    });
  },

  deleteProblemType: async (id: string): Promise<void> => {
    return fetchWithAuth(`/api/configs/problem-types/${id}`, {
      method: 'DELETE',
    });
  },

  getSiteLevelConfigs: async (): Promise<SiteLevelConfig[]> => {
    return fetchWithAuth('/api/configs/site-level-configs');
  },

  createSiteLevelConfig: async (
    config: SiteLevelConfigRequest
  ): Promise<SiteLevelConfig> => {
    return fetchWithAuth('/api/configs/site-level-configs', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  updateSiteLevelConfig: async (
    id: string,
    updates: SiteLevelConfigRequest
  ): Promise<SiteLevelConfig> => {
    return fetchWithAuth(`/api/configs/site-level-configs/${id}`, {
      method: 'POST',
      body: JSON.stringify(updates),
    });
  },

  deleteSiteLevelConfig: async (id: string): Promise<void> => {
    return fetchWithAuth(`/api/configs/site-level-configs/${id}`, {
      method: 'DELETE',
    });
  },

  // ========== Health Check ==========
  healthCheck: async (): Promise<{ status: string; version: string }> => {
    return fetchWithAuth('/api/health');
  },
};

export default api;
