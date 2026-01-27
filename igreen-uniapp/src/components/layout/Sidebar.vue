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
          <view class="menu-icon-wrapper">
            <text class="menu-icon">{{ item.icon }}</text>
          </view>
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
        <view class="menu-icon-wrapper">
          <text class="menu-icon">👤</text>
        </view>
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
import { getUser } from '@/store';
import { Avatar } from '@/components/ui';

const props = defineProps<{
  currentView: string;
}>();

const emit = defineEmits<{
  (e: 'update:currentView', view: string): void;
}>();

const user = computed(() => getUser());

const menuItems = computed(() => [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'queue', label: 'Ticket Queue', icon: '📋' },
  { id: 'my-work', label: 'My Workspace', icon: '✅' },
  { id: 'history', label: 'History', icon: '📜' },
]);

const settingsText = 'Settings';
const profileText = 'Profile';

const userName = computed(() => user.value?.name || 'Mike Technician');
const userRole = computed(() => user.value?.role || 'L3 Senior Engineer');

function handleMenuClick(view: string) {
  emit('update:currentView', view);
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.sidebar {
  width: 256px;
  height: 100vh;
  background: $gray-950;  // slate-950 - dark theme like iGreenApp
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
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
  font-weight: $font-weight-bold;
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
    background: $gray-800;  // slate-800
    
    .menu-label {
      color: $white;
    }
  }

  &.active {
    background: $primary;  // green-600 - matches iGreenApp
    
    .menu-label {
      color: $sidebar-primary-foreground;
      font-weight: $font-weight-medium;
    }
    
    .menu-icon-wrapper {
      filter: brightness(0) invert(1);
    }
  }
}

.menu-icon-wrapper {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon {
  font-size: 16px;
}

.menu-label {
  font-size: $text-sm;
  color: $gray-400;  // slate-400 for inactive
  transition: color 0.2s ease;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: $spacing-4 0;
}

.section-title {
  font-size: 12px;
  font-weight: $font-weight-semibold;
  color: $gray-500;  // slate-500
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: $spacing-2;
  display: block;
  padding-left: $spacing-3;
}

.sidebar-footer {
  background: $gray-900;  // slate-900
  padding: $spacing-4;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  font-weight: $font-weight-medium;
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
  border-radius: $radius-md;
  transition: all 0.2s ease;

  &:hover {
    background: $gray-800;
    
    .settings-icon {
      color: $white;
    }
  }
}

.settings-icon {
  font-size: 16px;
  color: $gray-400;
  transition: color 0.2s ease;
}
</style>
