<template>
  <view class="profile">
    <view class="profile-header">
      <text class="page-title">{{ userProfileText }}</text>
    </view>

    <view class="user-card">
      <view class="user-avatar">
        <text class="avatar-text">{{ userInitials }}</text>
      </view>
      <text class="user-name">{{ userName }}</text>
    </view>

    <view class="info-card">
      <text class="card-title">{{ accountInfoText }}</text>

      <view class="info-row">
        <view class="info-label-group">
          <text class="info-icon">📱</text>
          <text class="info-label">{{ phoneText }}</text>
        </view>
        <text class="info-value">{{ userPhone }}</text>
      </view>

      <view class="info-row">
        <view class="info-label-group">
          <text class="info-icon">👤</text>
          <text class="info-label">Login Name</text>
        </view>
        <text class="info-value">{{ userUsername }}</text>
      </view>

      <view class="info-row">
        <view class="info-label-group">
          <text class="info-icon">👥</text>
          <text class="info-label">Group</text>
        </view>
        <text class="info-value">{{ userGroup }}</text>
      </view>
    </view>

    <view class="settings-card">
      <text class="card-title">{{ appSettingsText }}</text>

      <view class="setting-row">
        <view class="setting-label-group">
          <view class="setting-icon bg-indigo">
            <text class="icon">🌐</text>
          </view>
          <text class="setting-label">{{ languageText }}</text>
        </view>
        <view class="language-switcher">
          <view
            class="lang-btn"
            :class="{ active: currentLanguage === 'en' }"
            @click="setLanguage('en')"
          >
            <text class="lang-text">English</text>
          </view>
          <view
            class="lang-btn"
            :class="{ active: currentLanguage === 'th' }"
            @click="setLanguage('th')"
          >
            <text class="lang-text">ไทย</text>
          </view>
        </view>
      </view>
    </view>

    <view class="logout-btn" @click="handleLogout">
      <text class="logout-icon">🚪</text>
      <text class="logout-text">{{ signOutText }}</text>
    </view>

    <view class="version-info">
      <text class="version-text">iGreen+ {{ versionText }} 1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { setLanguage, getLanguage } from '@/utils/i18n';

const emit = defineEmits<{
  (e: 'logout'): void;
}>();

const userStore = useUserStore();

const userProfileText = 'User Profile';
const accountInfoText = 'Account Information';
const phoneText = 'Phone';
const appSettingsText = 'App Settings';
const languageText = 'Language';
const signOutText = 'Sign Out';
const versionText = 'Version';

const userName = computed(() => userStore.user?.name || 'Guest User');
const userPhone = computed(() => userStore.user?.phone || '-');
const userUsername = computed(() => userStore.user?.username || 'guest');
const userGroup = computed(() => userStore.user?.groupName || '-' );
const userInitials = computed(() => {
  const name = userName.value;
  return name.split(' ').map(n => n[0]).join('').slice(0, 2);
});

const currentLanguage = computed(() => getLanguage());

function setLanguage(lang: 'en' | 'th') {
  setLanguage(lang);
}

function handleLogout() {
  userStore.logout();
  emit('logout');
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.profile {
  padding: $spacing-4;
  padding-bottom: 100px;
}

.profile-header {
  margin-bottom: $spacing-6;
}

.page-title {
  font-size: $text-2xl;
  font-weight: $font-bold;
  color: $gray-900;
}

.user-card {
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-xl;
  padding: $spacing-6;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-4;
}

.user-avatar {
  width: 96px;
  height: 96px;
  background: $gray-200;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-4;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.avatar-text {
  font-size: 32px;
  font-weight: $font-bold;
  color: $gray-600;
}

.user-name {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $gray-900;
}

.info-card, .settings-card {
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-xl;
  padding: $spacing-4;
  margin-bottom: $spacing-4;
}

.card-title {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $gray-500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: $spacing-4;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-2 0;
  min-height: 40px;
  border-bottom: 1px solid $gray-50;

  &:last-child {
    border-bottom: none;
  }
}

.info-label-group, .setting-label-group {
  display: flex;
  align-items: center;
  gap: $spacing-3;
}

.info-icon {
  font-size: 16px;
}

.info-label, .setting-label {
  font-size: $text-sm;
  color: $gray-700;
}

.info-value {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $gray-900;
  text-align: right;
  margin-left: $spacing-4;
}

.setting-row {
  padding: $spacing-3 0;
}

.setting-icon {
  width: 32px;
  height: 32px;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;

  &.bg-indigo {
    background: rgba($indigo-500, 0.1);
  }

  .icon {
    font-size: 16px;
  }
}

.language-switcher {
  display: flex;
  background: $gray-100;
  border-radius: $radius-lg;
  padding: $spacing-1;
}

.lang-btn {
  padding: $spacing-1 $spacing-3;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    background: $white;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

    .lang-text {
      color: $gray-900;
    }
  }
}

.lang-text {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $gray-500;
}

.logout-btn {
  width: 100%;
  height: 48px;
  background: $error-color;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba($error-color, 0.2);
  margin-top: $spacing-4;

  &:active {
    opacity: 0.9;
  }
}

.logout-icon {
  font-size: 18px;
}

.logout-text {
  font-size: $text-base;
  font-weight: $font-medium;
  color: $white;
}

.version-info {
  margin-top: $spacing-6;
  text-align: center;
}

.version-text {
  font-size: 12px;
  color: $gray-400;
}
</style>
