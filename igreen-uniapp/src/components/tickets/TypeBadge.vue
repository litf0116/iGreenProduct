<template>
  <view class="type-badge" :class="typeClass">
    <text class="type-text">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
import type { TicketType } from '@/types/ticket';

const props = defineProps<{
  type: TicketType;
}>();

const labelMap: Record<TicketType, string> = {
  CORRECTIVE: 'Corrective',
  PLANNED: 'Planned',
  PREVENTIVE: 'Preventive',
  PROBLEM: 'Problem',
};

const typeClass = computed(() => `type-${props.type.toLowerCase()}`);
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

.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px $spacing-1;
  border-radius: $radius-sm;
  font-size: 10px;
  font-weight: $font-weight-medium;
  border: 1px solid;
}

.type-corrective {
  background: oklch(76.9% 0.188 70.08 / 10%);
  color: $chart-5;
  border-color: oklch(76.9% 0.188 70.08 / 20%);
}

.type-planned {
  background: oklch(64.6% 0.222 41.12 / 10%);
  color: $chart-1;
  border-color: oklch(64.6% 0.222 41.12 / 20%);
}

.type-preventive {
  background: oklch(60% 0.118 184.7 / 10%);
  color: $chart-2;
  border-color: oklch(60% 0.118 184.7 / 20%);
}

.type-problem {
  background: oklch(54% 0.186 25.72 / 10%);
  color: $destructive;
  border-color: oklch(54% 0.186 25.72 / 20%);
}
</style>
