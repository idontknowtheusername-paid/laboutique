// Utilitaires Capacitor pour détecter la plateforme et utiliser les plugins natifs
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Network } from '@capacitor/network';

// Détection de plateforme
export const isNative = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isIOS = () => Capacitor.getPlatform() === 'ios';
export const isWeb = () => Capacitor.getPlatform() === 'web';

// Configuration de la status bar
export const setupStatusBar = async () => {
  if (!isNative()) return;

  try {
    await StatusBar.setStyle({ style: Style.Light });
    if (isAndroid()) {
      await StatusBar.setBackgroundColor({ color: '#FF5722' });
    }
  } catch (error) {
    console.error('Status bar setup error:', error);
  }
};

// Gestion du bouton retour Android
export const setupBackButton = (callback: () => void) => {
  if (!isAndroid()) return;

  App.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack) {
      App.exitApp();
    } else {
      callback();
    }
  });
};

// Haptic feedback
export const vibrate = async (style: ImpactStyle = ImpactStyle.Medium) => {
  if (!isNative()) return;
  
  try {
    await Haptics.impact({ style });
  } catch (error) {
    console.error('Haptics error:', error);
  }
};

// Partage natif
export const shareNative = async (title: string, text: string, url: string) => {
  if (!isNative()) {
    // Fallback vers Web Share API
    if (navigator.share) {
      return navigator.share({ title, text, url });
    }
    return false;
  }

  try {
    await Share.share({
      title,
      text,
      url,
      dialogTitle: 'Partager',
    });
    return true;
  } catch (error) {
    console.error('Share error:', error);
    return false;
  }
};

// Vérifier la connexion réseau
export const checkNetwork = async () => {
  if (!isNative()) {
    return navigator.onLine;
  }

  try {
    const status = await Network.getStatus();
    return status.connected;
  } catch (error) {
    console.error('Network check error:', error);
    return true; // Assume connected on error
  }
};

// Écouter les changements de réseau
export const onNetworkChange = (callback: (connected: boolean) => void) => {
  if (!isNative()) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
    return;
  }

  Network.addListener('networkStatusChange', (status) => {
    callback(status.connected);
  });
};

// Cacher le clavier
export const hideKeyboard = async () => {
  if (!isNative()) return;

  try {
    await Keyboard.hide();
  } catch (error) {
    console.error('Keyboard hide error:', error);
  }
};

// Info sur l'app
export const getAppInfo = async () => {
  if (!isNative()) {
    return {
      name: 'JomionStore',
      version: '1.0.0',
      build: '1',
    };
  }

  try {
    const info = await App.getInfo();
    return info;
  } catch (error) {
    console.error('App info error:', error);
    return null;
  }
};
