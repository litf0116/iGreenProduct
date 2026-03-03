/**
 * API Client for iGreen+ Backend
 * 连接到统一后端API
 */
import { Ticket, TicketStatus, TicketPriority, TicketType, TicketStep, TicketTypeTemplateWithData } from './data';
import { getAuthToken, saveAuthToken, clearAuthToken } from './storage';

// Backend API Base URL
// 通过环境变量 VITE_API_URL 配置，默认为生产环境
// dev:local 脚本会自动设置 VITE_API_URL=http://127.0.0.1:8089
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://43.255.212.68:8088';

// 获取完整的图片 URL（处理相对路径）
export function getFullImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}


// Get auth token from storage (async wrapper for compatibility)
async function getAuthTokenAsync(): Promise<string | null> {
  return await getAuthToken();
}

  // 后端 TicketResponse 转换为前端 Ticket 格式
function transformTicket(backendTicket: any): Ticket {
  // 后端状态是英文大写，前端用小写
  // 后端状态: OPEN, ASSIGNED, ACCEPTED, DEPARTED, ARRIVED, REVIEW, COMPLETED, ON_HOLD, CANCELLED
  const statusMap: Record<string, string> = {
    'accepted': 'assigned',  // 后端 ACCEPTED 对应前端 assigned（已接单待出发）
  };
  const normalizedStatus = backendTicket.status?.toLowerCase();
  const mappedStatus = (statusMap[normalizedStatus] || normalizedStatus || 'open') as TicketStatus;

  return {
    id: backendTicket.id,
    title: backendTicket.title,
    description: backendTicket.description || '',
    status: mappedStatus,
    // 后端和前端都使用 P1, P2, P3, P4 优先级
    priority: mapBackendPriority(backendTicket.priority),
    type: mapBackendType(backendTicket.type),
    requester: backendTicket.createdByName || 'System',
    createdAt: backendTicket.createdAt,
    tags: [],
    assignee: backendTicket.assignedToName,
    location: backendTicket.siteName || backendTicket.site || backendTicket.assignedToName,
    siteId: backendTicket.siteId,
    siteName: backendTicket.siteName,
    siteAddress: backendTicket.siteAddress,
    steps: backendTicket.stepData?.data ? transformSteps(backendTicket.stepData.data) : [],
    history: {
      departedAt: backendTicket.departureAt,
      arrivedAt: backendTicket.arrivalAt,
      completedAt: backendTicket.completedAt,
    },
    rootCause: backendTicket.cause,
    solution: backendTicket.solution,
    beforePhotoUrls: [],
    afterPhotoUrls: [],
    feedback: backendTicket.feedback,
    feedbackPhotoUrls: [],
    estimatedResolutionTime: backendTicket.dueDate,
    problemPhotoUrls: [],
    relatedTicketId: backendTicket.relatedTicketIds?.[0],
    problemType: backendTicket.problemType,
    templateData: backendTicket.templateData || undefined,
  };
}

function mapBackendPriority(priority: string): TicketPriority {
  const map: Record<string, TicketPriority> = {
    'P1': 'P1',
    'P2': 'P2',
    'P3': 'P3',
    'P4': 'P4',
    'CRITICAL': 'P1',
    'HIGH': 'P2',
    'MEDIUM': 'P3',
    'LOW': 'P4',
  };
  return map[priority?.toUpperCase()] || 'P3';
}

function mapBackendType(type: string): TicketType {
  const map: Record<string, TicketType> = {
    'CORRECTIVE': 'corrective',
    'PREVENTIVE': 'preventive',
    'PLANNED': 'planned',
    'PROBLEM': 'problem',
    'MAINTENANCE': 'preventive',
  };
  return map[type?.toUpperCase()] || 'corrective';
}

