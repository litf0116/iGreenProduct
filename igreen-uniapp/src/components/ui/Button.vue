<template>
  <view
    class="btn"
    :class="[variantClass, sizeClass, { loading: loading, disabled: disabled }]"
    :hover-class="disabled || loading ? 'none' : hoverClass"
    @click="handleClick"
  >
    <view v-if="loading" class="btn-spinner"></view>
    <text class="btn-text">
      <slot></slot>
    </text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  hoverClass?: string;
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  hoverClass: 'btn-hover',
});

const emit = defineEmits<{
  (e: 'click', event: any): void;
}>();

const variantClass = computed(() => `btn-${props.variant}`);
const sizeClass = computed(() => `btn-${props.size}`);

function handleClick(e: any) {
  if (!props.disabled && !props.loading) {
    emit('click', e);
  }
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  border-radius: $radius-md;
  font-weight: $font-medium;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.loading {
    cursor: wait;
  }
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-text {
  font-size: $text-sm;
}

.btn-sm {
  height: 32px;
  padding: 0 $spacing-3;

  .btn-text {
    font-size: $text-xs;
  }
}

.btn-md {
  height: 40px;
  padding: 0 $spacing-4;
}

.btn-lg {
  height: 48px;
  padding: 0 $spacing-6;

  .btn-text {
    font-size: $text-base;
  }
}

.btn-primary {
  background: $primary-color;
  border: none;
  color: $white;

  &:not(.disabled):not(.loading):hover {
    background: $primary-dark;
  }

  &.loading {
    background: $gray-400;
  }
}

.btn-secondary {
  background: $gray-100;
  border: none;
  color: $gray-700;

  &:not(.disabled):not(.loading):hover {
    background: $gray-200;
  }
}

.btn-outline {
  background: transparent;
  border: 1px solid $gray-300;
  color: $gray-700;

  &:not(.disabled):not(.loading):hover {
    background: $gray-50;
    border-color: $gray-400;
  }
}

.btn-ghost {
  background: transparent;
  border: none;
  color: $gray-600;

  &:not(.disabled):not(.loading):hover {
    background: $gray-100;
  }
}

.btn-danger {
  background: $error-color;
  border: none;
  color: $white;

  &:not(.disabled):not(.loading):hover {
    background: darken(#ef4444, 10%);
  }
}

.none {
  pointer-events: none;
}
</style>
