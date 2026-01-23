/**
 * API Client for iGreen+ Backend
 * 连接到统一后端API
 */
import { Ticket } from './data';

// Backend API Base URL
// 请根据实际部署情况修改此URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

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
  // Authentication
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

  // Tickets
  getTickets: async (offset = 0, limit = 50): Promise<Ticket[]> => {
    return fetchWithAuth(`/api/tickets?offset=${offset}&limit=${limit}`);
  },

  getTicket: async (id: string): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}`);
  },

  updateTicket: async (id: string, updates: Partial<Ticket>): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  acceptTicket: async (id: string, comment?: string) => {
    return fetchWithAuth(`/api/tickets/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  declineTicket: async (id: string, comment: string) => {
    return fetchWithAuth(`/api/tickets/${id}/decline`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  // File upload
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

  // Users
  getCurrentUser: async () => {
    return fetchWithAuth('/api/users/me');
  },

  // For demo/development - seed tickets
  seedTickets: async () => {
    return fetchWithAuth('/api/seed', {
      method: 'POST',
    });
  }
};
