// src/store/dataStore.ts
import { create } from 'zustand';
import { toast } from 'sonner';
import api from '@/lib/api';
import type {
  Ticket,
  Template,
  Site,
  Group,
  User,
  SLAConfig,
  ProblemType,
  SiteLevelConfig,
} from '@/lib/types';

interface DataState {
  // 数据存储
  tickets: Ticket[];
  templates: Template[];
  sites: Site[];
  groups: Group[];
  users: User[];
  slaConfigs: SLAConfig[];
  problemTypes: ProblemType[];
  siteLevelConfigs: SiteLevelConfig[];

  // ========== Setters (组件加载数据后调用) ==========
  setTickets: (tickets: Ticket[]) => void;
  setTemplates: (templates: Template[]) => void;
  setSites: (sites: Site[]) => void;
  setGroups: (groups: Group[]) => void;
  setUsers: (users: User[]) => void;
  setSLAConfigs: (configs: SLAConfig[]) => void;
  setProblemTypes: (types: ProblemType[]) => void;
  setSiteLevelConfigs: (configs: SiteLevelConfig[]) => void;

  // ========== Mutations (CRUD 操作) ==========
  // Ticket
  createTicket: (ticket: Partial<Ticket>) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  acceptTicket: (id: string, comment?: string) => Promise<void>;
  declineTicket: (id: string, reason: string) => Promise<void>;
  cancelTicket: (id: string, reason: string) => Promise<void>;
  departTicket: (id: string, departurePhoto?: string) => Promise<void>;
  arriveTicket: (id: string, arrivalPhoto?: string) => Promise<void>;
  submitTicket: (id: string, stepData: Record<string, any>) => Promise<void>;
  completeTicket: (id: string, completionPhoto?: string) => Promise<void>;
  reviewTicket: (id: string, cause?: string) => Promise<void>;

  // Site
  createSite: (site: Partial<Site>) => Promise<void>;
  updateSite: (id: string, updates: Partial<Site>) => Promise<void>;
  deleteSite: (id: string) => Promise<void>;

