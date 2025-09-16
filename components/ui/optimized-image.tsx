'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageOff } from 'lucide-react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
    onLoad?: () => void;
    onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = '',
    fallbackSrc = '/images/placeholder-product.jpg',
    onLoad,
    onError
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(src);

    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
        setIsLoading(false);
        if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setHasError(false);
            setIsLoading(true);
        }
        onError?.();
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {isLoading && (
                <Skeleton className="absolute inset-0 w-full h-full" />
            )}

            {hasError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <ImageOff className="w-8 h-8 text-gray-400" />
                </div>
            ) : (
                <Image
                    src={currentSrc}
                    alt={alt}
                    fill
                    className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={handleLoad}
                    onError={handleError as any}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
            )}
        </div>
    );
};

export default OptimizedImage;