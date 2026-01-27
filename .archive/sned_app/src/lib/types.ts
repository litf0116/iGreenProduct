export type TicketStatus = "open" | "accepted" | "inProgress" | "closed" | "onHold" | "cancelled" | "submitted";
export type Priority = "P1" | "P2" | "P3" | "P4";
export type SLAConfig = {
  priority: Priority;
  responseTime: number;
  resolutionTime: number;
};

export interface ProblemType {
  id: string;
  name: string;
  description: string;
}

export interface SiteLevelConfig {
  id: string;
  name: string;
  description: string;
  slaMultiplier: number;
}

export type FieldType = "text" | "number" | "date" | "location" | "photo" | "signature" | "faceRecognition";
export type TicketType = "planned" | "preventive" | "corrective" | "problem";
export type SiteLevel = "normal" | "vip" | string;
export type SiteStatus = "online" | "offline" | "underConstruction";

export interface TicketComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: Date;
  type: "general" | "accept" | "decline" | "cancel";
}

export interface TemplateField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
}

export interface TemplateStep {
  id: string;
  name: string;
  description: string;
  fields: TemplateField[];
  order: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  steps: TemplateStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  templateId: string;
  templateName: string;
  type: TicketType;
  site?: string;
  status: TicketStatus;
  priority?: Priority;
  assignedTo: string;
  assignedToName: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  dueDate: Date;
  completedSteps: string[];
  stepData: Record<string, any>;
  accepted?: boolean;
  acceptedAt?: Date;
  departureAt?: Date;
  departurePhoto?: string;
  arrivalAt?: Date;
  arrivalPhoto?: string;
  completionPhoto?: string;
  cause?: string;
  solution?: string;
  comments: TicketComment[];
  relatedTicketIds?: string[];
}

export interface User {
  id: string;
  name: string; // Full Name
  username: string; // User Name
  role: "admin" | "engineer" | "manager";
  groupId?: string;
  groupName?: string;
  status?: "active" | "inactive";
  createdAt?: Date;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  level: SiteLevel;
  status: SiteStatus;
  createdAt: Date;
  updatedAt: Date;
}
