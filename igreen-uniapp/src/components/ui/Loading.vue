<template>
  <view class="loading-wrapper" :class="{ inline: inline }">
    <view class="loading-spinner" :class="[sizeClass]"></view>
    <text v-if="text" class="loading-text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  inline?: boolean;
}>(), {
  size: 'md',
  inline: false,
});

const sizeClass = computed(() => `loading-${props.size}`);
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-8;
  gap: $spacing-3;

  &.inline {
    flex-direction: row;
    padding: $spacing-2;
  }
}

.loading-spinner {
  border: 2px solid $gray-200;
  border-top-color: $indigo-600;  // indigo-600 - matches iGreenApp loading spinner
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.loading-sm {
  width: 16px;
  height: 16px;
}

.loading-md {
  width: 24px;
  height: 24px;
}

.loading-lg {
  width: 32px;
  height: 32px;
}

.loading-text {
  font-size: $text-sm;
  color: $gray-500;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
