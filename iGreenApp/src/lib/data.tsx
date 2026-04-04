import {AlertCircle, CalendarDays, CheckCircle2, ClipboardCheck, Clock, HelpCircle, Wrench, Zap} from "lucide-react";
import React from "react";

export type TicketStatus = 'open' | 'assigned' | 'departed' | 'arrived' | 'review' | 'completed';
export type TicketPriority = 'P1' | 'P2' | 'P3' | 'P4';
export type TicketType = 'corrective' | 'planned' | 'preventive' | 'problem';

// Helper Functions
// Case-insensitive field type comparison
export function isFieldType(fieldType: string, expected: FieldType): boolean {
  return fieldType.toUpperCase() === expected;
}
export type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'PHOTOS' | 'INSPECTION' | 'SIGNATURE' | 'LOCATION';

export interface TemplateField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  description?: string;
  config?: Record<string, any>;
}

// INSPECTION 类型的值结构
// 不同状态对应不同的表单数据
export interface InspectionValue {
  status: 'pass' | 'fail' | 'na' | undefined;
  // 当 status === 'pass'
  evidencePhotos?: string[];    // when status === 'pass'
  // 当 status === 'fail'
  cause?: string;               // when status === 'fail'
  beforePhotos?: string[];      // when status === 'fail'
  afterPhotos?: string[];       // when status === 'fail'
}

// LOCATION 类型的值结构
export interface LocationValue {
  latitude: number;
  longitude: number;
  address: string;
}

export interface TemplateFieldValue extends TemplateField {
  value?: string | InspectionValue | LocationValue | string[];
}


export interface TemplateStepConfig {
  id: string;
  name: string;
  fields: TemplateField[];
}

export interface TemplateStepWithData extends TemplateStepConfig {
  name: string;
  description: string;
  fields: TemplateFieldValue[];
  completed: boolean;
  status?: 'pass' | 'fail' | 'na' | 'pending';
}

export interface TicketTypeTemplateWithData {
  id: string;
  name: string;
  type: TicketType;
  steps: TemplateStepWithData[];
}

export interface TicketTypeTemplate {
  id: string;
  name: string;
  type: TicketType;
  steps: TemplateStepConfig[];
}

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
  siteId?: string;
  siteName?: string;
  siteAddress?: string;
  templateData?: TicketTypeTemplateWithData;
  steps?: TicketStep[];
  progressPercentage?: number;
  completedStepsCount?: number;
  totalStepsCount?: number;
  completedSteps?: string[];
  history?: {
    departedAt?: string;
    arrivedAt?: string;
    completedAt?: string;
  };
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
  problemType?: string;
}

export const MOCK_TICKETS: Ticket[] = [
  {
    id: '202601200001',
    title: "Station #405 Offline - Downtown Plaza",
    description: "Station is reporting offline status for more than 2 hours. Remote reset failed. Likely network module issue or power cut.",
    status: "open",
    priority: "P1",
    type: "corrective",
    requester: "System Monitor",
    createdAt: "2023-10-27T14:30:00Z",
    tags: ["offline", "network", "urgent"],
    location: "Downtown Plaza, Bay 4",
  },
  {
    id: '202601200002',
    title: "Connector B Damage - Highway Rest Stop 12",
    description: "Customer reported CCS connector locking mechanism is broken. Visual inspection required. Spare part #CCS-Type2-L might be needed.",
    status: "assigned",
    priority: "P2",
    type: "corrective",
    requester: "Customer Report",
    createdAt: "2023-10-27T10:00:00Z",
    assignee: "Mike Technician",
    tags: ["hardware", "connector", "safety"],
    location: "Highway 101, Rest Stop 12",
  },
  {
    id: '202601200003',
    title: "Routine Maintenance - Mall of City (Level 2)",
    description: "Quarterly preventive maintenance for cluster A. Check cables, clean screens, test voltage output.",
    status: "open",
    priority: "P3",
    type: "preventive",
    requester: "Ops Manager",
    createdAt: "2023-10-26T16:20:00Z",
    tags: ["maintenance", "routine"],
    location: "Mall of City, P2 Green Zone",
  },
  {
    id: '202601200004',
    title: "Scheduled Modem Upgrade - Westside Park",
    description: "Replace 3G modems with 4G LTE units for Stations 1-4 as part of the Q4 connectivity upgrade plan.",
    status: "open",
    priority: "P3",
    type: "planned",
    requester: "Network Planning",
    createdAt: "2023-10-25T09:15:00Z",
    tags: ["upgrade", "connectivity", "planned"],
    location: "Westside Park, Stations 1-4",
  },
  {
    id: '202601200005',
    title: "Payment Terminal Jammed - Central Station",
    description: "Credit card reader is not accepting cards. Physical obstruction detected in the slot.",
    status: "open",
    priority: "P4",
    type: "corrective",
    requester: "Site Security",
    createdAt: "2023-10-24T11:00:00Z",
    tags: ["payment", "hardware"],
    location: "Central Station, Main Entrance",
  },
  {
    id: '202601200006',
    title: "Recurring Power Fluctuation - Sector 7",
    description: "Multiple users reporting power output instability. Requires deep analysis and long-term monitoring strategy.",
    status: "assigned",
    priority: "P2",
    type: "problem",
    requester: "Regional Director",
    createdAt: "2023-10-24T09:00:00Z",
    assignee: "Mike Technician",
    tags: ["power", "investigation"],
    location: "Sector 7, Industrial Zone",
    relatedTicketId: '202601200001'
  }
];

export const getPriorityColor = (priority: TicketPriority) => {
  switch (priority) {
    case 'P1':
      return 'destructive';
    case 'P2':
      return 'default';
    case 'P3':
      return 'secondary';
    case 'P4':
      return 'outline';
    default:
      return 'secondary';
  }
};

export const getTicketTypeLabel = (type: TicketType) => {
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
};

export const getTicketTypeIcon = (type: TicketType) => {
  switch (type) {
    case 'corrective':
      return <Wrench className="w-3 h-3"/>;
    case 'planned':
      return <CalendarDays className="w-3 h-3"/>;
    case 'preventive':
      return <ClipboardCheck className="w-3 h-3"/>;
    case 'problem':
      return <HelpCircle className="w-3 h-3"/>;
  }
};

export const getTicketTypeColor = (type: TicketType) => {
  switch (type) {
    case 'corrective':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'planned':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'preventive':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'problem':
      return 'text-rose-600 bg-rose-50 border-rose-200';
  }
};

export const getStatusIcon = (status: TicketStatus) => {
  switch (status) {
    case 'open':
      return <Zap className="w-4 h-4 text-blue-500"/>;
    case 'assigned':
      return <ClipboardCheck className="w-4 h-4 text-indigo-500"/>;
    case 'departed':
      return <Clock className="w-4 h-4 text-orange-500"/>;
    case 'arrived':
      return <Wrench className="w-4 h-4 text-yellow-500"/>;
    case 'review':
      return <AlertCircle className="w-4 h-4 text-purple-500"/>;
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-green-500"/>;
    default:
      return <Zap className="w-4 h-4 text-slate-500"/>;
  }
};
