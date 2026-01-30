import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
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

// Create mock implementations
const createStoreMock = (tickets: Ticket[], language: string = 'en') => {
  return (selector: any) => {
    const selectorStr = String(selector);
    if (selectorStr.includes('tickets')) {
      return tickets;
    }
    if (selectorStr.includes('setTickets')) {
      return vi.fn();
    }
    if (selectorStr.includes('language')) {
      return language;
    }
    if (selectorStr.includes('setSelectedTicket')) {
      return vi.fn();
    }
    if (selectorStr.includes('openModal')) {
      return vi.fn();
    }
    if (selectorStr.includes('setLanguage')) {
      return vi.fn();
    }
    return vi.fn();
  };
};

// Store mock references for updating in tests
let mockDataStoreImpl = createStoreMock(mockTickets);
let mockUIStoreImpl = createStoreMock(mockTickets, 'en');

// Mock API
vi.mock('../lib/api', () => ({
  default: {
    getTickets: vi.fn(() => Promise.resolve({ records: mockTickets })),
    getTicketStats: vi.fn(() => Promise.resolve({
      total: 3,
      open: 1,
      inProgress: 1,
      submitted: 0,
      completed: 1,
      onHold: 0,
    })),
  },
}));

// Mock stores with configurable implementations
vi.mock('../store', () => ({
  useDataStore: (selector: any) => mockDataStoreImpl(selector),
  useUIStore: (selector: any) => mockUIStoreImpl(selector),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Helper component to wrap Dashboard with Router
function DashboardWrapper() {
  return (
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    mockDataStoreImpl = createStoreMock(mockTickets);
    mockUIStoreImpl = createStoreMock(mockTickets, 'en');
  });

  describe('Rendering', () => {
    it('should render welcome message and create button', () => {
      render(<DashboardWrapper />);
      expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create ticket/i })).toBeInTheDocument();
    });

    it('should render all ticket type tabs', () => {
      render(<DashboardWrapper />);
      expect(screen.getByRole('tab', { name: /corrective/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /preventive/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /planned/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /problem/i })).toBeInTheDocument();
    });

    it('should render stats cards', () => {
      render(<DashboardWrapper />);
      expect(screen.getByText(/Total Tickets/i)).toBeInTheDocument();
      expect(screen.getByText(/Open/i)).toBeInTheDocument();
      expect(screen.getByText(/In Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Closed/i)).toBeInTheDocument();
    });

    it('should render filters', () => {
      render(<DashboardWrapper />);
      expect(screen.getByPlaceholderText(/search tickets/i)).toBeInTheDocument();
    });
  });

  describe('Ticket Filtering by Type', () => {
    it('should show corrective tickets by default', () => {
      render(<DashboardWrapper />);
      expect(screen.getByText('TKT-001')).toBeInTheDocument();
      expect(screen.getByText('TKT-003')).toBeInTheDocument();
    });

    it('should switch to preventive tab', async () => {
      const user = userEvent.setup();
      render(<DashboardWrapper />);
      await user.click(screen.getByRole('tab', { name: /preventive/i }));
      expect(screen.getByText('TKT-002')).toBeInTheDocument();
      expect(screen.queryByText('TKT-001')).not.toBeInTheDocument();
    });

    it('should show empty state for planned tickets', async () => {
      const user = userEvent.setup();
      render(<DashboardWrapper />);
      await user.click(screen.getByRole('tab', { name: /planned/i }));
      expect(screen.getByText(/No tickets found/i)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should search tickets by title', async () => {
      const user = userEvent.setup();
      render(<DashboardWrapper />);
      const searchInput = screen.getByPlaceholderText(/search tickets/i);
      await user.type(searchInput, 'broken');
      expect(screen.getByText('TKT-001')).toBeInTheDocument();
      expect(screen.getByText('TKT-003')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no tickets', () => {
      mockDataStoreImpl = createStoreMock([]);
      render(<DashboardWrapper />);
      expect(screen.getByText(/No tickets found/i)).toBeInTheDocument();
    });
  });

  describe('Language Support', () => {
    it('should render in Thai language', () => {
      mockUIStoreImpl = createStoreMock(mockTickets, 'th');
      render(<DashboardWrapper />);
      expect(screen.getByText(/ยินดีต้อนรับกลับ/i)).toBeInTheDocument();
    });
  });
});
