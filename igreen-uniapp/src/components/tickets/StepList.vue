<template>
  <view class="step-list">
    <view
      v-for="(step, index) in steps"
      :key="step.id"
      class="step-item"
      :class="{ completed: step.completed }"
      @click="handleToggle(index)"
    >
      <view class="step-checkbox" :class="{ completed: step.completed }">
        <text class="check-icon">{{ step.completed ? '✓' : '' }}</text>
      </view>
      <text class="step-label">{{ step.label }}</text>
      <view v-if="step.completed" class="step-timestamp">
        {{ formatTime(step.completedAt) }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Step {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: string;
}

const props = defineProps<{
  steps: Step[];
}>();

const emit = defineEmits<{
  (e: 'change', steps: Step[]): void;
  (e: 'toggle', index: number): void;
}>();

function handleToggle(index: number) {
  emit('toggle', index);
}

function formatTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.step-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.step-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-2 0;
  cursor: pointer;

  &.completed {
    .step-label {
      color: $gray-400;
      text-decoration: line-through;
    }
  }
}

.step-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid $gray-300;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &.completed {
    background: $green-500;
    border-color: $green-500;
  }

  .check-icon {
    font-size: 14px;
    color: $white;
  }
}

.step-label {
  flex: 1;
  font-size: $text-sm;
  color: $gray-700;
  line-height: 1.4;
}

.step-timestamp {
  font-size: 12px;
  color: $gray-400;
  flex-shrink: 0;
}
</style>
