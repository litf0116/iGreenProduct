<template>
  <view class="sidebar">
    <view class="sidebar-header">
      <view class="logo-container">
        <image class="logo-image" src="/static/logo.png" mode="aspectFit" />
      </view>
      <text class="app-name">iGreen+</text>
    </view>

    <scroll-view class="menu-scroll" scroll-y>
      <view class="menu-list">
        <view
          v-for="item in menuItems"
          :key="item.id"
          class="menu-item"
          :class="{ active: currentView === item.id }"
          @click="handleMenuClick(item.id)"
        >
          <text class="menu-icon">{{ item.icon }}</text>
          <text class="menu-label">{{ item.label }}</text>
        </view>
      </view>

      <view class="divider"></view>

      <text class="section-title">{{ settingsText }}</text>
      <view
        class="menu-item"
        :class="{ active: currentView === 'profile' }"
        @click="handleMenuClick('profile')"
      >
        <text class="menu-icon">👤</text>
        <text class="menu-label">{{ profileText }}</text>
      </view>
    </scroll-view>

    <view class="sidebar-footer">
      <view class="user-info">
        <Avatar :name="userName" size="sm" />
        <view class="user-details">
          <text class="user-name">{{ userName }}</text>
          <text class="user-role">{{ userRole }}</text>
        </view>
        <view class="settings-btn" @click="handleMenuClick('profile')">
          <text class="settings-icon">⚙</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { Avatar } from '@/components/ui';

const props = defineProps<{
  currentView: string;
}>();

const emit = defineEmits<{
  (e: 'update:currentView', view: string): void;
}>();

const userStore = useUserStore();

const menuItems = computed(() => [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'queue', label: 'Ticket Queue', icon: '📋' },
  { id: 'my-work', label: 'My Workspace', icon: '✅' },
  { id: 'history', label: 'History', icon: '📜' },
]);

const settingsText = 'Settings';
const profileText = 'Profile';

const userName = computed(() => userStore.user?.name || 'Mike Technician');
const userRole = computed(() => userStore.user?.role || 'L3 Senior Engineer');

function handleMenuClick(view: string) {
  emit('update:currentView', view);
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.sidebar {
  width: 256px;
  height: 100vh;
  background: $gray-950;
  display: flex;
  flex-direction: column;
  border-right: 1px solid $gray-800;
}

.sidebar-header {
  padding: $spacing-6;
  display: flex;
  align-items: center;
  gap: $spacing-2;
}

.logo-container {
  width: 32px;
  height: 32px;
  background: $white;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.logo-image {
  width: 100%;
  height: 100%;
}

.app-name {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $white;
  letter-spacing: -0.5px;
}

.menu-scroll {
  flex: 1;
  padding: 0 $spacing-4;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-2 $spacing-3;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $gray-900;
  }

  &.active {
    background: $success-color;

    .menu-label {
      color: $white;
    }

    .menu-icon {
      filter: brightness(0) invert(1);
    }
  }
}

.menu-icon {
  font-size: 16px;
  width: 16px;
  text-align: center;
}

.menu-label {
  font-size: $text-sm;
  color: $gray-400;

  .menu-item.active & {
    color: $white;
    font-weight: $font-medium;
  }
}

.divider {
  height: 1px;
  background: $gray-800;
  margin: $spacing-4 0;
}

.section-title {
  font-size: 12px;
  font-weight: $font-semibold;
  color: $gray-500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: $spacing-2;
  display: block;
}

.sidebar-footer {
  background: $gray-900;
  padding: $spacing-4;
  border-top: 1px solid $gray-800;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-3;
}

.user-details {
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $white;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: $gray-400;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.settings-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.settings-icon {
  font-size: 16px;
  color: $gray-400;
}
</style>
