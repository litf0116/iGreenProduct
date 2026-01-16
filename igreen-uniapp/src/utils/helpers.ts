import type { TicketStatus, TicketPriority, TicketType } from '@/types/ticket';

export function getPriorityColor(priority: TicketPriority): string {
  switch (priority) {
    case 'critical':
      return 'error';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
      return 'default';
    default:
      return 'default';
  }
}

export function getPriorityLabel(priority: TicketPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function getTicketTypeLabel(type: TicketType): string {
  switch (type) {
    case 'corrective':
      return 'Corrective Maintenance';
    case 'planned':
      return 'Planned Maintenance';
    case 'preventive':
      return 'Preventive Maintenance';
    case 'problem':
      return 'Problem Management';
    default:
      return type;
  }
}

export function getTicketTypeColor(type: TicketType): string {
  switch (type) {
    case 'corrective':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'planned':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'preventive':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'problem':
      return 'text-rose-600 bg-rose-50 border-rose-200';
    default:
      return '';
  }
}

export function getStatusLabel(status: TicketStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(dateString: string): string {
  return formatDate(dateString) + ' ' + formatTime(dateString);
}