  // Group
  createGroup: (group: Partial<Group>) => Promise<void>;
  updateGroup: (id: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;

  // User
  createUser: (user: Partial<User> & { password?: string }) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Template
  createTemplate: (template: Partial<Template>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  // Config
  updateSLAConfig: (config: SLAConfig) => Promise<void>;
  createProblemType: (type: ProblemType) => Promise<void>;
  updateProblemType: (type: ProblemType) => Promise<void>;
  deleteProblemType: (id: string) => Promise<void>;
  createSiteLevelConfig: (config: SiteLevelConfig) => Promise<void>;
  updateSiteLevelConfig: (config: SiteLevelConfig) => Promise<void>;
  deleteSiteLevelConfig: (id: string) => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  // 初始状态
  tickets: [],
  templates: [],
  sites: [],
  groups: [],
  users: [],
  slaConfigs: [],
  problemTypes: [],
  siteLevelConfigs: [],

  // ========== Setters ==========
  setTickets: (tickets) => set({ tickets }),
  setTemplates: (templates) => set({ templates }),
  setSites: (sites) => set({ sites }),
  setGroups: (groups) => set({ groups }),
  setUsers: (users) => set({ users }),
  setSLAConfigs: (configs) => set({ slaConfigs: configs }),
  setProblemTypes: (types) => set({ problemTypes: types }),
  setSiteLevelConfigs: (configs) => set({ siteLevelConfigs: configs }),

  // ========== Mutations ==========
  // Ticket
  createTicket: async (ticket) => {
    try {
      const created = await api.createTicket(ticket);
      set((state) => ({ tickets: [created, ...state.tickets] }));
      toast.success("Ticket created successfully");
    } catch (error) {
      toast.error("Failed to create ticket");
      throw error;
    }
  },
  updateTicket: async (id, updates) => {
    try {
      const updated = await api.updateTicket(id, updates);
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
      }));
      toast.success("Ticket updated successfully");
    } catch (error) {
      toast.error("Failed to update ticket");
      throw error;
    }
  },
  deleteTicket: async (id) => {
    try {
      await api.deleteTicket(id);
      set((state) => ({ tickets: state.tickets.filter((t) => t.id !== id) }));
      toast.success("Ticket deleted successfully");
    } catch (error) {
      toast.error("Failed to delete ticket");
      throw error;
    }
  },
  acceptTicket: async (id, comment) => {
    try {
      const updated = await api.acceptTicket(id, comment);
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
      }));
      toast.success("Ticket accepted");
    } catch (error) {
      toast.error("Failed to accept ticket");
      throw error;
    }
  },
  declineTicket: async (id, reason) => {
    try {
      const updated = await api.declineTicket(id, reason);
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
      }));
      toast.success("Ticket declined");
    } catch (error) {
      toast.error("Failed to decline ticket");
      throw error;
    }
  },
  cancelTicket: async (id, reason) => {
    try {
      const updated = await api.cancelTicket(id, reason);
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
      }));
      toast.success("Ticket cancelled");
    } catch (error) {
      toast.error("Failed to cancel ticket");
      throw error;
    }
  },
  departTicket: async (id, departurePhoto) => {
    try {
      const updated = await api.departTicket(id, departurePhoto);
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
      }));
      toast.success("Engineer departed");
    } catch (error) {
      toast.error("Failed to depart ticket");
      throw error;
    }
  },
  arriveTicket: async (id, arrivalPhoto) => {
    try {
      const updated = await api.arriveTicket(id, arrivalPhoto);
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
      }));
      toast.success("Engineer arrived");
    } catch (error) {
      toast.error("Failed to arrive ticket");
      throw error;
    }
  },
  submitTicket: async (id, stepData) => {
    try {
      const updated = await api.submitTicket(id, stepData);
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
      }));
      toast.success("Step submitted");
    } catch (error) {
      toast.error("Failed to submit ticket");
      throw error;
    }
  },
  completeTicket: async (id, completionPhoto) => {
    try {
      const updated = await api.completeTicket(id, completionPhoto);
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
      }));
      toast.success("Ticket completed");
    } catch (error) {
      toast.error("Failed to complete ticket");
      throw error;
    }
  },
  reviewTicket: async (id, cause) => {
    try {
      const updated = await api.reviewTicket(id, cause);
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
      }));
      toast.success(cause ? "Ticket returned for revision" : "Ticket approved");
    } catch (error) {
      toast.error("Failed to review ticket");
      throw error;
    }
  },

  // Site
  createSite: async (site) => {
    try {
      const created = await api.createSite(site);
      set((state) => ({ sites: [...state.sites, created] }));
      toast.success("Site created successfully");
    } catch (error) {
      toast.error("Failed to create site");
      throw error;
    }
  },
  updateSite: async (id, updates) => {
    try {
      const updated = await api.updateSite(id, updates);
      set((state) => ({
        sites: state.sites.map((s) => (s.id === id ? updated : s)),
      }));
      toast.success("Site updated successfully");
    } catch (error) {
      toast.error("Failed to update site");
      throw error;
    }
  },
  deleteSite: async (id) => {
    try {
      await api.deleteSite(id);
      set((state) => ({ sites: state.sites.filter((s) => s.id !== id) }));
      toast.success("Site deleted successfully");
    } catch (error) {
      toast.error("Failed to delete site");
      throw error;
    }
  },

  // Group
  createGroup: async (group) => {
    try {
      const created = await api.createGroup(group);
      set((state) => ({ groups: [...state.groups, created] }));
      toast.success("Group created successfully");
    } catch (error) {
      toast.error("Failed to create group");
      throw error;
    }
  },
  updateGroup: async (id, updates) => {
    try {
      const updated = await api.updateGroup(id, updates);
      set((state) => ({
        groups: state.groups.map((g) => (g.id === id ? updated : g)),
      }));
      toast.success("Group updated successfully");
    } catch (error) {
      toast.error("Failed to update group");
      throw error;
    }
  },
  deleteGroup: async (id) => {
    try {
      await api.deleteGroup(id);
      set((state) => ({ groups: state.groups.filter((g) => g.id !== id) }));
      toast.success("Group deleted successfully");
    } catch (error) {
      toast.error("Failed to delete group");
      throw error;
    }
  },

  // User
  createUser: async (user) => {
    try {
      const created = await api.createUser(user);
      set((state) => ({ users: [...state.users, created] }));
      toast.success("User created successfully");
    } catch (error) {
      toast.error("Failed to create user");
      throw error;
    }
  },
  updateUser: async (id, updates) => {
    try {
      const updated = await api.updateUser(id, updates);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
      }));
      toast.success("User updated successfully");
    } catch (error) {
      toast.error("Failed to update user");
      throw error;
    }
  },
  deleteUser: async (id) => {
    try {
      await api.deleteUser(id);
      set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
      throw error;
    }
  },

  // Template
  createTemplate: async (template) => {
    try {
      const created = await api.createTemplate(template);
      set((state) => ({ templates: [...state.templates, created] }));
      toast.success("Template created successfully");
    } catch (error) {
      toast.error("Failed to create template");
      throw error;
    }
  },
  updateTemplate: async (id, updates) => {
    try {
      const updated = await api.updateTemplate(id, updates);
      set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? updated : t)),
      }));
      toast.success("Template updated successfully");
    } catch (error) {
      toast.error("Failed to update template");
      throw error;
    }
  },
  deleteTemplate: async (id) => {
    try {
      await api.deleteTemplate(id);
      set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }));
      toast.success("Template deleted successfully");
    } catch (error) {
      toast.error("Failed to delete template");
      throw error;
    }
  },

  // Config
  updateSLAConfig: async (config) => {
    try {
      const updated = await api.createSLAConfig(config);
      set((state) => {
        const existing = state.slaConfigs.findIndex((c) => c.priority === config.priority);
        if (existing >= 0) {
          const newConfigs = [...state.slaConfigs];
          newConfigs[existing] = updated;
          return { slaConfigs: newConfigs };
        }
        return { slaConfigs: [...state.slaConfigs, updated] };
      });
      toast.success("SLA config updated successfully");
    } catch (error) {
      toast.error("Failed to update SLA config");
      throw error;
    }
  },
  createProblemType: async (type) => {
    try {
      const created = await api.createProblemType(type);
      set((state) => ({ problemTypes: [...state.problemTypes, created] }));
      toast.success("Problem type created successfully");
    } catch (error) {
      toast.error("Failed to create problem type");
      throw error;
    }
  },
  updateProblemType: async (type) => {
    try {
      const updated = await api.updateProblemType(type.id, type);
      set((state) => ({
        problemTypes: state.problemTypes.map((t) => (t.id === type.id ? updated : t)),
      }));
      toast.success("Problem type updated successfully");
    } catch (error) {
      toast.error("Failed to update problem type");
      throw error;
    }
  },
  deleteProblemType: async (id) => {
    try {
      await api.deleteProblemType(id);
      set((state) => ({ problemTypes: state.problemTypes.filter((t) => t.id !== id) }));
      toast.success("Problem type deleted successfully");
    } catch (error) {
      toast.error("Failed to delete problem type");
      throw error;
    }
  },
  createSiteLevelConfig: async (config) => {
    try {
      const created = await api.createSiteLevelConfig(config);
      set((state) => ({ siteLevelConfigs: [...state.siteLevelConfigs, created] }));
      toast.success("Site level config created successfully");
    } catch (error) {
      toast.error("Failed to create site level config");
      throw error;
    }
  },
  updateSiteLevelConfig: async (config) => {
    try {
      const updated = await api.updateSiteLevelConfig(config.id, config);
      set((state) => ({
        siteLevelConfigs: state.siteLevelConfigs.map((c) => (c.id === config.id ? updated : c)),
      }));
      toast.success("Site level config updated successfully");
    } catch (error) {
      toast.error("Failed to update site level config");
      throw error;
    }
  },
  deleteSiteLevelConfig: async (id) => {
    try {
      await api.deleteSiteLevelConfig(id);
      set((state) => ({ siteLevelConfigs: state.siteLevelConfigs.filter((c) => c.id !== id) }));
      toast.success("Site level config deleted successfully");
    } catch (error) {
      toast.error("Failed to delete site level config");
      throw error;
    }
  },
}));
