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
    DEFAULT_PAGE_SIZE,
} from './types';
import {kyInstance, ky} from './kyInstance';
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
        json: {refreshToken: refreshTokenValue},
    });

    const result = await response.json<TokenResponse>();
    setTokens(result);
    return result.accessToken;
}

export const api = {
    login: async (username: string, password: string, country: string): Promise<TokenResponse> => {
        const response = await kyInstance.post('api/auth/login', {
            json: {username, password, country},
        });
        const result = await response.json<TokenResponse>();
        setTokens(result);
        return result;
    },

    register: async (data: {
        name: string;
        username: string;
        password: string;
        confirmPassword: string;
        country: string;
        role?: string;
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

    getUsers: async (params?: PageParams & { keyword?: string }): Promise<{
        records: User[];
        total: number;
        current: number;
        size: number;
        hasNext: boolean
    }> => {
        const searchParams = new URLSearchParams();
        searchParams.set('page', String((params?.page ?? 0) + 1));
        searchParams.set('size', String(params?.size ?? 100));
        if (params?.keyword) searchParams.set('keyword', params.keyword);
        return kyInstance.get(`api/users?${searchParams}`).json();
    },

    getUser: async (id: string): Promise<User> => {
        return kyInstance.get(`api/users/${id}`).json<User>();
    },

    createUser: async (user: UserCreateRequest): Promise<User> => {
        return kyInstance.post('api/users', {json: user}).json<User>();
    },

    updateUser: async (id: string, updates: UserUpdateRequest): Promise<User> => {
        return kyInstance.post(`api/users/${id}`, {json: updates}).json<User>();
    },

    deleteUser: async (id: string): Promise<void> => {
        await kyInstance.delete(`api/users/${id}`);
    },

    updateUserCountries: async (id: string, country: string): Promise<User> => {
        return kyInstance.patch(`api/users/${id}/countries`, {json: {country}}).json<User>();
    },

    getEngineers: async (): Promise<User[]> => {
        const response = await kyInstance.get('api/users/engineers').json<{ data: { records: User[] } }>();
        return response.data.records;
    },

    getGroups: async (keyword?: string): Promise<Group[]> => {
        const url = keyword ? `api/groups?keyword=${encodeURIComponent(keyword)}` : 'api/groups';
        const rawResponse = await kyInstance.get(url).text();
        console.log('[DEBUG getGroups] Raw response:', rawResponse);

        const response = JSON.parse(rawResponse) as {
            success: boolean;
            data?: { records: Group[] };
            message?: string;
            code?: string;
        };

        console.log('[DEBUG getGroups] Parsed response:', response);

        if (response.success && response.data) {
            console.log('[DEBUG getGroups] Using wrapper format, records:', response.data.records);
            return response.data.records || [];
        }

        // Fallback: try direct format
        const directResponse = JSON.parse(rawResponse) as {
            records: Group[];
            total: number;
            current: number;
            size: number;
            hasNext: boolean
        };
        console.log('[DEBUG getGroups] Using direct format, records:', directResponse.records);
        return directResponse.records || [];
    },

    getGroup: async (id: string): Promise<Group> => {
        return kyInstance.get(`api/groups/${id}`).json<Group>();
    },

    createGroup: async (group: GroupCreateRequest): Promise<Group> => {
        return kyInstance.post('api/groups', {json: group}).json<Group>();
    },

    updateGroup: async (id: string, updates: GroupUpdateRequest): Promise<Group> => {
        return kyInstance.put(`api/groups/${id}`, {json: updates}).json<Group>();
    },

    deleteGroup: async (id: string): Promise<void> => {
        await kyInstance.delete(`api/groups/${id}`);
    },

    getGroupMembers: async (groupId: string): Promise<User[]> => {
        return kyInstance.get(`api/groups/${groupId}/members`).json<User[]>();
    },

    getSites: async (params?: PageParams & { keyword?: string; level?: string; status?: string }): Promise<{
        records: Site[];
        total: number;
        current: number;
        size: number;
        hasNext: boolean
    }> => {
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
        return kyInstance.post('api/sites', {json: site}).json<Site>();
    },

    updateSite: async (id: string, updates: SiteUpdateRequest): Promise<Site> => {
        return kyInstance.post(`api/sites/${id}`, {json: updates}).json<Site>();
    },

    deleteSite: async (id: string): Promise<void> => {
        await kyInstance.delete(`api/sites/${id}`);
    },

    getSiteStats: async (): Promise<{ totalSites: number; onlineSites: number; offlineSites: number; vipSites: number }> => {
        return kyInstance.get('api/sites/stats').json();
    },

    // Site Import/Export APIs
    exportSites: async (params?: { keyword?: string; level?: string; status?: string }): Promise<Blob> => {
        const searchParams = new URLSearchParams();
        if (params?.keyword) searchParams.set('keyword', params.keyword);
        if (params?.level) searchParams.set('level', params.level);
        if (params?.status) searchParams.set('status', params.status);

        const response = await kyInstance.get(`api/sites/export?${searchParams}`);
        return response.blob();
    },

    downloadSiteTemplate: async (): Promise<Blob> => {
        const response = await kyInstance.get('api/sites/export/template');
        return response.blob();
    },

    importSites: async (file: File): Promise<{
        success: boolean;
        message: string;
        importedCount: number;
        errorCount: number;
        errors?: Array<{ row: number; message: string }>
    }> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await kyInstance.post('api/sites/import', {
            body: formData,
        });

        return response.json();
    },

    getTemplates: async (): Promise<Template[]> => {
        try {
            // kyInstance.afterResponse 已经提取了 apiResponse.data
            // 所以返回的直接是 { records: Template[] }
            const response = await kyInstance.get('api/templates').json<{ records: Template[] }>();
            return response.records || [];
        } catch (error) {
            console.error("getTemplates API error:", error);
            return [];
        }
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
        const response = await kyInstance.post('api/templates', {json: template}).json<{ data: Template }>();
        return response.data;
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
        const response = await kyInstance.put(`api/templates/${id}`, {json: template}).json<{ data: Template }>();
        return response.data;
    },

    deleteTemplate: async (id: string): Promise<void> => {
        await kyInstance.delete(`api/templates/${id}`);
    },

    getTickets: async (params?: PageParams & {
        type?: string;
        status?: string;
        adminStatus?: string;
        priority?: string;
        assignedTo?: string;
        keyword?: string;
        createdAfter?: string | null
    }): Promise<{ records: Ticket[]; total: number; current: number; size: number; hasNext: boolean }> => {
        const searchParams = new URLSearchParams();
        searchParams.set('page', String((params?.page ?? 0) + 1));
        searchParams.set('size', String(params?.size ?? DEFAULT_PAGE_SIZE));
        if (params?.type) searchParams.set('type', params.type);
        if (params?.status) searchParams.set('status', params.status);
        if (params?.adminStatus) searchParams.set('adminStatus', params.adminStatus);
        if (params?.priority) searchParams.set('priority', params.priority);
        if (params?.assignedTo) searchParams.set('assignedTo', params.assignedTo);
        if (params?.keyword) searchParams.set('keyword', params.keyword);
        if (params?.createdAfter) searchParams.set('createdAfter', params.createdAfter);
        return kyInstance.get(`api/tickets?${searchParams}`).json();
    },

    getTicket: async (id: number): Promise<Ticket> => {
        return kyInstance.get(`api/tickets/${id}`).json<Ticket>();
    },

    createTicket: async (ticket: Partial<Ticket>): Promise<Ticket> => {
        const response = await kyInstance.post('api/tickets', {json: ticket}).json<{ data: Ticket }>();
        return response.data;
    },

    updateTicket: async (id: number, updates: Partial<Ticket>): Promise<Ticket> => {
        return kyInstance.post(`api/tickets/${id}`, {json: updates}).json<Ticket>();
    },

    deleteTicket: async (id: number): Promise<void> => {
        await kyInstance.delete(`api/tickets/${id}`);
    },

    acceptTicket: async (id: number, comment?: string): Promise<Ticket> => {
        return kyInstance.post(`api/tickets/${id}/accept`, {json: {comment}}).json<Ticket>();
    },

    declineTicket: async (id: number, reason: string): Promise<Ticket> => {
        return kyInstance.post(`api/tickets/${id}/decline`, {json: {reason}}).json<Ticket>();
    },

    cancelTicket: async (id: number, reason: string): Promise<Ticket> => {
        return kyInstance.post(`api/tickets/${id}/cancel`, {json: {reason}}).json<Ticket>();
    },

    departTicket: async (id: number, departurePhoto?: string): Promise<Ticket> => {
        return kyInstance.post(`api/tickets/${id}/depart`, {json: {departurePhoto}}).json<Ticket>();
    },

    arriveTicket: async (id: number, arrivalPhoto?: string): Promise<Ticket> => {
        return kyInstance.post(`api/tickets/${id}/arrive`, {json: {arrivalPhoto}}).json<Ticket>();
    },

    submitTicket: async (id: number, stepData: Record<string, any>): Promise<Ticket> => {
        return kyInstance.post(`api/tickets/${id}/submit`, {json: {data: stepData}}).json<Ticket>();
    },

    completeTicket: async (id: number, completionPhoto?: string): Promise<Ticket> => {
        return kyInstance.post(`api/tickets/${id}/complete`, {json: {completionPhoto}}).json<Ticket>();
    },

    reviewTicket: async (id: number, cause?: string): Promise<Ticket> => {
        return kyInstance.post(`api/tickets/${id}/review`, {json: {cause}}).json<Ticket>();
    },

    getTicketComments: async (ticketId: number): Promise<TicketComment[]> => {
        const response = await kyInstance.get(`api/tickets/${ticketId}/comments`).json<{ data: { records: TicketComment[] } }>();
        return response.data.records;
    },

    addComment: async (
        ticketId: number,
        comment: string,
        type: string = 'GENERAL'
    ): Promise<TicketComment> => {
        return kyInstance.post(`api/tickets/${ticketId}/comments`, {json: {comment, type}}).json<TicketComment>();
    },

    getMyTickets: async (params?: { page?: number; size?: number; status?: string }): Promise<{
        records: Ticket[];
        total: number;
        current: number;
        size: number;
        hasNext: boolean
    }> => {
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

    getCompletedTickets: async (params?: { page?: number; size?: number }): Promise<{
        records: Ticket[];
        total: number;
        current: number;
        size: number;
        hasNext: boolean
    }> => {
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
        // 验证文件
        if (!file) {
            throw new Error('Please select a file to upload');
        }

        // 验证文件大小（限制 10MB）
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            throw new Error('File size exceeds 10MB limit');
        }

        const formData = new FormData();
        formData.append('file', file);
        if (fieldType) {
            formData.append('fieldType', fieldType);
        }

        try {
            // 使用 kyInstance.post 并确保认证头通过 hooks 自动添加
            const response = await kyInstance.post('api/files/upload', {
                body: formData,
            });

            const result = await response.json<{
                success: boolean;
                data: { id: string; url: string; name: string; type: string; size: number };
                message: string
            }>();

            if (!result.success) {
                // 详细的 401 错误处理
                if (result.message && result.message.includes('401') || result.message.includes('Unauthorized') || result.message.includes('Authentication')) {
                    console.error('[Upload] Authentication failed:', result.message);
                    console.error('[Upload] Current token:', localStorage.getItem('auth_token'));
                    throw new Error('Authentication failed. Please login again.');
                }
                throw new Error(result.message || 'File upload failed');
            }

            console.log('[Upload] Success:', result.data);
            return result.data;
        } catch (error) {
            console.error('[Upload] Network error:', error);
            if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
                throw new Error('Network error. Please check your connection.');
            }
            throw error;
        }
    },

    deleteFile: async (id: string): Promise<void> => {
        await kyInstance.delete(`api/files/${id}`);
    },

    getSLAConfigs: async (): Promise<SLAConfig[]> => {
        const rawResponse = await kyInstance.get('api/configs/sla-configs').text();
        console.log('[DEBUG getSLAConfigs] Raw response:', rawResponse);

        // 尝试解析为带 wrapper 的格式
        let response = JSON.parse(rawResponse) as {
            success: boolean;
            data?: { records: SLAConfig[] };
            message?: string;
            code?: string;
        };

        // 判断是否有 wrapper
        if (response.success && response.data) {
            console.log('[DEBUG getSLAConfigs] Using wrapper format');
            console.log('[DEBUG getSLAConfigs] Records:', response.data.records);
            return response.data.records || [];
        }

        // 无 wrapper 格式，直接从 records 解析
        console.log('[DEBUG getSLAConfigs] Using direct format');
        const directResponse = JSON.parse(rawResponse) as {
            records: SLAConfig[];
            total: number;
            current: number;
            size: number;
            hasNext: boolean
        };
        console.log('[DEBUG getSLAConfigs] Records:', directResponse.records);
        return directResponse.records || [];
    },

    getSLAConfig: async (id: string): Promise<SLAConfig> => {
        return kyInstance.get(`api/configs/sla-configs/${id}`).json<SLAConfig>();
    },

    saveSLAConfig: async (config: SLAConfigRequest): Promise<SLAConfig> => {
        return kyInstance.post('api/configs/sla-configs', {json: config}).json<SLAConfig>();
    },

    deleteSLAConfig: async (id: string): Promise<void> => {
        await kyInstance.delete(`api/configs/sla-configs/${id}`);
    },

    getPriorities: async (): Promise<{ value: string; name: string }[]> => {
        // 从 SLA configs 中获取优先级配置
        const rawResponse = await kyInstance.get('api/configs/sla-configs').text();
        console.log('[DEBUG getPriorities] Raw response:', rawResponse);

        // 尝试解析为带 wrapper 的格式
        let response = JSON.parse(rawResponse) as {
            success: boolean;
            data?: { records: { priority: string }[] };
            message?: string;
            code?: string;
        };

        let records: { priority: string }[] = [];

        // 判断是否有 wrapper
        if (response.success && response.data) {
            console.log('[DEBUG getPriorities] Using wrapper format');
            records = response.data.records || [];
        } else {
            // 无 wrapper 格式，直接从 records 解析
            console.log('[DEBUG getPriorities] Using direct format');
            const directResponse = JSON.parse(rawResponse) as {
                records: { priority: string }[];
                total: number;
                current: number;
                size: number;
                hasNext: boolean
            };
            records = directResponse.records || [];
        }

        console.log('[DEBUG getPriorities] Records:', records);
        return records.map(config => ({
            value: config.priority,
            name: config.priority  // P1, P2, P3, P4
        }));
    },

    getProblemTypes: async (): Promise<ProblemType[]> => {
        const rawResponse = await kyInstance.get('api/configs/problem-types').text();
        console.log('[DEBUG getProblemTypes] Raw response:', rawResponse);

        // 尝试解析为带 wrapper 的格式
        let response = JSON.parse(rawResponse) as {
            success: boolean;
            data?: { records: ProblemType[] };
            message?: string;
            code?: string;
        };

        // 判断是否有 wrapper
        if (response.success && response.data) {
            console.log('[DEBUG getProblemTypes] Using wrapper format');
            console.log('[DEBUG getProblemTypes] Records:', response.data.records);
            return response.data.records || [];
        }

        // 无 wrapper 格式，直接从 records 解析
        console.log('[DEBUG getProblemTypes] Using direct format');
        const directResponse = JSON.parse(rawResponse) as {
            records: ProblemType[];
            total: number;
            current: number;
            size: number;
            hasNext: boolean
        };
        console.log('[DEBUG getProblemTypes] Records:', directResponse.records);
        return directResponse.records || [];
    },

    createProblemType: async (type: ProblemTypeRequest): Promise<ProblemType> => {
        return kyInstance.post('api/configs/problem-types', {json: type}).json<ProblemType>();
    },

    updateProblemType: async (id: string, updates: ProblemTypeRequest): Promise<ProblemType> => {
        return kyInstance.post(`api/configs/problem-types/${id}`, {json: updates}).json<ProblemType>();
    },

    deleteProblemType: async (id: string): Promise<void> => {
        await kyInstance.delete(`api/configs/problem-types/${id}`);
    },

    getSiteLevelConfigs: async (): Promise<SiteLevelConfig[]> => {
        const rawResponse = await kyInstance.get('api/configs/site-level-configs').text();
        console.log('[DEBUG getSiteLevelConfigs] Raw response:', rawResponse);

        // 尝试解析为带 wrapper 的格式
        let response = JSON.parse(rawResponse) as {
            success: boolean;
            data?: { records: SiteLevelConfig[] };
            message?: string;
            code?: string;
        };

        // 判断是否有 wrapper
        if (response.success && response.data) {
            console.log('[DEBUG getSiteLevelConfigs] Using wrapper format');
            console.log('[DEBUG getSiteLevelConfigs] Records:', response.data.records);
            return response.data.records || [];
        }

        // 无 wrapper 格式，直接从 records 解析
        console.log('[DEBUG getSiteLevelConfigs] Using direct format');
        const directResponse = JSON.parse(rawResponse) as {
            records: SiteLevelConfig[];
            total: number;
            current: number;
            size: number;
            hasNext: boolean
        };
        console.log('[DEBUG getSiteLevelConfigs] Records:', directResponse.records);
        return directResponse.records || [];
    },

    createSiteLevelConfig: async (config: SiteLevelConfigRequest): Promise<SiteLevelConfig> => {
        return kyInstance.post('api/configs/site-level-configs', {json: config}).json<SiteLevelConfig>();
    },

    updateSiteLevelConfig: async (id: string, updates: SiteLevelConfigRequest): Promise<SiteLevelConfig> => {
        return kyInstance.post(`api/configs/site-level-configs/${id}`, {json: updates}).json<SiteLevelConfig>();
    },

    deleteSiteLevelConfig: async (id: string): Promise<void> => {
        await kyInstance.delete(`api/configs/site-level-configs/${id}`);
    },

    healthCheck: async (): Promise<{ status: string; version: string }> => {
        return kyInstance.get('api/health').json();
    },
};

export default api;
