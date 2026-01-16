import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserProfile } from '@/types/ticket';
import { api } from '@/utils/api';

export const useUserStore = defineStore('user', () => {
  const user = ref<UserProfile | null>(null);
  const isAuthenticated = ref(false);

  function initFromStorage() {
    try {
      const storedUser = uni.getStorageSync('user');
      const storedAuth = uni.getStorageSync('auth_token');
      if (storedUser && storedAuth) {
        user.value = storedUser;
        isAuthenticated.value = true;
      }
    } catch {
      console.error('Failed to load from storage');
    }
  }

  async function login(username: string, password: string): Promise<void> {
    try {
      const result = await api.login(username, password);
      user.value = result.user;
      isAuthenticated.value = true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  function logout() {
    api.logout();
    user.value = null;
    isAuthenticated.value = false;
  }

  async function fetchCurrentUser() {
    try {
      const userData = await api.getCurrentUser();
      user.value = userData;
      isAuthenticated.value = true;
      uni.setStorageSync('user', userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
      throw error;
    }
  }

  return {
    user,
    isAuthenticated,
    initFromStorage,
    login,
    logout,
    fetchCurrentUser,
  };
});
