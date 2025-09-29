/**
 * Mobile performance optimization utilities
 * Lazy loading, image optimization, and performance monitoring
 */

import { useEffect, useState, useCallback } from 'react';

// Mobile performance monitoring
export const useMobilePerformance = () => {
  const [performance, setPerformance] = useState({
    isLowEndDevice: false,
    connectionType: 'unknown' as 'slow' | 'fast' | 'unknown',
    memoryUsage: 0,
    cpuCores: 0,
    batteryLevel: 0,
  });

  useEffect(() => {
    const checkPerformance = () => {
      // Check device capabilities
      const isLowEnd = 
        navigator.hardwareConcurrency < 4 ||
        /Android.*Chrome\/[0-5]/.test(navigator.userAgent) ||
        /iPhone.*Safari.*Version\/[0-9]/.test(navigator.userAgent);

      // Check connection type
      let connectionType: 'slow' | 'fast' | 'unknown' = 'unknown';
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection.effectiveType;
        connectionType = effectiveType === 'slow-2g' || effectiveType === '2g' ? 'slow' : 'fast';
      }

      // Check memory usage (if available)
      let memoryUsage = 0;
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      }

      // Check battery level (if available)
      let batteryLevel = 0;
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          batteryLevel = battery.level;
        });
      }

      setPerformance({
        isLowEndDevice: isLowEnd,
        connectionType,
        memoryUsage,
        cpuCores: navigator.hardwareConcurrency,
        batteryLevel,
      });
    };

    checkPerformance();
    window.addEventListener('resize', checkPerformance);
    return () => window.removeEventListener('resize', checkPerformance);
  }, []);

  return performance;
};

// Mobile-optimized lazy loading
export const useMobileLazyLoading = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useCallback((node: HTMLElement | null) => {
    if (node) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(node);
    }
  }, []);

  const loadContent = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return { isVisible, isLoaded, elementRef, loadContent };
};

// Mobile image optimization
export const useMobileImageOptimization = (src: string, alt: string) => {
  const { isLowEndDevice, connectionType } = useMobilePerformance();
  const [optimizedSrc, setOptimizedSrc] = useState(src);

  useEffect(() => {
    // Optimize image based on device capabilities
    if (isLowEndDevice || connectionType === 'slow') {
      // Use lower quality images for low-end devices
      setOptimizedSrc(src.replace(/\.(jpg|jpeg|png)$/, '_mobile.$1'));
    } else {
      setOptimizedSrc(src);
    }
  }, [src, isLowEndDevice, connectionType]);

  return {
    src: optimizedSrc,
    alt,
    loading: isLowEndDevice ? 'lazy' : 'eager',
    decoding: 'async',
    className: isLowEndDevice ? 'blur-sm' : '',
  };
};

// Mobile scroll optimization
export const useMobileScrollOptimization = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      
      if (direction !== scrollDirection) {
        setScrollDirection(direction);
      }
      
      lastScrollY = scrollY;
      setIsScrolling(true);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    const onScrollEnd = () => {
      setIsScrolling(false);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', onScrollEnd, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', onScrollEnd);
    };
  }, [scrollDirection]);

  return { isScrolling, scrollDirection };
};

// Mobile touch optimization
export const useMobileTouchOptimization = () => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return null;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isUpSwipe = distanceY > 50;
    const isDownSwipe = distanceY < -50;

    return {
      isLeftSwipe,
      isRightSwipe,
      isUpSwipe,
      isDownSwipe,
      distanceX,
      distanceY,
    };
  }, [touchStart, touchEnd]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

// Mobile performance monitoring
export const useMobilePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
  });

  useEffect(() => {
    const startTime = performance.now();

    // Monitor load time
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, loadTime }));
    });

    // Monitor memory usage
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
        }));
      }
    };

    // Monitor network latency
    const checkNetwork = () => {
      const start = performance.now();
      fetch('/api/health')
        .then(() => {
          const latency = performance.now() - start;
          setMetrics(prev => ({ ...prev, networkLatency: latency }));
        })
        .catch(() => {
          setMetrics(prev => ({ ...prev, networkLatency: -1 }));
        });
    };

    checkMemory();
    checkNetwork();

    const interval = setInterval(() => {
      checkMemory();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
};

// Mobile optimization recommendations
export const getMobileOptimizationRecommendations = (
  performance: ReturnType<typeof useMobilePerformance>,
  metrics: ReturnType<typeof useMobilePerformanceMonitoring>
) => {
  const recommendations: string[] = [];

  if (performance.isLowEndDevice) {
    recommendations.push('Use lower quality images');
    recommendations.push('Reduce animation complexity');
    recommendations.push('Implement progressive loading');
  }

  if (performance.connectionType === 'slow') {
    recommendations.push('Enable aggressive lazy loading');
    recommendations.push('Use compressed images');
    recommendations.push('Implement offline caching');
  }

  if (metrics.memoryUsage > 100) {
    recommendations.push('Optimize memory usage');
    recommendations.push('Implement garbage collection');
  }

  if (metrics.loadTime > 3000) {
    recommendations.push('Optimize bundle size');
    recommendations.push('Implement code splitting');
  }

  return recommendations;
};