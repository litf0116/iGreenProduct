import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Ticket, TicketStatus } from '@/types/ticket';
import { MOCK_TICKETS } from '@/utils/mockData';

export const useTicketStore = defineStore('tickets', () => {
  const tickets = ref<Ticket[]>([]);
  const loading = ref(false);
  const refreshing = ref(false);
  const loadingMore = ref(false);
  const hasMore = ref(true);
  const currentTicket = ref<Ticket | null>(null);

  const openTickets = computed(() => 
    tickets.value.filter(t => t.status === 'open')
  );

  const ongoingTickets = computed(() => 
    tickets.value.filter(t => ['assigned', 'departed', 'arrived', 'review'].includes(t.status))
  );

  const completedTickets = computed(() => 
    tickets.value.filter(t => t.status === 'completed')
  );

  const currentJob = computed(() => {
    const jobs = ongoingTickets.value;
    return jobs.length > 0 ? jobs[0] : null;
  });

  async function loadTickets(reset = false) {
    if (loadingMore.value && !reset) return;

    try {
      if (reset) {
        refreshing.value = true;
        hasMore.value = true;
      } else {
        loadingMore.value = true;
      }

      const offset = reset ? 0 : tickets.value.length;
      const limit = 20;

      await new Promise(resolve => setTimeout(resolve, 500));
      const newTickets = MOCK_TICKETS.slice(offset, offset + limit);

      if (newTickets.length < limit) {
        hasMore.value = false;
      }

      if (reset) {
        tickets.value = newTickets;
      } else {
        tickets.value = [...tickets.value, ...newTickets];
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      loading.value = false;
      refreshing.value = false;
      loadingMore.value = false;
    }
  }

  async function acceptTicket(id: string) {
    const ticket = tickets.value.find(t => t.id === id);
    if (ticket) {
      ticket.status = 'assigned';
      ticket.assignee = 'Mike Technician';
    }
    if (currentTicket.value?.id === id) {
      currentTicket.value = ticket || null;
    }
  }

  async function updateTicket(id: string, updates: Partial<Ticket>) {
    const index = tickets.value.findIndex(t => t.id === id);
    if (index !== -1) {
      tickets.value[index] = { ...tickets.value[index], ...updates };
    }
    if (currentTicket.value?.id === id) {
      currentTicket.value = { ...currentTicket.value, ...updates };
    }
  }

  function setCurrentTicket(ticket: Ticket | null) {
    currentTicket.value = ticket;
  }

  return {
    tickets,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    currentTicket,
    openTickets,
    ongoingTickets,
    completedTickets,
    currentJob,
    loadTickets,
    acceptTicket,
    updateTicket,
    setCurrentTicket,
  };
});
