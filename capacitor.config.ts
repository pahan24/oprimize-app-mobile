import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ultraoptimizex.app',
  appName: 'Ultra Optimize X',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
