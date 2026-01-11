import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from './Dashboard';
import { Ticket } from '../lib/types';

const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'Fix broken charger',
    description: 'Charger not working',
    type: 'CORRECTIVE',
    status: 'OPEN',
    priority: 'P2',
    site: 'Site A',
    assignedTo: 'user-1',
    assignedToName: 'John Doe',
    createdBy: 'admin-1',
    createdByName: 'Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    dueDate: '2024-01-15T00:00:00Z',
    completedSteps: [],
  },
  {
    id: 'TKT-002',
    title: 'Preventive maintenance',
    description: 'Routine check',
    type: 'PREVENTIVE',
    status: 'IN_PROGRESS',
    priority: 'P1',
    site: 'Site B',
    assignedTo: 'user-2',
    assignedToName: 'Jane Smith',
    createdBy: 'admin-1',
    createdByName: 'Admin',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    dueDate: '2024-01-20T00:00:00Z',
    completedSteps: ['step-1'],
  },
  {
    id: 'TKT-003',
    title: 'Fix another charger',
    description: 'Another broken charger',
    type: 'CORRECTIVE',
    status: 'COMPLETED',
    priority: 'P3',
    site: 'Site A',
    assignedTo: 'user-1',
    assignedToName: 'John Doe',
    createdBy: 'admin-1',
    createdByName: 'Admin',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    dueDate: '2024-01-10T00:00:00Z',
    completedSteps: ['step-1', 'step-2'],
  },
];

describe('Dashboard Component', () => {
  const mockOnCreateTicket = vi.fn();
  const mockOnViewTicket = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render welcome message and create button', () => {
      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create ticket/i })).toBeInTheDocument();
    });

    it('should render all ticket type tabs', () => {
      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      expect(screen.getByRole('tab', { name: /corrective/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /preventive/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /planned/i })).toBeInTheDocument();
      expect(screen.getBy.role('tab', { name: /problem/i })).toBeInTheDocument();
    });

    it('should render stats cards', () => {
      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      expect(screen.getByText(/Total Tickets/i)).toBeInTheDocument();
      expect(screen.getByText(/Open/i)).toBeInTheDocument();
      expect(screen.getByText(/In Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Closed/i)).toBeInTheDocument();
    });

    it('should render filters', () => {
      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      expect(screen.getByPlaceholderText(/search tickets/i)).toBeInTheDocument();
    });
  });

  describe('Ticket Filtering by Type', () => {
    it('should show corrective tickets by default', () => {
      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      expect(screen.getByText('TKT-001')).toBeInTheDocument();
      expect(screen.getByText('TKT-003')).toBeInTheDocument();
      expect(screen.queryByText('TKT-002')).not.toBeInTheDocument();
    });

    it('should switch to preventive tab', async () => {
      const user = userEvent.setup();

      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      await user.click(screen.getByRole('tab', { name: /preventive/i }));

      expect(screen.getByText('TKT-002')).toBeInTheDocument();
      expect(screen.queryByText('TKT-001')).not.toBeInTheDocument();
    });

    it('should show empty state for planned tickets', async () => {
      const user = userEvent.setup();

      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      await user.click(screen.getByRole('tab', { name: /planned/i }));

      expect(screen.getByText(/No tickets found/i)).toBeInTheDocument();
    });
  });

  describe('Ticket Filtering by Status', () => {
    it('should filter tickets by status', async () => {
      const user = userEvent.setup();

      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      // Open status filter dropdown
      const statusFilter = screen.getAllByRole('combobox')[1];
      await user.click(statusFilter);

      // Select Open status
      await user.click(screen.getByText(/open/i));

      expect(screen.getByText('TKT-001')).toBeInTheDocument();
      expect(screen.queryByText('TKT-003')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should search tickets by title', async () => {
      const user = userEvent.setup();

      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search tickets/i);
      await user.type(searchInput, 'broken');

      expect(screen.getByText('TKT-001')).toBeInTheDocument();
      expect(screen.getByText('TKT-003')).toBeInTheDocument();
    });

    it('should search tickets by ID', async () => {
      const user = userEvent.setup();

      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search tickets/i);
      await user.type(searchInput, 'TKT-002');

      // Should not show in corrective tab
      expect(screen.queryByText('TKT-002')).not.toBeInTheDocument();
    });

    it('should clear search and show all tickets', async () => {
      const user = userEvent.setup();

      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search tickets/i);
      await user.type(searchInput, 'broken');

      expect(screen.getByText('TKT-001')).toBeInTheDocument();

      await user.clear(searchInput);

      expect(screen.getByText('TKT-001')).toBeInTheDocument();
      expect(screen.getByText('TKT-003')).toBeInTheDocument();
    });
  });

  describe('Clear Filters', () => {
    it('should show clear filters button when filters are active', async () => {
      const user = userEvent.setup();

      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      // Initially, clear filters button should not be visible
      expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();

      // Apply search filter
      const searchInput = screen.getByPlaceholderText(/search tickets/i);
      await user.type(searchInput, 'broken');

      // Clear filters button should appear
      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });

    it('should clear all filters when button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      // Apply search filter
      const searchInput = screen.getByPlaceholderText(/search tickets/i);
      await user.type(searchInput, 'broken');

      // Click clear filters
      await user.click(screen.getByRole('button', { name: /clear filters/i }));

      // Search input should be cleared
      expect(screen.getByPlaceholderText(/search tickets/i)).toHaveValue('');
    });
  });

  describe('Ticket Actions', () => {
    it('should call onViewTicket when clicking ticket row', async () => {
      const user = userEvent.setup();

      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      const ticketRow = screen.getByText('TKT-001').closest('tr');
      await user.click(ticketRow!);

      expect(mockOnViewTicket).toHaveBeenCalledWith(mockTickets[0]);
    });

    it('should call onViewTicket when clicking view button', async () => {
      const user = userEvent.setup();

      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      await user.click(viewButtons[0]);

      expect(mockOnViewTicket).toHaveBeenCalledWith(mockTickets[0]);
    });

    it('should call onCreateTicket when clicking create button', async () => {
      const user = userEvent.setup();

      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      await user.click(screen.getByRole('button', { name: /create ticket/i }));

      expect(mockOnCreateTicket).toHaveBeenCalled();
    });
  });

  describe('Stats Calculation', () => {
    it('should use provided stats', () => {
      const customStats = {
        total: 100,
        pending: 20,
        inProgress: 30,
        completed: 50,
      };

      render(
        <Dashboard
          tickets={mockTickets}
          stats={customStats}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should calculate stats from tickets when not provided', () => {
      render(
        <Dashboard
          tickets={mockTickets}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      // 2 corrective tickets
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no tickets', () => {
      render(
        <Dashboard
          tickets={[]}
          language="en"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      expect(screen.getByText(/No tickets found/i)).toBeInTheDocument();
    });
  });

  describe('Language Support', () => {
    it('should render in Thai language', () => {
      render(
        <Dashboard
          tickets={mockTickets}
          language="th"
          onCreateTicket={mockOnCreateTicket}
          onViewTicket={mockOnViewTicket}
        />
      );

      expect(screen.getByText(/ยินดีต้อนรับกลับ/i)).toBeInTheDocument();
    });
  });
});
