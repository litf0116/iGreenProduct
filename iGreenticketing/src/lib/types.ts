export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED';

export type TicketType =
  | 'PLANNED'
  | 'PREVENTIVE'
  | 'CORRECTIVE'
  | 'PROBLEM';

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type UserRole = 'ADMIN' | 'MANAGER' | 'ENGINEER';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export type CommentType =
  | 'GENERAL'
  | 'COMMENT'
  | 'ACCEPT'
  | 'DECLINE'
  | 'CANCEL'
  | 'SYSTEM';

export type SiteStatus = 'ACTIVE' | 'INACTIVE';

export type GroupStatus = 'ACTIVE' | 'INACTIVE';

export type FieldType =
  | 'TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'LOCATION'
  | 'PHOTO'
  | 'SIGNATURE'
  | 'FACE_RECOGNITION';

export type SiteLevel = 'A' | 'B' | 'C' | string;

export interface SLAConfig {
  id: string;
  priority: Priority;
  responseTimeHours: number;
  resolutionTimeHours: number;
}

export interface SLAConfigRequest {
  id?: string;
  priority: Priority;
  responseTimeHours: number;
  resolutionTimeHours: number;
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
  slaMultiplier: number;
}

export interface SiteLevelConfigRequest {
  levelName: string;
  description?: string;
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
  stepId: string;
}

export interface TemplateStep {
  id: string;
  name: string;
  description: string;
  order: number;
  templateId: string;
  fields?: TemplateField[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  steps?: TemplateStep[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  tags?: string;
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
  site: string;
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
  name: string;
  address: string;
  level: SiteLevel;
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: UserRole;
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
  site: string;
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
}

export interface TicketCreateRequest {
  title: string;
  description: string;
  type: TicketType;
  site: string;
  priority: Priority;
  templateId?: string;
  assignedTo: string;
  dueDate: string;
}

export interface TicketUpdateRequest {
  title?: string;
  description?: string;
  type?: TicketType;
  site?: string;
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
  name: string;
  address: string;
  level: SiteLevel;
}

export interface SiteUpdateRequest {
  name?: string;
  address?: string;
  level?: SiteLevel;
  status?: SiteStatus;
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
}

export interface TemplateUpdateRequest {
  name?: string;
  description?: string;
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

export interface SLAConfigRequest {
  id?: string;
  priority: Priority;
  responseTimeHours: number;
  resolutionTimeHours: number;
}

export interface ProblemTypeRequest {
  name: string;
  description?: string;
}

export interface SiteLevelConfigRequest {
  levelName: string;
  description?: string;
  maxConcurrentTickets: number;
  escalationTimeHours: number;
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
  inProgress: number;
  submitted: number;
  completed: number;
  onHold: number;
}
