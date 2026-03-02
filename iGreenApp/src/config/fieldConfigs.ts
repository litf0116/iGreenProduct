import { TicketTypeTemplate } from '../lib/data';

// =====================
// 1. Corrective Maintenance Template
// =====================
export const CORRECTIVE_TEMPLATE: TicketTypeTemplate = {
  id: 'template-corrective',
  name: 'Corrective Maintenance',
  type: 'corrective',
  steps: [{
    id: 'step-maintenance',
    name: 'Maintenance Details',
    fields: [
      { id: 'field-root-cause', name: 'Root Cause', type: 'TEXT', required: true, config: { multiline: true } },
      { id: 'field-solution', name: 'Solution', type: 'TEXT', required: true, config: { multiline: true } },
      { id: 'field-before-photos', name: 'Before Photos', type: 'PHOTOS', required: true },
      { id: 'field-after-photos', name: 'After Photos', type: 'PHOTOS', required: true }
    ]
  }]
};

// =====================
// 2. Planned Maintenance Template
// =====================
export const PLANNED_TEMPLATE: TicketTypeTemplate = {
  id: 'template-planned',
  name: 'Planned Maintenance',
  type: 'planned',
  steps: [{
    id: 'step-feedback',
    name: 'Maintenance Feedback',
    fields: [
      { id: 'field-feedback', name: 'Feedback / Notes', type: 'TEXT', required: true, config: { multiline: true } },
      { id: 'field-feedback-photos', name: 'Maintenance Photos', type: 'PHOTOS', required: true }
    ]
  }]
};

// =====================
// 3. Problem Management Template
// =====================
export const PROBLEM_TEMPLATE: TicketTypeTemplate = {
  id: 'template-problem',
  name: 'Problem Management',
  type: 'problem',
  steps: [{
    id: 'step-resolution',
    name: 'Problem Resolution',
    fields: [
      { id: 'field-solution', name: 'Solution / Action Plan', type: 'TEXT', required: true, config: { multiline: true } },
      { id: 'field-estimated-resolution', name: 'Estimated Date for Resolution', type: 'DATE', required: true },
      { id: 'field-problem-photos', name: 'Evidence Photos', type: 'PHOTOS', required: true }
    ]
  }]
};

// =====================
// 4. Preventive Maintenance Template (16 检查步骤)
// =====================
export const PREVENTIVE_TEMPLATE: TicketTypeTemplate = {
  id: 'template-preventive',
  name: 'Preventive Maintenance',
  type: 'preventive',
  steps: [
    { id: 'step-1', name: 'MDB Cabinet Check', fields: [
      { id: 'field-inspection-1', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-2', name: 'Fire Extinguisher Check', fields: [
      { id: 'field-inspection-2', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-3', name: 'Ground Condition Check', fields: [
      { id: 'field-inspection-3', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-4', name: 'Charging Gun & Cable Check', fields: [
      { id: 'field-inspection-4', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-5', name: 'Charging Input Line Check', fields: [
      { id: 'field-inspection-5', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-6', name: 'Mainboard Terminals Check', fields: [
      { id: 'field-inspection-6', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-7', name: 'Display Screen Check', fields: [
      { id: 'field-inspection-7', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-8', name: 'Indicator Lights Check', fields: [
      { id: 'field-inspection-8', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-9', name: 'Communication Functions Check', fields: [
      { id: 'field-inspection-9', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-10', name: 'Emergency Stop Button Check', fields: [
      { id: 'field-inspection-10', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-11', name: 'Charging Module Check', fields: [
      { id: 'field-inspection-11', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-12', name: 'Surge Protector Check', fields: [
      { id: 'field-inspection-12', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-13', name: 'Dust Screen Check', fields: [
      { id: 'field-inspection-13', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-14', name: 'Historical Records Check', fields: [
      { id: 'field-inspection-14', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-15', name: 'Backend Communication Check', fields: [
      { id: 'field-inspection-15', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]},
    { id: 'step-16', name: 'Contactor & Charging Action Test', fields: [
      { id: 'field-inspection-16', name: 'Inspection Result', type: 'INSPECTION', required: true }
    ]}
  ]
};

// =====================
// Template Registry
// =====================
export const TICKET_TEMPLATES: Record<string, TicketTypeTemplate> = {
  corrective: CORRECTIVE_TEMPLATE,
  planned: PLANNED_TEMPLATE,
  preventive: PREVENTIVE_TEMPLATE,
  problem: PROBLEM_TEMPLATE
};

// Helper Functions
// =====================
export function getTemplateByType(type: string): TicketTypeTemplate | undefined {
  return TICKET_TEMPLATES[type];
}

// 字段 ID 到旧字段名的映射（用于向后兼容）
export const FIELD_ID_TO_LEGACY_FIELD: Record<string, string> = {
  'field-root-cause': 'rootCause',
  'field-solution': 'solution',
  'field-before-photos': 'beforePhotoUrls',
  'field-after-photos': 'afterPhotoUrls',
  'field-feedback': 'feedback',
  'field-feedback-photos': 'feedbackPhotoUrls',
  'field-estimated-resolution': 'estimatedResolutionTime',
  'field-problem-photos': 'problemPhotoUrls'
};

// 旧字段名到字段 ID 的映射
export const LEGACY_FIELD_TO_FIELD_ID: Record<string, string> = {
  rootCause: 'field-root-cause',
  solution: 'field-solution',
  beforePhotoUrls: 'field-before-photos',
  afterPhotoUrls: 'field-after-photos',
  feedback: 'field-feedback',
  feedbackPhotoUrls: 'field-feedback-photos',
  estimatedResolutionTime: 'field-estimated-resolution',
  problemPhotoUrls: 'field-problem-photos'
};
