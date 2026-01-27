<template>
  <view class="card" :class="{ hover: hover }" @click="handleClick">
    <view v-if="$slots.header || title" class="card-header">
      <view class="card-header-left">
        <text v-if="title" class="card-title">{{ title }}</text>
        <slot name="header"></slot>
      </view>
      <view v-if="$slots.action" class="card-action">
        <slot name="action"></slot>
      </view>
    </view>
    <view class="card-content" :class="{ 'no-padding': !padding }">
      <slot></slot>
    </view>
    <view v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string;
  padding?: boolean;
  hover?: boolean;
}>(), {
  padding: true,
  hover: false,
});

const emit = defineEmits<{
  (e: 'click'): void;
}>();

function handleClick() {
  if (props.hover) {
    emit('click');
  }
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.card {
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  overflow: hidden;

  &.hover {
    cursor: pointer;
    transition: all 0.2s ease;

    &:active {
      background: $gray-50;  // slate-50 - matches iGreenApp
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-4;
  border-bottom: 1px solid $border;
}

.card-header-left {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.card-title {
  font-size: $text-base;
  font-weight: $font-weight-semibold;
  color: $foreground;
}

.card-action {
  flex-shrink: 0;
}

.card-content {
  padding: $spacing-4;

  &.no-padding {
    padding: 0;
  }
}

.card-footer {
  padding: $spacing-4;
  border-top: 1px solid $border;
  background: $gray-50;  // slate-50
}
</style>
