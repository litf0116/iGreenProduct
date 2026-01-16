export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'DEPARTED'
  | 'ARRIVED'
  | 'REVIEW'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED';

export type TicketPriority = 'P1' | 'P2' | 'P3' | 'P4';

export type TicketType = 'PLANNED' | 'PREVENTIVE' | 'CORRECTIVE' | 'PROBLEM';

export type UserRole = 'ADMIN' | 'MANAGER' | 'ENGINEER';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export type CommentType = 'GENERAL' | 'COMMENT' | 'ACCEPT' | 'DECLINE' | 'CANCEL' | 'SYSTEM';

export interface TicketStep {
  id: string;
  label: string;
  description?: string;
  photoUrl?: string;
  photoUrls?: string[];
  timestamp?: string;
  location?: string;
  completed: boolean;
  status?: 'pass' | 'fail' | 'na' | 'pending';
  cause?: string;
  beforePhotoUrl?: string;
  beforePhotoUrls?: string[];
  afterPhotoUrl?: string;
  afterPhotoUrls?: string[];
}

export interface TicketHistory {
  departedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  acceptedAt?: string;
  submittedAt?: string;
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

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  site?: string;
  templateId?: string;
  templateName?: string;
  assignedTo: string;
  assignedToName?: string;
  createdBy: string;
  createdByName?: string;
  requester?: string;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
  tags?: string[];
  assignee?: string;
  location?: string;
  steps?: TicketStep[];
  history?: TicketHistory;
  completedSteps?: string[];
  stepData?: Record<string, any>;
  accepted?: boolean;
  acceptedAt?: string;
  departureAt?: string;
  departurePhoto?: string;
  arrivalAt?: string;
  arrivalPhoto?: string;
  completionPhoto?: string;
  rootCause?: string;
  solution?: string;
  cause?: string;
  feedback?: string;
  feedbackPhotoUrls?: string[];
  estimatedResolutionTime?: string;
  problemPhotoUrls?: string[];
  relatedTicketId?: string;
  comments?: TicketComment[];
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: UserRole;
  groupId?: string;
  groupName?: string;
  status: UserStatus;
  country?: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  level?: string;
  status?: 'ONLINE' | 'OFFLINE' | 'UNDER_CONSTRUCTION';
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  submitted: number;
  completed: number;
  onHold: number;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
  hasNext: boolean;
}

export type ViewType = 'dashboard' | 'queue' | 'my-work' | 'history' | 'profile';

export function getStatusLabel(status: TicketStatus): string {
  const labels: Record<TicketStatus, string> = {
    OPEN: 'Open',
    ASSIGNED: 'Assigned',
    ACCEPTED: 'Accepted',
    IN_PROGRESS: 'In Progress',
    DEPARTED: 'Departed',
    ARRIVED: 'Arrived',
    REVIEW: 'Review',
    COMPLETED: 'Completed',
    ON_HOLD: 'On Hold',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
}

export function getStatusIcon(status: TicketStatus): string {
  const icons: Record<TicketStatus, string> = {
    OPEN: '⚡',
    ASSIGNED: '✓',
    ACCEPTED: '✓',
    IN_PROGRESS: '🔧',
    DEPARTED: '🚗',
    ARRIVED: '📍',
    REVIEW: '👁',
    COMPLETED: '✔',
    ON_HOLD: '⏸',
    CANCELLED: '✕',
  };
  return icons[status] || '•';
}

export function getPriorityLabel(priority: TicketPriority): string {
  return priority;
}

export function getPriorityClass(priority: TicketPriority): string {
  return `priority-${priority.toLowerCase()}`;
}

export function getTypeLabel(type: TicketType): string {
  const labels: Record<TicketType, string> = {
    PLANNED: 'Planned',
    PREVENTIVE: 'Preventive',
    CORRECTIVE: 'Corrective',
    PROBLEM: 'Problem',
  };
  return labels[type] || type;
}

export function getTypeClass(type: TicketType): string {
  return `type-${type.toLowerCase()}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
