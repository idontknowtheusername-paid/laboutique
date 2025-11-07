'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, ProductsService, CategoriesService } from '@/lib/services';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { WishlistButton } from '@/components/ui/wishlist-button';
import { ErrorState } from '@/components/ui/error-state';
import { generateConsistentRating, generateConsistentReviews } from '@/lib/utils/rating';

interface CategoryProductsCarouselProps {
  categorySlug: string;
  title: string;
  subtitle: string;
  maxItems?: number;
  className?: string;
}

export default function CategoryProductsCarousel({
  categorySlug,
  title,
  subtitle,
  maxItems = 8,
  className = ''
}: CategoryProductsCarouselProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const categoryResponse = await CategoriesService.getBySlug(categorySlug);
        
        if (!categoryResponse.success || !categoryResponse.data) {
          setError('Catégorie non trouvée');
          return;
        }
        
        const categoryId = categoryResponse.data.id;
        
        // Test direct avec une requête simple
        console.log('🔍 CategoryProductsCarousel - Loading products for:', {
          categorySlug,
          categoryId,
          maxItems
        });
        
        const response = await ProductsService.getAll(
          {
            category_id: categoryId,
            status: 'active'
          },
          { limit: maxItems }
        );
        
        console.log('🔍 CategoryProductsCarousel - Response:', response);
        console.log('🔍 CategoryProductsCarousel - Response.data:', response.data);
        console.log('🔍 CategoryProductsCarousel - Response.data.data:', (response.data as any).data);

        if (response.success && response.data) {
          const productsData = response.data || [];
          console.log('🔍 CategoryProductsCarousel - Products data:', productsData);
          console.log('🔍 CategoryProductsCarousel - Products count:', productsData.length);
          setProducts(productsData);


        } else {
          setError(response.error || 'Erreur lors du chargement des produits');
        }
      } catch (err) {
        setError('Erreur de connexion');
        console.error('Erreur chargement produits catégorie:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [categorySlug, maxItems]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, product.name, product.price, 1, product.images?.[0]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    }
  };

  const scrollByAmount = (amount: number) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Loading state
  if (loading && products.length === 0) {
    return (
      <section className={`bg-white ${className}`}>
        <div className="container">
          <div className="text-center mb-12 p-3 rounded-lg" style={{ background: '#FF5722' }}>
            <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-orange-200 mt-1 text-sm truncate">{subtitle}</p>}
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

  // Error state
  if (error && products.length === 0) {
    return (
      <section className={`bg-white ${className}`}>
        <div className="container">
          <div className="text-center mb-12 p-3 rounded-lg" style={{ background: '#FF5722' }}>
            <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-orange-200 mt-1 text-sm truncate">{subtitle}</p>}
          </div>
          <ErrorState
            type="generic"
            title="Erreur de chargement"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </section>
    );
  }

  // Masquer la section si pas de produits
  if (!loading && products.length === 0) {
    console.log('🔍 CategoryProductsCarousel - Section masquée (pas de produits):', categorySlug);
    return null;
  }

  console.log('🔍 CategoryProductsCarousel - Rendering with products:', products.length);
  
  return (
    <section className={`bg-white ${className}`}>
      <div className="container">
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ background: '#FF5722' }}>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-orange-200 mt-1 text-sm truncate">{subtitle}</p>}
          </div>

          <Link href={`/category/${categorySlug}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-orange-300 text-xs font-medium bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full transition-all"
            >
              Voir tout
            </Button>
          </Link>
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
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border border-gray-200 snap-start shrink-0 w-[180px]">
                <CardContent className="p-1">
                  <div className="relative mb-1">
                    <Link href={`/product/${product.slug}`}>
                      <div className="aspect-square relative overflow-hidden rounded bg-gray-100">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="180px"
                            loading="lazy"
                            quality={85}
                          />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                              Pas d'image
                          </div>
                        )}
                      </div>
                    </Link>

                    {product.compare_price && product.compare_price > product.price && (
                      <Badge className="absolute top-0.5 left-0.5 bg-red-500 text-white font-bold text-[10px] px-1 py-0">
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
                      className="absolute top-0.5 right-0.5 bg-white/80 hover:bg-white"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-medium text-[10px] line-clamp-2 hover:text-jomionstore-primary transition-colors leading-tight">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-2 h-2 ${i < Math.floor(generateConsistentRating(product.id, product.average_rating))
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                            }`}
                        />
                      ))}
                      <span className="text-[9px] text-gray-600">({generateConsistentReviews(product.id, product.reviews_count)})</span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-0.5 flex-wrap">
                        <span className="font-bold text-[11px] text-jomionstore-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price && (
                          <span className="text-[9px] text-gray-500 line-through">
                            {formatPrice(product.compare_price)}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-jomionstore-primary hover:bg-orange-700 text-white font-medium py-0.5 text-[10px] h-6"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.status !== 'active' || (product.track_quantity && product.quantity <= 0)}
                    >
                      {product.status !== 'active' || (product.track_quantity && product.quantity <= 0)
                        ? 'Indisponible'
                        : 'Ajouter'
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>


      </div>
    </section>
  );
}
