<template>
  <view
    class="btn"
    :class="[variantClass, sizeClass, { loading: loading, disabled: disabled }]"
    :hover-class="disabled || loading ? 'none' : 'btn-hover'"
    v-on="$attrs"
    @tap="handleTap"
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
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
});

const emit = defineEmits<{
  (e: 'click', event: any): void;
}>();

const variantClass = computed(() => `btn-${props.variant}`);
const sizeClass = computed(() => `btn-${props.size}`);

function handleTap(e: any) {
  handleEvent(e);
}

function handleClick(e: any) {
  handleEvent(e);
}

function handleEvent(e: any) {
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
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.loading {
    cursor: wait;
  }
}

.btn-hover {
  transform: translateY(-1px);
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

// Primary - indigo-600 with indigo-700 hover (matches iGreenApp)
.btn-primary {
  background: $indigo-600;
  border: none;
  color: $white;

  &:not(.disabled):not(.loading):hover {
    background: $indigo-700;
  }

  &:not(.disabled):not(.loading):active {
    transform: translateY(0);
  }

  &.loading {
    background: $muted;
    color: $muted-foreground;
  }
}

// Secondary - ghost style (matches iGreenApp)
.btn-secondary {
  background: transparent;
  border: none;
  color: $foreground;

  &:not(.disabled):not(.loading):hover {
    background: $muted;
  }
}

// Outline - slate-200 border (matches iGreenApp)
.btn-outline {
  background: transparent;
  border: 1px solid $gray-200;
  color: $foreground;

  &:not(.disabled):not(.loading):hover {
    background: $accent;
    border-color: $gray-300;
  }
}

// Ghost - transparent background (matches iGreenApp)
.btn-ghost {
  background: transparent;
  border: none;
  color: $foreground;

  &:not(.disabled):not(.loading):hover {
    background: $muted;
  }
}

// Danger - destructive red (matches iGreenApp)
.btn-danger {
  background: $destructive;
  border: none;
  color: $destructive-foreground;

  &:not(.disabled):not(.loading):hover {
    background: darken($destructive, 10%);
  }
}

.none {
  pointer-events: none;
}
</style>
