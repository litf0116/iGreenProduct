<template>
  <TicketList
    :title="title"
    :tickets="tickets"
    :refreshing="refreshing"
    :loading-more="loadingMore"
    :has-more="hasMore"
    @ticket-click="handleTicketClick"
    @refresh="handleRefresh"
    @load-more="handleLoadMore"
  />
</template>

<script setup lang="ts">
import type { Ticket } from '@/types/ticket';
import { TicketList } from '@/components/tickets';

defineProps<{
  title: string;
  tickets: Ticket[];
  refreshing?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
}>();

const emit = defineEmits<{
  (e: 'ticketClick', ticket: Ticket): void;
  (e: 'refresh'): void;
  (e: 'loadMore'): void;
}>();

function handleTicketClick(ticket: Ticket) {
  emit('ticketClick', ticket);
}

function handleRefresh() {
  emit('refresh');
}

function handleLoadMore() {
  emit('loadMore');
}
</script>
