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
        <text class="form-subtitle">Enter your account and password</text>

        <view class="input-group">
          <text class="input-label">Account</text>
          <view class="input-wrapper">
            <text class="input-icon">👤</text>
            <input
              class="input-field"
              type="text"
              placeholder="Username or Account ID"
              v-model="account"
            />
          </view>
        </view>

        <view class="input-group">
          <view class="input-header">
            <text class="input-label">Password</text>
          </view>
          <view class="input-wrapper">
            <text class="input-icon">🔒</text>
            <input
              class="input-field"
              type="password"
              placeholder="Enter your password"
              v-model="password"
            />
          </view>
        </view>

        <view class="submit-btn" @click="handleLogin" :class="{ loading: isLoading }">
          <text class="btn-text">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </text>
          <text class="btn-arrow" v-if="!isLoading">→</text>
        </view>
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

const account = ref('mike.tech');
const password = ref('password');
const isLoading = ref(false);

const userStore = useUserStore();

async function handleLogin() {
  if (!account.value || !password.value) {
    uni.showToast({
      title: 'Please enter valid credentials',
      icon: 'none',
    });
    return;
  }

  isLoading.value = true;

  try {
    await userStore.login(account.value, password.value);
    uni.showToast({
      title: 'Welcome back!',
      icon: 'success',
    });
  } catch (error) {
    uni.showToast({
      title: 'Login failed',
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

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-2;
}

.input-label {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $gray-700;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: $spacing-3;
  font-size: 16px;
  z-index: 1;
}

.input-field {
  width: 100%;
  height: 44px;
  padding: $spacing-3 $spacing-4;
  padding-left: 44px;
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-md;
  font-size: $text-base;
  color: $gray-900;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
  }

  &::placeholder {
    color: $gray-400;
  }
}

.submit-btn {
  width: 100%;
  height: 44px;
  background: $primary-color;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  cursor: pointer;
  margin-top: $spacing-6;
  transition: background 0.2s ease;

  &:hover {
    background: $primary-dark;
  }

  &.loading {
    background: $gray-400;
    cursor: not-allowed;
  }
}

.btn-text {
  font-size: $text-base;
  font-weight: $font-medium;
  color: $white;
}

.btn-arrow {
  font-size: $text-base;
  color: $white;
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

  a {
    color: $gray-900;
    text-decoration: underline;

    &:hover {
      color: $gray-700;
    }
  }
}
</style>
