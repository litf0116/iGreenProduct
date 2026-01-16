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
          <text class="menu-icon" :class="item.iconClass"></text>
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
        <text class="menu-icon profile-icon"></text>
        <text class="menu-label">{{ profileText }}</text>
      </view>
    </scroll-view>

    <view class="sidebar-footer">
      <view class="user-info">
        <view class="user-avatar">
          <text class="avatar-text">{{ userInitials }}</text>
        </view>
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

const props = defineProps<{
  currentView: string;
}>();

const emit = defineEmits<{
  (e: 'update:currentView', view: string): void;
}>();

const userStore = useUserStore();

const menuItems = computed(() => [
  { id: 'dashboard', label: 'Dashboard', iconClass: 'icon-dashboard' },
  { id: 'queue', label: 'Ticket Queue', iconClass: 'icon-queue' },
  { id: 'my-work', label: 'My Workspace', iconClass: 'icon-work' },
  { id: 'history', label: 'History', iconClass: 'icon-history' },
]);

const settingsText = computed(() => 'Settings');
const profileText = computed(() => 'Profile');

const userName = computed(() => userStore.user?.name || 'Mike Technician');
const userRole = computed(() => userStore.user?.role || 'L3 Senior Engineer');
const userInitials = computed(() => {
  const name = userName.value;
  return name.split(' ').map(n => n[0]).join('').slice(0, 2);
});

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
  }
}

.menu-icon {
  width: 16px;
  height: 16px;
  background: $gray-400;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;

  &.icon-dashboard {
    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>');
  }

  &.icon-queue {
    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>');
  }

  &.icon-work {
    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>');
  }

  &.icon-history {
    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>');
  }

  &.profile-icon {
    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>');
  }
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

.user-avatar {
  width: 36px;
  height: 36px;
  background: $gray-700;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 12px;
  font-weight: $font-bold;
  color: $white;
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
