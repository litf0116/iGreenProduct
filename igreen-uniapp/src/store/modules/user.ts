import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserProfile } from '@/types/ticket';
import { MOCK_USER } from '@/utils/mockData';

export const useUserStore = defineStore('user', () => {
  const user = ref<UserProfile | null>(null);
  const isAuthenticated = ref(false);

  function login(username: string, password: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username && password) {
          user.value = MOCK_USER;
          isAuthenticated.value = true;
          uni.setStorageSync('user', MOCK_USER);
          uni.setStorageSync('isAuthenticated', true);
          resolve();
        } else {
          throw new Error('Invalid credentials');
        }
      }, 1000);
    });
  }

  function logout() {
    user.value = null;
    isAuthenticated.value = false;
    uni.removeStorageSync('user');
    uni.removeStorageSync('isAuthenticated');
  }

  function initFromStorage() {
    const storedUser = uni.getStorageSync('user');
    const storedAuth = uni.getStorageSync('isAuthenticated');
    if (storedUser && storedAuth) {
      user.value = storedUser;
      isAuthenticated.value = true;
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    initFromStorage,
  };
});
