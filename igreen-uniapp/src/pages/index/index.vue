<template>
  <view class="container">
    <view class="logo-container">
      <view class="logo">
        <text class="logo-text">iGreen+</text>
      </view>
    </view>
    <view class="welcome-card">
      <text class="welcome-title">Welcome to iGreen+</text>
      <text class="welcome-subtitle">Engineer Mobile App</text>
      <view class="status-indicator">
        <view class="status-dot"></view>
        <text class="status-text">Framework Ready</text>
      </view>
    </view>
    <view class="info-card">
      <text class="info-title">Project Status</text>
      <view class="info-row">
        <text class="info-label">Framework:</text>
        <text class="info-value">uni-app 3.x</text>
      </view>
      <view class="info-row">
        <text class="info-label">Vue Version:</text>
        <text class="info-value">Vue 3.2.13</text>
      </view>
      <view class="info-row">
        <text class="info-label">TypeScript:</text>
        <text class="info-value">Enabled</text>
      </view>
      <view class="info-row">
        <text class="info-label">State Management:</text>
        <text class="info-value">Pinia</text>
      </view>
      <view class="info-row">
        <text class="info-label">Styling:</text>
        <text class="info-value">SCSS</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

onLoad(() => {
  console.log('Index page loaded')
})
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.container {
  min-height: 100vh;
  background: linear-gradient(180deg, $primary-bg 0%, $white 100%);
  padding: $spacing-8 $spacing-4 $spacing-4;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: $spacing-8;
}

.logo {
  width: 80px;
  height: 80px;
  background: $primary-color;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-lg;
}

.logo-text {
  color: $white;
  font-size: $text-xl;
  font-weight: $font-bold;
}

.welcome-card {
  background: $white;
  border-radius: $radius-xl;
  padding: $spacing-6;
  margin-bottom: $spacing-4;
  box-shadow: $shadow-md;
  text-align: center;
}

.welcome-title {
  display: block;
  font-size: $text-2xl;
  font-weight: $font-bold;
  color: $gray-900;
  margin-bottom: $spacing-1;
}

.welcome-subtitle {
  display: block;
  font-size: $text-sm;
  color: $gray-500;
  margin-bottom: $spacing-4;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  background: $success-bg;
  padding: $spacing-2 $spacing-4;
  border-radius: $radius-full;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: $success-color;
  border-radius: $radius-full;
}

.status-text {
  font-size: $text-xs;
  color: $success-color;
  font-weight: $font-medium;
}

.info-card {
  background: $white;
  border-radius: $radius-xl;
  padding: $spacing-4;
  box-shadow: $shadow-md;
}

.info-title {
  display: block;
  font-size: $text-sm;
  font-weight: $font-semibold;
  color: $gray-700;
  margin-bottom: $spacing-3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: $spacing-2 0;
  border-bottom: 1px solid $gray-100;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: $text-sm;
  color: $gray-500;
}

.info-value {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $gray-900;
}
</style>
