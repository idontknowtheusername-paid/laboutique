'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QuickAddToCart from '@/components/home/QuickAddToCart';
import { WishlistButton } from '@/components/ui/wishlist-button';

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
  vendor?: string;
  category?: string;
}

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  backgroundColor?: string;
  autoPlay?: boolean;
  showVendor?: boolean;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  products,
  backgroundColor = 'bg-white',
  autoPlay = false,
  showVendor = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Update scroll buttons state
  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Handle scroll
  const handleScroll = () => {
    updateScrollButtons();
    
    // Calculate current index based on scroll position
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const cardWidth = clientWidth < 640 ? clientWidth / 2 : clientWidth < 1024 ? clientWidth / 3 : clientWidth / 4;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    }
  };

  // Scroll to specific index
  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    
    const { clientWidth } = scrollContainerRef.current;
    const cardWidth = clientWidth < 640 ? clientWidth / 2 : clientWidth < 1024 ? clientWidth / 3 : clientWidth / 4;
    const scrollPosition = index * cardWidth;
    
    scrollContainerRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth',
    });
  };

  // Navigation functions
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    const { clientWidth } = scrollContainerRef.current;
    scrollContainerRef.current.scrollBy({ left: -clientWidth, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    const { clientWidth } = scrollContainerRef.current;
    scrollContainerRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || products.length === 0) return;

    autoPlayTimerRef.current = setInterval(() => {
      if (!scrollContainerRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 10;
      
      if (isAtEnd) {
        // Reset to start
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll next
        scrollRight();
      }
    }, 4000);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlaying, products.length]);

  // Initialize
  useEffect(() => {
    updateScrollButtons();
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [products]);

  // Pause auto-play on hover (desktop)
  const handleMouseEnter = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (autoPlay) {
      setIsAutoPlaying(true);
    }
  };

  if (!products || products.length === 0) {
    return (
      <section className={`py-8 ${backgroundColor}`}>
        <div className="container">
          <div className="text-center text-gray-500 py-8">
            Aucun produit disponible
          </div>
        </div>
      </section>
    );
  }

  const totalSlides = Math.ceil(products.length / 2); // Pour mobile (2 par vue)

  return (
    <section className={`py-8 md:py-12 ${backgroundColor}`}>
      <div className="container">
        {/* Header - Mobile First */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm md:text-base text-gray-600">{subtitle}</p>
          )}
        </div>

        {/* Carousel Container - Mobile First with Snap Scroll */}
        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Products - Horizontal Scroll with Snap */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar pb-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {products.map((product) => (
              <Card
                key={product.id}
                className="group flex-shrink-0 w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] snap-start hover:shadow-lg transition-shadow duration-300"
              >
                <Link href={`/product/${product.slug}`} className="block">
                  {/* Image Container */}
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading="lazy"
                    />
                    
                    {/* Badges */}
                    {product.discount && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                        -{product.discount}%
                      </Badge>
                    )}

                    {/* Wishlist Button - Desktop only */}
                    <div className="absolute top-2 right-2 opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <WishlistButton
                        productId={product.id}
                        productName={product.name}
                        price={product.price}
                        productSlug={product.slug}
                        size="sm"
                        variant="icon"
                        className="bg-white/90 hover:bg-white"
                      />
                    </div>
                  </div>
                </Link>

                <CardContent className="p-2 md:p-3">
                  {/* Vendor - Optional */}
                  {showVendor && product.vendor && (
                    <p className="text-xs text-gray-500 uppercase tracking-wide truncate mb-1">
                      {product.vendor}
                    </p>
                  )}

                  {/* Product Name */}
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium text-xs md:text-sm line-clamp-2 hover:text-jomionstore-primary transition-colors mb-1 md:mb-2 min-h-[32px] md:min-h-[40px]">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating - Compact on mobile */}
                  <div className="flex items-center gap-1 mb-1 md:mb-2">
                    <div className="flex">
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
                    <span className="text-[10px] md:text-xs text-gray-500">
                      ({product.reviews})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-bold text-jomionstore-primary text-sm md:text-base">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-[10px] md:text-xs text-gray-500 line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart - Always visible on mobile */}
                  <QuickAddToCart
                    productId={product.id}
                    productName={product.name}
                    price={product.price}
                    showQuantitySelector={false}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation Buttons - Desktop Only */}
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollLeft}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white hover:bg-white shadow-lg rounded-full z-10"
              aria-label="Précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          
          {canScrollRight && (
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollRight}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white hover:bg-white shadow-lg rounded-full z-10"
              aria-label="Suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Indicators - Mobile optimized */}
        <div className="flex justify-center gap-1.5 md:gap-2 mt-4">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index * 2)}
              className={`h-1.5 md:h-2 rounded-full transition-all ${
                Math.floor(currentIndex / 2) === index
                  ? 'w-6 md:w-8 bg-jomionstore-primary'
                  : 'w-1.5 md:w-2 bg-gray-300'
              }`}
              aria-label={`Aller à la page ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default ProductCarousel;
