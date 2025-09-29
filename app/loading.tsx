'use client';

import React from 'react';
import Image from 'next/image';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-jomiastore-background">
      {/* Header Skeleton */}
      <div className="bg-white border-b">
        <div className="container">
          {/* Announcement Bar Skeleton */}
          <div className="h-10 bg-gray-100 animate-pulse"></div>
          
          {/* Main Header Skeleton */}
          <div className="h-20 flex items-center justify-between">
            {/* Logo Skeleton */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="hidden lg:block">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Search Bar Skeleton */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            
            {/* Actions Skeleton */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container py-8">
        {/* Hero Section Skeleton */}
        <div className="mb-8">
          <div className="h-64 lg:h-96 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>

        {/* Categories Skeleton */}
        <div className="mb-8">
          <div className="h-12 w-48 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="mb-8">
          <div className="h-12 w-64 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-4">
                <div className="h-48 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Overlay with Logo and Animation */}
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          {/* Logo Animation */}
          <div className="mb-8">
            <div className="relative">
              {/* Logo Container */}
              <div className="w-32 h-32 mx-auto mb-4 relative">
                <Image
                  src="/logo.svg"
                  alt="JomiaStore"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                  priority
                />
                {/* Pulsing Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-jomiastore-primary/20 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-2 border-jomiastore-primary animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-jomiastore-primary">
              JomiaStore Hub
            </h2>
            <p className="text-gray-600">
              Chargement de votre expérience shopping...
            </p>
            
            {/* Progress Bar */}
            <div className="w-64 mx-auto">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-jomiastore-primary to-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Loading Dots */}
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-jomiastore-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-jomiastore-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-jomiastore-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


