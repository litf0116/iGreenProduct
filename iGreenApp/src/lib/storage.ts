import { Preferences } from '@capacitor/preferences';

/**
 * 存储工具 - 使用 Capacitor Preferences 替代 localStorage
 * 解决 iOS 会定期清理 localStorage 的问题
 */

const AUTH_TOKEN_KEY = 'auth_token';

/**
 * 保存认证 Token
 * @param token JWT Token
 */
export async function saveAuthToken(token: string): Promise<void> {
  try {
    await Preferences.set({
      key: AUTH_TOKEN_KEY,
      value: token,
    });
  } catch (error) {
    console.error('保存 Token 失败:', error);
    throw error;
  }
}

/**
 * 获取认证 Token
 * @returns JWT Token 或 null
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key: AUTH_TOKEN_KEY });
    return value;
  } catch (error) {
    console.error('获取 Token 失败:', error);
    return null;
  }
}

/**
 * 清除认证 Token
 */
export async function clearAuthToken(): Promise<void> {
  try {
    await Preferences.remove({ key: AUTH_TOKEN_KEY });
  } catch (error) {
    console.error('清除 Token 失败:', error);
  }
}

/**
 * 通用存储方法
 * @param key 存储键
 * @param value 存储值
 */
export async function setItem(key: string, value: string): Promise<void> {
  try {
    await Preferences.set({ key, value });
  } catch (error) {
    console.error(`存储 ${key} 失败:`, error);
    throw error;
  }
}

/**
 * 通用获取方法
 * @param key 存储键
 * @returns 存储值或 null
 */
export async function getItem(key: string): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key });
    return value;
  } catch (error) {
    console.error(`获取 ${key} 失败:`, error);
    return null;
  }
}

/**
 * 通用删除方法
 * @param key 存储键
 */
export async function removeItem(key: string): Promise<void> {
  try {
    await Preferences.remove({ key });
  } catch (error) {
    console.error(`删除 ${key} 失败:`, error);
  }
}
