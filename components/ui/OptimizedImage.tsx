'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { PRODUCT_PLACEHOLDER } from '@/lib/utils/image-placeholder';

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  fallbackSrc?: string;
}

/**
 * Optimized Image Component
 * - Automatic blur placeholder
 * - Error handling with fallback
 * - Lazy loading by default
 * - Optimized for performance
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder-product.jpg',
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative overflow-hidden">
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        placeholder="blur"
        blurDataURL={PRODUCT_PLACEHOLDER}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc);
          setIsLoading(false);
        }}
        loading={props.priority ? 'eager' : 'lazy'}
        className={`
          ${props.className || ''}
          ${isLoading ? 'scale-110 blur-sm' : 'scale-100 blur-0'}
          transition-all duration-300
        `}
      />
      
      {/* Loading shimmer effect */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}
    </div>
  );
}
