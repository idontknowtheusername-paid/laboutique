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

export const ProfileSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-24" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                        <Skeleton className="h-8 w-16 mx-auto mb-2" />
                        <Skeleton className="h-4 w-20 mx-auto" />
                    </div>
                ))}
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-28" />
            </div>
        </div>
    );
};

export const CartSkeleton: React.FC<{ itemCount?: number }> = ({ itemCount = 3 }) => {
    return (
        <div className="space-y-6">
            {/* Cart Header */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-24" />
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
                {Array.from({ length: itemCount }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center space-x-4">
                            {/* Product Image */}
                            <Skeleton className="w-20 h-20 rounded-lg" />

                            {/* Product Info */}
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-64" />
                                <Skeleton className="h-4 w-32" />
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                                <Skeleton className="w-8 h-8 rounded" />
                                <Skeleton className="w-12 h-8" />
                                <Skeleton className="w-8 h-8 rounded" />
                            </div>

                            {/* Price */}
                            <div className="text-right space-y-1">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>

                            {/* Remove Button */}
                            <Skeleton className="w-8 h-8 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <Skeleton className="h-6 w-32" />

                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>

                <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                </div>

                <Skeleton className="h-12 w-full rounded-lg" />
            </div>
        </div>
    );
};

export const OrderSkeleton: React.FC<{ orderCount?: number }> = ({ orderCount = 5 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: orderCount }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="text-right space-y-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Skeleton className="w-16 h-16 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const WishlistSkeleton: React.FC<{ itemCount?: number }> = ({ itemCount = 6 }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: itemCount }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="w-8 h-8 rounded" />
                        </div>
                        <Skeleton className="h-8 w-full rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
};