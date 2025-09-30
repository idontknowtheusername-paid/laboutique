import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';

// Configuration Redis pour rate limiting
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// Types pour le rate limiting
interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en ms
  maxRequests: number; // Nombre max de requêtes
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Configuration par défaut pour différents types d'endpoints
const RATE_LIMIT_CONFIGS = {
  // API publiques (plus restrictives)
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  
  // API d'authentification (très restrictives)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  
  // API de recherche (modérées)
  search: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30,
  },
  
  // API de produits (modérées)
  products: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60,
  },
  
  // API utilisateur (moins restrictives)
  user: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
  },
  
  // API admin (très permissives)
  admin: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 1000,
  },
} as const;

// Classe pour le rate limiting
export class RateLimiter {
  private redis: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.redis = redis;
    this.connect();
  }

  private async connect() {
    try {
      await this.redis.ping();
      this.isConnected = true;
      console.log('✅ Rate limiter Redis connected');
    } catch (error) {
      console.warn('⚠️ Rate limiter Redis not available, using memory fallback');
      this.isConnected = false;
    }
  }

  // Générer une clé pour le rate limiting
  private generateKey(req: NextRequest, config: RateLimitConfig): string {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const userId = req.headers.get('x-user-id') || 'anonymous';
    
    // Utiliser l'IP comme clé principale, avec fallback sur user-agent
    const baseKey = `${ip}:${userAgent}`;
    
    // Si on a un userId, l'utiliser comme clé
    if (userId !== 'anonymous') {
      return `rate_limit:user:${userId}`;
    }
    
    return `rate_limit:ip:${baseKey}`;
  }

  // Vérifier le rate limit
  async checkRateLimit(
    req: NextRequest,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = this.generateKey(req, config);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    if (!this.isConnected) {
      // Fallback en mémoire (très basique)
      return this.memoryFallback(key, config);
    }

    try {
      // Utiliser Redis avec pipeline pour performance
      const pipeline = this.redis.pipeline();
      
      // Supprimer les anciennes entrées
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Compter les requêtes actuelles
      pipeline.zcard(key);
      
      // Ajouter la requête actuelle
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Définir l'expiration
      pipeline.expire(key, Math.ceil(config.windowMs / 1000));
      
      const results = await pipeline.exec();
      
      if (!results) {
        throw new Error('Pipeline execution failed');
      }

      const currentCount = results[1][1] as number;
      const allowed = currentCount < config.maxRequests;
      
      const remaining = Math.max(0, config.maxRequests - currentCount - 1);
      const resetTime = now + config.windowMs;
      
      return {
        allowed,
        remaining,
        resetTime,
        retryAfter: allowed ? undefined : Math.ceil(config.windowMs / 1000),
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // En cas d'erreur, autoriser la requête
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
      };
    }
  }

  // Fallback en mémoire
  private memoryFallback(key: string, config: RateLimitConfig): RateLimitResult {
    // Implémentation très basique en mémoire
    // Dans un vrai environnement, vous utiliseriez une solution plus robuste
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: Date.now() + config.windowMs,
    };
  }

  // Middleware pour le rate limiting
  static createMiddleware(config: RateLimitConfig) {
    const rateLimiter = new RateLimiter();
    
    return async (req: NextRequest): Promise<NextResponse | null> => {
      const result = await rateLimiter.checkRateLimit(req, config);
      
      if (!result.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: result.retryAfter,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': result.retryAfter?.toString() || '60',
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString(),
            },
          }
        );
      }
      
      return null; // Continuer avec la requête
    };
  }
}

// Middlewares pré-configurés
export const rateLimiters = {
  // Rate limiter pour l'authentification
  auth: RateLimiter.createMiddleware(RATE_LIMIT_CONFIGS.auth),
  
  // Rate limiter pour la recherche
  search: RateLimiter.createMiddleware(RATE_LIMIT_CONFIGS.search),
  
  // Rate limiter pour les produits
  products: RateLimiter.createMiddleware(RATE_LIMIT_CONFIGS.products),
  
  // Rate limiter pour les utilisateurs
  user: RateLimiter.createMiddleware(RATE_LIMIT_CONFIGS.user),
  
  // Rate limiter pour les APIs publiques
  public: RateLimiter.createMiddleware(RATE_LIMIT_CONFIGS.public),
  
  // Rate limiter pour les admins
  admin: RateLimiter.createMiddleware(RATE_LIMIT_CONFIGS.admin),
};

// Fonction utilitaire pour appliquer le rate limiting
export async function applyRateLimit(
  req: NextRequest,
  type: keyof typeof RATE_LIMIT_CONFIGS
): Promise<NextResponse | null> {
  const middleware = rateLimiters[type];
  return await middleware(req);
}

// Configuration pour différents environnements
export const getRateLimitConfig = (environment: string) => {
  const baseConfig = {
    development: {
      // Plus permissif en développement
      auth: { ...RATE_LIMIT_CONFIGS.auth, maxRequests: 100 },
      search: { ...RATE_LIMIT_CONFIGS.search, maxRequests: 100 },
      products: { ...RATE_LIMIT_CONFIGS.products, maxRequests: 200 },
    },
    production: RATE_LIMIT_CONFIGS,
    staging: {
      // Intermédiaire en staging
      auth: { ...RATE_LIMIT_CONFIGS.auth, maxRequests: 20 },
      search: { ...RATE_LIMIT_CONFIGS.search, maxRequests: 50 },
      products: { ...RATE_LIMIT_CONFIGS.products, maxRequests: 100 },
    },
  };

  return baseConfig[environment as keyof typeof baseConfig] || baseConfig.production;
};

// Monitoring du rate limiting
export class RateLimitMonitor {
  private static blockedRequests: Map<string, number> = new Map();
  private static totalRequests: Map<string, number> = new Map();

  static recordRequest(key: string, blocked: boolean): void {
    this.totalRequests.set(key, (this.totalRequests.get(key) || 0) + 1);
    
    if (blocked) {
      this.blockedRequests.set(key, (this.blockedRequests.get(key) || 0) + 1);
    }
  }

  static getStats(): {
    totalRequests: number;
    blockedRequests: number;
    blockRate: number;
    topBlockedIPs: Array<{ ip: string; count: number }>;
  } {
    const total = Array.from(this.totalRequests.values()).reduce((sum, count) => sum + count, 0);
    const blocked = Array.from(this.blockedRequests.values()).reduce((sum, count) => sum + count, 0);
    const blockRate = total > 0 ? blocked / total : 0;

    const topBlockedIPs = Array.from(this.blockedRequests.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests: total,
      blockedRequests: blocked,
      blockRate,
      topBlockedIPs,
    };
  }

  static reset(): void {
    this.blockedRequests.clear();
    this.totalRequests.clear();
  }
}