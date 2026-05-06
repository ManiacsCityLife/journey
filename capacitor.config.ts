import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.journeyforward.app',
  appName: 'Journey Forward',
  webDir: 'dist',
  android: {
    buildOptions: {
      keystorePath: undefined,
    }
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#0d9488',
      sound: 'default',
    },
  },
};
export default config;
