<template>
  <view class="ticket-list">
    <view class="header">
      <text class="title">{{ title }}</text>
    </view>

    <view class="refresh-indicator" v-if="refreshing">
      <text class="refresh-icon">↻</text>
      <text class="refresh-text">Syncing...</text>
    </view>

    <scroll-view class="ticket-scroll" scroll-y @scrolltoupper="handleRefresh" :upper-threshold="50">
      <view class="ticket-cards" v-if="tickets.length > 0">
        <view
          v-for="ticket in tickets"
          :key="ticket.id"
          class="ticket-card"
          @click="handleTicketClick(ticket)"
        >
          <view class="status-stripe" :class="getStatusClass(ticket.status)"></view>
          <view class="ticket-content">
            <view class="ticket-header">
              <view class="ticket-badges">
                <text class="ticket-id">{{ ticket.id }}</text>
                <view class="priority-badge" :class="getPriorityClass(ticket.priority)">
                  <text class="priority-text">{{ ticket.priority }}</text>
                </view>
                <view class="type-badge" :class="getTypeClass(ticket.type)">
                  <text class="type-text">{{ getTypeLabel(ticket.type) }}</text>
                </view>
              </view>
              <text class="ticket-date">{{ formatDate(ticket.createdAt) }}</text>
            </view>

            <text class="ticket-title">{{ ticket.title }}</text>

            <view class="ticket-location" v-if="ticket.location || ticket.site">
              <text class="location-icon">📍</text>
              <text class="location-text">{{ ticket.location || ticket.site }}</text>
            </view>

            <view class="ticket-footer">
              <view class="ticket-status">
                <text class="status-icon">{{ getStatusIcon(ticket.status) }}</text>
                <text class="status-text">{{ getStatusLabel(ticket.status) }}</text>
              </view>

              <view class="ticket-action" v-if="ticket.status === 'OPEN'">
                <view class="grab-btn">
                  <text class="grab-icon">⚡</text>
                  <text class="grab-text">Grab</text>
                </view>
              </view>

              <view class="ticket-assignee" v-else-if="ticket.assignedToName || ticket.assignee">
                <view class="assignee-avatar">
                  <text class="avatar-text">{{ (ticket.assignedToName || ticket.assignee || '').charAt(0) }}</text>
                </view>
                <text class="assignee-name">{{ ticket.assignedToName || ticket.assignee }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="loading-more" v-if="loadingMore">
          <text class="loading-icon">↻</text>
          <text class="loading-text">Loading more...</text>
        </view>
      </view>

      <view class="empty-state" v-else-if="!loading && !refreshing">
        <text class="empty-icon">📋</text>
        <text class="empty-text">No tickets found</text>
        <text class="empty-subtext">Pull down to refresh</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Ticket, TicketStatus, TicketPriority, TicketType } from '@/types/ticket';
import { getStatusLabel, getStatusIcon, getTypeLabel, formatDate } from '@/types/ticket';
import { getStatusClass, getPriorityClass, getTypeClass } from '@/utils/helpers';

const props = defineProps<{
  title: string;
  tickets: Ticket[];
  showAssignee?: boolean;
  refreshing?: boolean;
  loadingMore?: boolean;
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
</script>

<script lang="ts">
export default {
  options: {
    styleIsolation: 'shared',
  },
};
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

.refresh-icon {
  font-size: 14px;
  animation: spin 1s linear infinite;
}

.refresh-text {
  font-size: $text-sm;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

.ticket-card {
  background: $white;
  border-radius: $radius-lg;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  overflow: hidden;
  cursor: pointer;
  transition: background 0.2s ease;

  &:active {
    background: $gray-50;
  }
}

.status-stripe {
  width: 4px;
  flex-shrink: 0;

  &.bg-blue { background: $blue-500; }
  &.bg-green { background: $green-500; }
  &.bg-purple { background: $purple-500; }
  &.bg-yellow { background: $yellow-500; }
  &.bg-red { background: $red-500; }
  &.bg-indigo { background: $indigo-500; }
}

.ticket-content {
  flex: 1;
  padding: $spacing-4;
}

.ticket-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: $spacing-2;
  flex-wrap: wrap;
  gap: $spacing-2;
}

.ticket-badges {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  flex-wrap: wrap;
}

.ticket-id {
  font-size: 12px;
  font-family: monospace;
  font-weight: $font-medium;
  color: $gray-500;
}

.priority-badge {
  padding: 2px $spacing-1;
  border-radius: $radius-sm;
  font-size: 10px;
  font-weight: $font-medium;
  text-transform: capitalize;

  &.priority-p1 {
    background: rgba($error-color, 0.1);
    color: $error-color;
  }

  &.priority-p2 {
    background: rgba($warning-color, 0.1);
    color: $warning-color;
  }

  &.priority-p3 {
    background: rgba($gray-500, 0.1);
    color: $gray-600;
  }

  &.priority-p4 {
    background: rgba($gray-200, 0.5);
    color: $gray-500;
  }
}

.type-badge {
  padding: 2px $spacing-1;
  border-radius: $radius-sm;
  font-size: 10px;
  font-weight: $font-medium;
  border: 1px solid;

  &.type-corrective {
    background: rgba($orange-500, 0.1);
    color: $orange-600;
    border-color: rgba($orange-200, 0.5);
  }

  &.type-planned {
    background: rgba($blue-500, 0.1);
    color: $blue-600;
    border-color: rgba($blue-200, 0.5);
  }

  &.type-preventive {
    background: rgba($green-500, 0.1);
    color: $green-600;
    border-color: rgba($green-200, 0.5);
  }

  &.type-problem {
    background: rgba($rose-500, 0.1);
    color: $rose-600;
    border-color: rgba($rose-200, 0.5);
  }
}

.ticket-date {
  font-size: 12px;
  color: $gray-400;
}

.ticket-title {
  font-size: $text-base;
  font-weight: $font-bold;
  color: $gray-900;
  display: block;
  margin-bottom: $spacing-2;
  line-height: 1.4;
}

.ticket-location {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  margin-bottom: $spacing-3;
}

.location-icon {
  font-size: 12px;
}

.location-text {
  font-size: $text-xs;
  color: $gray-600;
}

.ticket-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid $gray-50;
  padding-top: $spacing-3;
}

.ticket-status {
  display: flex;
  align-items: center;
  gap: $spacing-1;
}

.status-icon {
  font-size: 14px;
}

.status-text {
  font-size: $text-xs;
  font-weight: $font-medium;
  color: $gray-700;
  text-transform: capitalize;
}

.grab-btn {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-1 $spacing-3;
  background: $blue-600;
  border-radius: $radius-md;
}

.grab-icon {
  font-size: 12px;
}

.grab-text {
  font-size: $text-xs;
  font-weight: $font-medium;
  color: $white;
}

.ticket-assignee {
  display: flex;
  align-items: center;
  gap: $spacing-1;
}

.assignee-avatar {
  width: 20px;
  height: 20px;
  background: rgba($indigo-500, 0.1);
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 10px;
  font-weight: $font-bold;
  color: $indigo-600;
}

.assignee-name {
  font-size: $text-xs;
  color: $gray-500;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: $spacing-12 $spacing-4;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: $spacing-4;
  display: block;
}

.empty-text {
  font-size: $text-lg;
  font-weight: $font-medium;
  color: $gray-900;
  display: block;
  margin-bottom: $spacing-2;
}

.empty-subtitle {
  font-size: $text-sm;
  color: $gray-500;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-4;
  color: $gray-400;
}

.loading-icon {
  font-size: 16px;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: $text-sm;
}
</style>
