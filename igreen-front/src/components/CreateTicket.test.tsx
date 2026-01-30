import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateTicket } from './CreateTicket';
import { Template, User, Group, Ticket } from '../lib/types';

const mockTemplates: Template[] = [
  {
    id: 'tmpl-001',
    name: 'AC Maintenance',
    description: 'Air conditioning maintenance template',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    steps: [],
  },
  {
    id: 'tmpl-002',
    name: 'Electrical Repair',
    description: 'Electrical repair template',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    steps: [],
  },
];

const mockUsers: User[] = [
  {
    id: 'user-001',
    name: 'John Engineer',
    username: 'john',
    email: 'john@example.com',
    role: 'ENGINEER',
    status: 'ACTIVE',
    groupId: 'group-001',
    groupName: 'Team A',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const mockGroups: Group[] = [
  {
    id: 'group-001',
    name: 'Team A',
    description: 'Maintenance Team A',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockSites = [
  { id: 'site-001', name: 'Building A' },
  { id: 'site-002', name: 'Building B' },
];

const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'AC Repair',
    description: 'AC not cooling',
    type: 'CORRECTIVE',
    status: 'OPEN',
    priority: 'P2',
    site: 'Site A',
    assignedTo: 'user-001',
    assignedToName: 'John Engineer',
    createdBy: 'admin-1',
    createdByName: 'Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    dueDate: '2024-01-15T00:00:00Z',
    completedSteps: [],
  },
];

const mockProblemTypes = [
  { id: 'prob-001', name: 'No Power' },
];

// Mock i18n
vi.mock('../lib/i18n', () => ({
  translations: {
    en: {
      createTicket: 'Create Ticket',
      ticketTitle: 'Ticket Title',
      description: 'Description',
      selectTemplate: 'Select Template',
      assignTo: 'Assign To',
      priority: 'Priority',
      dueDate: 'Due Date',
      submit: 'Submit',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
    },
    th: {
      createTicket: 'สร้างตั๋ว',
      ticketTitle: 'หัวข้อตั๋ว',
      description: 'คำอธิบาย',
      selectTemplate: 'เลือกเทมเพลต',
      assignTo: 'มอบหมายให้',
      priority: 'ความสำคัญ',
      dueDate: 'กำหนดส่ง',
      submit: 'ส่ง',
      low: 'ต่ำ',
      medium: 'ปานกลาง',
      high: 'สูง',
      urgent: 'เร่งด่วน',
    },
  },
  Language: 'en',
  TranslationKey: 'string',
}));

describe('CreateTicket Component', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (language: 'en' | 'th' = 'en') => {
    return render(
      <CreateTicket
        templates={mockTemplates}
        users={mockUsers}
        groups={mockGroups}
        sites={mockSites}
        tickets={mockTickets}
        problemTypes={mockProblemTypes}
        language={language}
        onSubmit={mockOnSubmit}
        onCancel={vi.fn()}
      />
    );
  };

  describe('Rendering', () => {
    it('should render card component', () => {
      renderComponent();
      expect(screen.getByText(/ticket title/i)).toBeInTheDocument();
    });

    it('should render submit button with correct text', () => {
      renderComponent();
      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should render input elements', () => {
      renderComponent();
      // Find all inputs (including textarea)
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThanOrEqual(2); // title + description
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in input fields', async () => {
      const user = userEvent.setup();
      renderComponent();

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'Test Ticket Title');

      expect(inputs[0]).toHaveValue('Test Ticket Title');
    });
  });

  describe('Thai Language Support', () => {
    it('should render component in Thai when language is th', () => {
      renderComponent('th');
      // Component should render with Thai placeholder
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
      // First input should have Thai placeholder
      expect(inputs[0]).toHaveAttribute('placeholder', 'หัวข้อตั๋ว');
    });
  });
});
