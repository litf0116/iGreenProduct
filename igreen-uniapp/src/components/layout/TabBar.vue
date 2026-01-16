<template>
  <view class="tabbar">
    <view
      v-for="item in menuItems"
      :key="item.id"
      class="tab-item"
      :class="{ active: currentView === item.id }"
      @click="handleTabClick(item.id)"
    >
      <text class="tab-icon" :class="item.iconClass"></text>
      <text class="tab-label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentView: string;
}>();

const emit = defineEmits<{
  (e: 'update:currentView', view: string): void;
}>();

const menuItems = computed(() => [
  { id: 'dashboard', label: 'Home', iconClass: 'icon-home' },
  { id: 'queue', label: 'Queue', iconClass: 'icon-queue' },
  { id: 'my-work', label: 'Mine', iconClass: 'icon-work' },
  { id: 'profile', label: 'Profile', iconClass: 'icon-profile' },
]);

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

  &.active {
    .tab-label {
      color: $primary-color;
    }
  }
}

.tab-icon {
  width: 20px;
  height: 20px;
  background: $gray-500;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;

  .tab-item.active & {
    background: $primary-color;
  }

  &.icon-home {
    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>');
  }

  &.icon-queue {
    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>');
  }

  &.icon-work {
    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>');
  }

  &.icon-profile {
    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>');
  }
}

.tab-label {
  font-size: 10px;
  font-weight: $font-medium;
  color: $gray-500;
}
</style>
