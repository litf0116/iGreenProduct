<template>
  <view class="header">
    <view class="mobile-logo">
      <view class="logo-container">
        <image class="logo-image" src="/static/logo.png" mode="aspectFit" />
      </view>
      <text class="app-name">iGreen+</text>
    </view>

    <view class="desktop-org">
      <text class="org-label">Organization:</text>
      <text class="org-name">GreenPower Energy</text>
    </view>

    <view class="header-actions">
      <Avatar name="MT" size="sm" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { Avatar } from '@/components/ui';
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.header {
  height: 56px;
  background: $white;
  border-bottom: 1px solid $border;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-4;
  position: sticky;
  top: 0;
  z-index: 10;

  @media (min-width: 768px) {
    height: 64px;
    padding: 0 $spacing-6;
  }
}

.mobile-logo {
  display: flex;
  align-items: center;
  gap: $spacing-2;

  @media (min-width: 768px) {
    display: none;
  }
}

.logo-container {
  width: 32px;
  height: 32px;
  background: $white;
  border-radius: $radius-lg;
  border: 1px solid $border;
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
  font-size: $text-lg;
  font-weight: $font-weight-bold;
  color: $gray-900;  // slate-900
  letter-spacing: -0.5px;
}

.desktop-org {
  display: none;

  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    gap: $spacing-2;
  }
}

.org-label {
  font-size: $text-sm;
  color: $gray-500;  // slate-500
}

.org-name {
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  color: $gray-900;  // slate-900
}

.header-actions {
  display: flex;
  align-items: center;
  gap: $spacing-2;

  @media (min-width: 768px) {
    display: none;
  }
}
</style>
