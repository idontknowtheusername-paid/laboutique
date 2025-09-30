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

      {/* Modern Loading Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-white via-blue-50 to-jomiastore-background flex items-center justify-center z-50">
        <div className="text-center">
          {/* Modern Logo Animation */}
          <div className="mb-12">
            <div className="relative">
              {/* Animated Logo Container */}
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-jomiastore-primary to-blue-600 animate-spin-slow"></div>
                <div className="absolute inset-1 rounded-xl bg-white flex items-center justify-center">
                  <Image
                    src="/logo.svg"
                    alt="JomiaStore"
                    width={64}
                    height={64}
                    className="w-12 h-12 object-contain"
                    priority
                  />
                </div>
                {/* Floating particles */}
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-jomiastore-secondary rounded-full animate-float"></div>
                <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-float-delayed"></div>
              </div>
            </div>
          </div>

          {/* Modern Loading Content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-jomiastore-primary to-blue-600 bg-clip-text text-transparent">
                JomiaStore Hub
              </h2>
              <p className="text-gray-600 text-lg">
                Préparation de votre expérience shopping...
              </p>
            </div>
            
            {/* Modern Progress Bar */}
            <div className="w-80 mx-auto">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-jomiastore-primary via-blue-500 to-jomiastore-secondary rounded-full animate-progress"></div>
              </div>
            </div>

            {/* Elegant Loading Animation */}
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-jomiastore-primary rounded-full animate-wave"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-wave" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-jomiastore-secondary rounded-full animate-wave" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-wave" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-2 h-2 bg-jomiastore-primary rounded-full animate-wave" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


