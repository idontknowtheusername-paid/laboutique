import { Redis } from 'ioredis';

// Configuration Redis pour cache distribué
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

// Types pour le cache
interface CacheConfig {
  ttl: number; // Time to live en secondes
  prefix: string;
  version?: string;
}

interface CacheResult<T> {
  data: T;
  cached: boolean;
  ttl?: number;
}

// Configuration des caches par type de données
const CACHE_CONFIGS = {
  // Cache court (5 minutes) pour données dynamiques
  PRODUCTS: { ttl: 300, prefix: 'products' },
  CATEGORIES: { ttl: 600, prefix: 'categories' },
  SEARCH_RESULTS: { ttl: 300, prefix: 'search' },
  
  // Cache moyen (30 minutes) pour données semi-statiques
  USER_PROFILE: { ttl: 1800, prefix: 'user' },
  CART: { ttl: 1800, prefix: 'cart' },
  
  // Cache long (2 heures) pour données statiques
  STATIC_CONTENT: { ttl: 7200, prefix: 'static' },
  CONFIG: { ttl: 7200, prefix: 'config' },
} as const;

// Classe principale pour la gestion du cache
export class CacheManager {
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
      console.log('✅ Redis cache connected');
    } catch (error) {
      console.warn('⚠️ Redis cache not available, using memory fallback');
      this.isConnected = false;
    }
  }

  // Générer une clé de cache
  private generateKey(config: CacheConfig, identifier: string): string {
    const version = config.version || 'v1';
    return `${config.prefix}:${version}:${identifier}`;
  }

  // Obtenir des données du cache
  async get<T>(config: CacheConfig, identifier: string): Promise<CacheResult<T> | null> {
    if (!this.isConnected) return null;

    try {
      const key = this.generateKey(config, identifier);
      const cached = await this.redis.get(key);
      
      if (cached) {
        const data = JSON.parse(cached);
        return {
          data,
          cached: true,
          ttl: await this.redis.ttl(key)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Stocker des données dans le cache
  async set<T>(config: CacheConfig, identifier: string, data: T): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const key = this.generateKey(config, identifier);
      const serialized = JSON.stringify(data);
      
      await this.redis.setex(key, config.ttl, serialized);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Supprimer du cache
  async delete(config: CacheConfig, identifier: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const key = this.generateKey(config, identifier);
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Supprimer par pattern
  async deletePattern(pattern: string): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        return await this.redis.del(...keys);
      }
      return 0;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  // Invalider le cache d'un utilisateur
  async invalidateUser(userId: string): Promise<void> {
    await this.deletePattern(`user:*:${userId}*`);
    await this.deletePattern(`cart:*:${userId}*`);
  }

  // Invalider le cache des produits
  async invalidateProducts(): Promise<void> {
    await this.deletePattern('products:*');
    await this.deletePattern('search:*');
  }

  // Invalider le cache des catégories
  async invalidateCategories(): Promise<void> {
    await this.deletePattern('categories:*');
  }

  // Obtenir ou calculer avec cache
  async getOrCompute<T>(
    config: CacheConfig,
    identifier: string,
    computeFn: () => Promise<T>
  ): Promise<CacheResult<T>> {
    // Essayer de récupérer du cache
    const cached = await this.get<T>(config, identifier);
    if (cached) {
      return cached;
    }

    // Calculer les données
    const data = await computeFn();
    
    // Stocker dans le cache
    await this.set(config, identifier, data);
    
    return {
      data,
      cached: false
    };
  }

  // Cache avec fallback en mémoire
  private memoryCache = new Map<string, { data: any; expires: number }>();

  async getWithFallback<T>(config: CacheConfig, identifier: string): Promise<T | null> {
    // Essayer Redis d'abord
    const redisResult = await this.get<T>(config, identifier);
    if (redisResult) {
      return redisResult.data;
    }

    // Fallback en mémoire
    const key = this.generateKey(config, identifier);
    const memoryData = this.memoryCache.get(key);
    
    if (memoryData && memoryData.expires > Date.now()) {
      return memoryData.data;
    }

    return null;
  }

  async setWithFallback<T>(config: CacheConfig, identifier: string, data: T): Promise<void> {
    // Stocker dans Redis
    await this.set(config, identifier, data);
    
    // Fallback en mémoire
    const key = this.generateKey(config, identifier);
    this.memoryCache.set(key, {
      data,
      expires: Date.now() + (config.ttl * 1000)
    });
  }

  // Nettoyer le cache mémoire
  cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.expires <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Statistiques du cache
  async getStats(): Promise<{
    connected: boolean;
    memorySize: number;
    redisInfo?: any;
  }> {
    const stats = {
      connected: this.isConnected,
      memorySize: this.memoryCache.size
    };

    if (this.isConnected) {
      try {
        const info = await this.redis.info('memory');
        return { ...stats, redisInfo: info };
      } catch (error) {
        console.error('Redis info error:', error);
      }
    }

    return stats;
  }
}

// Instance singleton
export const cacheManager = new CacheManager();

// Fonctions utilitaires pour les cas d'usage courants
export const cacheUtils = {
  // Cache des produits
  async getProduct(productId: string) {
    return cacheManager.getOrCompute(
      CACHE_CONFIGS.PRODUCTS,
      productId,
      async () => {
        // Ici vous appelleriez votre service de produits
        const { ProductsService } = await import('../services/products.service');
        return await ProductsService.getBySlug(productId);
      }
    );
  },

  // Cache des catégories
  async getCategories() {
    return cacheManager.getOrCompute(
      CACHE_CONFIGS.CATEGORIES,
      'all',
      async () => {
        const { CategoriesService } = await import('../services/categories.service');
        return await CategoriesService.getAll();
      }
    );
  },

  // Cache des résultats de recherche
  async getSearchResults(query: string, filters: any) {
    const identifier = `${query}:${JSON.stringify(filters)}`;
    return cacheManager.getOrCompute(
      CACHE_CONFIGS.SEARCH_RESULTS,
      identifier,
      async () => {
        const { ProductsService } = await import('../services/products.service');
        return await ProductsService.search(query, filters);
      }
    );
  },

  // Cache du profil utilisateur
  async getUserProfile(userId: string) {
    return cacheManager.getOrCompute(
      CACHE_CONFIGS.USER_PROFILE,
      userId,
      async () => {
        const { AuthService } = await import('../services/auth.service');
        return await AuthService.getProfile(userId);
      }
    );
  },

  // Cache du panier
  async getCart(userId: string) {
    return cacheManager.getOrCompute(
      CACHE_CONFIGS.CART,
      userId,
      async () => {
        const { CartService } = await import('../services/cart.service');
        return await CartService.getCartSummary(userId);
      }
    );
  }
};

// Nettoyage automatique du cache mémoire
setInterval(() => {
  cacheManager.cleanupMemoryCache();
}, 60000); // Toutes les minutes