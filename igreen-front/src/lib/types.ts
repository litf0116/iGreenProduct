export type TicketStatus =
    | 'open' | 'assigned' | 'accepted' | 'departed'
    | 'arrived' | 'review' | 'completed' | 'cancelled';

export type AdminTicketStatus = 'open' | 'in_progress' | 'submitted' | 'on_hold' | 'closed';

export type TicketType = 'planned' | 'preventive' | 'corrective' | 'problem';

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type UserRole = 'admin' | 'manager' | 'engineer';

export type UserStatus = 'active' | 'inactive';

export type CommentType =
    | 'general' | 'comment' | 'accept' | 'decline' | 'cancel' | 'system';

export type SiteStatus = 'online' | 'offline' | 'under_construction';

export type GroupStatus = 'active' | 'inactive';

export type FieldType =
    | 'text' | 'number' | 'date' | 'location' 
    | 'photo' | 'photos' | 'signature' | 'inspection';

export type SiteLevel = 'A' | 'B' | 'C' | string;

export interface SLAConfig {
    id: string;
    priority: Priority;
    responseTimeMinutes: number;
    completionTimeHours: number;
}

export interface SLAConfigRequest {
    id?: string;
    priority: Priority;
    responseTimeMinutes: number;
    completionTimeHours: number;
}

export interface ProblemType {
    id: string;
    name: string;
    description?: string;
}

export interface SiteLevelConfig {
    id: string;
    levelName: string;
    description?: string;
    maxConcurrentTickets: number;
    slaMultiplier: number;
}

export interface SiteLevelConfigRequest {
    levelName: string;
    description?: string;
    maxConcurrentTickets: number;
    slaMultiplier: number;
}

export interface TicketComment {
    id: string;
    comment: string;
    type: CommentType;
    userId: string;
    userName: string;
    ticketId: string;
    createdAt: string;
}

export interface TemplateField {
    id: string;
    name: string;
    type: FieldType;
    required: boolean;
    options?: string;
}

export interface TemplateStep {
    id: string;
    name: string;
    description: string;
    order: number;
    fields: TemplateField[];
}

export interface Template {
    id: string;
    name: string;
    description: string;
    type?: TicketType;
    createdAt: string;
    updatedAt: string;
    steps: TemplateStep[];
}

export interface Group {
    id: string;
    name: string;
    description?: string;
    tags?: string[];
    status: GroupStatus;
    memberCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Ticket {
    id: string;
    title: string;
    description: string;
    type: TicketType;
    status: TicketStatus;
    priority: Priority;
    siteId: string;
    siteName?: string;
    siteAddress?: string;
    templateId?: string;
    templateName?: string;
  template: Template;
    assignedTo: string;
    assignedToName: string;
    acceptedUserId?: string;
    acceptedUserName?: string;
    createdBy: string;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
    dueDate: string;
  completedSteps?: string[];
  stepValues?: TemplateStep[];
    accepted?: boolean;
    acceptedAt?: string;
    departureAt?: string;
    departurePhoto?: string;
    arrivalAt?: string;
    arrivalPhoto?: string;
    completionPhoto?: string;
    cause?: string;
    solution?: string;
    comments?: TicketComment[];
    relatedTicketIds?: string[];
    problemType?: string;
    country?: string;
}

export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    role: UserRole;
    groupId?: string;
    groupName?: string;
    status: UserStatus;
    country?: string;
    createdAt: string;
}

export interface Site {
    id: string;
    code?: string;
    name: string;
    address: string;
    level: string;
    status: SiteStatus;
    createdAt: string;
    updatedAt: string;
}

export interface PageResult<T> {
    records: T[];
    total: number;
    current: number;
    size: number;
    hasNext: boolean;
}

export interface PageParams {
    page?: number;
    size?: number;
}

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

export const DEFAULT_PAGE_PARAMS: PageParams = {
    page: 0,
    size: DEFAULT_PAGE_SIZE,
};

export function toAdminStatus(status: TicketStatus): AdminTicketStatus {
    switch (status) {
        case 'open':
        case 'assigned':
            return 'open';
        case 'accepted':
        case 'departed':
        case 'arrived':
            return 'in_progress';
        case 'review':
            return 'submitted';
        case 'completed':
        case 'cancelled':
            return 'closed';
        default:
            return 'open';
    }
}

