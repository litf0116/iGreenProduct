<template>
  <view class="tabbar">
    <view
      v-for="item in menuItems"
      :key="item.id"
      class="tab-item"
      :class="{ active: currentView === item.id }"
      @click="handleTabClick(item.id)"
    >
      <view class="tab-icon-wrapper">
        <text class="tab-icon">{{ item.icon }}</text>
      </view>
      <text class="tab-label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentView: string;
}>();

const emit = defineEmits<{
  (e: 'update:currentView', view: string): void;
}>();

const menuItems = [
  { id: 'dashboard', label: 'Home', icon: '🏠' },
  { id: 'queue', label: 'Queue', icon: '📋' },
  { id: 'my-work', label: 'Mine', icon: '✅' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

function handleTabClick(view: string) {
  emit('update:currentView', view);
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.tabbar {
  height: 64px;
  background: $white;
  border-top: 1px solid $gray-200;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 $spacing-2;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: $radius-md;

  &:active {
    background: $gray-50;
  }

    &.active {
    .tab-icon-wrapper {
      transform: scale(1.1);
    }

    .tab-label {
      color: $primary;  // green-600 - matches iGreenApp
      font-weight: $font-weight-medium;
    }
  }
}

.tab-icon-wrapper {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.tab-icon {
  font-size: 20px;
}

.tab-label {
  font-size: 10px;
  font-weight: $font-weight-medium;
  color: $gray-500;  // slate-500 for inactive
  transition: color 0.2s ease;
}
</style>
