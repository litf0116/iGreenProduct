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
  font-weight: $font-medium;
  border: 1px solid;
}

.type-corrective {
  background: rgba($orange-500, 0.1);
  color: $orange-600;
  border-color: rgba($orange-200, 0.5);
}

.type-planned {
  background: rgba($blue-500, 0.1);
  color: $blue-600;
  border-color: rgba($blue-200, 0.5);
}

.type-preventive {
  background: rgba($green-500, 0.1);
  color: $green-600;
  border-color: rgba($green-200, 0.5);
}

.type-problem {
  background: rgba($rose-500, 0.1);
  color: $rose-600;
  border-color: rgba($rose-200, 0.5);
}
</style>
