import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.igreen.engineer',
  appName: 'iGreen工程师',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'http',
    cleartext: true,
    // 允许访问 API 服务器和域名
    allowNavigation: [
      '43.255.212.68',
      '192.168.10.154',
      'localhost',
      '127.0.0.1',
    ],
    allowNavigation: [
      '43.255.212.68',
      '192.168.10.154',
      'localhost',
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
