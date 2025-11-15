import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jomionstore.app',
  appName: 'JomionStore',
  webDir: 'public', // Pas besoin de build, on pointe vers le site web
  server: {
    // MODE HYBRIDE: L'app charge le site web en production
    url: 'https://jomionstore.com', // ⚠️ REMPLACE par ton URL de production
    cleartext: false, // HTTPS obligatoire en production
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FF5722',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      spinnerColor: '#FFFFFF',
    },
  },
};

export default config;
