import { NextRequest, NextResponse } from 'next/server';

// Types pour le monitoring
interface PerformanceMetrics {
  timestamp: number;
  route: string;
  method: string;
  responseTime: number;
  statusCode: number;
  memoryUsage: number;
  cpuUsage: number;
  userAgent: string;
  ip: string;
}

interface SystemMetrics {
  timestamp: number;
  memory: {
    used: number;
    free: number;
    total: number;
  };
  cpu: {
    usage: number;
    load: number[];
  };
  database: {
    connections: number;
    queries: number;
    slowQueries: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    size: number;
  };
}

// Classe pour le monitoring des performances
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private alerts: any[] = [];
  private thresholds = {
    responseTime: 2000, // 2 secondes
    memoryUsage: 0.8, // 80%
    cpuUsage: 0.8, // 80%
    errorRate: 0.05, // 5%
  };

  // Enregistrer une métrique de performance
  recordMetric(metric: Omit<PerformanceMetrics, 'timestamp'>): void {
    const fullMetric: PerformanceMetrics = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);
    
    // Garder seulement les 1000 dernières métriques
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Vérifier les alertes
    this.checkAlerts(fullMetric);
  }

  // Enregistrer les métriques système
  recordSystemMetrics(metrics: Omit<SystemMetrics, 'timestamp'>): void {
    const fullMetrics: SystemMetrics = {
      ...metrics,
      timestamp: Date.now(),
    };

    this.systemMetrics.push(fullMetrics);
    
    // Garder seulement les 100 dernières métriques système
    if (this.systemMetrics.length > 100) {
      this.systemMetrics = this.systemMetrics.slice(-100);
    }
  }

  // Middleware pour mesurer les performances
  static middleware = async (request: NextRequest, response: NextResponse) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    // Mesurer le temps de réponse
    const responseTime = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    
    const monitor = new PerformanceMonitor();
    monitor.recordMetric({
      route: request.nextUrl.pathname,
      method: request.method,
      responseTime,
      statusCode: response.status,
      memoryUsage: endMemory.heapUsed / endMemory.heapTotal,
      cpuUsage: process.cpuUsage().user / 1000000, // Convertir en secondes
      userAgent: request.headers.get('user-agent') || '',
      ip: request.ip || request.headers.get('x-forwarded-for') || '',
    });

    return response;
  };

  // Vérifier les alertes
  private checkAlerts(metric: PerformanceMetrics): void {
    const alerts = [];

    // Alerte temps de réponse élevé
    if (metric.responseTime > this.thresholds.responseTime) {
      alerts.push({
        type: 'HIGH_RESPONSE_TIME',
        message: `Response time ${metric.responseTime}ms exceeds threshold ${this.thresholds.responseTime}ms`,
        severity: 'WARNING',
        route: metric.route,
        timestamp: metric.timestamp,
      });
    }

    // Alerte utilisation mémoire élevée
    if (metric.memoryUsage > this.thresholds.memoryUsage) {
      alerts.push({
        type: 'HIGH_MEMORY_USAGE',
        message: `Memory usage ${(metric.memoryUsage * 100).toFixed(1)}% exceeds threshold ${(this.thresholds.memoryUsage * 100)}%`,
        severity: 'CRITICAL',
        route: metric.route,
        timestamp: metric.timestamp,
      });
    }

    // Alerte code d'erreur
    if (metric.statusCode >= 500) {
      alerts.push({
        type: 'SERVER_ERROR',
        message: `Server error ${metric.statusCode} on route ${metric.route}`,
        severity: 'CRITICAL',
        route: metric.route,
        timestamp: metric.timestamp,
      });
    }

    // Ajouter les alertes
    this.alerts.push(...alerts);
    
    // Garder seulement les 100 dernières alertes
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Envoyer les alertes critiques
    alerts
      .filter(alert => alert.severity === 'CRITICAL')
      .forEach(alert => this.sendAlert(alert));
  }

  // Envoyer une alerte
  private async sendAlert(alert: any): Promise<void> {
    try {
      // Ici vous pourriez intégrer avec des services comme:
      // - Slack
      // - Discord
      // - Email
      // - PagerDuty
      // - Webhook
      
      console.error('🚨 CRITICAL ALERT:', alert);
      
      // Exemple d'envoi vers un webhook
      if (process.env.ALERT_WEBHOOK_URL) {
        await fetch(process.env.ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert),
        });
      }
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  // Obtenir les statistiques de performance
  getPerformanceStats(timeWindow: number = 3600000): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    slowestRoutes: Array<{ route: string; avgTime: number; count: number }>;
    topErrors: Array<{ statusCode: number; count: number }>;
  } {
    const cutoff = Date.now() - timeWindow;
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);

    const totalRequests = recentMetrics.length;
    const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const errorRate = recentMetrics.filter(m => m.statusCode >= 400).length / totalRequests;

    // Routes les plus lentes
    const routeStats = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.route]) {
        acc[metric.route] = { totalTime: 0, count: 0 };
      }
      acc[metric.route].totalTime += metric.responseTime;
      acc[metric.route].count += 1;
      return acc;
    }, {} as Record<string, { totalTime: number; count: number }>);

    const slowestRoutes = Object.entries(routeStats)
      .map(([route, stats]) => ({
        route,
        avgTime: stats.totalTime / stats.count,
        count: stats.count,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);

    // Erreurs les plus fréquentes
    const errorStats = recentMetrics
      .filter(m => m.statusCode >= 400)
      .reduce((acc, metric) => {
        acc[metric.statusCode] = (acc[metric.statusCode] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

    const topErrors = Object.entries(errorStats)
      .map(([statusCode, count]) => ({ statusCode: parseInt(statusCode), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests,
      averageResponseTime,
      errorRate,
      slowestRoutes,
      topErrors,
    };
  }

  // Obtenir les métriques système
  getSystemStats(): {
    current: SystemMetrics | null;
    average: {
      memory: number;
      cpu: number;
    };
    trends: {
      memory: 'increasing' | 'decreasing' | 'stable';
      cpu: 'increasing' | 'decreasing' | 'stable';
    };
  } {
    const current = this.systemMetrics[this.systemMetrics.length - 1] || null;
    
    const average = this.systemMetrics.reduce(
      (acc, metric) => ({
        memory: acc.memory + metric.memory.used / metric.memory.total,
        cpu: acc.cpu + metric.cpu.usage,
      }),
      { memory: 0, cpu: 0 }
    );

    if (this.systemMetrics.length > 0) {
      average.memory /= this.systemMetrics.length;
      average.cpu /= this.systemMetrics.length;
    }

    // Calculer les tendances
    const recent = this.systemMetrics.slice(-10);
    const older = this.systemMetrics.slice(-20, -10);
    
    const memoryTrend = this.calculateTrend(
      recent.map(m => m.memory.used / m.memory.total),
      older.map(m => m.memory.used / m.memory.total)
    );
    
    const cpuTrend = this.calculateTrend(
      recent.map(m => m.cpu.usage),
      older.map(m => m.cpu.usage)
    );

    return {
      current,
      average,
      trends: {
        memory: memoryTrend,
        cpu: cpuTrend,
      },
    };
  }

  // Calculer la tendance
  private calculateTrend(recent: number[], older: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    const diff = (recentAvg - olderAvg) / olderAvg;
    
    if (diff > 0.1) return 'increasing';
    if (diff < -0.1) return 'decreasing';
    return 'stable';
  }

  // Obtenir les alertes récentes
  getRecentAlerts(limit: number = 50): any[] {
    return this.alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Nettoyer les anciennes données
  cleanup(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 heures
    
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.systemMetrics = this.systemMetrics.filter(m => m.timestamp > cutoff);
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);
  }
}

// Instance singleton
export const performanceMonitor = new PerformanceMonitor();

// Nettoyage automatique toutes les heures
setInterval(() => {
  performanceMonitor.cleanup();
}, 60 * 60 * 1000);

// Fonction pour mesurer les performances d'une fonction
export function measurePerformance<T>(
  fn: () => Promise<T>,
  context: string
): Promise<{ result: T; duration: number }> {
  return new Promise(async (resolve, reject) => {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      
      performanceMonitor.recordMetric({
        route: context,
        method: 'FUNCTION',
        responseTime: duration,
        statusCode: 200,
        memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
        cpuUsage: process.cpuUsage().user / 1000000,
        userAgent: 'internal',
        ip: 'internal',
      });
      
      resolve({ result, duration });
    } catch (error) {
      const duration = Date.now() - start;
      
      performanceMonitor.recordMetric({
        route: context,
        method: 'FUNCTION',
        responseTime: duration,
        statusCode: 500,
        memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
        cpuUsage: process.cpuUsage().user / 1000000,
        userAgent: 'internal',
        ip: 'internal',
      });
      
      reject(error);
    }
  });
}