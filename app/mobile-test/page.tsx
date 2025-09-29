'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { ResponsiveTester } from '@/components/mobile/ResponsiveTester';
import { TouchInteractionTester } from '@/components/mobile/TouchInteractionTester';
import { MobilePerformanceTester } from '@/components/mobile/MobilePerformanceTester';
import { 
  TouchButton, 
  TouchCard, 
  MobileInput, 
  MobileGrid, 
  MobileScroll,
  MobileSpacing,
  MobileTypography,
  useMobileViewport,
  useMobilePerformance
} from '@/components/mobile/MobileOptimizations';

export default function MobileTestPage() {
  const { isMobile, isTablet, isDesktop } = useMobileViewport();
  const { isLowEndDevice, connectionType } = useMobilePerformance();

  return (
    <div className="min-h-screen bg-jomiastore-background">
      <Header />
      <CategoryMenu />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-4">Mobile UX Testing</h1>
          <p className="text-center text-gray-600 mb-8">
            Comprehensive testing for mobile responsiveness, touch interactions, and performance
          </p>
        </div>

        {/* Current Device Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Current Device Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Viewport</h3>
              <p className="text-sm text-blue-600">
                {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Performance</h3>
              <p className="text-sm text-green-600">
                {isLowEndDevice ? 'Low-end' : 'High-end'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Connection</h3>
              <p className="text-sm text-purple-600">
                {connectionType === 'slow' ? 'Slow' : connectionType === 'fast' ? 'Fast' : 'Unknown'}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800">Touch Support</h3>
              <p className="text-sm text-orange-600">
                {'ontouchstart' in window ? 'Supported' : 'Not Supported'}
              </p>
            </div>
          </div>
        </div>

        {/* Responsive Testing */}
        <div className="mb-8">
          <ResponsiveTester />
        </div>

        {/* Touch Interaction Testing */}
        <div className="mb-8">
          <TouchInteractionTester />
        </div>

        {/* Mobile Performance Testing */}
        <div className="mb-8">
          <MobilePerformanceTester />
        </div>

        {/* Mobile Component Testing */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Mobile Component Testing</h2>
          
          {/* Touch Buttons */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Touch Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <TouchButton className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600">
                Primary Button
              </TouchButton>
              <TouchButton className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600">
                Secondary Button
              </TouchButton>
              <TouchButton className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600">
                Success Button
              </TouchButton>
            </div>
          </div>

          {/* Mobile Inputs */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Mobile Inputs</h3>
            <div className="space-y-4">
              <MobileInput
                type="text"
                placeholder="Mobile optimized input"
                className="w-full border border-gray-300 rounded px-4 py-3"
              />
              <MobileInput
                type="email"
                placeholder="Email input"
                className="w-full border border-gray-300 rounded px-4 py-3"
              />
              <MobileInput
                type="tel"
                placeholder="Phone input"
                className="w-full border border-gray-300 rounded px-4 py-3"
              />
            </div>
          </div>

          {/* Touch Cards */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Touch Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <TouchCard className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800">Card 1</h4>
                <p className="text-sm text-blue-600">Touch-friendly card with proper spacing</p>
              </TouchCard>
              <TouchCard className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800">Card 2</h4>
                <p className="text-sm text-green-600">Optimized for mobile interactions</p>
              </TouchCard>
              <TouchCard className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800">Card 3</h4>
                <p className="text-sm text-purple-600">Responsive design testing</p>
              </TouchCard>
            </div>
          </div>

          {/* Mobile Grid */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Mobile Grid</h3>
            <MobileGrid cols={2} className="gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-100 p-4 rounded-lg text-center">
                  <p className="font-semibold">Item {i + 1}</p>
                  <p className="text-sm text-gray-600">Grid item</p>
                </div>
              ))}
            </MobileGrid>
          </div>

          {/* Mobile Scroll */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Mobile Scroll</h3>
            <MobileScroll className="bg-gray-100 p-4 rounded-lg">
              <div className="flex space-x-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg min-w-[200px] text-center">
                    <p className="font-semibold">Scroll Item {i + 1}</p>
                    <p className="text-sm text-gray-600">Horizontal scroll test</p>
                  </div>
                ))}
              </div>
            </MobileScroll>
          </div>

          {/* Typography Testing */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Mobile Typography</h3>
            <div className="space-y-4">
              <h1 className={MobileTypography.h1}>Heading 1</h1>
              <h2 className={MobileTypography.h2}>Heading 2</h2>
              <h3 className={MobileTypography.h3}>Heading 3</h3>
              <p className={MobileTypography.body}>Body text optimized for mobile reading</p>
              <p className={MobileTypography.small}>Small text for captions and labels</p>
              <p className={MobileTypography.caption}>Caption text for additional information</p>
            </div>
          </div>

          {/* Spacing Testing */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Mobile Spacing</h3>
            <div className="space-y-4">
              <div className={`bg-blue-50 p-4 rounded-lg ${MobileSpacing.container}`}>
                <p className="font-semibold">Container Spacing</p>
                <p className="text-sm text-gray-600">Responsive padding for containers</p>
              </div>
              <div className={`bg-green-50 p-4 rounded-lg ${MobileSpacing.section}`}>
                <p className="font-semibold">Section Spacing</p>
                <p className="text-sm text-gray-600">Vertical spacing for sections</p>
              </div>
              <div className={`bg-purple-50 p-4 rounded-lg ${MobileSpacing.card}`}>
                <p className="font-semibold">Card Spacing</p>
                <p className="text-sm text-gray-600">Internal spacing for cards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Testing */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Performance Testing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Device Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Device Type:</span>
                  <span className={isLowEndDevice ? 'text-red-600' : 'text-green-600'}>
                    {isLowEndDevice ? 'Low-end' : 'High-end'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <span className={
                    connectionType === 'slow' ? 'text-red-600' : 
                    connectionType === 'fast' ? 'text-green-600' : 'text-yellow-600'
                  }>
                    {connectionType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Viewport:</span>
                  <span className="text-blue-600">
                    {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Optimization Recommendations</h3>
              <div className="space-y-2 text-sm">
                {isLowEndDevice && (
                  <p className="text-red-600">• Reduce image quality for low-end devices</p>
                )}
                {connectionType === 'slow' && (
                  <p className="text-yellow-600">• Enable lazy loading for slow connections</p>
                )}
                {isMobile && (
                  <p className="text-blue-600">• Optimize touch interactions for mobile</p>
                )}
                <p className="text-green-600">• Use skeleton loaders for better UX</p>
                <p className="text-green-600">• Implement progressive loading</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}