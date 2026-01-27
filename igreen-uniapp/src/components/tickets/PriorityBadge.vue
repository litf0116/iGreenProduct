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
  font-weight: $font-weight-medium;
}

.priority-p1 {
  background: oklch(54% 0.186 25.72 / 10%);
  color: $destructive;
}

.priority-p2 {
  background: oklch(82.8% 0.189 84.43 / 10%);
  color: $chart-4;
}

.priority-p3 {
  background: oklch(93% 0.01 265 / 50%);
  color: $muted-foreground;
}

.priority-p4 {
  background: oklch(93% 0.01 265 / 30%);
  color: $muted-foreground;
}
</style>
