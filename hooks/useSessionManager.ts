'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { showAuthErrorToast } from '@/components/ui/enhanced-toast';

interface SessionManagerOptions {
  checkInterval?: number; // in milliseconds
  warningThreshold?: number; // in milliseconds before expiry to show warning
  autoRefresh?: boolean;
  redirectOnExpiry?: boolean;
  excludePaths?: string[]; // paths where session expiry should not redirect
}

export function useSessionManager(options: SessionManagerOptions = {}) {
  const {
    checkInterval = 60000, // 1 minute
    warningThreshold = 300000, // 5 minutes
    autoRefresh = true,
    redirectOnExpiry = true,
    excludePaths = ['/auth/login', '/auth/register', '/auth/forgot-password', '/']
  } = options;

  const { session, user, refreshSession, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  const isExcludedPath = useCallback((path: string) => {
    return excludePaths.some(excludePath => 
      path === excludePath || path.startsWith(excludePath)
    );
  }, [excludePaths]);

  const getTimeUntilExpiry = useCallback(() => {
    if (!session?.expires_at) return null;

    // Supabase v2: session.expires_at is a Unix timestamp in seconds (number)
    // Some flows may provide ISO string. Support both safely.
    let expiryTimeMs: number;
    const raw = session.expires_at as unknown;
    if (typeof raw === 'number') {
      // seconds -> ms
      expiryTimeMs = raw * 1000;
    } else if (typeof raw === 'string') {
      const parsed = Date.parse(raw);
      expiryTimeMs = isNaN(parsed) ? 0 : parsed;
    } else {
      return null;
    }

    const currentTime = Date.now();
    return expiryTimeMs - currentTime;
  }, [session]);

  const handleSessionExpiry = useCallback(async () => {
    console.log('Session expired, logging out...');
    
    try {
      await signOut();
      
      if (redirectOnExpiry && !isExcludedPath(pathname)) {
        showAuthErrorToast('Votre session a expiré. Veuillez vous reconnecter.');
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      }
    } catch (error) {
      console.error('Error during session expiry logout:', error);
    }
  }, [signOut, redirectOnExpiry, isExcludedPath, pathname, router]);

  const handleSessionWarning = useCallback(() => {
    if (warningShownRef.current) return;
    
    warningShownRef.current = true;
    showAuthErrorToast('Votre session expire bientôt. Activité détectée pour la prolonger.');
    
    // Reset warning flag after some time
    setTimeout(() => {
      warningShownRef.current = false;
    }, warningThreshold);
  }, [warningThreshold]);

  const checkSession = useCallback(async () => {
    if (!session || !user) return;

    const timeUntilExpiry = getTimeUntilExpiry();
    
    if (timeUntilExpiry === null) return;

    // Session has expired
    if (timeUntilExpiry <= 0) {
      await handleSessionExpiry();
      return;
    }

    // Session is about to expire - show warning
    if (timeUntilExpiry <= warningThreshold && !warningShownRef.current) {
      handleSessionWarning();
    }

    // Auto-refresh session if it's getting close to expiry
    if (autoRefresh && timeUntilExpiry <= warningThreshold * 2) {
      try {
        await refreshSession();
        console.log('Session refreshed automatically');
      } catch (error) {
        console.warn('Failed to refresh session:', error);
      }
    }
  }, [
    session,
    user,
    getTimeUntilExpiry,
    handleSessionExpiry,
    handleSessionWarning,
    warningThreshold,
    autoRefresh,
    refreshSession
  ]);

  // Set up session checking interval
  useEffect(() => {
    if (!session || !user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial check
    checkSession();

    // Set up interval
    intervalRef.current = setInterval(checkSession, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [session, user, checkSession, checkInterval]);

  // Activity-based session refresh
  useEffect(() => {
    if (!session || !user || !autoRefresh) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    let lastActivity = Date.now();
    let activityTimeout: NodeJS.Timeout;

    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      
      // Only refresh if there's been significant time since last activity
      if (timeSinceLastActivity > 30000) { // 30 seconds
        lastActivity = now;
        
        // Clear existing timeout
        if (activityTimeout) {
          clearTimeout(activityTimeout);
        }
        
        // Debounce session refresh
        activityTimeout = setTimeout(async () => {
          const timeUntilExpiry = getTimeUntilExpiry();
          
          // Only refresh if session is getting close to expiry
          if (timeUntilExpiry && timeUntilExpiry <= warningThreshold * 1.5) {
            try {
              await refreshSession();
              console.log('Session refreshed due to user activity');
            } catch (error) {
              console.warn('Failed to refresh session on activity:', error);
            }
          }
        }, 1000); // 1 second debounce
      }
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      // Remove event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
    };
  }, [session, user, autoRefresh, getTimeUntilExpiry, warningThreshold, refreshSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeUntilExpiry: getTimeUntilExpiry(),
    isSessionValid: session && user && (getTimeUntilExpiry() || 0) > 0,
    refreshSession,
    checkSession
  };
}
         