<template>
  <view class="priority-badge" :class="priorityClass">
    <text class="priority-text">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
import type { TicketPriority } from '@/types/ticket';

const props = defineProps<{
  priority: TicketPriority;
}>();

const labelMap: Record<TicketPriority, string> = {
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
  P4: 'P4',
};

const priorityClass = computed(() => `priority-${props.priority.toLowerCase()}`);
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

.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px $spacing-1;
  border-radius: $radius-sm;
  font-size: 10px;
  font-weight: $font-medium;
}

.priority-p1 {
  background: rgba($error-color, 0.1);
  color: $error-color;
}

.priority-p2 {
  background: rgba($warning-color, 0.1);
  color: $warning-600;
}

.priority-p3 {
  background: rgba($gray-500, 0.1);
  color: $gray-600;
}

.priority-p4 {
  background: rgba($gray-200, 0.5);
  color: $gray-500;
}
</style>
