// Performance optimization configuration
export const PERFORMANCE_CONFIG = {
  // Image optimization
  images: {
    quality: 85,
    formats: ['image/webp', 'image/avif'] as const,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Bundle optimization
  bundle: {
    splitChunks: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
      },
      common: {
        name: 'common',
        minChunks: 2,
        chunks: 'all',
        enforce: true,
      },
    },
  },
  
  // Lazy loading
  lazyLoading: {
    threshold: 0.1,
    rootMargin: '50px',
    fallback: true,
  },
  
  // Critical resources
  critical: {
    fonts: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
    preload: [
      '/images/hero-bg.webp',
      '/images/logo.svg',
    ],
  },
  
  // Performance budgets
  budgets: {
    js: '250kb',
    css: '50kb',
    images: '500kb',
    fonts: '100kb',
  },
  
  // Monitoring
  monitoring: {
    enabled: process.env.NODE_ENV === 'production',
    sampleRate: 0.1,
    metrics: [
      'FCP',
      'LCP',
      'CLS',
      'FID',
      'TTFB',
    ],
  },
};

export default PERFORMANCE_CONFIG;