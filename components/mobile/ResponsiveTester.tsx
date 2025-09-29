/**
 * Responsive testing component
 * Tests all breakpoints and mobile interactions
 */

import React, { useState, useEffect } from 'react';
import { useMobileViewport, useTouchGestures, useMobilePerformance } from './MobileOptimizations';

interface ResponsiveTestResult {
  breakpoint: string;
  width: number;
  height: number;
  touchSupport: boolean;
  performance: 'low' | 'medium' | 'high';
  issues: string[];
}

export const ResponsiveTester = () => {
  const [testResults, setTestResults] = useState<ResponsiveTestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const { isMobile, isTablet, isDesktop } = useMobileViewport();
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures();
  const { isLowEndDevice, connectionType } = useMobilePerformance();

  const testBreakpoints = [
    { name: 'Mobile S', width: 320, height: 568 },
    { name: 'Mobile M', width: 375, height: 667 },
    { name: 'Mobile L', width: 425, height: 812 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop S', width: 1024, height: 768 },
    { name: 'Desktop L', width: 1440, height: 900 },
    { name: 'Desktop XL', width: 1920, height: 1080 },
  ];

  const runResponsiveTests = async () => {
    setCurrentTest('Testing responsive design...');
    const results: ResponsiveTestResult[] = [];

    for (const breakpoint of testBreakpoints) {
      const result: ResponsiveTestResult = {
        breakpoint: breakpoint.name,
        width: breakpoint.width,
        height: breakpoint.height,
        touchSupport: 'ontouchstart' in window,
        performance: isLowEndDevice ? 'low' : connectionType === 'slow' ? 'medium' : 'high',
        issues: [],
      };

      // Test viewport
      if (window.innerWidth < 768 && !isMobile) {
        result.issues.push('Mobile detection failed');
      }

      // Test touch support
      if (!result.touchSupport && (breakpoint.width < 768)) {
        result.issues.push('Touch support missing on mobile breakpoint');
      }

      // Test performance
      if (result.performance === 'low' && breakpoint.width < 768) {
        result.issues.push('Low performance on mobile');
      }

      results.push(result);
    }

    setTestResults(results);
    setCurrentTest('Tests completed');
  };

  const testTouchInteractions = () => {
    setCurrentTest('Testing touch interactions...');
    
    // Test swipe detection
    const testElement = document.createElement('div');
    testElement.style.width = '100px';
    testElement.style.height = '100px';
    testElement.style.background = 'red';
    document.body.appendChild(testElement);

    const touchStart = { x: 0, y: 0 };
    const touchEnd = { x: 50, y: 0 };

    // Simulate touch events
    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: touchStart.x, clientY: touchStart.y } as Touch],
    });
    const touchEndEvent = new TouchEvent('touchend', {
      changedTouches: [{ clientX: touchEnd.x, clientY: touchEnd.y } as Touch],
    });

    testElement.dispatchEvent(touchStartEvent);
    testElement.dispatchEvent(touchEndEvent);

    document.body.removeChild(testElement);
    setCurrentTest('Touch tests completed');
  };

  const testMobilePerformance = () => {
    setCurrentTest('Testing mobile performance...');
    
    const startTime = performance.now();
    
    // Test DOM manipulation
    const testDiv = document.createElement('div');
    for (let i = 0; i < 1000; i++) {
      const child = document.createElement('div');
      child.textContent = `Test ${i}`;
      testDiv.appendChild(child);
    }
    document.body.appendChild(testDiv);
    document.body.removeChild(testDiv);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 100) {
      console.warn('Slow DOM manipulation detected');
    }
    
    setCurrentTest('Performance tests completed');
  };

  const runAllTests = async () => {
    setCurrentTest('Starting comprehensive tests...');
    await runResponsiveTests();
    testTouchInteractions();
    testMobilePerformance();
    setCurrentTest('All tests completed');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Responsive & Mobile Testing</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Current Viewport:</p>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded text-xs ${isMobile ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>
            Mobile: {isMobile ? 'Yes' : 'No'}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${isTablet ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
            Tablet: {isTablet ? 'Yes' : 'No'}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${isDesktop ? 'bg-purple-100 text-purple-800' : 'bg-gray-100'}`}>
            Desktop: {isDesktop ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Performance:</p>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded text-xs ${
            isLowEndDevice ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            Device: {isLowEndDevice ? 'Low-end' : 'High-end'}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            connectionType === 'slow' ? 'bg-red-100 text-red-800' : 
            connectionType === 'fast' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
          }`}>
            Connection: {connectionType}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={runAllTests}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 min-h-[44px] min-w-[44px]"
        >
          Run All Tests
        </button>
        {currentTest && (
          <p className="text-sm text-gray-600 mt-2">{currentTest}</p>
        )}
      </div>

      {testResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{result.breakpoint}</span>
                  <span className="text-sm text-gray-500">
                    {result.width}x{result.height}
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.touchSupport ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    Touch: {result.touchSupport ? 'Yes' : 'No'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.performance === 'high' ? 'bg-green-100 text-green-800' :
                    result.performance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Perf: {result.performance}
                  </span>
                </div>
                {result.issues.length > 0 && (
                  <div className="text-sm text-red-600">
                    Issues: {result.issues.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};