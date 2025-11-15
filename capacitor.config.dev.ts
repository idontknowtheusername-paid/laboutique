import type { CapacitorConfig } from '@capacitor/cli';

// Configuration pour le développement local
const config: CapacitorConfig = {
  appId: 'com.jomionstore.app',
  appName: 'JomionStore Dev',
  webDir: 'public',
  server: {
    // En dev, pointer vers ton serveur Next.js local
    url: 'http://localhost:3000',
    cleartext: true, // Permet HTTP en dev
    androidScheme: 'http',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#FF5722',
      showSpinner: true,
    },
  },
};

export default config;
