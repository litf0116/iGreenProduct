<template>
  <view class="profile">
    <view class="profile-header">
      <text class="page-title">{{ userProfileText }}</text>
    </view>

    <Card class="user-card">
      <view class="user-avatar-wrap">
        <Avatar :name="userName" size="lg" />
      </view>
      <text class="user-name">{{ userName }}</text>
    </Card>

    <Card class="info-card">
      <template #header>
        <text class="card-title">{{ accountInfoText }}</text>
      </template>
      <InfoRow label="Phone" :value="userPhone">
        <template #icon>📱</template>
      </InfoRow>
      <InfoRow label="Login Name" :value="userUsername">
        <template #icon>👤</template>
      </InfoRow>
      <InfoRow label="Group" :value="userGroup">
        <template #icon>👥</template>
      </InfoRow>
    </Card>

    <Card class="settings-card">
      <template #header>
        <text class="card-title">{{ appSettingsText }}</text>
      </template>
      <view class="setting-row">
        <view class="setting-label-group">
          <view class="setting-icon bg-indigo">
            <text class="icon">🌐</text>
          </view>
          <text class="setting-label">{{ languageText }}</text>
        </view>
        <LanguageSwitcher />
      </view>
    </Card>

    <Button
      variant="danger"
      size="lg"
      class="logout-btn"
      @click="handleLogout"
    >
      🚪 {{ signOutText }}
    </Button>

    <view class="version-info">
      <text class="version-text">iGreen+ {{ versionText }} 1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getUser, clearAuth } from '@/store';
import { setLanguage } from '@/utils/i18n';
import { Card, Button, Avatar, InfoRow, LanguageSwitcher } from '@/components/ui';

const emit = defineEmits<{
  (e: 'logout'): void;
}>();

const userProfileText = 'User Profile';
const accountInfoText = 'Account Information';
const appSettingsText = 'App Settings';
const languageText = 'Language';
const signOutText = 'Sign Out';
const versionText = 'Version';

const user = computed(() => getUser());

const userName = computed(() => user.value?.name || 'Guest User');
const userPhone = computed(() => user.value?.phone || '-');
const userUsername = computed(() => user.value?.username || 'guest');
const userGroup = computed(() => user.value?.groupName || '-' );

function handleLogout() {
  uni.showModal({
    title: 'Sign Out',
    content: 'Are you sure you want to sign out?',
    success: (res) => {
      if (res.confirm) {
        clearAuth();
        emit('logout');
      }
    },
  });
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
  font-weight: $font-weight-bold;
  color: $foreground;
}

.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-6;
  margin-bottom: $spacing-4;
}

.user-avatar-wrap {
  margin-bottom: $spacing-4;
}

.user-name {
  font-size: $text-xl;
  font-weight: $font-weight-bold;
  color: $foreground;
}

.info-card, .settings-card {
  margin-bottom: $spacing-4;
}

.card-title {
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  color: $muted-foreground;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.setting-row {
  padding: $spacing-2 0;
}

.setting-label-group {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  margin-bottom: $spacing-3;
}

.setting-icon {
  width: 32px;
  height: 32px;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;

  &.bg-indigo {
    background: oklch(39.8% 0.07 227.39 / 10%);
  }

  .icon {
    font-size: 16px;
  }
}

.setting-label {
  font-size: $text-sm;
  color: $foreground;
}

.logout-btn {
  width: 100%;
  margin-top: $spacing-4;
}

.version-info {
  margin-top: $spacing-6;
  text-align: center;
}

.version-text {
  font-size: 12px;
  color: $muted-foreground;
}
</style>