function transformSteps(stepData: Record<string, any>): TicketStep[] {
  if (!stepData) return [];
  return Object.entries(stepData).map(([id, data]: [string, any]) => ({
    id,
    label: data.label || '',
    description: data.description,
    photoUrls: data.photoUrls || [],
    timestamp: data.timestamp,
    location: data.location,
    completed: data.status === 'pass' || data.status === 'na',
    status: data.status,
    cause: data.cause,
    beforePhotoUrls: data.beforePhotoUrls || [],
    afterPhotoUrls: data.afterPhotoUrls || [],
  }));
}

// Fetch with authentication
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getAuthTokenAsync();
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
      await clearAuthToken();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${errorText}`);
  }

  return response.json();
}


export interface PaginatedResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
  hasNext: boolean;
}

export const api = {
  // Authentication
  login: async (username: string, password: string) => {
    console.log('[API] Login request:', { username, apiUrl: API_BASE_URL });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('[API] Login response status:', response.status);

      const data = await response.json();
      console.log('[API] Login response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Login failed: ${response.status}`);
      }

      if (data.success && data.data) {
        await saveAuthToken(data.data.accessToken);
        return data.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('[API] Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    await clearAuthToken();
  },

  // Tickets - 后端使用 page/size 参数
  getTickets: async (page = 0, size = 20): Promise<any[]> => {
    const data = await fetchWithAuth(`/api/tickets?page=${page}&size=${size}`);
    // 后端返回格式: { success, data: { records: [], total, current, size, hasNext } }
    if (data.success && data.data && data.data.records) {
      return data.data.records;
    }
    return [];
  },

  // 获取待接单列表 (OPEN 状态的工单)
  getPendingTickets: async (): Promise<Ticket[]> => {
    const data = await fetchWithAuth('/api/tickets/pending');
    // 后端返回格式: { success, data: { records: [], total, current, size, hasNext } }
    if (data.success && data.data && data.data.records) {
      return data.data.records.map(transformTicket);
    }
    return [];
  },

  getTicketStats: async (): Promise<{total: number; open: number; inProgress: number; completed: number}> => {
    const data = await fetchWithAuth('/api/tickets/stats');
    if (data.success && data.data) {
      return {
        total: data.data.total || 0,
        open: data.data.open || 0,
        inProgress: data.data.inProgress || 0,
        completed: data.data.completed || 0
      };
    }
    return { total: 0, open: 0, inProgress: 0, completed: 0 };
  },
  // 获取我的工单
  getMyTickets: async (page = 1, size = 20, status?: string): Promise<PaginatedResult<Ticket>> => {
    let url = `/api/tickets/my?page=${page}&size=${size}`;
    if (status) {
      url += `&status=${status}`;
    }
    const data = await fetchWithAuth(url);
    if (data.success && data.data && data.data.records) {
      return {
        records: data.data.records.map(transformTicket),
        total: data.data.total || 0,
        current: data.data.current || page,
        size: data.data.size || size,
        hasNext: data.data.hasNext || false
      };
    }
    return { records: [], total: 0, current: page, size, hasNext: false };
  },

  // 获取已完成工单
  getCompletedTickets: async (page = 1, size = 20): Promise<PaginatedResult<Ticket>> => {
    const data = await fetchWithAuth(`/api/tickets/completed?page=${page}&size=${size}`);
    if (data.success && data.data && data.data.records) {
      return {
        records: data.data.records.map(transformTicket),
        total: data.data.total || 0,
        current: data.data.current || page,
        size: data.data.size || size,
        hasNext: data.data.hasNext || false
      };
    }
    return { records: [], total: 0, current: page, size, hasNext: false };
  },

  getTicket: async (id: string): Promise<Ticket> => {
    const data = await fetchWithAuth(`/api/tickets/${id}`);
    if (data.success && data.data) {
      return transformTicket(data.data);
    }
    throw new Error('Ticket not found');
  },

  updateTicket: async (id: string, updates: Partial<Ticket>): Promise<Ticket> => {
    // 后端 TicketUpdateRequest 只接受特定字段，需要过滤掉其他字段
    // 允许的字段列表：relatedTicketIds, dueDate, priority, site, assignedTo, arrivalAt, 
    // status, stepData, title, arrivalPhoto, type, description, departurePhoto, 
    // departureAt, cause, completionPhoto, solution, completedSteps
    const allowedFields = [
      'siteId', 'relatedTicketIds', 'dueDate', 'priority', 'site', 'assignedTo', 'arrivalAt',
      'status', 'stepData', 'title', 'arrivalPhoto', 'type', 'description',
      'departurePhoto', 'departureAt', 'cause', 'completionPhoto', 'solution', 'completedSteps',
      'templateData'
    ];
    
    const filteredUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        filteredUpdates[key] = value;
      }
    }
    
    return fetchWithAuth(`/api/tickets/${id}`, {
      method: 'POST',
      body: JSON.stringify(filteredUpdates),
    });
  },

  // 接受工单
  acceptTicket: async (id: string, comment?: string) => {
    return fetchWithAuth(`/api/tickets/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  // 拒绝工单
  declineTicket: async (id: string, comment: string) => {
    return fetchWithAuth(`/api/tickets/${id}/decline`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  // 出发
  departTicket: async (id: string, departurePhoto?: string) => {
    return fetchWithAuth(`/api/tickets/${id}/depart`, {
      method: 'POST',
      body: departurePhoto ? JSON.stringify(departurePhoto) : undefined,
    });
  },

  // 到达
  arriveTicket: async (id: string, arrivalPhoto?: string) => {
    return fetchWithAuth(`/api/tickets/${id}/arrive`, {
      method: 'POST',
      body: arrivalPhoto ? JSON.stringify(arrivalPhoto) : undefined,
    });
  },

  completeTicket: async (id: string, completionData?: {
    cause?: string;
    solution?: string;
    completionPhoto?: string;
  }) => {
    return fetchWithAuth(`/api/tickets/${id}/complete`, {
      method: 'POST',
      body: completionData ? JSON.stringify(completionData) : undefined,
    });
  },

  reviewTicket: async (id: string, cause?: string) => {
    return fetchWithAuth(`/api/tickets/${id}/review`, {
      method: 'POST',
      body: cause ? JSON.stringify(cause) : undefined,
    });
  },

  // 提交工单审核（工程师完成工作后使用）
  // 状态: ARRIVED → REVIEW
  submitTicketForReview: async (id: string, templateData?: TicketTypeTemplateWithData) => {
    // 直接发送 templateData 对象，不包装
    return fetchWithAuth(`/api/tickets/${id}/submit-for-review`, {
      method: 'POST',
      body: templateData ? JSON.stringify(templateData) : JSON.stringify({})
    });
  },

  // 更新工单步骤
  updateTicketStep: async (
    ticketId: string,
    stepId: string,
    updates: {
      completed?: boolean;
      description?: string;
      status?: string;
      cause?: string;
      photoUrl?: string;
      photoUrls?: string[];
      beforePhotoUrl?: string;
      beforePhotoUrls?: string[];
      afterPhotoUrl?: string;
      afterPhotoUrls?: string[];
      timestamp?: string;
    }
  ) => {
    return fetchWithAuth(`/api/tickets/${ticketId}/steps/${stepId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // File upload
  uploadFile: async (file: File, fieldType?: string): Promise<{ id: string; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (fieldType) {
      formData.append('fieldType', fieldType);
    }

    const token = await getAuthToken();
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

    const result = await response.json();
    return { id: result.data.id, url: result.data.url };
  },

  // Users
  getCurrentUser: async () => {
    return fetchWithAuth('/api/users/me');
  },

  // Update user profile (name, phone)
  updateProfile: async (updates: { name?: string; phone?: string }) => {
    return fetchWithAuth('/api/users/me', {
      method: 'POST',
      body: JSON.stringify(updates),
    });
  },

  // For demo/development - seed tickets
  seedTickets: async () => {
    return fetchWithAuth('/api/seed', {
      method: 'POST',
    });
  }
};
