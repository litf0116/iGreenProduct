<template>
  <view class="status-badge" :class="statusClass">
    <text class="status-icon">{{ icon }}</text>
    <text class="status-text">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TicketStatus } from '@/types/ticket';

const props = defineProps<{
  status: TicketStatus;
}>();

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

const label = computed(() => labelMap[props.status] || props.status);
const icon = computed(() => iconMap[props.status] || '•');

const statusClass = computed(() => {
  const classMap: Record<TicketStatus, string> = {
    OPEN: 'status-open',
    ASSIGNED: 'status-assigned',
    ACCEPTED: 'status-accepted',
    IN_PROGRESS: 'status-progress',
    DEPARTED: 'status-progress',
    ARRIVED: 'status-progress',
    REVIEW: 'status-review',
    COMPLETED: 'status-completed',
    DECLINED: 'status-declined',
  };
  return classMap[props.status] || 'status-default';
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px $spacing-2;
  border-radius: $radius-sm;
  font-size: 10px;
  font-weight: $font-medium;
}

.status-icon {
  font-size: 10px;
}

.status-text {
  text-transform: capitalize;
}

.status-open {
  background: rgba($blue-500, 0.1);
  color: $blue-600;
}

.status-assigned,
.status-accepted {
  background: rgba($warning-color, 0.1);
  color: $warning-600;
}

.status-progress {
  background: rgba($purple-500, 0.1);
  color: $purple-600;
}

.status-review {
  background: rgba($indigo-500, 0.1);
  color: $indigo-600;
}

.status-completed {
  background: rgba($success-color, 0.1);
  color: $success-600;
}

.status-declined {
  background: rgba($error-color, 0.1);
  color: $error-color;
}

.status-default {
  background: rgba($gray-500, 0.1);
  color: $gray-600;
}
</style>
