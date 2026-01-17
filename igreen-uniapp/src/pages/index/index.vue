<template>
  <view class="container">
    <view class="logo-container">
      <view class="logo">
        <text class="logo-text">iGreen+</text>
      </view>
    </view>

    <Card class="welcome-card">
      <text class="welcome-title">Welcome to iGreen+</text>
      <text class="welcome-subtitle">Engineer Mobile App</text>
      <Badge variant="success" class="status-badge">
        <view class="status-dot"></view>
        Framework Ready
      </Badge>
    </Card>

    <Card class="info-card">
      <template #header>
        <text class="info-title">Project Status</text>
      </template>
      <InfoRow label="Framework" value="uni-app 3.x" />
      <InfoRow label="Vue Version" value="Vue 3.2.13" />
      <InfoRow label="TypeScript" value="Enabled" />
      <InfoRow label="State Management" value="Pinia" />
      <InfoRow label="Styling" value="SCSS" />
    </Card>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Card, Badge, InfoRow } from '@/components/ui';

onMounted(() => {
  console.log('Index page loaded');
});
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
  text-align: center;
  padding: $spacing-6;
  margin-bottom: $spacing-4;
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

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: $success-color;
  border-radius: $radius-full;
}

.info-card {
  padding: 0;

  :deep(.card-header) {
    padding-bottom: 0;
  }
}

.info-title {
  font-size: $text-sm;
  font-weight: $font-semibold;
  color: $gray-700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
