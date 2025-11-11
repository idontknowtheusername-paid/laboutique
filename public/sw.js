// Service Worker JomionStore - Optimisé pour e-commerce
// Version: Change à chaque déploiement pour forcer la mise à jour
const VERSION = 'v2.1.0-' + '20250212'; // Mettre la date du déploiement
const IS_PRODUCTION = self.location.hostname !== 'localhost';

// Cache names
const CACHE_STATIC = `jomionstore-static-${VERSION}`;
const CACHE_IMAGES = `jomionstore-images-${VERSION}`;
const CACHE_API = `jomionstore-api-${VERSION}`;

// Durées de cache (en millisecondes)
const CACHE_DURATION = {
  images: 7 * 24 * 60 * 60 * 1000,  // 7 jours
  api: 3 * 60 * 1000,                // 3 minutes
};

// Assets critiques (seulement ceux qui existent vraiment)
const CRITICAL_ASSETS = [
  '/',
  '/offline',
  '/images/latestlogo.jpg',
  '/favicon.ico',
];

// ============================================
// INSTALL - Cache les assets critiques
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', VERSION);
  
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(CRITICAL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.error('[SW] Install failed:', err);
        // Continue quand même l'installation
        return self.skipWaiting();
      })
  );
});

// ============================================
// ACTIVATE - Nettoie les vieux caches
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', VERSION);
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('jomionstore-') && 
                           name !== CACHE_STATIC && 
                           name !== CACHE_IMAGES && 
                           name !== CACHE_API)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ============================================
// FETCH - Stratégies de cache intelligentes
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip non-http protocols
  if (!url.protocol.startsWith('http')) return;

  // Skip localhost en développement (pas de cache local)
  if (!IS_PRODUCTION && url.hostname === 'localhost') {
    return;
  }

  // Router selon le type de requête
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPI(request));
  } else if (request.destination === 'image') {
    event.respondWith(handleImage(request));
  } else if (request.destination === 'document') {
    event.respondWith(handleDocument(request));
  } else if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(handleStatic(request));
  }
});

// ============================================
// STRATÉGIE: API - Network first (0-3 min cache)
// ============================================
async function handleAPI(request) {
  try {
    const response = await fetch(request);
    
    // Cache seulement les réponses réussies
    if (response.ok) {
      const cache = await caches.open(CACHE_API);
      cache.put(request, response.clone());
      
      // Nettoyer les entrées expirées
      setTimeout(() => cleanExpiredCache(CACHE_API, CACHE_DURATION.api), 1000);
    }
    
    return response;
  } catch (error) {
    // Fallback vers le cache si réseau échoue
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] API from cache:', request.url);
      return cached;
    }
    
    // Retourner une erreur JSON
    return new Response(
      JSON.stringify({ error: 'Network unavailable', offline: true }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// ============================================
// STRATÉGIE: Images - Cache first (1-7 jours)
// ============================================
async function handleImage(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    // Retourner le cache et mettre à jour en arrière-plan
    fetch(request)
      .then(response => {
        if (response.ok) {
          caches.open(CACHE_IMAGES).then(cache => {
            cache.put(request, response.clone());
          });
        }
      })
      .catch(() => {});
    
    return cached;
  }
  
  // Pas en cache, fetch depuis le réseau
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_IMAGES);
      cache.put(request, response.clone());
      
      // Nettoyer les vieilles images
      setTimeout(() => cleanExpiredCache(CACHE_IMAGES, CACHE_DURATION.images), 1000);
    }
    
    return response;
  } catch (error) {
    // Image placeholder SVG
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#f0f0f0" width="400" height="400"/><text fill="#999" x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="18">Image indisponible</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// ============================================
// STRATÉGIE: HTML - Network first (max 5 min)
// ============================================
async function handleDocument(request) {
  try {
    const response = await fetch(request);
    
    // Ne pas cacher les pages HTML (toujours fresh)
    return response;
  } catch (error) {
    // Fallback vers le cache
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Document from cache:', request.url);
      return cached;
    }
    
    // Page offline
    return caches.match('/offline');
  }
}

// ============================================
// STRATÉGIE: Static assets - Cache first (1 an)
// ============================================
async function handleStatic(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}

// ============================================
// UTILITAIRE: Nettoyer les entrées expirées
// ============================================
async function cleanExpiredCache(cacheName, maxAge) {
  try {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    const now = Date.now();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const dateHeader = response?.headers.get('date');
      
      if (dateHeader) {
        const cacheDate = new Date(dateHeader).getTime();
        if (now - cacheDate > maxAge) {
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Cache cleanup error:', error);
  }
}

// ============================================
// MESSAGE: Communication avec l'app
// ============================================
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  } else if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then(names => {
        return Promise.all(
          names.filter(n => n.startsWith('jomionstore-'))
               .map(n => caches.delete(n))
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded - Version:', VERSION, '- Production:', IS_PRODUCTION);
