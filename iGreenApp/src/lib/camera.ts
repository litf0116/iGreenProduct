import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface PhotoResult {
  path: string;
  webPath: string;
  format: string;
  saved: boolean;
  isNative: boolean;
}

export async function takePhoto(): Promise<PhotoResult | undefined> {
  try {
    console.log('[CAMERA] takePhoto() 开始拍照');
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      saveToGallery: false,
      width: 1920,
      height: 1920,
    });
    const isNative = Capacitor.isNativePlatform();
    console.log('[CAMERA] takePhoto() 返回:', {
      path: image.path,
      webPath: image.webPath,
      format: image.format,
      saved: image.saved,
      isNative
    });
    return {
      path: image.path || '',
      webPath: image.webPath || '',
      format: image.format || 'jpeg',
      saved: image.saved || false,
      isNative
    };
  } catch (error) {
    console.error('[CAMERA] takePhoto() 失败:', error);
    throw error;
  }
}

export async function pickPhoto(): Promise<PhotoResult | undefined> {
  try {
    console.log('[CAMERA] pickPhoto() 开始选择图片');
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });
    const isNative = Capacitor.isNativePlatform();
    console.log('[CAMERA] pickPhoto() 返回:', {
      path: image.path,
      webPath: image.webPath,
      format: image.format,
      saved: image.saved,
      isNative
    });
    return {
      path: image.path || '',
      webPath: image.webPath || '',
      format: image.format || 'jpeg',
      saved: image.saved || false,
      isNative
    };
  } catch (error) {
    console.error('[CAMERA] pickPhoto() 失败:', error);
    throw error;
  }
}

/**
 * 请求相机权限（Android 和 iOS）
 */
export async function requestCameraPermissions(): Promise<boolean> {
  try {
    const permissions = await Camera.requestPermissions();
    return permissions.camera === 'granted';
  } catch (error) {
    console.error('请求权限失败:', error);
    return false;
  }
}

/**
 * 检查相机权限状态
 */
export async function checkCameraPermissions(): Promise<boolean> {
  try {
    const permissions = await Camera.checkPermissions();
    return permissions.camera === 'granted';
  } catch (error) {
    console.error('检查权限失败:', error);
    return false;
  }
}
