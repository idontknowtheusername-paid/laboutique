/**
 * Rate Limiter simple en mémoire
 * Pour la production, utilisez Redis ou une solution distribuée
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitRecord> = new Map();
  private interval: number; // Durée de la fenêtre en ms
  private maxRequests: number; // Nombre max de requêtes

  constructor(interval: number = 60000, maxRequests: number = 5) {
    this.interval = interval;
    this.maxRequests = maxRequests;

    // Nettoyage automatique toutes les minutes
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Vérifier si l'IP peut faire une requête
   */
  check(identifier: string): boolean {
    const now = Date.now();
    const record = this.limits.get(identifier);

    // Si pas d'enregistrement ou fenêtre expirée
    if (!record || now > record.resetTime) {
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.interval
      });
      return true;
    }

    // Si limite atteinte
    if (record.count >= this.maxRequests) {
      console.warn(`⚠️ [RateLimiter] Limite atteinte pour ${identifier}: ${record.count}/${this.maxRequests}`);
      return false;
    }

    // Incrémenter le compteur
    record.count++;
    return true;
  }

  /**
   * Obtenir le temps restant avant reset (en secondes)
   */
  getResetTime(identifier: string): number {
    const record = this.limits.get(identifier);
    if (!record) return 0;

    const now = Date.now();
    const remaining = Math.max(0, record.resetTime - now);
    return Math.ceil(remaining / 1000);
  }

  /**
   * Nettoyer les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, record] of this.limits.entries()) {
      if (now > record.resetTime) {
        this.limits.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[RateLimiter] Nettoyage: ${cleaned} entrées supprimées`);
    }
  }

  /**
   * Réinitialiser un identifiant (pour tests ou admin)
   */
  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  /**
   * Obtenir les stats
   */
  getStats(): { total: number; active: number } {
    const now = Date.now();
    const active = Array.from(this.limits.values()).filter(
      record => now <= record.resetTime
    ).length;

    return {
      total: this.limits.size,
      active
    };
  }
}

// Instances pour différents endpoints
export const checkoutLimiter = new RateLimiter(
  60 * 1000, // 1 minute
  5 // 5 tentatives max par minute
);

export const apiLimiter = new RateLimiter(
  60 * 1000, // 1 minute
  30 // 30 requêtes max par minute
);

/**
 * Helper pour extraire l'IP de la requête
 */
export function getClientIdentifier(request: Request): string {
  // Essayer plusieurs headers pour récupérer la vraie IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');

  let ip = forwarded?.split(',')[0] || realIp || cfIp || 'unknown';
  
  // Nettoyer l'IP
  ip = ip.trim();

  return ip;
}

/**
 * Middleware helper pour vérifier le rate limit
 */
export function checkRateLimit(
  request: Request,
  limiter: RateLimiter = checkoutLimiter
): { allowed: boolean; resetTime: number } {
  const identifier = getClientIdentifier(request);
  const allowed = limiter.check(identifier);
  const resetTime = limiter.getResetTime(identifier);

  if (!allowed) {
    console.warn(
      `🚫 [RateLimit] Bloqué: ${identifier}`,
      `Réessayez dans ${resetTime}s`
    );
  }

  return { allowed, resetTime };
}
