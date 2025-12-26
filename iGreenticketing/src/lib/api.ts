/**
 * API Client for iGreen+ Ticketing System
 * 连接到统一后端API
 */
import type { User, Template, Ticket, Group, Site } from "./types";

// Backend API Base URL
// 请根据实际部署情况修改此URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Fetch with authentication
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${errorText}`);
  }

  return response.json();
}

export const api = {
  // ========== Authentication ==========
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('auth_token', data.access_token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  // ========== Users ==========
  getUsers: async (): Promise<User[]> => {
    return fetchWithAuth('/api/users');
  },

  getUser: async (id: string): Promise<User> => {
    return fetchWithAuth(`/api/users/${id}`);
  },

  createUser: async (user: Partial<User>): Promise<User> => {
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

  getCurrentUser: async (): Promise<User> => {
    return fetchWithAuth('/api/users/me');
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

  // ========== Sites ==========
  getSites: async (): Promise<Site[]> => {
    return fetchWithAuth('/api/sites');
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

  createTemplate: async (template: Partial<Template>): Promise<Template> => {
    return fetchWithAuth('/api/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  },

  updateTemplate: async (id: string, updates: Partial<Template>): Promise<Template> => {
    return fetchWithAuth(`/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteTemplate: async (id: string): Promise<void> => {
    return fetchWithAuth(`/api/templates/${id}`, {
      method: 'DELETE',
    });
  },

  // ========== Tickets ==========
  getTickets: async (params?: {
    status?: string;
    assignedTo?: string;
    createdBy?: string;
    type?: string;
  }): Promise<Ticket[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.assignedTo) queryParams.append('assigned_to', params.assignedTo);
    if (params?.createdBy) queryParams.append('created_by', params.createdBy);
    if (params?.type) queryParams.append('type', params.type);

    const url = queryParams.toString()
      ? `/api/tickets?${queryParams}`
      : '/api/tickets';

    return fetchWithAuth(url);
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

  addComment: async (ticketId: string, comment: string, type = "general") => {
    return fetchWithAuth(`/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, type }),
    });
  },

  // ========== File Upload ==========
  uploadFile: async (file: File, fieldType?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (fieldType) {
      formData.append('field_type', fieldType);
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

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    return response.json();
  },

  // ========== Configurations ==========
  getSLAConfigs: async () => {
    return fetchWithAuth('/api/configs/sla');
  },

  getSiteLevelConfigs: async () => {
    return fetchWithAuth('/api/configs/site-levels');
  },

  getProblemTypes: async () => {
    return fetchWithAuth('/api/configs/problem-types');
  },
};

export default api;
