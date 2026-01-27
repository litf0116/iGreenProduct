/**
 * API Client for iGreen+ Ticketing System
 * 连接到 Spring Boot 后端API
 * 使用 Ky HTTP 客户端，支持双token认证和自动刷新
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
  TokenResponse,
  PageParams,
  TicketStatsResponse,
  UserCreateRequest,
  UserUpdateRequest,
  GroupCreateRequest,
  GroupUpdateRequest,
  SiteCreateRequest,
  SiteUpdateRequest,
  SLAConfigRequest,
  ProblemTypeRequest,
  SiteLevelConfigRequest,
} from './types';
import { DEFAULT_PAGE_SIZE } from './types';
import { kyInstance, ky } from './kyInstance';
import {
  getAuthToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from './authToken';

async function handleTokenRefresh(): Promise<string> {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  const response = await kyInstance.post('api/auth/refresh', {
    json: { refreshToken: refreshTokenValue },
  });

  const result = await response.json<TokenResponse>();
  setTokens(result);
  return result.accessToken;
}

export const api = {
  login: async (username: string, password: string, country: string): Promise<TokenResponse> => {
    const response = await kyInstance.post('api/auth/login', {
      json: { username, password, country },
    });
    const result = await response.json<TokenResponse>();
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
  }): Promise<TokenResponse> => {
    const response = await kyInstance.post('api/auth/register', {
      json: data,
    });
    const result = await response.json<TokenResponse>();
    setTokens(result);
    return result;
  },

  logout: (): void => {
    clearTokens();
  },

  getCurrentUser: async (): Promise<User> => {
    return kyInstance.get('api/auth/me').json<User>();
  },

  refreshTokenToken: async (): Promise<TokenResponse> => {
    const newAccessToken = await handleTokenRefresh();
    return {
      accessToken: newAccessToken,
      refreshToken: getRefreshToken()!,
      expiresIn: 7200000,
      tokenType: 'Bearer',
    };
  },

  getUsers: async (params?: PageParams & { keyword?: string }): Promise<{ records: User[]; total: number; current: number; size: number; hasNext: boolean }> => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String((params?.page ?? 0) + 1));
    searchParams.set('size', String(params?.size ?? DEFAULT_PAGE_SIZE));
    if (params?.keyword) searchParams.set('keyword', params.keyword);
    return kyInstance.get(`api/users?${searchParams}`).json();
  },

  getUser: async (id: string): Promise<User> => {
    return kyInstance.get(`api/users/${id}`).json<User>();
  },

  createUser: async (user: UserCreateRequest): Promise<User> => {
    return kyInstance.post('api/users', { json: user }).json<User>();
  },

  updateUser: async (id: string, updates: UserUpdateRequest): Promise<User> => {
    return kyInstance.post(`api/users/${id}`, { json: updates }).json<User>();
  },

  deleteUser: async (id: string): Promise<void> => {
    await kyInstance.delete(`api/users/${id}`);
  },

  updateUserCountries: async (id: string, country: string): Promise<User> => {
    return kyInstance.patch(`api/users/${id}/countries`, { json: { country } }).json<User>();
  },

  getEngineers: async (): Promise<User[]> => {
    const response = await kyInstance.get('api/users/engineers').json<{ data: { records: User[] } }>();
    return response.data.records;
  },

  getGroups: async (): Promise<Group[]> => {
    const response = await kyInstance.get('api/groups').json<{ data: { records: Group[] } }>();
    return response.data.records;
  },

  getGroup: async (id: string): Promise<Group> => {
    return kyInstance.get(`api/groups/${id}`).json<Group>();
  },

  createGroup: async (group: GroupCreateRequest): Promise<Group> => {
    return kyInstance.post('api/groups', { json: group }).json<Group>();
  },

  updateGroup: async (id: string, updates: GroupUpdateRequest): Promise<Group> => {
    return kyInstance.put(`api/groups/${id}`, { json: updates }).json<Group>();
  },

  deleteGroup: async (id: string): Promise<void> => {
    await kyInstance.delete(`api/groups/${id}`);
  },

  getGroupMembers: async (groupId: string): Promise<User[]> => {
    return kyInstance.get(`api/groups/${groupId}/members`).json<User[]>();
  },

  getSites: async (params?: PageParams & { keyword?: string; level?: string; status?: string }): Promise<{ records: Site[]; total: number; current: number; size: number; hasNext: boolean }> => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String((params?.page ?? 0) + 1));
    searchParams.set('size', String(params?.size ?? DEFAULT_PAGE_SIZE));
    if (params?.keyword) searchParams.set('keyword', params.keyword);
    if (params?.level) searchParams.set('level', params.level);
    if (params?.status) searchParams.set('status', params.status);
    return kyInstance.get(`api/sites?${searchParams}`).json();
  },

  getSite: async (id: string): Promise<Site> => {
    return kyInstance.get(`api/sites/${id}`).json<Site>();
  },

  createSite: async (site: SiteCreateRequest): Promise<Site> => {
    return kyInstance.post('api/sites', { json: site }).json<Site>();
  },

  updateSite: async (id: string, updates: SiteUpdateRequest): Promise<Site> => {
    return kyInstance.post(`api/sites/${id}`, { json: updates }).json<Site>();
  },

  deleteSite: async (id: string): Promise<void> => {
    await kyInstance.delete(`api/sites/${id}`);
  },

  getSiteStats: async (): Promise<{ totalSites: number; onlineSites: number; offlineSites: number; vipSites: number }> => {
    return kyInstance.get('api/sites/stats').json();
  },

  getTemplates: async (): Promise<Template[]> => {
    const response = await kyInstance.get('api/templates').json<{ data: { records: Template[] } }>();
    return response.data.records;
  },

  getTemplate: async (id: string): Promise<Template> => {
    return kyInstance.get(`api/templates/${id}`).json<Template>();
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
    return kyInstance.post('api/templates', { json: template }).json<Template>();
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
    return kyInstance.put(`api/templates/${id}`, { json: template }).json<Template>();
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await kyInstance.delete(`api/templates/${id}`);
  },

  getTickets: async (params?: PageParams & { type?: string; status?: string; priority?: string; assignedTo?: string; keyword?: string; createdAfter?: string }): Promise<{ records: Ticket[]; total: number; current: number; size: number; hasNext: boolean }> => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String((params?.page ?? 0) + 1));
    searchParams.set('size', String(params?.size ?? DEFAULT_PAGE_SIZE));
    if (params?.type) searchParams.set('type', params.type);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.assignedTo) searchParams.set('assignedTo', params.assignedTo);
    if (params?.keyword) searchParams.set('keyword', params.keyword);
    if (params?.createdAfter) searchParams.set('createdAfter', params.createdAfter);
    return kyInstance.get(`api/tickets?${searchParams}`).json();
  },

  getTicket: async (id: string): Promise<Ticket> => {
    return kyInstance.get(`api/tickets/${id}`).json<Ticket>();
  },

  createTicket: async (ticket: Partial<Ticket>): Promise<Ticket> => {
    return kyInstance.post('api/tickets', { json: ticket }).json<Ticket>();
  },

  updateTicket: async (id: string, updates: Partial<Ticket>): Promise<Ticket> => {
    return kyInstance.put(`api/tickets/${id}`, { json: updates }).json<Ticket>();
  },

  deleteTicket: async (id: string): Promise<void> => {
    await kyInstance.delete(`api/tickets/${id}`);
  },

  acceptTicket: async (id: string, comment?: string): Promise<Ticket> => {
    return kyInstance.post(`api/tickets/${id}/accept`, { json: { comment } }).json<Ticket>();
  },

  declineTicket: async (id: string, reason: string): Promise<Ticket> => {
    return kyInstance.post(`api/tickets/${id}/decline`, { json: { reason } }).json<Ticket>();
  },

  cancelTicket: async (id: string, reason: string): Promise<Ticket> => {
    return kyInstance.post(`api/tickets/${id}/cancel`, { json: { reason } }).json<Ticket>();
  },

  departTicket: async (id: string, departurePhoto?: string): Promise<Ticket> => {
    return kyInstance.post(`api/tickets/${id}/depart`, { json: { departurePhoto } }).json<Ticket>();
  },

  arriveTicket: async (id: string, arrivalPhoto?: string): Promise<Ticket> => {
    return kyInstance.post(`api/tickets/${id}/arrive`, { json: { arrivalPhoto } }).json<Ticket>();
  },

  submitTicket: async (id: string, stepData: Record<string, any>): Promise<Ticket> => {
    return kyInstance.post(`api/tickets/${id}/submit`, { json: { data: stepData } }).json<Ticket>();
  },

  completeTicket: async (id: string, completionPhoto?: string): Promise<Ticket> => {
    return kyInstance.post(`api/tickets/${id}/complete`, { json: { completionPhoto } }).json<Ticket>();
  },

  reviewTicket: async (id: string, cause?: string): Promise<Ticket> => {
    return kyInstance.post(`api/tickets/${id}/review`, { json: { cause } }).json<Ticket>();
  },

  getTicketComments: async (ticketId: string): Promise<TicketComment[]> => {
    const response = await kyInstance.get(`api/tickets/${ticketId}/comments`).json<{ data: { records: TicketComment[] } }>();
    return response.data.records;
  },

  addComment: async (
    ticketId: string,
    comment: string,
    type: string = 'GENERAL'
  ): Promise<TicketComment> => {
    return kyInstance.post(`api/tickets/${ticketId}/comments`, { json: { comment, type } }).json<TicketComment>();
  },

  getMyTickets: async (params?: { page?: number; size?: number; status?: string }): Promise<{ records: Ticket[]; total: number; current: number; size: number; hasNext: boolean }> => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String((params?.page ?? 0) + 1));
    searchParams.set('size', String(params?.size ?? 20));
    if (params?.status) searchParams.set('status', params.status);
    return kyInstance.get(`api/tickets/my?${searchParams}`).json();
  },

  getPendingTickets: async (): Promise<Ticket[]> => {
    const response = await kyInstance.get('api/tickets/pending').json<{ data: { records: Ticket[] } }>();
    return response.data.records;
  },

  getCompletedTickets: async (params?: { page?: number; size?: number }): Promise<{ records: Ticket[]; total: number; current: number; size: number; hasNext: boolean }> => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String((params?.page ?? 0) + 1));
    searchParams.set('size', String(params?.size ?? 20));
    return kyInstance.get(`api/tickets/completed?${searchParams}`).json();
  },

  getTicketStats: async (type?: string): Promise<TicketStatsResponse> => {
    const searchParams = new URLSearchParams();
    if (type) searchParams.set('type', type);
    return kyInstance.get(`api/tickets/stats?${searchParams}`).json<TicketStatsResponse>();
  },

  uploadFile: async (file: File, fieldType?: string): Promise<{ id: string; url: string; name: string; type: string; size: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (fieldType) {
      formData.append('fieldType', fieldType);
    }

    const response = await kyInstance.post('api/files/upload', {
      body: formData,
    });

    const result = await response.json<{ success: boolean; data: { id: string; url: string; name: string; type: string; size: number }; message: string }>();
    return result.data;
  },

  deleteFile: async (id: string): Promise<void> => {
    await kyInstance.delete(`api/files/${id}`);
  },

  getSLAConfigs: async (): Promise<SLAConfig[]> => {
    const response = await kyInstance.get('api/configs/sla-configs').json<{ data: { records: SLAConfig[] } }>();
    return response.data.records;
  },

  getSLAConfig: async (id: string): Promise<SLAConfig> => {
    return kyInstance.get(`api/configs/sla-configs/${id}`).json<SLAConfig>();
  },

  saveSLAConfig: async (config: SLAConfigRequest): Promise<SLAConfig> => {
    return kyInstance.post('api/configs/sla-configs', { json: config }).json<SLAConfig>();
  },

  deleteSLAConfig: async (id: string): Promise<void> => {
    await kyInstance.delete(`api/configs/sla-configs/${id}`);
  },

  getProblemTypes: async (): Promise<ProblemType[]> => {
    const response = await kyInstance.get('api/configs/problem-types').json<{ data: { records: ProblemType[] } }>();
    return response.data.records;
  },

  createProblemType: async (type: ProblemTypeRequest): Promise<ProblemType> => {
    return kyInstance.post('api/configs/problem-types', { json: type }).json<ProblemType>();
  },

  updateProblemType: async (id: string, updates: ProblemTypeRequest): Promise<ProblemType> => {
    return kyInstance.post(`api/configs/problem-types/${id}`, { json: updates }).json<ProblemType>();
  },

  deleteProblemType: async (id: string): Promise<void> => {
    await kyInstance.delete(`api/configs/problem-types/${id}`);
  },

  getSiteLevelConfigs: async (): Promise<SiteLevelConfig[]> => {
    const response = await kyInstance.get('api/configs/site-level-configs').json<{ data: { records: SiteLevelConfig[] } }>();
    return response.data.records;
  },

  createSiteLevelConfig: async (config: SiteLevelConfigRequest): Promise<SiteLevelConfig> => {
    return kyInstance.post('api/configs/site-level-configs', { json: config }).json<SiteLevelConfig>();
  },

  updateSiteLevelConfig: async (id: string, updates: SiteLevelConfigRequest): Promise<SiteLevelConfig> => {
    return kyInstance.post(`api/configs/site-level-configs/${id}`, { json: updates }).json<SiteLevelConfig>();
  },

  deleteSiteLevelConfig: async (id: string): Promise<void> => {
    await kyInstance.delete(`api/configs/site-level-configs/${id}`);
  },

  healthCheck: async (): Promise<{ status: string; version: string }> => {
    return kyInstance.get('api/health').json();
  },
};

export default api;
