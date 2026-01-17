import type { TicketStatus, TicketPriority, TicketType } from '@/types/ticket';

export function getStatusClass(status: TicketStatus): string {
  const classes: Record<TicketStatus, string> = {
    OPEN: 'bg-blue',
    ASSIGNED: 'bg-indigo',
    ACCEPTED: 'bg-indigo',
    IN_PROGRESS: 'bg-yellow',
    DEPARTED: 'bg-orange',
    ARRIVED: 'bg-green',
    REVIEW: 'bg-purple',
    COMPLETED: 'bg-green',
    ON_HOLD: 'bg-gray',
    CANCELLED: 'bg-gray',
  };
  return classes[status] || 'bg-gray';
}

export function getPriorityClass(priority: TicketPriority): string {
  return `priority-${priority.toLowerCase()}`;
}

export function getTypeClass(type: TicketType): string {
  return `type-${type.toLowerCase()}`;
}

export function getPriorityColor(priority: TicketPriority): string {
  switch (priority) {
    case 'P1':
      return 'error';
    case 'P2':
      return 'warning';
    case 'P3':
      return 'info';
    case 'P4':
      return 'default';
    default:
      return 'default';
  }
}

export function getTicketTypeColor(type: TicketType): string {
  switch (type) {
    case 'CORRECTIVE':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'PLANNED':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'PREVENTIVE':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'PROBLEM':
      return 'text-rose-600 bg-rose-50 border-rose-200';
    default:
      return '';
  }
}

export function formatRelativeTime(dateString: string): string {
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
