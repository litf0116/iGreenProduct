import { TicketStatus, AdminTicketStatus } from './types';

/**
 * Maps engineer ticket status to admin ticket status
 * Engineer statuses: OPEN, ASSIGNED, ACCEPTED, DEPARTED, ARRIVED, REVIEW, COMPLETED, ON_HOLD, CANCELLED
 * Admin statuses: open, accepted, in_process, submitted, on_hold, closed
 */
export function toAdminStatus(engineerStatus: TicketStatus): AdminTicketStatus {
  const status = engineerStatus.toUpperCase();
  
  switch (status) {
    case 'OPEN':
      return 'open';
    case 'ASSIGNED':
      return 'accepted';
    case 'ACCEPTED':
    case 'DEPARTED':
    case 'ARRIVED':
      return 'in_process';
    case 'REVIEW':
    case 'SUBMITTED':
      return 'submitted';
    case 'ON_HOLD':
      return 'on_hold';
    case 'COMPLETED':
    case 'CANCELLED':
    case 'DECLINED':
      return 'closed';
    default:
      return 'open'; // Default fallback
  }
}

/**
 * Get admin status display color
 */
export function getAdminStatusColor(status: AdminTicketStatus): string {
  const colors: Record<AdminTicketStatus, string> = {
    open: 'bg-blue-500',
    accepted: 'bg-cyan-500',
    in_process: 'bg-indigo-500',
    submitted: 'bg-amber-500',
    on_hold: 'bg-orange-500',
    closed: 'bg-emerald-500',
  };
  return colors[status] || 'bg-gray-500';
}

/**
 * Get admin status display name (i18n key)
 */
export function getAdminStatusName(status: AdminTicketStatus): string {
  const keys: Record<AdminTicketStatus, string> = {
    open: 'status.open',
    accepted: 'status.accepted',
    in_process: 'status.inProcess',
    submitted: 'status.submitted',
    on_hold: 'status.onHold',
    closed: 'status.closed',
  };
  return keys[status] || 'status.unknown';
}

/**
 * All admin statuses for filtering
 */
export const ADMIN_STATUSES: AdminTicketStatus[] = [
  'open',
  'accepted',
  'in_process',
  'submitted',
  'on_hold',
  'closed',
];

/**
 * Get admin status counts from stats response
 */
export function getAdminStatusCounts(stats: {
  open?: number;
  accepted?: number;
  inProgress?: number;
  submitted?: number;
  onHold?: number;
  closed?: number;
}): Record<AdminTicketStatus, number> {
  return {
    open: stats.open || 0,
    accepted: stats.accepted || 0,
    in_process: stats.inProgress || 0,
    submitted: stats.submitted || 0,
    on_hold: stats.onHold || 0,
    closed: stats.closed || 0,
  };
}
