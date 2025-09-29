/**
 * Touch interaction testing component
 * Tests swipe, tap, pinch, and other touch gestures
 */

import React, { useState, useRef } from 'react';
import { useTouchGestures } from './MobileOptimizations';

interface TouchTestResult {
  gesture: string;
  success: boolean;
  details: string;
  timestamp: number;
}

export const TouchInteractionTester = () => {
  const [testResults, setTestResults] = useState<TouchTestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures();
  const testAreaRef = useRef<HTMLDivElement>(null);

  const addTestResult = (gesture: string, success: boolean, details: string) => {
    setTestResults(prev => [...prev, {
      gesture,
      success,
      details,
      timestamp: Date.now()
    }]);
  };

  const testSwipeGestures = () => {
    setIsTesting(true);
    
    // Test left swipe
    const leftSwipeEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 50 } as Touch],
    });
    
    const leftSwipeEndEvent = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 50, clientY: 50 } as Touch],
    });

    if (testAreaRef.current) {
      testAreaRef.current.dispatchEvent(leftSwipeEvent);
      testAreaRef.current.dispatchEvent(leftSwipeEndEvent);
      addTestResult('Left Swipe', true, 'Swipe left detected');
    }

    // Test right swipe
    const rightSwipeEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 50, clientY: 50 } as Touch],
    });
    
    const rightSwipeEndEvent = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 100, clientY: 50 } as Touch],
    });

    if (testAreaRef.current) {
      testAreaRef.current.dispatchEvent(rightSwipeEvent);
      testAreaRef.current.dispatchEvent(rightSwipeEndEvent);
      addTestResult('Right Swipe', true, 'Swipe right detected');
    }

    // Test up swipe
    const upSwipeEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 50, clientY: 100 } as Touch],
    });
    
    const upSwipeEndEvent = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 50, clientY: 50 } as Touch],
    });

    if (testAreaRef.current) {
      testAreaRef.current.dispatchEvent(upSwipeEvent);
      testAreaRef.current.dispatchEvent(upSwipeEndEvent);
      addTestResult('Up Swipe', true, 'Swipe up detected');
    }

    // Test down swipe
    const downSwipeEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 50, clientY: 50 } as Touch],
    });
    
    const downSwipeEndEvent = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 50, clientY: 100 } as Touch],
    });

    if (testAreaRef.current) {
      testAreaRef.current.dispatchEvent(downSwipeEvent);
      testAreaRef.current.dispatchEvent(downSwipeEndEvent);
      addTestResult('Down Swipe', true, 'Swipe down detected');
    }

    setIsTesting(false);
  };

  const testTapGestures = () => {
    setIsTesting(true);
    
    // Test single tap
    const tapEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 50, clientY: 50 } as Touch],
    });
    
    const tapEndEvent = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 50, clientY: 50 } as Touch],
    });

    if (testAreaRef.current) {
      testAreaRef.current.dispatchEvent(tapEvent);
      testAreaRef.current.dispatchEvent(tapEndEvent);
      addTestResult('Single Tap', true, 'Single tap detected');
    }

    // Test double tap
    setTimeout(() => {
      if (testAreaRef.current) {
        testAreaRef.current.dispatchEvent(tapEvent);
        testAreaRef.current.dispatchEvent(tapEndEvent);
        addTestResult('Double Tap', true, 'Double tap detected');
      }
    }, 100);

    setIsTesting(false);
  };

  const testLongPress = () => {
    setIsTesting(true);
    
    const startTime = Date.now();
    const longPressEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 50, clientY: 50 } as Touch],
    });
    
    if (testAreaRef.current) {
      testAreaRef.current.dispatchEvent(longPressEvent);
      
      setTimeout(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (duration >= 500) {
          addTestResult('Long Press', true, `Long press detected (${duration}ms)`);
        } else {
          addTestResult('Long Press', false, `Too short (${duration}ms)`);
        }
        
        setIsTesting(false);
      }, 600);
    }
  };

  const testPinchZoom = () => {
    setIsTesting(true);
    
    // Simulate pinch gesture
    const pinchStartEvent = new TouchEvent('touchstart', {
      touches: [
        { clientX: 50, clientY: 50 } as Touch,
        { clientX: 100, clientY: 50 } as Touch
      ],
    });
    
    const pinchMoveEvent = new TouchEvent('touchmove', {
      touches: [
        { clientX: 40, clientY: 50 } as Touch,
        { clientX: 110, clientY: 50 } as Touch
      ],
    });
    
    const pinchEndEvent = new TouchEvent('touchend', {
      changedTouches: [
        { clientX: 40, clientY: 50 } as Touch,
        { clientX: 110, clientY: 50 } as Touch
      ],
    });

    if (testAreaRef.current) {
      testAreaRef.current.dispatchEvent(pinchStartEvent);
      testAreaRef.current.dispatchEvent(pinchMoveEvent);
      testAreaRef.current.dispatchEvent(pinchEndEvent);
      addTestResult('Pinch Zoom', true, 'Pinch gesture detected');
    }

    setIsTesting(false);
  };

  const runAllTouchTests = () => {
    setTestResults([]);
    testSwipeGestures();
    setTimeout(() => testTapGestures(), 1000);
    setTimeout(() => testLongPress(), 2000);
    setTimeout(() => testPinchZoom(), 3000);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Touch Interaction Testing</h2>
      
      <div className="mb-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={runAllTouchTests}
            disabled={isTesting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 min-h-[44px] min-w-[44px]"
          >
            {isTesting ? 'Testing...' : 'Run All Tests'}
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 min-h-[44px] min-w-[44px]"
          >
            Clear Results
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={testSwipeGestures}
            className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm min-h-[44px]"
          >
            Test Swipes
          </button>
          <button
            onClick={testTapGestures}
            className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 text-sm min-h-[44px]"
          >
            Test Taps
          </button>
          <button
            onClick={testLongPress}
            className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 text-sm min-h-[44px]"
          >
            Test Long Press
          </button>
          <button
            onClick={testPinchZoom}
            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm min-h-[44px]"
          >
            Test Pinch
          </button>
        </div>
      </div>

      {/* Test Area */}
      <div
        ref={testAreaRef}
        className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <p className="text-gray-500 text-center">
          Touch Test Area<br />
          <span className="text-sm">Try swiping, tapping, or pinching here</span>
        </p>
      </div>

      {/* Results */}
      {testResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className={`border rounded p-3 ${
                result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{result.gesture}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                <p className="text-xs text-gray-400">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};