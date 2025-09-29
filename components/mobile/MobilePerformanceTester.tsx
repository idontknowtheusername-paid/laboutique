/**
 * Mobile performance testing component
 * Tests loading times, memory usage, and optimization recommendations
 */

import React, { useState, useEffect } from 'react';
import { 
  useMobilePerformance, 
  useMobilePerformanceMonitoring,
  getMobileOptimizationRecommendations 
} from '@/lib/mobile-performance';

interface PerformanceTest {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  threshold: number;
}

export const MobilePerformanceTester = () => {
  const [tests, setTests] = useState<PerformanceTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  const performance = useMobilePerformance();
  const metrics = useMobilePerformanceMonitoring();

  const runPerformanceTests = async () => {
    setIsRunning(true);
    const testResults: PerformanceTest[] = [];

    // Test 1: Load Time
    const loadTimeTest: PerformanceTest = {
      name: 'Page Load Time',
      value: metrics.loadTime,
      unit: 'ms',
      status: metrics.loadTime < 2000 ? 'good' : metrics.loadTime < 4000 ? 'warning' : 'critical',
      threshold: 2000,
    };
    testResults.push(loadTimeTest);

    // Test 2: Memory Usage
    const memoryTest: PerformanceTest = {
      name: 'Memory Usage',
      value: metrics.memoryUsage,
      unit: 'MB',
      status: metrics.memoryUsage < 50 ? 'good' : metrics.memoryUsage < 100 ? 'warning' : 'critical',
      threshold: 50,
    };
    testResults.push(memoryTest);

    // Test 3: Network Latency
    const networkTest: PerformanceTest = {
      name: 'Network Latency',
      value: metrics.networkLatency,
      unit: 'ms',
      status: metrics.networkLatency < 100 ? 'good' : metrics.networkLatency < 300 ? 'warning' : 'critical',
      threshold: 100,
    };
    testResults.push(networkTest);

    // Test 4: CPU Cores
    const cpuTest: PerformanceTest = {
      name: 'CPU Cores',
      value: performance.cpuCores,
      unit: 'cores',
      status: performance.cpuCores >= 4 ? 'good' : performance.cpuCores >= 2 ? 'warning' : 'critical',
      threshold: 4,
    };
    testResults.push(cpuTest);

    // Test 5: Battery Level
    const batteryTest: PerformanceTest = {
      name: 'Battery Level',
      value: performance.batteryLevel * 100,
      unit: '%',
      status: performance.batteryLevel > 0.5 ? 'good' : performance.batteryLevel > 0.2 ? 'warning' : 'critical',
      threshold: 50,
    };
    testResults.push(batteryTest);

    setTests(testResults);

    // Get optimization recommendations
    const recs = getMobileOptimizationRecommendations(performance, metrics);
    setRecommendations(recs);

    setIsRunning(false);
  };

  const testImageLoading = async () => {
    setIsRunning(true);
    
    const startTime = performance.now();
    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      const imageTest: PerformanceTest = {
        name: 'Image Load Time',
        value: loadTime,
        unit: 'ms',
        status: loadTime < 500 ? 'good' : loadTime < 1000 ? 'warning' : 'critical',
        threshold: 500,
      };
      
      setTests(prev => [...prev, imageTest]);
      setIsRunning(false);
    };
    
    img.onerror = () => {
      const imageTest: PerformanceTest = {
        name: 'Image Load Time',
        value: -1,
        unit: 'ms',
        status: 'critical',
        threshold: 500,
      };
      
      setTests(prev => [...prev, imageTest]);
      setIsRunning(false);
    };
    
    img.src = '/images/placeholder-product.jpg';
  };

  const testScrollPerformance = () => {
    setIsRunning(true);
    
    const startTime = performance.now();
    let frameCount = 0;
    
    const animate = () => {
      frameCount++;
      if (frameCount < 60) {
        requestAnimationFrame(animate);
      } else {
        const endTime = performance.now();
        const fps = 60000 / (endTime - startTime);
        
        const scrollTest: PerformanceTest = {
          name: 'Scroll FPS',
          value: fps,
          unit: 'fps',
          status: fps >= 60 ? 'good' : fps >= 30 ? 'warning' : 'critical',
          threshold: 60,
        };
        
        setTests(prev => [...prev, scrollTest]);
        setIsRunning(false);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const testTouchResponsiveness = () => {
    setIsRunning(true);
    
    const startTime = performance.now();
    let touchCount = 0;
    
    const handleTouch = () => {
      touchCount++;
      if (touchCount < 10) {
        setTimeout(handleTouch, 10);
      } else {
        const endTime = performance.now();
        const avgResponseTime = (endTime - startTime) / touchCount;
        
        const touchTest: PerformanceTest = {
          name: 'Touch Response',
          value: avgResponseTime,
          unit: 'ms',
          status: avgResponseTime < 16 ? 'good' : avgResponseTime < 33 ? 'warning' : 'critical',
          threshold: 16,
        };
        
        setTests(prev => [...prev, touchTest]);
        setIsRunning(false);
      }
    };
    
    handleTouch();
  };

  const runAllTests = async () => {
    setTests([]);
    setRecommendations([]);
    
    await runPerformanceTests();
    await testImageLoading();
    testScrollPerformance();
    testTouchResponsiveness();
  };

  const clearResults = () => {
    setTests([]);
    setRecommendations([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Mobile Performance Testing</h2>
      
      <div className="mb-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 min-h-[44px] min-w-[44px]"
          >
            {isRunning ? 'Testing...' : 'Run All Tests'}
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 min-h-[44px] min-w-[44px]"
          >
            Clear Results
          </button>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={runPerformanceTests}
            className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm min-h-[44px]"
          >
            Basic Tests
          </button>
          <button
            onClick={testImageLoading}
            className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 text-sm min-h-[44px]"
          >
            Image Loading
          </button>
          <button
            onClick={testScrollPerformance}
            className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 text-sm min-h-[44px]"
          >
            Scroll Performance
          </button>
          <button
            onClick={testTouchResponsiveness}
            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm min-h-[44px]"
          >
            Touch Response
          </button>
        </div>
      </div>

      {/* Current Performance Info */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Current Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Device Type</p>
            <p className={`font-semibold ${performance.isLowEndDevice ? 'text-red-600' : 'text-green-600'}`}>
              {performance.isLowEndDevice ? 'Low-end' : 'High-end'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Connection</p>
            <p className={`font-semibold ${
              performance.connectionType === 'slow' ? 'text-red-600' : 
              performance.connectionType === 'fast' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {performance.connectionType}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">CPU Cores</p>
            <p className="font-semibold text-blue-600">{performance.cpuCores}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Battery</p>
            <p className="font-semibold text-purple-600">
              {performance.batteryLevel > 0 ? `${Math.round(performance.batteryLevel * 100)}%` : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {tests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Test Results</h3>
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="border rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{test.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(test.status)}`}>
                    {test.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {test.value === -1 ? 'Failed' : `${test.value.toFixed(2)} ${test.unit}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    Threshold: {test.threshold} {test.unit}
                  </span>
                </div>
                {test.value !== -1 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          test.status === 'good' ? 'bg-green-500' :
                          test.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min(100, (test.value / test.threshold) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Optimization Recommendations</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-sm text-blue-800">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Live Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Load Time</p>
            <p className="font-semibold text-blue-600">{metrics.loadTime.toFixed(0)}ms</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Memory Usage</p>
            <p className="font-semibold text-green-600">{metrics.memoryUsage.toFixed(1)}MB</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Network Latency</p>
            <p className="font-semibold text-purple-600">{metrics.networkLatency.toFixed(0)}ms</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Render Time</p>
            <p className="font-semibold text-orange-600">{metrics.renderTime.toFixed(0)}ms</p>
          </div>
        </div>
      </div>
    </div>
  );
};