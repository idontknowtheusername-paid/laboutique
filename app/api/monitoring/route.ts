import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/monitoring/performance-monitor';
import { cacheManager } from '@/lib/cache/cache-strategy';

export async function GET(request: NextRequest) {
  try {
    // Obtenir les statistiques de performance
    const performanceStats = performanceMonitor.getPerformanceStats();
    const systemStats = performanceMonitor.getSystemStats();
    const recentAlerts = performanceMonitor.getRecentAlerts(10);
    
    // Obtenir les statistiques du cache
    const cacheStats = await cacheManager.getStats();
    
    return NextResponse.json({
      success: true,
      data: {
        performance: performanceStats,
        system: systemStats,
        cache: cacheStats,
        alerts: recentAlerts,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get monitoring data'
    }, 500);
  }
}