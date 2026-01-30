import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateManager } from './TemplateManager';
import { Template } from '../lib/types';

// Mock i18n
vi.mock('../lib/i18n', () => ({
  translations: {
    en: {
      createTemplate: 'Create Template',
      editTemplate: 'Edit Template',
      deleteTemplate: 'Delete Template',
      templateName: 'Template Name',
      description: 'Description',
      steps: 'Steps',
      addStep: 'Add Step',
      saveTemplate: 'Save Template',
      cancel: 'Cancel',
      stepName: 'Step Name',
      stepDescription: 'Step Description',
      noTemplatesFound: 'No templates found',
      save: 'Save',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this template?',
      templates: 'templates',
    },
    th: {
      createTemplate: 'สร้างเทมเพลต',
      editTemplate: 'แก้ไขเทมเพลต',
      deleteTemplate: 'ลบเทมเพลต',
      templateName: 'ชื่อเทมเพลต',
      description: 'คำอธิบาย',
      steps: 'ขั้นตอน',
      addStep: 'เพิ่มขั้นตอน',
      saveTemplate: 'บันทึกเทมเพลต',
      cancel: 'ยกเลิก',
      stepName: 'ชื่อขั้นตอน',
      stepDescription: 'คำอธิบายขั้นตอน',
      noTemplatesFound: 'ไม่พบเทมเพลต',
      save: 'บันทึก',
      delete: 'ลบ',
      confirmDelete: 'คุณแน่ใจหรือไม่ว่าต้องการลบเทมเพลตนี้?',
      templates: 'เทมเพลต',
    },
  },
  Language: 'en',
  TranslationKey: 'string',
}));

const mockTemplates: Template[] = [
  {
    id: 'tmpl-001',
    name: 'AC Maintenance',
    description: 'Air conditioning maintenance template',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    steps: [
      {
        id: 'step-1',
        name: 'Inspect Unit',
        description: 'Visual inspection',
        order: 1,
        templateId: 'tmpl-001',
        fields: [],
      },
    ],
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

describe('TemplateManager Component', () => {
  const mockOnSaveTemplate = vi.fn();
  const mockOnDeleteTemplate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (language: 'en' | 'th' = 'en') => {
    return render(
      <TemplateManager
        templates={mockTemplates}
        language={language}
        onSaveTemplate={mockOnSaveTemplate}
        onDeleteTemplate={mockOnDeleteTemplate}
      />
    );
  };

  describe('Rendering', () => {
    it('should render template count', () => {
      renderComponent();
      expect(screen.getByText(/2 templates/i)).toBeInTheDocument();
    });

    it('should render create template button', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /create template/i })).toBeInTheDocument();
    });

    it('should render template card headings', () => {
      renderComponent();
      // Check by heading role to avoid duplicate text matches
      const headings = screen.getAllByRole('heading');
      const templateHeadings = headings.filter(h => 
        h.textContent === 'AC Maintenance' || h.textContent === 'Electrical Repair'
      );
      expect(templateHeadings.length).toBe(2);
    });

    it('should render template descriptions', () => {
      renderComponent();
      expect(screen.getByText(/air conditioning maintenance template/i)).toBeInTheDocument();
      expect(screen.getByText(/electrical repair template/i)).toBeInTheDocument();
    });
  });

  describe('Create Template Dialog', () => {
    it('should open dialog when create button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button', { name: /create template/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render dialog title', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button', { name: /create template/i }));

      expect(screen.getByRole('heading', { name: /create template/i })).toBeInTheDocument();
    });

    it('should render template name input in dialog', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button', { name: /create template/i }));

      // Find the input with placeholder "Template Name"
      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0]).toBeInTheDocument();
    });
  });

  describe('Thai Language', () => {
    it('should render in Thai language', () => {
      renderComponent('th');
      // Should show Thai text in the UI
      const buttons = screen.getAllByRole('button');
      expect(buttons.some(b => b.textContent?.includes('สร้าง'))).toBe(true);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no templates', () => {
      render(
        <TemplateManager
          templates={[]}
          language="en"
          onSaveTemplate={mockOnSaveTemplate}
          onDeleteTemplate={mockOnDeleteTemplate}
        />
      );

      expect(screen.getByText(/0 templates/i)).toBeInTheDocument();
    });
  });
});
