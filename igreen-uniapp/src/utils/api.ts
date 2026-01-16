import type { Ticket } from '@/types/ticket';
import { MOCK_TICKETS } from './mockData';

const API_BASE_URL = 'http://localhost:8000';

function getAuthToken(): string | null {
  return uni.getStorageSync('auth_token');
}

export const api = {
  async login(username: string, password: string): Promise<{ access_token: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (username && password) {
      uni.setStorageSync('auth_token', 'mock_token_' + Date.now());
      return { access_token: 'mock_token_' + Date.now() };
    }
    throw new Error('Invalid credentials');
  },

  logout() {
    uni.removeStorageSync('auth_token');
  },

  async getTickets(offset = 0, limit = 20): Promise<Ticket[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const end = offset + limit;
    return MOCK_TICKETS.slice(offset, end);
  },

  async getTicket(id: string): Promise<Ticket | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_TICKETS.find(t => t.id === id);
  },

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const ticket = MOCK_TICKETS.find(t => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    return { ...ticket, ...updates };
  },

  async acceptTicket(id: string): Promise<Ticket> {
    return this.updateTicket(id, {
      status: 'assigned',
      assignee: 'Mike Technician',
    });
  },

  async getCurrentUser() {
    return {
      id: 'TECH-8821',
      name: 'Mike Technician',
      username: 'mike.tech',
      email: 'mike.tech@igreenplus.com',
      phone: '+1 (555) 123-4567',
      group: 'Bangkok Operations (Zone A)',
      role: 'L3 Senior Engineer',
    };
  },
};
