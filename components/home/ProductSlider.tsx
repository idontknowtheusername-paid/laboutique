'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QuickAddToCart from './QuickAddToCart';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  comparePrice?: number;
  rating: number;
  reviews: number;
  discount?: number;
  vendor: string;
  category: string;
  badge?: string;
  badgeColor?: string;
}

interface ProductSliderProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  backgroundColor?: string;
}

const ProductSlider: React.FC<ProductSliderProps> = ({
  title,
  subtitle,
  products,
  viewAllLink,
  backgroundColor = 'bg-white'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(5);
  const [isHovering, setIsHovering] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const hoverDelayMs = 1500;
  const autoPlayIntervalMs = 3000;
  let hoverDelayTimer: any = null;
  let autoPlayTimer: any = null;

  // Responsive items per view: mobile=3, tablet=4, desktop=5 (we will duplicate items if fewer)
  useEffect(() => {
    const computeItemsToShow = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const base = width < 640 ? 3 : width < 1024 ? 4 : 5;
      return base;
    };

    const handleResize = () => {
      setItemsToShow((prev) => {
        const next = computeItemsToShow();
        // Adjust currentIndex to avoid empty space when itemsToShow changes
        setCurrentIndex((idx) => {
          const maxStart = Math.max(0, products.length - next);
          return Math.min(idx, maxStart);
        });
        return next;
      });
    };

    // Initialize
    setItemsToShow(computeItemsToShow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [products.length]);

  // Autoplay on hover with delay
  useEffect(() => {
    if (!isHovering) {
      setIsAutoPlaying(false);
      return;
    }

    hoverDelayTimer = setTimeout(() => {
      setIsAutoPlaying(true);
    }, hoverDelayMs);

    return () => {
      if (hoverDelayTimer) clearTimeout(hoverDelayTimer);
    };
  }, [isHovering]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    autoPlayTimer = setInterval(() => {
      setCurrentIndex((prev) => {
        const canNext = prev < products.length - itemsToShow;
        return canNext ? prev + 1 : 0;
      });
    }, autoPlayIntervalMs);
    return () => {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    };
  }, [isAutoPlaying, products.length, itemsToShow]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const nextSlide = () => {
    if (currentIndex < products.length - itemsToShow) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const canGoNext = currentIndex < products.length - itemsToShow;
  const canGoPrev = currentIndex > 0;

  // Build a displayed array to ensure multiple visible items even if products are few
  const displayedProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [] as Product[];
    if (products.length >= itemsToShow) return products;
    const min = itemsToShow;
    const result: Product[] = [];
    for (let i = 0; i < min; i++) {
      result.push(products[i % products.length]);
    }
    return result;
  }, [products, itemsToShow]);

  const totalItems = displayedProducts.length;
  const safeCanGoNext = currentIndex < Math.max(0, totalItems - itemsToShow);
  const safeCanGoPrev = currentIndex > 0;

  return (
    <section className={`py-12 ${backgroundColor}`}>
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            {subtitle && (
              <p className="text-gray-600">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {viewAllLink && (
              <Link href={viewAllLink}>
                <Button variant="outline" className="border-beshop-primary text-beshop-primary hover:bg-beshop-primary hover:text-white">
                  Voir tout
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Products Slider */}
        <div 
          className="relative overflow-hidden group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
              width: `${(totalItems / itemsToShow) * 100}%`,
            }}
          >
            {displayedProducts.map((product, index) => (
              <div key={`${product.id}-${index}`} className="flex-shrink-0 px-3" style={{ width: `${100 / itemsToShow}%` }}>
                <Card className="group hover-lift card-shadow h-full flex flex-col">
                  <div className="relative overflow-hidden">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 space-y-1">
                      {product.discount && (
                        <Badge className="bg-red-500 text-white text-xs">
                          -{product.discount}%
                        </Badge>
                      )}
                      {product.badge && (
                        <Badge className={`${product.badgeColor || 'bg-green-500'} text-white text-xs`}>
                          {product.badge}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                      <Button size="icon" variant="secondary" className="w-7 h-7 md:w-8 md:h-8 bg-white/90 hover:bg-white shadow-sm">
                        <Heart className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button size="icon" variant="secondary" className="w-7 h-7 md:w-8 md:h-8 bg-white/90 hover:bg-white shadow-sm">
                        <Eye className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-2 md:p-4 flex flex-col flex-grow">
                    <div className="space-y-1.5 md:space-y-3 flex-grow">
                      {/* Vendor */}
                      <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                        {product.vendor}
                      </p>

                      {/* Product Name */}
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-medium text-xs md:text-sm line-clamp-2 hover:text-beshop-primary transition-colors min-h-[2.5rem] md:min-h-[3rem]">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="flex items-center space-x-2 text-xs md:text-sm">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 md:w-3 md:h-3 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-500 truncate">({product.reviews})</span>
                      </div>

                      {/* Price */}
                      <div className="space-y-1">
                        <div className="flex flex-col md:flex-row items-start md:items-center space-y-1 md:space-y-0 md:space-x-2">
                          <span className="font-bold text-beshop-primary text-sm md:text-lg">
                            {formatPrice(product.price)}
                          </span>
                          {product.comparePrice && (
                            <span className="text-xs md:text-sm text-gray-500 line-through">
                              {formatPrice(product.comparePrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart */}
                    <div className="mt-auto">
                      <QuickAddToCart
                        productId={product.id}
                        productName={product.name}
                        price={product.price}
                        onAddToCart={(productId, quantity) => {
                          console.log(`Added ${quantity} of product ${productId} to cart`);
                          // TODO: Implement actual cart functionality
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Overlay Navigation */}
          <div className="absolute inset-y-0 left-2 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              disabled={!safeCanGoPrev}
              aria-label="Précédent"
              className="w-10 h-10 bg-white/80 hover:bg-white text-gray-900 rounded-full shadow transition disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
          <div className="absolute inset-y-0 right-2 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              disabled={!safeCanGoNext}
              aria-label="Suivant"
              className="w-10 h-10 bg-white/80 hover:bg-white text-gray-900 rounded-full shadow transition disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Slider Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: Math.max(1, Math.ceil(totalItems / itemsToShow)) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * itemsToShow)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                Math.floor(currentIndex / itemsToShow) === index
                  ? 'bg-beshop-primary'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;