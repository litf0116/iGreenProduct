import type { Ticket, UserProfile, TicketStatus, TicketPriority, TicketType } from '@/types/ticket';

// API base URL - 使用代理路径避免跨域问题
// Vite 开发服务器会将 /api 请求代理到后端服务器
const API_BASE_URL = ''; // 空字符串表示相对路径，通过 Vite 代理

export function getBaseUrl(): string {
  return API_BASE_URL;
}

function getAuthToken(): string | null {
  try {
    return uni.getStorageSync('auth_token');
  } catch {
    return null;
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    try {
      uni.removeStorageSync('auth_token');
      uni.removeStorageSync('user');
      uni.reLaunch({ url: '/pages/login/index' });
    } catch {
      console.error('Failed to clear storage');
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error: ${response.status} ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export const api = {
  async login(username: string, password: string): Promise<{ access_token: string; user: UserProfile }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Login failed: ${errorText}`);
    }

    // 后端返回格式: { code: "200", data: { accessToken, refreshToken, expiresIn }, message: "Success" }
    const result = await response.json();
    
    if (result.code !== 0 && result.code !== "200" || !result.data) {
      throw new Error(result.message || 'Login failed');
    }

    const { accessToken } = result.data;
    uni.setStorageSync('auth_token', accessToken);

    // 获取当前用户信息
    const user = await this.getCurrentUser();
    uni.setStorageSync('user', user);

    return { access_token: accessToken, user };
  },

  logout() {
    try {
      uni.removeStorageSync('auth_token');
      uni.removeStorageSync('user');
    } catch {
      console.error('Failed to clear storage');
    }
  },

  async getCurrentUser(): Promise<UserProfile> {
    return fetchWithAuth('/api/users/me');
  },

  async getTickets(params: {
    page?: number;
    size?: number;
    type?: TicketType;
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
    keyword?: string;
  } = {}): Promise<{ records: Ticket[]; total: number; current: number; size: number; hasNext: boolean }> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String((params.page ?? 0) + 1));
    queryParams.append('size', String(params.size ?? 20));
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    if (params.keyword) queryParams.append('keyword', params.keyword);

    return fetchWithAuth(`/api/tickets?${queryParams}`);
  },

  async getTicket(id: string): Promise<Ticket> {
    return fetchWithAuth(`/api/tickets/${id}`);
  },

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    return fetchWithAuth(`/api/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async acceptTicket(id: string, comment?: string): Promise<Ticket> {
    return fetchWithAuth(`/api/tickets/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  async declineTicket(id: string, reason: string): Promise<Ticket> {
    return fetchWithAuth(`/api/tickets/${id}/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async departTicket(id: string, departurePhoto?: string): Promise<Ticket> {
    return fetchWithAuth(`/api/tickets/${id}/depart`, {
      method: 'POST',
      body: JSON.stringify(departurePhoto),
    });
  },

  async arriveTicket(id: string, arrivalPhoto?: string): Promise<Ticket> {
    return fetchWithAuth(`/api/tickets/${id}/arrive`, {
      method: 'POST',
      body: JSON.stringify(arrivalPhoto),
    });
  },

  async submitTicket(id: string, stepData: Record<string, any>): Promise<Ticket> {
    return fetchWithAuth(`/api/tickets/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ data: stepData }),
    });
  },

  async completeTicket(id: string, completionPhoto?: string): Promise<Ticket> {
    return fetchWithAuth(`/api/tickets/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(completionPhoto),
    });
  },

  async getMyTickets(status?: string): Promise<{ records: Ticket[]; total: number }> {
    const params = new URLSearchParams();
    params.append('page', '1');
    params.append('size', '100');
    if (status) params.append('status', status);
    return fetchWithAuth(`/api/tickets/my?${params}`);
  },

  async getPendingTickets(): Promise<Ticket[]> {
    return fetchWithAuth('/api/tickets/pending');
  },

  async getCompletedTickets(page = 1, size = 20): Promise<{ records: Ticket[]; total: number }> {
    return fetchWithAuth(`/api/tickets/completed?page=${page}&size=${size}`);
  },

  async getTicketStats(): Promise<{ total: number; open: number; inProgress: number; completed: number }> {
    return fetchWithAuth('/api/tickets/stats');
  },

  async getTicketComments(id: string): Promise<any[]> {
    return fetchWithAuth(`/api/tickets/${id}/comments`);
  },

  async addTicketComment(id: string, comment: string, type: string = 'COMMENT'): Promise<any> {
    return fetchWithAuth(`/api/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, type }),
    });
  },

  async uploadFile(file: UniApp.UploadFileOption): Promise<{ id: string; url: string; name: string; type: string; size: number }> {
    const token = getAuthToken();
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: `${API_BASE_URL}/api/files/upload`,
        filePath: file.filePath,
        name: 'file',
        header: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        success: (res) => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(res.data));
            } catch {
              reject(new Error('Invalid response'));
            }
          } else {
            reject(new Error(`Upload failed: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          reject(err);
        },
      });
    });
  },
};
