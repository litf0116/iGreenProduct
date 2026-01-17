<template>
  <view class="ticket-card" @click="handleClick">
    <view class="status-stripe" :class="statusClass"></view>
    <view class="ticket-content">
      <view class="ticket-header">
        <view class="ticket-badges">
          <text class="ticket-id">{{ ticket.id }}</text>
          <StatusBadge :status="ticket.status" />
          <PriorityBadge :priority="ticket.priority" />
          <TypeBadge :type="ticket.type" />
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

        <view v-if="ticket.status === 'OPEN'" class="ticket-action" @click.stop="handleGrab">
          <view class="grab-btn">
            <text class="grab-icon">⚡</text>
            <text class="grab-text">Grab</text>
          </view>
        </view>

        <view v-else-if="ticket.assignedToName || ticket.assignee" class="ticket-assignee">
          <Avatar :name="ticket.assignedToName || ticket.assignee" size="sm" />
          <text class="assignee-name">{{ ticket.assignedToName || ticket.assignee }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Ticket, TicketStatus } from '@/types/ticket';
import { formatDate } from '@/types/ticket';
import StatusBadge from './StatusBadge.vue';
import PriorityBadge from './PriorityBadge.vue';
import TypeBadge from './TypeBadge.vue';
import Avatar from '../ui/Avatar.vue';

const props = defineProps<{
  ticket: Ticket;
}>();

const emit = defineEmits<{
  (e: 'click', ticket: Ticket): void;
  (e: 'grab', ticket: Ticket): void;
}>();

const statusClass = computed(() => {
  const statusMap: Record<TicketStatus, string> = {
    OPEN: 'bg-blue',
    ASSIGNED: 'bg-yellow',
    ACCEPTED: 'bg-yellow',
    IN_PROGRESS: 'bg-purple',
    DEPARTED: 'bg-purple',
    ARRIVED: 'bg-purple',
    REVIEW: 'bg-indigo',
    COMPLETED: 'bg-green',
    DECLINED: 'bg-red',
  };
  return statusMap[props.ticket.status] || 'bg-gray';
});

function getStatusIcon(status: TicketStatus): string {
  const iconMap: Record<TicketStatus, string> = {
    OPEN: '📋',
    ASSIGNED: '👤',
    ACCEPTED: '✓',
    IN_PROGRESS: '🔧',
    DEPARTED: '🚗',
    ARRIVED: '📍',
    REVIEW: '👀',
    COMPLETED: '✅',
    DECLINED: '❌',
  };
  return iconMap[status] || '•';
}

function getStatusLabel(status: TicketStatus): string {
  const labelMap: Record<TicketStatus, string> = {
    OPEN: 'Open',
    ASSIGNED: 'Assigned',
    ACCEPTED: 'Accepted',
    IN_PROGRESS: 'In Progress',
    DEPARTED: 'Departed',
    ARRIVED: 'Arrived',
    REVIEW: 'Review',
    COMPLETED: 'Completed',
    DECLINED: 'Declined',
  };
  return labelMap[status] || status;
}

function handleClick() {
  emit('click', props.ticket);
}

function handleGrab() {
  emit('grab', props.ticket);
}
</script>

<script lang="ts">
import { computed } from 'vue';
export default {
  options: {
    styleIsolation: 'shared',
  },
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.ticket-card {
  background: $white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
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

.assignee-name {
  font-size: $text-xs;
  color: $gray-500;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
