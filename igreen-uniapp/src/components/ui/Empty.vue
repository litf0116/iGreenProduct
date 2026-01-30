<template>
  <view class="empty-state">
    <view class="empty-icon">
      <text>{{ icon }}</text>
    </view>
    <text class="empty-text">{{ text }}</text>
    <text v-if="subtext" class="empty-subtext">{{ subtext }}</text>
    <view v-if="$slots.action" class="empty-action">
      <slot name="action"></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string;
  text: string;
  subtext?: string;
}>(), {
  icon: '📋',
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-12 $spacing-4;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: $spacing-4;
}

.empty-text {
  font-size: $text-lg;
  font-weight: $font-weight-medium;
  color: $gray-900;
  display: block;
  margin-bottom: $spacing-2;
}

.empty-subtext {
  font-size: $text-sm;
  color: $gray-500;
  display: block;
}

.empty-action {
  margin-top: $spacing-6;
}
</style>
