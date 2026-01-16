import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Ticket, TicketStatus, TicketPriority, TicketType } from '@/types/ticket';
import { api } from '@/utils/api';

export const useTicketStore = defineStore('tickets', () => {
  const tickets = ref<Ticket[]>([]);
  const currentTicket = ref<Ticket | null>(null);
  const loading = ref(false);
  const refreshing = ref(false);
  const loadingMore = ref(false);
  const hasMore = ref(true);
  const stats = ref<{ total: number; open: number; inProgress: number; completed: number }>({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
  });

  const openTickets = computed(() =>
    tickets.value.filter(t => t.status === 'OPEN')
  );

  const ongoingTickets = computed(() =>
    tickets.value.filter(t => ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'DEPARTED', 'ARRIVED', 'REVIEW'].includes(t.status))
  );

  const completedTickets = computed(() =>
    tickets.value.filter(t => t.status === 'COMPLETED')
  );

  const currentJob = computed(() => {
    const jobs = ongoingTickets.value;
    return jobs.length > 0 ? jobs[0] : null;
  });

  async function loadTickets(options: {
    page?: number;
    size?: number;
    type?: TicketType;
    status?: TicketStatus;
    priority?: TicketPriority;
    reset?: boolean;
  } = {}) {
    const isReset = options.reset ?? false;

    if (loadingMore.value && !isReset) return;

    try {
      if (isReset) {
        refreshing.value = true;
        hasMore.value = true;
      } else {
        loadingMore.value = true;
      }

      const offset = isReset ? 0 : tickets.value.length;
      const result = await api.getTickets({
        page: Math.floor(offset / (options.size ?? 20)),
        size: options.size ?? 20,
        type: options.type,
        status: options.status,
        priority: options.priority,
      });

      const newTickets = result.records;
      hasMore.value = result.hasNext;

      if (isReset) {
        tickets.value = newTickets;
      } else {
        tickets.value = [...tickets.value, ...newTickets];
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
      uni.showToast({
        title: 'Failed to load tickets',
        icon: 'none',
      });
    } finally {
      loading.value = false;
      refreshing.value = false;
      loadingMore.value = false;
    }
  }

  async function loadTicket(id: string) {
    loading.value = true;
    try {
      currentTicket.value = await api.getTicket(id);
    } catch (error) {
      console.error('Failed to load ticket:', error);
      uni.showToast({
        title: 'Failed to load ticket',
        icon: 'none',
      });
    } finally {
      loading.value = false;
    }
  }

  async function acceptTicket(id: string, comment?: string) {
    try {
      await api.acceptTicket(id, comment);
      await loadTickets({ reset: true });
      uni.showToast({
        title: 'Ticket accepted',
        icon: 'success',
      });
    } catch (error) {
      console.error('Failed to accept ticket:', error);
      uni.showToast({
        title: 'Failed to accept ticket',
        icon: 'none',
      });
      throw error;
    }
  }

  async function declineTicket(id: string, reason: string) {
    try {
      await api.declineTicket(id, reason);
      await loadTickets({ reset: true });
      uni.showToast({
        title: 'Ticket declined',
        icon: 'success',
      });
    } catch (error) {
      console.error('Failed to decline ticket:', error);
      uni.showToast({
        title: 'Failed to decline ticket',
        icon: 'none',
      });
      throw error;
    }
  }

  async function departTicket(id: string, departurePhoto?: string) {
    try {
      await api.departTicket(id, departurePhoto);
      await loadTickets({ reset: true });
      uni.showToast({
        title: 'Departed to site',
        icon: 'success',
      });
    } catch (error) {
      console.error('Failed to depart:', error);
      uni.showToast({
        title: 'Failed to depart',
        icon: 'none',
      });
      throw error;
    }
  }

  async function arriveTicket(id: string, arrivalPhoto?: string) {
    try {
      await api.arriveTicket(id, arrivalPhoto);
      await loadTickets({ reset: true });
      uni.showToast({
        title: 'Arrived at site',
        icon: 'success',
      });
    } catch (error) {
      console.error('Failed to arrive:', error);
      uni.showToast({
        title: 'Failed to arrive',
        icon: 'none',
      });
      throw error;
    }
  }

  async function completeTicket(id: string, completionPhoto?: string) {
    try {
      await api.completeTicket(id, completionPhoto);
      await loadTickets({ reset: true });
      uni.showToast({
        title: 'Ticket completed',
        icon: 'success',
      });
    } catch (error) {
      console.error('Failed to complete ticket:', error);
      uni.showToast({
        title: 'Failed to complete ticket',
        icon: 'none',
      });
      throw error;
    }
  }

  async function loadStats() {
    try {
      stats.value = await api.getTicketStats();
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  function setCurrentTicket(ticket: Ticket | null) {
    currentTicket.value = ticket;
  }

  return {
    tickets,
    currentTicket,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    stats,
    openTickets,
    ongoingTickets,
    completedTickets,
    currentJob,
    loadTickets,
    loadTicket,
    acceptTicket,
    declineTicket,
    departTicket,
    arriveTicket,
    completeTicket,
    loadStats,
    setCurrentTicket,
  };
});
