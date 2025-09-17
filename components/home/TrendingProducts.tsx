'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Heart, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductsService, Product } from '@/lib/services';
import { useCart } from '@/contexts/CartContext';
import { WishlistButton } from '@/components/ui/wishlist-button';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ErrorState } from '@/components/ui/error-state';

// Cache for trending products with TTL
const CACHE_KEY = 'trending_products';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  data: Product[];
  timestamp: number;
}

function TrendingProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart } = useCart();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const itemWidthRef = useRef<number>(260 + 24);
  const rafRef = useRef<number | null>(null);

  // Check cache first
  const getCachedData = useCallback((): Product[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsedCache: CachedData = JSON.parse(cached);
        const isExpired = Date.now() - parsedCache.timestamp > CACHE_TTL;
        if (!isExpired) {
          return parsedCache.data;
        }
      }
    } catch (error) {
      console.warn('Error reading cache:', error);
    }
    return null;
  }, []);

  // Save to cache
  const setCachedData = useCallback((data: Product[]) => {
    try {
      const cacheData: CachedData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }
  }, []);

  const loadProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Check cache first if not refreshing
      if (!isRefresh) {
        const cachedProducts = getCachedData();
        if (cachedProducts) {
          setProducts(cachedProducts);
          setLoading(false);
          return;
        }
      }

      const response = await ProductsService.getPopular(8);
      if (response.success && response.data) {
        setProducts(response.data);
        setCachedData(response.data);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(response.error || 'Erreur lors du chargement des produits');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');

      // If we have cached data and this is a refresh, keep showing cached data
      if (isRefresh && products.length > 0) {
        setError('Impossible de rafraîchir. Données en cache affichées.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getCachedData, setCachedData, products.length]);

  // Retry with exponential backoff
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
    setTimeout(() => {
      loadProducts();
    }, delay);
  }, [loadProducts, retryCount]);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    loadProducts(true);
  }, [loadProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, product.name, product.price, 1);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    }
  };

  const scrollByAmount = (amount: number) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    if (!trackRef.current) return;
    const safeIndex = Math.max(0, Math.min(index, products.length - 1));
    trackRef.current.scrollTo({ left: safeIndex * (itemWidthRef.current), behavior: 'smooth' });
    setCurrent(safeIndex);
  };

  useEffect(() => {
    if (!trackRef.current) return;
    const firstCard = trackRef.current.querySelector('.trend-card') as HTMLElement | null;
    if (firstCard) {
      const rect = firstCard.getBoundingClientRect();
      itemWidthRef.current = rect.width + 24; // include gap
    }
  }, [products.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const idx = Math.round(el.scrollLeft / itemWidthRef.current);
        if (idx !== current) setCurrent(Math.max(0, Math.min(idx, products.length - 1)));
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [current, products.length]);

  useEffect(() => {
    if (paused || products.length === 0) return;
    const id = setInterval(() => {
      const next = (current + 1) % products.length;
      scrollToIndex(next);
    }, 4000);
    return () => clearInterval(id);
  }, [current, paused, products.length]);

  // Loading state
  if (loading && products.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Produits Tendance</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez les produits les plus populaires du moment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state with no cached data
  if (error && products.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Produits Tendance</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez les produits les plus populaires du moment
            </p>
          </div>

          <ErrorState
            type="generic"
            title="Erreur de chargement"
            message={error}
            onRetry={handleRetry}
            retryCount={retryCount}
          />
        </div>
      </section>
    );
  }

  // Empty state
  if (!loading && products.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Produits Tendance</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez les produits les plus populaires du moment
            </p>
          </div>

          <ErrorState
            type="empty"
            title="Aucun produit tendance"
            message="Aucun produit tendance n'est disponible pour le moment."
            onRetry={handleRetry}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Produits Tendance</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les produits les plus populaires du moment
          </p>
          {error && products.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden md:block">
            <Button variant="outline" size="icon" onClick={() => scrollByAmount(-320)} aria-label="Précédent">
              ‹
            </Button>
          </div>
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden md:block">
            <Button variant="outline" size="icon" onClick={() => scrollByAmount(320)} aria-label="Suivant">
              ›
            </Button>
          </div>
          <div
            ref={trackRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            style={{ scrollbarWidth: 'none' as any }}
          >
            {products.map((product) => (
              <Card key={product.id} className="trend-card group hover:shadow-lg transition-shadow duration-300 snap-start shrink-0 w-[260px]">
                <CardContent className="p-4">
                <div className="relative mb-4">
                  <Link href={`/product/${product.slug}`}>
                    <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingCart className="w-12 h-12" />
                          </div>
                      )}
                    </div>
                  </Link>

                  {product.compare_price && product.compare_price > product.price && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                      -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                    </Badge>
                  )}

                  <WishlistButton
                    productId={product.id}
                    productName={product.name}
                    price={product.price}
                    productSlug={product.slug}
                    size="sm"
                    variant="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(product.average_rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                          }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600">({product.reviews_count || 0})</span>
                  </div>

                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium text-sm line-clamp-2 hover:text-primary">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.status !== 'active' || (product.track_quantity && product.quantity <= 0)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.status !== 'active' || (product.track_quantity && product.quantity <= 0)
                      ? 'Indisponible'
                      : 'Ajouter au panier'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          {products.map((_, i) => (
            <button
              key={i}
              aria-label={`Aller à l'élément ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-beshop-primary' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/products">
            <Button variant="outline" size="lg">
              Voir tous les produits
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Export with Error Boundary
export default function TrendingProducts() {
  return (
    <ErrorBoundary
      fallback={
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Produits Tendance</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Découvrez les produits les plus populaires du moment
              </p>
            </div>
            <ErrorState
              type="generic"
              title="Erreur inattendue"
              message="Une erreur inattendue s'est produite lors du chargement des produits tendance."
              onRetry={() => window.location.reload()}
            />
          </div>
        </section>
      }
    >
      <TrendingProductsContent />
    </ErrorBoundary>
  );
}
