// src/store/uiStore.ts
import { create } from 'zustand';
import type { Ticket } from '@/lib/types';

interface UIState {
  // 模态框状态
  modals: {
    ticketDetail: boolean;
    createSite: boolean;
    createGroup: boolean;
    createTemplate: boolean;
  };

  // 当前选中的工单
  selectedTicket: Ticket | null;

  // 工单筛选条件
  ticketFilters: {
    status: string;
    priority: string;
    type: string;
    keyword: string;
  };

  // 当前语言
  language: 'en' | 'zh';

  // Actions
  openModal: (name: keyof UIState['modals']) => void;
  closeModal: (name: keyof UIState['modals']) => void;
  setSelectedTicket: (ticket: Ticket | null) => void;
  setTicketFilters: (filters: Partial<UIState['ticketFilters']>) => void;
  resetTicketFilters: () => void;
  setLanguage: (lang: 'en' | 'zh') => void;
}

const defaultFilters = {
  status: '',
  priority: '',
  type: '',
  keyword: '',
};

export const useUIStore = create<UIState>((set) => ({
  modals: {
    ticketDetail: false,
    createSite: false,
    createGroup: false,
    createTemplate: false,
  },
  selectedTicket: null,
  ticketFilters: defaultFilters,
  language: 'en',

  openModal: (name) => set((state) => ({
    modals: { ...state.modals, [name]: true }
  })),

  closeModal: (name) => set((state) => ({
    modals: { ...state.modals, [name]: false }
  })),

  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),

  setTicketFilters: (newFilters) => set((state) => ({
    ticketFilters: { ...state.ticketFilters, ...newFilters }
  })),

  resetTicketFilters: () => set({ ticketFilters: defaultFilters }),

  setLanguage: (lang) => set({ language: lang }),
}));
