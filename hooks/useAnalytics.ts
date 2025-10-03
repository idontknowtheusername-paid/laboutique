'use client';

import { useEffect, useCallback } from 'react';
import { useAnalytics as useAnalyticsCore } from '@/lib/analytics/tracking';

export const useAnalytics = () => {
  const analytics = useAnalyticsCore();

  // Tracking automatique des vues de page
  useEffect(() => {
    const startTime = Date.now();
    
    const handleLoad = () => {
      const loadTime = Date.now() - startTime;
      analytics.trackPageView({
        page: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        timestamp: Date.now(),
        loadTime
      });
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [analytics]);

  // Tracking des performances
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            analytics.trackPerformance('page_load_time', navEntry.loadEventEnd - navEntry.loadEventStart);
            analytics.trackPerformance('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
            analytics.trackPerformance('first_paint', navEntry.loadEventEnd - navEntry.fetchStart);
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });

      return () => observer.disconnect();
    }
  }, [analytics]);

  // Tracking des erreurs JavaScript
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      analytics.trackError(event.message, event.filename);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(event.reason?.toString() || 'Unhandled Promise Rejection');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [analytics]);

  // Fonctions de tracking spécialisées
  const trackProductView = useCallback((productId: string, productName: string, category: string, price: number) => {
    analytics.trackProductInteraction({
      productId,
      productName,
      category,
      price,
      action: 'view',
      timestamp: Date.now()
    });
  }, [analytics]);

  const trackAddToCart = useCallback((productId: string, productName: string, category: string, price: number) => {
    analytics.trackProductInteraction({
      productId,
      productName,
      category,
      price,
      action: 'add_to_cart',
      timestamp: Date.now()
    });
  }, [analytics]);

  const trackAddToWishlist = useCallback((productId: string, productName: string, category: string, price: number) => {
    analytics.trackProductInteraction({
      productId,
      productName,
      category,
      price,
      action: 'add_to_wishlist',
      timestamp: Date.now()
    });
  }, [analytics]);

  const trackSearch = useCallback((query: string, resultsCount: number, filters?: string[]) => {
    analytics.trackSearch({
      query,
      resultsCount,
      filters,
      timestamp: Date.now()
    });
  }, [analytics]);

  const trackButtonClick = useCallback((buttonName: string, location: string) => {
    analytics.trackButtonClick(buttonName, location);
  }, [analytics]);

  return {
    ...analytics,
    trackProductView,
    trackAddToCart,
    trackAddToWishlist,
    trackSearch,
    trackButtonClick
  };
};

export default useAnalytics;