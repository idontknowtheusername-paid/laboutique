'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { ProductsService, Product } from '@/lib/services';
import { useCart } from '@/contexts/CartContext';
import { WishlistButton } from '@/components/ui/wishlist-button';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import QuickAddToCart from './QuickAddToCart';

interface CategoryCarouselProps {
  title: string;
  subtitle?: string;
  categorySlug: string;
  viewAllLink?: string;
  maxItems?: number;
  sortBy?: 'newest' | 'popular' | 'price_asc' | 'price_desc' | 'featured';
  showBadge?: boolean;
  badgeText?: string;
  badgeColor?: string;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  title,
  subtitle,
  categorySlug,
  viewAllLink,
  maxItems = 8,
  sortBy = 'newest',
  showBadge = false,
  badgeText = 'Nouveau',
  badgeColor = 'bg-green-500'
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  // Charger les produits
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await ProductsService.getByCategorySorted(categorySlug, maxItems, sortBy);
        
        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          throw new Error(response.error || 'Erreur lors du chargement des produits');
        }
      } catch (err) {
        console.error(`Erreur lors du chargement des ${title}:`, err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [categorySlug, maxItems, sortBy, title]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || products.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, products.length - 2));
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, products.length]);

  const nextSlide = useCallback(() => {
    const maxIndex = Math.max(1, products.length - 2);
    setCurrentIndex((prev) => (prev + 1) % maxIndex);
  }, [products.length]);

  const prevSlide = useCallback(() => {
    const maxIndex = Math.max(1, products.length - 2);
    setCurrentIndex((prev) => (prev - 1 + maxIndex) % maxIndex);
  }, [products.length]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <section className="py-6 bg-white">
        <div className="container">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
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

  if (error || products.length === 0) {
    return (
      <section className="py-6 bg-white">
        <div className="container">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">{title}</h2>
            <p className="text-gray-600">{error || 'Aucun produit disponible'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 bg-white">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 p-3 rounded-lg" style={{ background: '#4169E1' }}>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-blue-200 mt-1 text-sm">{subtitle}</p>}
          </div>
          {viewAllLink && (
            <Link 
              href={viewAllLink} 
              className="text-white hover:text-blue-300 text-xs font-medium bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full transition-all"
            >
              Voir tout
            </Link>
          )}
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 25}%)` }}
            >
              {products.map((product) => (
                <div key={product.id} className="w-1/4 flex-shrink-0 px-2">
                  <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 h-full">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <Link href={`/product/${product.slug}`}>
                          <div className="aspect-square relative overflow-hidden rounded-xl bg-gray-100">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                loading="lazy"
                                quality={85}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ShoppingCart className="w-12 h-12" />
                              </div>
                            )}
                          </div>
                        </Link>
                        
                        {showBadge && (
                          <Badge className={`absolute top-2 left-2 ${badgeColor} text-white font-bold text-xs px-2 py-1`}>
                            {badgeText}
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

                      <div className="space-y-3">
                        <Link href={`/product/${product.slug}`}>
                          <h3 className="font-semibold text-sm line-clamp-2 hover:text-jomionstore-primary transition-colors leading-tight">
                            {product.name}
                          </h3>
                        </Link>

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
                          <span className="text-xs text-gray-600">({product.reviews_count || 0})</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="font-bold text-lg text-jomionstore-primary">
                              {formatPrice(product.price)}
                            </span>
                            {product.compare_price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.compare_price)}
                              </span>
                            )}
                          </div>
                        </div>

                        <QuickAddToCart
                          productId={product.id}
                          productName={product.name}
                          price={product.price}
                          disabled={product.status !== 'active' || (product.track_quantity && product.quantity <= 0)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          {products.length > 4 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-10 h-10 p-0 shadow-lg border border-gray-200"
                onClick={prevSlide}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-10 h-10 p-0 shadow-lg border border-gray-200"
                onClick={nextSlide}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;