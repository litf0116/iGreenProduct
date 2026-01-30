<template>
  <view class="status-badge" :class="statusClass">
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

const label = computed(() => labelMap[props.status] || props.status);

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
  padding: 2px $spacing-2;
  border-radius: $radius-sm;
  font-size: 10px;
  font-weight: $font-weight-medium;
  height: 20px;
  text-transform: capitalize;
}

// Open - indigo-50 with indigo-700 (matches iGreenApp)
.status-open {
  background: $indigo-50;
  color: $indigo-700;
}

// Assigned/Accepted - yellow/orange style
.status-assigned,
.status-accepted {
  background: $warning-bg;
  color: $warning-600;
}

// In Progress/Departed/Arrived - purple style
.status-progress {
  background: $purple-100;
  color: $purple-600;
}

// Review - indigo style
.status-review {
  background: $indigo-100;
  color: $indigo-600;
}

// Completed - green-50 with green-700 (matches iGreenApp)
.status-completed {
  background: $success-bg;
  color: $success-600;
  border: 1px solid rgba($success-color, 0.2);
}

// Declined - red style
.status-declined {
  background: $error-bg;
  color: $error-color;
}

// Default - slate style
.status-default {
  background: $gray-100;
  color: $gray-600;
}
</style>
