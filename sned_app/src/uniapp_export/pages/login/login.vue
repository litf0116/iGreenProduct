<template>
  <view class="container">
    <view class="login-box">
      <view class="header">
        <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
        <!-- Updated to match the specific request: Bold and dark color -->
        <text class="title">Welcome to iGreen+</text>
        <text class="subtitle">Sign in to your account</text>
      </view>

      <view class="form">
        <view class="input-group">
          <text class="label">Username</text>
          <input class="input" type="text" v-model="username" placeholder="Enter your username" />
        </view>

        <view class="input-group">
          <text class="label">Password</text>
          <input class="input" type="password" v-model="password" placeholder="Enter your password" />
        </view>

        <button class="btn-primary" @click="handleLogin">Sign In</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const username = ref('demo');
const password = ref('demo123');

const handleLogin = () => {
  if (username.value && password.value) {
    uni.showToast({
      title: 'Login Success',
      icon: 'success'
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/dashboard/dashboard'
      });
    }, 1000);
  } else {
    uni.showToast({
      title: 'Please fill all fields',
      icon: 'none'
    });
  }
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f9ff;
}

.login-box {
  width: 90%;
  max-width: 400px;
  background-color: #ffffff;
  padding: 40rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
  background-color: #e0f2fe;
  border-radius: 50%;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #0f172a; /* Updated color */
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #64748b;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.label {
  font-size: 28rpx;
  font-weight: 500;
  color: #334155;
}

.input {
  height: 80rpx;
  border: 2rpx solid #e2e8f0;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.btn-primary {
  background-color: #0ea5e9;
  color: #ffffff;
  border-radius: 8rpx;
  font-size: 32rpx;
  font-weight: 500;
  margin-top: 20rpx;
}

.btn-primary:active {
  opacity: 0.9;
}
</style>
