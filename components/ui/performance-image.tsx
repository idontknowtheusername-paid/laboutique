'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageOff } from 'lucide-react';

interface PerformanceImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export const PerformanceImage: React.FC<PerformanceImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  fallbackSrc = '/images/placeholder-product.jpg',
  priority = false,
  quality = 75,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  onError,
  loading = 'lazy',
  placeholder = 'empty',
  blurDataURL
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isVisible, setIsVisible] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isVisible]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    
    // Try fallback image if not already using it
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    }
    
    onError?.();
  }, [currentSrc, fallbackSrc, onError]);

  // Generate optimized blur placeholder
  const generateBlurPlaceholder = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#f3f4f6');
      gradient.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    return canvas.toDataURL();
  };

  const imageProps = {
    src: isVisible ? currentSrc : '',
    alt,
    onLoad: handleLoad,
    onError: handleError,
    className: `transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`,
    priority,
    quality,
    sizes,
    loading: priority ? 'eager' as const : loading,
    placeholder,
    blurDataURL: blurDataURL || (width && height ? generateBlurPlaceholder(width, height) : undefined)
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''}`}>
      {isLoading && isVisible && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <ImageOff className="w-8 h-8 text-gray-400" />
        </div>
      ) : (
        isVisible && (
          fill ? (
            <Image
              {...imageProps}
              fill
              alt={alt}
            />
          ) : (
            width && height ? (
              <Image
                {...imageProps}
                width={width}
                height={height}
                alt={alt}
              />
            ) : (
              <Image
                {...imageProps}
                fill
                alt={alt}
              />
            )
          )
        )
      )}
    </div>
  );
};

export default PerformanceImage;