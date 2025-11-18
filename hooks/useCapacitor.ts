// Hook React pour utiliser Capacitor facilement
'use client';

import { useEffect, useState } from 'react';
import {
  isNative,
  isAndroid,
  isIOS,
  setupStatusBar,
  setupBackButton,
  vibrate,
  shareNative,
  checkNetwork,
  onNetworkChange,
  getAppInfo,
} from '@/lib/utils/capacitor';

export function useCapacitor() {
  const [isOnline, setIsOnline] = useState(true);
  const [appInfo, setAppInfo] = useState<any>(null);

  useEffect(() => {
    // Setup initial
    setupStatusBar();

    // Check network
    checkNetwork().then(setIsOnline);

    // Listen to network changes
    onNetworkChange(setIsOnline);

    // Get app info
    getAppInfo().then(setAppInfo);
  }, []);

  return {
    isNative: isNative(),
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isOnline,
    appInfo,
    vibrate,
    share: shareNative,
    setupBackButton,
  };
}
