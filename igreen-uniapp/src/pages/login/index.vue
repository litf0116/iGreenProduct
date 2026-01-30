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
            <Input
              v-model="account"
              type="text"
              placeholder="Username or Account ID"
            >
              <template #prefix>
                <text class="input-icon">👤</text>
              </template>
            </Input>
          </view>
        </view>

        <view class="input-group">
          <text class="input-label">Password</text>
          <view class="input-wrapper">
            <Input
              v-model="password"
              type="password"
              placeholder="Enter your password"
            >
              <template #prefix>
                <text class="input-icon">🔒</text>
              </template>
            </Input>
          </view>
        </view>

        <Button class="submit-btn" :loading="isLoading" @click="handleLogin">
          {{ isLoading ? "Signing in..." : "Sign In" }}
        </Button>
      </view>

      <view class="footer-section">
        <text class="footer-text">
          By clicking continue, you agree to our Terms of Service and Privacy
          Policy.
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { setUser, setAuthToken } from "@/store";
import { api } from "@/utils/api";
import { Button, Input } from "@/components/ui";

const emit = defineEmits<{
  (e: "login"): void;
}>();

const account = ref<string>("");
const password = ref<string>("");
const isLoading = ref(false);

async function handleLogin() {
  if (!account.value || !password.value) {
    uni.showToast({
      title: "Please enter credentials",
      icon: "none",
    });
    return;
  }

  isLoading.value = true;

  try {
    const result = await api.login(account.value, password.value);
    setAuthToken(result.access_token);
    setUser(result.user);

    uni.showToast({
      title: "Welcome!",
      icon: "success",
    });

    setTimeout(() => {
      emit("login");
    }, 500);
  } catch (error: any) {
    console.error("Login error:", error);
    uni.showToast({
      title: error.message || "Login failed",
      icon: "none",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.login-container {
  min-height: 100vh;
  background: $teal-50; // teal-50 - matches iGreenApp
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
  height: 256px; // ~40% of viewport height
  background: $teal-600; // teal-600 - matches iGreenApp
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
  filter: blur(64px);
  z-index: 0;
  pointer-events: none;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: $card;
  border-radius: $radius-xl;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1); // shadow-xl - matches iGreenApp
  padding: $spacing-6; // p-6 (24px) - matches iGreenApp Card padding
  padding-top: $spacing-6; // pt-6 - matches iGreenApp
  z-index: 1;
  border: none;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-6; // mb-6 (24px) - matches iGreenApp card-header gap
}

.form-section {
  padding-top: $spacing-4; // pt-4 - matches iGreenApp
  padding-bottom: 0; // Remove default padding
}

.input-group {
  margin-bottom: $spacing-4; // space-y-4 - matches iGreenApp
}

.footer-section {
  padding: $spacing-6; // p-6
  margin: 0 -#{$spacing-6}; //抵消 card padding
  margin-top: $spacing-4;
  background: rgba($gray-50, 0.5); // bg-slate-50/50
  border-top: 1px solid $border;
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
  box-shadow: 0 10px 25px -5px rgba(19, 78, 74, 0.1); // teal-900 with opacity
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
  font-weight: $font-weight-bold;
  color: $teal-900; // teal-900 - matches iGreenApp
  letter-spacing: -0.5px;
}

.form-section {
  margin-bottom: $spacing-4;
}

.form-title {
  font-size: $text-2xl;
  font-weight: $font-weight-bold;
  color: $gray-900; // slate-900
  text-align: center;
  display: block;
  margin-bottom: $spacing-1;
}

.form-subtitle {
  font-size: $text-sm;
  color: $gray-500; // slate-500
  text-align: center;
  display: block;
  margin-bottom: $spacing-6;
  font-weight: $font-weight-normal;
}

.input-group {
  margin-bottom: $spacing-4;
}

.input-label {
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  color: $gray-700; // slate-700
  display: block;
  margin-bottom: $spacing-2;
}

.input-wrapper {
  width: 100%; // Full width - fills the row
  position: relative;
  align-items: center;
}

.input-icon {
  font-size: 16px;
  color: $gray-400; // slate-400
}

.submit-btn {
  width: 100%;
  height: 44px;
  margin-top: $spacing-6;
  background: $teal-600; // teal-600 - matches iGreenApp
  color: $white;
  border-radius: $radius-md;
  font-size: $text-base;
  font-weight: $font-weight-medium;

  &:hover {
    background: $teal-700; // teal-700
  }

  &:active {
    background: $teal-700;
  }
}

.footer-section {
  padding: $spacing-6;
  margin: 0 -#{$spacing-8};
  margin-top: $spacing-4;
  background: rgba($gray-50, 0.5);
  border-top: 1px solid $border;
  border-bottom-left-radius: $radius-xl;
  border-bottom-right-radius: $radius-xl;
}

.footer-text {
  font-size: 12px;
  color: $gray-500; // slate-500
  text-align: center;
  display: block;
  line-height: 1.5;
}
</style>
