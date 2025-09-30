import { NextRequest, NextResponse } from 'next/server';
import { gzip, deflate, brotliCompress } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const deflateAsync = promisify(deflate);
const brotliCompressAsync = promisify(brotliCompress);

// Types pour l'optimisation des réponses
interface CompressionConfig {
  threshold: number; // Taille minimum pour compression (bytes)
  level: number; // Niveau de compression (1-9)
  chunkSize: number; // Taille des chunks
}

interface OptimizationConfig {
  compression: CompressionConfig;
  minify: boolean;
  cache: {
    enabled: boolean;
    maxAge: number; // en secondes
    sMaxAge?: number; // en secondes
  };
  headers: {
    security: boolean;
    performance: boolean;
  };
}

// Configuration par défaut
const DEFAULT_CONFIG: OptimizationConfig = {
  compression: {
    threshold: 1024, // 1KB
    level: 6,
    chunkSize: 16 * 1024, // 16KB
  },
  minify: true,
  cache: {
    enabled: true,
    maxAge: 3600, // 1 heure
    sMaxAge: 86400, // 24 heures
  },
  headers: {
    security: true,
    performance: true,
  },
};

// Classe pour l'optimisation des réponses
export class ResponseOptimizer {
  private config: OptimizationConfig;

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Optimiser une réponse
  async optimizeResponse(
    request: NextRequest,
    response: NextResponse,
    data?: any
  ): Promise<NextResponse> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Déterminer le type de contenu
    const contentType = response.headers.get('content-type') || '';
    const isTextContent = contentType.includes('text/') || contentType.includes('application/json');
    const isStaticAsset = pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/);

    // Optimiser selon le type de contenu
    if (isTextContent) {
      return await this.optimizeTextResponse(request, response, data);
    } else if (isStaticAsset) {
      return await this.optimizeStaticResponse(request, response);
    } else {
      return await this.optimizeApiResponse(request, response, data);
    }
  }

  // Optimiser les réponses texte (HTML, CSS, JS)
  private async optimizeTextResponse(
    request: NextRequest,
    response: NextResponse,
    data?: any
  ): Promise<NextResponse> {
    const body = data ? JSON.stringify(data) : response.body;
    if (!body) return response;

    // Compression
    const compressedResponse = await this.compressResponse(request, body);
    
    // Headers de cache
    const cacheHeaders = this.getCacheHeaders(request, 'text');
    
    // Headers de sécurité
    const securityHeaders = this.getSecurityHeaders();
    
    // Headers de performance
    const performanceHeaders = this.getPerformanceHeaders();

    return new NextResponse(compressedResponse.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        ...cacheHeaders,
        ...securityHeaders,
        ...performanceHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Encoding': compressedResponse.encoding,
        'Content-Length': compressedResponse.body.length.toString(),
      },
    });
  }

  // Optimiser les assets statiques
  private async optimizeStaticResponse(
    request: NextRequest,
    response: NextResponse
  ): Promise<NextResponse> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Headers de cache pour les assets statiques
    const cacheHeaders = this.getCacheHeaders(request, 'static');
    
    // Headers de sécurité
    const securityHeaders = this.getSecurityHeaders();
    
    // Compression pour les assets
    const compressedResponse = await this.compressResponse(request, response.body);

    return new NextResponse(compressedResponse.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        ...cacheHeaders,
        ...securityHeaders,
        'Content-Encoding': compressedResponse.encoding,
        'Content-Length': compressedResponse.body.length.toString(),
      },
    });
  }

  // Optimiser les réponses API
  private async optimizeApiResponse(
    request: NextRequest,
    response: NextResponse,
    data?: any
  ): Promise<NextResponse> {
    const body = data ? JSON.stringify(data) : response.body;
    if (!body) return response;

    // Compression
    const compressedResponse = await this.compressResponse(request, body);
    
    // Headers de cache pour les APIs
    const cacheHeaders = this.getCacheHeaders(request, 'api');
    
    // Headers de sécurité
    const securityHeaders = this.getSecurityHeaders();
    
    // Headers CORS
    const corsHeaders = this.getCorsHeaders(request);

    return new NextResponse(compressedResponse.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        ...cacheHeaders,
        ...securityHeaders,
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Encoding': compressedResponse.encoding,
        'Content-Length': compressedResponse.body.length.toString(),
      },
    });
  }

  // Compresser une réponse
  private async compressResponse(
    request: NextRequest,
    body: any
  ): Promise<{ body: Buffer; encoding: string }> {
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body);

    // Vérifier si la compression est nécessaire
    if (bodyBuffer.length < this.config.compression.threshold) {
      return { body: bodyBuffer, encoding: 'identity' };
    }

    // Choisir le meilleur algorithme de compression
    if (acceptEncoding.includes('br')) {
      try {
        const compressed = await brotliCompressAsync(bodyBuffer, {
          params: {
            [require('zlib').constants.BROTLI_PARAM_QUALITY]: this.config.compression.level,
          },
        });
        return { body: compressed, encoding: 'br' };
      } catch (error) {
        console.warn('Brotli compression failed:', error);
      }
    }

    if (acceptEncoding.includes('gzip')) {
      try {
        const compressed = await gzipAsync(bodyBuffer, {
          level: this.config.compression.level,
          chunkSize: this.config.compression.chunkSize,
        });
        return { body: compressed, encoding: 'gzip' };
      } catch (error) {
        console.warn('Gzip compression failed:', error);
      }
    }

    if (acceptEncoding.includes('deflate')) {
      try {
        const compressed = await deflateAsync(bodyBuffer, {
          level: this.config.compression.level,
          chunkSize: this.config.compression.chunkSize,
        });
        return { body: compressed, encoding: 'deflate' };
      } catch (error) {
        console.warn('Deflate compression failed:', error);
      }
    }

    return { body: bodyBuffer, encoding: 'identity' };
  }

  // Obtenir les headers de cache
  private getCacheHeaders(request: NextRequest, type: 'text' | 'static' | 'api'): Record<string, string> {
    if (!this.config.cache.enabled) return {};

    const headers: Record<string, string> = {};

    switch (type) {
      case 'static':
        // Assets statiques - cache long
        headers['Cache-Control'] = `public, max-age=${this.config.cache.sMaxAge}, immutable`;
        headers['Expires'] = new Date(Date.now() + this.config.cache.sMaxAge * 1000).toUTCString();
        break;
      
      case 'text':
        // Contenu HTML - cache court
        headers['Cache-Control'] = `public, max-age=${this.config.cache.maxAge}`;
        headers['Expires'] = new Date(Date.now() + this.config.cache.maxAge * 1000).toUTCString();
        break;
      
      case 'api':
        // APIs - cache très court ou pas de cache
        const url = new URL(request.url);
        if (url.pathname.includes('/api/products') || url.pathname.includes('/api/categories')) {
          headers['Cache-Control'] = `public, max-age=300`; // 5 minutes
        } else {
          headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        }
        break;
    }

    return headers;
  }

  // Obtenir les headers de sécurité
  private getSecurityHeaders(): Record<string, string> {
    if (!this.config.headers.security) return {};

    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };
  }

  // Obtenir les headers de performance
  private getPerformanceHeaders(): Record<string, string> {
    if (!this.config.headers.performance) return {};

    return {
      'X-DNS-Prefetch-Control': 'on',
      'X-Download-Options': 'noopen',
      'X-Permitted-Cross-Domain-Policies': 'none',
    };
  }

  // Obtenir les headers CORS
  private getCorsHeaders(request: NextRequest): Record<string, string> {
    const origin = request.headers.get('origin');
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

    if (!origin || !allowedOrigins.includes(origin)) {
      return {};
    }

    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    };
  }
}

// Instance singleton
export const responseOptimizer = new ResponseOptimizer();

// Middleware pour l'optimisation automatique
export async function optimizeResponseMiddleware(
  request: NextRequest,
  response: NextResponse,
  data?: any
): Promise<NextResponse> {
  return await responseOptimizer.optimizeResponse(request, response, data);
}

// Fonction utilitaire pour les APIs
export async function createOptimizedResponse(
  request: NextRequest,
  data: any,
  status: number = 200
): Promise<NextResponse> {
  const response = new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return await responseOptimizer.optimizeResponse(request, response, data);
}

// Configuration pour différents environnements
export const getOptimizationConfig = (environment: string) => {
  const configs = {
    development: {
      compression: { threshold: 0, level: 1 },
      minify: false,
      cache: { enabled: false, maxAge: 0 },
    },
    production: DEFAULT_CONFIG,
    staging: {
      ...DEFAULT_CONFIG,
      compression: { ...DEFAULT_CONFIG.compression, level: 4 },
    },
  };

  return configs[environment as keyof typeof configs] || DEFAULT_CONFIG;
};