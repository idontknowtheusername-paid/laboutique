'use client';

import React from 'react';

interface OptimizedLoadingProps {
  type?: 'skeleton' | 'spinner' | 'pulse';
  count?: number;
  className?: string;
}

export const OptimizedLoading: React.FC<OptimizedLoadingProps> = ({
  type = 'skeleton',
  count = 1,
  className = ''
}) => {
  if (type === 'spinner') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jomionstore-primary"></div>
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // Skeleton loading
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OptimizedLoading;