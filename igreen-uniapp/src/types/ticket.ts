export type TicketStatus = 'open' | 'assigned' | 'departed' | 'arrived' | 'review' | 'completed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketType = 'corrective' | 'planned' | 'preventive' | 'problem';

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
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  requester: string;
  createdAt: string;
  tags: string[];
  assignee?: string;
  location?: string;
  steps?: TicketStep[];
  history?: TicketHistory;
  rootCause?: string;
  solution?: string;
  beforePhotoUrl?: string;
  beforePhotoUrls?: string[];
  afterPhotoUrl?: string;
  afterPhotoUrls?: string[];
  feedback?: string;
  feedbackPhotoUrls?: string[];
  estimatedResolutionTime?: string;
  problemPhotoUrls?: string[];
  relatedTicketId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone: string;
  group: string;
  role: string;
  avatar?: string;
}

export type ViewType = 'dashboard' | 'queue' | 'my-work' | 'history' | 'profile';
