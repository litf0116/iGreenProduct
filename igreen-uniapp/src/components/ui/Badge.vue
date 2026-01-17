<template>
  <view class="badge" :class="[variantClass, sizeClass]">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md';
}>(), {
  variant: 'default',
  size: 'md',
});

const variantClass = computed(() => `badge-${props.variant}`);
const sizeClass = computed(() => `badge-${props.size}`);
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-sm;
  font-weight: $font-medium;
  font-size: $text-xs;
}

.badge-sm {
  padding: 2px $spacing-1;
  font-size: 10px;
}

.badge-md {
  padding: 2px $spacing-2;
}

.badge-default {
  background: rgba($primary-color, 0.1);
  color: $primary-color;
}

.badge-success {
  background: rgba($success-color, 0.1);
  color: $success-color;
}

.badge-warning {
  background: rgba($warning-color, 0.1);
  color: $warning-color;
}

.badge-error {
  background: rgba($error-color, 0.1);
  color: $error-color;
}

.badge-info {
  background: rgba($info-color, 0.1);
  color: $info-color;
}

.badge-outline {
  background: transparent;
  border: 1px solid $gray-300;
  color: $gray-600;
}
</style>
