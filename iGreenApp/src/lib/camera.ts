import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * 拍照并返回图片数据
 * @returns 图片的 base64 数据或 web 路径
 */
export async function takePhoto(): Promise<string | undefined> {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    
    return image.dataUrl;
  } catch (error) {
    console.error('拍照失败:', error);
    throw error;
  }
}

/**
 * 从相册选择图片
 * @returns 图片的 base64 数据或 web 路径
 */
export async function pickPhoto(): Promise<string | undefined> {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });
    
    return image.dataUrl;
  } catch (error) {
    console.error('选择图片失败:', error);
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
