<template>
  <view class="info-row" :class="{ border: showBorder }">
    <view v-if="$slots.icon || icon" class="info-icon-wrap">
      <slot name="icon">
        <text class="info-icon">{{ icon }}</text>
      </slot>
    </view>
    <view class="info-content">
      <text class="info-label">{{ label }}</text>
      <slot name="value">
        <text class="info-value" :class="{ 'value-primary': valuePrimary }">{{ value }}</text>
      </slot>
    </view>
    <view v-if="$slots.action" class="info-action">
      <slot name="action"></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string;
  value?: string;
  icon?: string;
  showBorder?: boolean;
  valuePrimary?: boolean;
}>(), {
  value: '',
  showBorder: true,
  valuePrimary: false,
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-3 0;
  min-height: 44px;

  &.border {
    border-bottom: 1px solid $gray-100;
  }

  &:last-child {
    border-bottom: none;
  }
}

.info-icon-wrap {
  margin-right: $spacing-3;
}

.info-icon {
  font-size: 16px;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.info-label {
  font-size: $text-sm;
  color: $gray-500;
}

.info-value {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $gray-900;
  text-align: right;

  &.value-primary {
    color: $primary-color;
  }
}

.info-action {
  flex-shrink: 0;
  margin-left: $spacing-3;
}
</style>
