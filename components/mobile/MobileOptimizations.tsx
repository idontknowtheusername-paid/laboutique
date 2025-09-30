/**
 * Mobile-specific optimizations and components
 * Touch interactions, responsive design, and mobile performance
 */

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

// Touch-friendly button component
export const TouchButton = ({ 
  children, 
  className = '', 
  onClick, 
  disabled = false,
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  [key: string]: any;
}) => {
  return (
    <button
      className={`
        min-h-[44px] min-w-[44px] 
        touch-manipulation 
        active:scale-95 
        transition-transform 
        duration-150 
        ease-in-out
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Mobile-optimized input component
export const MobileInput = ({ 
  className = '', 
  ...props 
}: {
  className?: string;
  [key: string]: any;
}) => {
  return (
    <input
      className={`
        min-h-[44px] 
        text-base 
        touch-manipulation 
        ${className}
      `}
      {...props}
    />
  );
};

// Touch-friendly card component
export const TouchCard = ({ 
  children, 
  className = '', 
  onClick,
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}) => {
  return (
    <div
      className={`
        min-h-[44px] 
        touch-manipulation 
        active:scale-[0.98] 
        transition-transform 
        duration-150 
        ease-in-out
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Mobile viewport detection hook
export const useMobileViewport = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  return { isMobile, isTablet, isDesktop };
};

// Touch gesture detection hook
export const useTouchGestures = () => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
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
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

// Mobile performance optimization hook
export const useMobilePerformance = () => {
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [connectionType, setConnectionType] = useState<'slow' | 'fast' | 'unknown'>('unknown');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Detect low-end devices
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const isLowEnd = 
        /Android.*Chrome\/[0-5]/.test(userAgent) ||
        /iPhone.*Safari.*Version\/[0-9]/.test(userAgent) ||
        navigator.hardwareConcurrency < 4;
      
      setIsLowEndDevice(isLowEnd);
    };

    // Detect connection type
    const checkConnection = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection.effectiveType;
        setConnectionType(
          effectiveType === 'slow-2g' || effectiveType === '2g' ? 'slow' : 'fast'
        );
      }
    };

    checkDevice();
    checkConnection();
  }, []);

  return { isLowEndDevice, connectionType };
};

// Mobile-optimized image component
export const MobileImage = ({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  ...props 
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  [key: string]: any;
}) => {
  const { isLowEndDevice, connectionType } = useMobilePerformance();
  
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      className={`
        w-full h-auto
        ${isLowEndDevice ? 'blur-sm' : ''}
        ${connectionType === 'slow' ? 'opacity-75' : ''}
        ${className}
      `}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...props}
    />
  );
};

// Mobile-optimized scroll component
export const MobileScroll = ({ 
  children, 
  className = '', 
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div
      className={`
        overflow-x-auto 
        scrollbar-hide 
        touch-pan-x 
        ${className}
      `}
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Mobile-optimized grid component
export const MobileGrid = ({ 
  children, 
  className = '', 
  cols = 2,
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  cols?: number;
  [key: string]: any;
}) => {
  return (
    <div
      className={`
        grid 
        gap-4 
        grid-cols-${cols} 
        sm:grid-cols-3 
        md:grid-cols-4 
        lg:grid-cols-5 
        xl:grid-cols-6
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Mobile-optimized spacing utilities
export const MobileSpacing = {
  container: 'px-4 sm:px-6 lg:px-8',
  section: 'py-8 sm:py-12 lg:py-16',
  card: 'p-4 sm:p-6',
  button: 'px-6 py-3 sm:px-8 sm:py-4',
  input: 'px-4 py-3 sm:px-6 sm:py-4',
};

// Mobile-optimized typography
export const MobileTypography = {
  h1: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
  h2: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
  h3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
  body: 'text-base sm:text-lg',
  small: 'text-sm sm:text-base',
  caption: 'text-xs sm:text-sm',
};