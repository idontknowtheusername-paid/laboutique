'use client';

import { useEffect } from 'react';
import { usePerformance, useMemoryMonitor } from '@/hooks/usePerformance';

interface PerformanceMonitorProps {
  enabled?: boolean;
  reportInterval?: number;
}

export function PerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  reportInterval = 30000 
}: PerformanceMonitorProps) {
  const { reportWebVitals } = usePerformance('PerformanceMonitor');
  
  // Monitor memory usage in development
  useMemoryMonitor();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Monitor bundle loading performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming;
          
          const metrics = {
            // Time to First Byte
            ttfb: navigationEntry.responseStart - navigationEntry.fetchStart,
            
            // DOM Content Loaded
            domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
            
            // Load Complete
            loadComplete: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
            
            // DNS Lookup
            dnsLookup: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
            
            // TCP Connection
            tcpConnection: navigationEntry.connectEnd - navigationEntry.connectStart,
            
            // SSL Negotiation
            sslNegotiation: navigationEntry.connectEnd - navigationEntry.secureConnectionStart,
            
            // Request + Response
            requestResponse: navigationEntry.responseEnd - navigationEntry.requestStart,
            
            // DOM Processing
            domProcessing: navigationEntry.domComplete - navigationEntry.domLoading,
          };

          console.log('[Performance Metrics]', metrics);
          reportWebVitals({ name: 'navigation', metrics });
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        
        // Track slow resources
        if (resourceEntry.duration > 1000) {
          console.warn(`[Slow Resource] ${resourceEntry.name}: ${resourceEntry.duration}ms`);
          reportWebVitals({
            name: 'slow_resource',
            url: resourceEntry.name,
            duration: resourceEntry.duration,
            size: resourceEntry.transferSize
          });
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

    // Monitor long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.warn(`[Long Task] Duration: ${entry.duration}ms at ${entry.startTime}ms`);
        reportWebVitals({
          name: 'long_task',
          duration: entry.duration,
          startTime: entry.startTime
        });
      }
    });

    if ('PerformanceObserver' in window && 'entryTypes' in PerformanceObserver.prototype) {
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long tasks not supported
      }
    }

    // Report performance metrics periodically
    const reportInterval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        reportWebVitals({
          name: 'memory_usage',
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
      }

      // Report paint metrics
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        reportWebVitals({
          name: entry.name,
          value: entry.startTime
        });
      });
    }, reportInterval);

    return () => {
      observer.disconnect();
      resourceObserver.disconnect();
      longTaskObserver.disconnect();
      clearInterval(reportInterval);
    };
  }, [enabled, reportInterval, reportWebVitals]);

  // This component doesn't render anything
  return null;
}

export default PerformanceMonitor;