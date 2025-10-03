'use client';

import { useState, useEffect } from 'react';

interface ImageOptimizationOptions {
  src: string;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
}

export const useImageOptimization = (options: ImageOptimizationOptions) => {
  const [optimizedSrc, setOptimizedSrc] = useState(options.src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const optimizeImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if image is already optimized
        if (options.src.includes('_next/image') || options.src.includes('?')) {
          setOptimizedSrc(options.src);
          setIsLoading(false);
          return;
        }

        // For external images, we'll use Next.js Image optimization
        // This is handled automatically by Next.js Image component
        setOptimizedSrc(options.src);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to optimize image');
        setOptimizedSrc(options.src); // Fallback to original
        setIsLoading(false);
      }
    };

    optimizeImage();
  }, [options.src, options.quality, options.format]);

  return {
    optimizedSrc,
    isLoading,
    error,
  };
};

export default useImageOptimization;