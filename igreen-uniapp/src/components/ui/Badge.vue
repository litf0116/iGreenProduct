<template>
  <view class="badge" :class="[variantClass, sizeClass]">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
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
  font-weight: $font-weight-medium;
  font-size: $text-xs;
  border: 1px solid transparent;
}

.badge-sm {
  padding: 2px $spacing-1;
  font-size: 10px;
  height: 20px;
}

.badge-md {
  padding: 2px $spacing-2;
  height: 24px;
}

// Matches iGreenApp's secondary variant (indigo-50 with indigo-700)
.badge-default,
.badge-secondary {
  background: $indigo-50;  // indigo-50 - matches iGreenApp
  color: $indigo-700;      // indigo-700 - matches iGreenApp
  
  &:hover {
    background: $indigo-100;
  }
}

// Success - green-50 with green-700
.badge-success {
  background: $success-bg;  // green-50
  color: $success-600;      // green-600
  border-color: rgba($success-color, 0.2);
}

// Warning - orange/yellow style
.badge-warning {
  background: $warning-bg;  // amber-50
  color: $warning-600;      // amber-600
  border-color: rgba($warning-color, 0.2);
}

// Error/Destructive - red style
.badge-error {
  background: $error-bg;    // red-50
  color: $error-color;       // red-500
  border-color: rgba($error-color, 0.2);
}

// Info - blue style
.badge-info {
  background: $info-bg;     // blue-50
  color: $info-color;        // blue-500
  border-color: rgba($info-color, 0.2);
}

// Outline variant
.badge-outline {
  background: transparent;
  border: 1px solid $border;
  color: $foreground;
}
</style>
