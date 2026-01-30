<template>
  <view class="avatar" :class="[sizeClass]" :style="{ backgroundColor: bgColor }">
    <text class="avatar-text" :style="{ color: textColor }">{{ initials }}</text>
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

// Use indigo theme colors (matches iGreenApp)
const bgColor = computed(() => {
  return $indigo-100;  // indigo-100
});

const textColor = computed(() => {
  return $indigo-600;  // indigo-600
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
    font-weight: $font-weight-bold;
  }
}

.avatar-md {
  width: 32px;
  height: 32px;

  .avatar-text {
    font-size: 12px;
    font-weight: $font-weight-bold;
  }
}

.avatar-lg {
  width: 48px;
  height: 48px;

  .avatar-text {
    font-size: 16px;
    font-weight: $font-weight-bold;
  }
}

.avatar-text {
  text-transform: uppercase;
}
</style>
