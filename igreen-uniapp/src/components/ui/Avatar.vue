<template>
  <view class="avatar" :class="[sizeClass]" :style="{ backgroundColor: bgColor }">
    <text class="avatar-text">{{ initials }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  name: string;
  size?: 'sm' | 'md' | 'lg';
}>(), {
  size: 'md',
});

const sizeClass = computed(() => `avatar-${props.size}`);

const initials = computed(() => {
  const name = props.name || '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

const bgColor = computed(() => {
  const colors = [
    'rgba(99, 102, 241, 0.1)',
    'rgba(245, 158, 11, 0.1)',
    'rgba(16, 185, 129, 0.1)',
    'rgba(239, 68, 68, 0.1)',
    'rgba(59, 130, 246, 0.1)',
    'rgba(168, 85, 247, 0.1)',
  ];
  const index = props.name.charCodeAt(0) % colors.length;
  return colors[index];
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  flex-shrink: 0;
}

.avatar-sm {
  width: 24px;
  height: 24px;

  .avatar-text {
    font-size: 10px;
    font-weight: $font-bold;
  }
}

.avatar-md {
  width: 32px;
  height: 32px;

  .avatar-text {
    font-size: 12px;
    font-weight: $font-bold;
  }
}

.avatar-lg {
  width: 48px;
  height: 48px;

  .avatar-text {
    font-size: 16px;
    font-weight: $font-bold;
  }
}

.avatar-text {
  color: inherit;
  text-transform: uppercase;
}
</style>
