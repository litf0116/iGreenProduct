<template>
  <view class="login-container">
    <view class="bg-decoration"></view>
    <view class="bg-blur"></view>

    <view class="login-card">
      <view class="logo-section">
        <view class="logo-container">
          <image class="logo-image" src="/static/logo.png" mode="aspectFit" />
        </view>
        <text class="app-title">iGreen+</text>
      </view>

      <view class="form-section">
        <text class="form-title">Sign in to your account</text>
        <text class="form-subtitle">Enter your credentials</text>

        <view class="input-group">
          <text class="input-label">Account</text>
          <Input
            v-model="account"
            type="text"
            placeholder="Username"
          >
            <template #prefix>👤</template>
          </Input>
        </view>

        <view class="input-group">
          <text class="input-label">Password</text>
          <Input
            v-model="password"
            type="password"
            placeholder="Enter your password"
          >
            <template #prefix>🔒</template>
          </Input>
        </view>

        <Button
          class="submit-btn"
          variant="primary"
          size="lg"
          :loading="isLoading"
          :disabled="!account || !password"
          @click="handleLogin"
        >
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </Button>
      </view>

      <view class="footer-section">
        <text class="footer-text">
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { Button, Input } from '@/components/ui';

const account = ref('');
const password = ref('');
const isLoading = ref(false);

const userStore = useUserStore();

async function handleLogin() {
  if (!account.value || !password.value) {
    uni.showToast({
      title: 'Please enter credentials',
      icon: 'none',
    });
    return;
  }

  isLoading.value = true;

  try {
    await userStore.login(account.value, password.value);
    uni.showToast({
      title: 'Welcome!',
      icon: 'success',
    });
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/dashboard/index' });
    }, 500);
  } catch (error: any) {
    uni.showToast({
      title: error.message || 'Login failed',
      icon: 'none',
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.login-container {
  min-height: 100vh;
  background: $primary-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-4;
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 256px;
  background: $primary-color;
  z-index: 0;
}

.bg-blur {
  position: absolute;
  top: 160px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 800px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: $radius-full;
  filter: blur(48px);
  z-index: 0;
  pointer-events: none;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: $white;
  border-radius: $radius-xl;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  padding: $spacing-8;
  z-index: 1;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-8;
}

.logo-container {
  width: 80px;
  height: 80px;
  background: $white;
  border-radius: $radius-xl;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-3;
  margin-bottom: $spacing-4;
}

.logo-image {
  width: 100%;
  height: 100%;
}

.app-title {
  font-size: 30px;
  font-weight: $font-bold;
  color: $primary-dark;
  letter-spacing: -0.5px;
}

.form-section {
  margin-bottom: $spacing-4;
}

.form-title {
  font-size: $text-2xl;
  font-weight: $font-bold;
  color: $gray-900;
  text-align: center;
  display: block;
  margin-bottom: $spacing-1;
}

.form-subtitle {
  font-size: $text-sm;
  color: $gray-500;
  text-align: center;
  display: block;
  margin-bottom: $spacing-6;
}

.input-group {
  margin-bottom: $spacing-4;
}

.input-label {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $gray-700;
  display: block;
  margin-bottom: $spacing-2;
}

.submit-btn {
  width: 100%;
  margin-top: $spacing-6;
}

.footer-section {
  padding: $spacing-6;
  margin: 0 -#{$spacing-8};
  margin-top: $spacing-4;
  background: rgba($gray-50, 0.5);
  border-top: 1px solid $gray-100;
}

.footer-text {
  font-size: 12px;
  color: $gray-500;
  text-align: center;
  display: block;
}
</style>
