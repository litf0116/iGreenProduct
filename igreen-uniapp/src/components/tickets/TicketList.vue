<template>
  <view class="ticket-list">
    <view class="header">
      <text class="title">{{ title }}</text>
    </view>

    <view class="refresh-indicator" v-if="refreshing">
      <view class="refresh-spinner"></view>
      <text class="refresh-text">Syncing...</text>
    </view>

    <scroll-view
      class="ticket-scroll"
      scroll-y
      : refresher-enabled="enableRefresh"
      : refresher-triggered="refreshing"
      @refresherrefresh="handleRefresh"
      @scrolltolower="handleLoadMore"
      :upper-threshold="50"
    >
      <view class="ticket-cards" v-if="tickets.length > 0">
        <TicketCard
          v-for="ticket in tickets"
          :key="ticket.id"
          :ticket="ticket"
          @click="handleTicketClick"
          @grab="handleGrab"
        />

        <view v-if="loadingMore" class="loading-more">
          <view class="loading-spinner"></view>
          <text class="loading-text">Loading more...</text>
        </view>

        <view v-else-if="!hasMore && tickets.length > 0" class="end-indicator">
          <text class="end-text">No more tickets</text>
        </view>
      </view>

      <Empty
        v-else-if="!loading && !refreshing"
        icon="📋"
        text="No tickets found"
        subtext="Pull down to refresh"
      >
        <template #action>
          <Button variant="outline" size="sm" @click="handleRefresh">
            Refresh
          </Button>
        </template>
      </Empty>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import type { Ticket } from '@/types/ticket';
import { Button, Empty } from '../ui';
import TicketCard from './TicketCard.vue';

const props = withDefaults(defineProps<{
  title: string;
  tickets: Ticket[];
  showAssignee?: boolean;
  enableRefresh?: boolean;
  enableLoadMore?: boolean;
  refreshing?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  loading?: boolean;
}>(), {
  showAssignee: true,
  enableRefresh: true,
  enableLoadMore: true,
  refreshing: false,
  loadingMore: false,
  hasMore: true,
  loading: false,
});

const emit = defineEmits<{
  (e: 'ticketClick', ticket: Ticket): void;
  (e: 'grab', ticket: Ticket): void;
  (e: 'refresh'): void;
  (e: 'loadMore'): void;
}>();

function handleTicketClick(ticket: Ticket) {
  emit('ticketClick', ticket);
}

function handleGrab(ticket: Ticket) {
  emit('grab', ticket);
}

function handleRefresh() {
  if (!props.refreshing) {
    emit('refresh');
  }
}

function handleLoadMore() {
  if (props.enableLoadMore && props.hasMore && !props.loadingMore) {
    emit('loadMore');
  }
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.ticket-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  padding: $spacing-4;
  padding-bottom: 0;
}

.title {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $gray-900;
  letter-spacing: -0.5px;
}

.refresh-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-3;
  color: $gray-500;
}

.refresh-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid $gray-200;
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.refresh-text {
  font-size: $text-sm;
}

.ticket-scroll {
  flex: 1;
  padding: $spacing-4;
}

.ticket-cards {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-4;
  color: $gray-400;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid $gray-200;
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: $text-sm;
}

.end-indicator {
  text-align: center;
  padding: $spacing-4;
}

.end-text {
  font-size: $text-sm;
  color: $gray-400;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