export function fromAdminStatus(adminStatus: AdminTicketStatus): TicketStatus[] {
    switch (adminStatus) {
        case 'open':
            return ['open', 'assigned'];
        case 'in_progress':
            return ['accepted', 'departed', 'arrived'];
        case 'submitted':
            return ['review'];
        case 'on_hold':
            return [];
        case 'closed':
            return ['completed', 'cancelled'];
        default:
            return [];
    }
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
    country: string;
    role?: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}

export interface UserResponse {
    id: string;
    name: string;
    username: string;
    email: string;
    role: UserRole;
    groupId?: string;
    groupName?: string;
    status: UserStatus;
    createdAt: string;
}

export interface TicketResponse {
    id: string;
    title: string;
    description: string;
    type: TicketType;
    status: TicketStatus;
    priority: Priority;
    siteId: string;
    siteName?: string;
    siteAddress?: string;
    templateId?: string;
    templateName?: string;
    assignedTo: string;
    assignedToName: string;
    createdBy: string;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
    dueDate: string;
    completedSteps?: string[];
    stepData?: Record<string, any>;
    accepted?: boolean;
    acceptedAt?: string;
    departureAt?: string;
    departurePhoto?: string;
    arrivalAt?: string;
    arrivalPhoto?: string;
    completionPhoto?: string;
    cause?: string;
    solution?: string;
    comments?: TicketComment[];
    relatedTicketIds?: string[];
    problemType?: string;
}

export interface TicketCreateRequest {
    title: string;
    description: string;
    type: TicketType;
    siteId: string;
    priority: Priority;
    templateId?: string;
    assignedTo: string;
    dueDate: string;
    relatedTicketIds?: string[];
    problemType?: string;
}

export interface TicketUpdateRequest {
    title?: string;
    description?: string;
    type?: TicketType;
    siteId?: string;
    status?: TicketStatus;
    priority?: Priority;
    assignedTo?: string;
    dueDate?: string;
    completedSteps?: string[];
    stepData?: Record<string, any>;
    departureAt?: string;
    departurePhoto?: string;
    arrivalAt?: string;
    arrivalPhoto?: string;
    completionPhoto?: string;
    cause?: string;
    solution?: string;
    relatedTicketIds?: string[];
}

export interface TicketAcceptRequest {
    comment?: string;
}

export interface TicketDeclineRequest {
    reason: string;
}

export interface TicketCancelRequest {
    reason: string;
}

export interface TicketCommentCreateRequest {
    comment: string;
    type: CommentType;
}

export interface StepData {
    data: Record<string, any>;
}

export interface SiteCreateRequest {
    code?: string;
    name: string;
    address: string;
    level?: string;
    status?: SiteStatus;
}

export interface SiteUpdateRequest {
    name?: string;
    address?: string;
    level?: string;
    status?: SiteStatus;
}

export interface SiteStats {
    totalSites: number;
    onlineSites: number;
    offlineSites: number;
    vipSites: number;
}

export interface GroupCreateRequest {
    name: string;
    description?: string;
    tags?: string;
    status?: GroupStatus;
}

export interface GroupUpdateRequest {
    name?: string;
    description?: string;
    tags?: string;
    status?: GroupStatus;
}

export interface UserCreateRequest {
    name: string;
    username: string;
    email: string;
    password: string;
    role?: UserRole;
    status?: UserStatus;
    groupId?: string;
    country?: string;
}

export interface UserUpdateRequest {
    name?: string;
    username?: string;
    groupId?: string;
    status?: UserStatus;
    role?: UserRole;
    password?: string;
    country?: string;
}

export interface TemplateCreateRequest {
    name: string;
    description?: string;
    type?: TicketType;
}

export interface TemplateUpdateRequest {
    name?: string;
    description?: string;
    type?: TicketType;
}

export interface TemplateStepCreateRequest {
    name: string;
    description?: string;
    order: number;
}

export interface TemplateStepUpdateRequest {
    name?: string;
    description?: string;
    order?: number;
}

export interface TemplateFieldCreateRequest {
    name: string;
    type: FieldType;
    required: boolean;
    options?: string;
}

export interface TemplateFieldUpdateRequest {
    name?: string;
    type?: FieldType;
    required?: boolean;
    options?: string;
}

export interface ProblemTypeRequest {
    name: string;
    description?: string;
}

export interface FileUploadResponse {
    id: string;
    url: string;
    name: string;
    type: string;
    size: number;
}

export interface HealthResponse {
    status: string;
    version: string;
}

export interface TicketStatsResponse {
    total: number;
    open: number;
    accepted: number;
    inProgress: number;
    submitted: number;
    onHold: number;
    closed: number;
}
