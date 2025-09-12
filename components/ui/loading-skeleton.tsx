import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductSkeletonProps {
    count?: number;
    className?: string;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({
    count = 5,
    className = ''
}) => {
    return (
        <div className={`grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Image skeleton */}
                    <Skeleton className="aspect-square w-full" />

                    {/* Content skeleton */}
                    <div className="p-2 md:p-4 space-y-2">
                        {/* Vendor */}
                        <Skeleton className="h-3 w-16" />

                        {/* Product name */}
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="w-2.5 h-2.5 rounded-full" />
                                ))}
                            </div>
                            <Skeleton className="h-3 w-8" />
                        </div>

                        {/* Price */}
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-3 w-16" />
                        </div>

                        {/* Button */}
                        <Skeleton className="h-8 w-full rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const SliderSkeleton: React.FC<ProductSkeletonProps> = ({
    count = 5,
    className = ''
}) => {
    return (
        <div className={`flex space-x-4 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-48 bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Image skeleton */}
                    <Skeleton className="aspect-square w-full" />

                    {/* Content skeleton */}
                    <div className="p-3 space-y-2">
                        {/* Vendor */}
                        <Skeleton className="h-3 w-16" />

                        {/* Product name */}
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="w-2.5 h-2.5 rounded-full" />
                                ))}
                            </div>
                            <Skeleton className="h-3 w-8" />
                        </div>

                        {/* Price */}
                        <Skeleton className="h-5 w-20" />

                        {/* Button */}
                        <Skeleton className="h-8 w-full rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const HeaderSkeleton: React.FC = () => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-24" />
        </div>
    );
};