import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
}

export function usePerformance(componentName: string) {
  const startTimeRef = useRef<number>(performance.now());
  const renderStartRef = useRef<number>(performance.now());

  // Measure component load time
  useEffect(() => {
    const loadTime = performance.now() - startTimeRef.current;
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    }

    // Report to analytics in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // You can integrate with analytics services here
      // Example: analytics.track('component_load_time', { component: componentName, loadTime });
    }
  }, [componentName]);

  // Measure render time
  const measureRender = useCallback(() => {
    const renderTime = performance.now() - renderStartRef.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    }
  }, [componentName]);

  // Throttled function helper
  const useThrottle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T => {
    const lastRun = useRef<number>(0);
    
    return ((...args: Parameters<T>) => {
      if (performance.now() - lastRun.current >= delay) {
        func(...args);
        lastRun.current = performance.now();
      }
    }) as T;
  }, []);

  // Debounced function helper
  const useDebounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T => {
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => func(...args), delay);
    }) as T;
  }, []);

  // Intersection Observer hook for lazy loading
  const useIntersectionObserver = useCallback((
    callback: (isVisible: boolean) => void,
    options: IntersectionObserverInit = {}
  ) => {
    const elementRef = useRef<HTMLElement>(null);
    
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => callback(entry.isIntersecting),
        { threshold: 0.1, ...options }
      );

      observer.observe(element);
      return () => observer.disconnect();
    }, [callback, options]);

    return elementRef;
  }, []);

  // Web Vitals reporting
  const reportWebVitals = useCallback((metric: any) => {
    if (process.env.NODE_ENV === 'production') {
      // Report to analytics
      console.log(metric);
    }
  }, []);

  return {
    measureRender,
    useThrottle,
    useDebounce,
    useIntersectionObserver,
    reportWebVitals
  };
}

// Memory usage monitor
export function useMemoryMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        console.log('[Memory]', {
          used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
          total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
          limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
        });
      };

      const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);
}

// Bundle size analyzer (development only)
export function useBundleAnalyzer() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const analyzeBundle = async () => {
        try {
          const response = await fetch('/_next/static/chunks/pages/_app.js');
          const size = response.headers.get('content-length');
          if (size) {
            console.log(`[Bundle] Main bundle size: ${(parseInt(size) / 1024).toFixed(2)} KB`);
          }
        } catch (error) {
          // Ignore errors in development
        }
      };

      analyzeBundle();
    }
  }, []);
}