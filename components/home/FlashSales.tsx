'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Star, Eye, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QuickAddToCart from './QuickAddToCart';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { ProductsService, Product } from '@/lib/services';

interface FlashProduct {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  rating: number;
  reviews: number;
  sold: number;
  stock: number;
  slug: string;
}

const flashProducts: FlashProduct[] = [
  {
    id: '1',
    name: 'Smartphone Samsung Galaxy A54',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 250000,
    salePrice: 180000,
    discount: 28,
    rating: 4.5,
    reviews: 324,
    sold: 89,
    stock: 150,
    slug: 'samsung-galaxy-a54'
  },
  {
    id: '2',
    name: 'MacBook Air M2',
    image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 850000,
    salePrice: 720000,
    discount: 15,
    rating: 4.8,
    reviews: 156,
    sold: 42,
    stock: 80,
    slug: 'macbook-air-m2'
  },
  {
    id: '3',
    name: 'AirPods Pro 2ème génération',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 180000,
    salePrice: 140000,
    discount: 22,
    rating: 4.7,
    reviews: 891,
    sold: 156,
    stock: 200,
    slug: 'airpods-pro-2'
  },
  {
    id: '4',
    name: 'TV Smart LG 55" 4K',
    image: 'https://images.pexels.com/photos/1444416/pexels-photo-1444416.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 450000,
    salePrice: 350000,
    discount: 22,
    rating: 4.4,
    reviews: 267,
    sold: 73,
    stock: 120,
    slug: 'tv-lg-55-4k'
  },
  {
    id: '5',
    name: 'PlayStation 5 Console',
    image: 'https://images.pexels.com/photos/9820190/pexels-photo-9820190.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 420000,
    salePrice: 380000,
    discount: 10,
    rating: 4.9,
    reviews: 523,
    sold: 198,
    stock: 60,
    slug: 'playstation-5'
  },
];

const FlashSales = () => {
  const { addToCart } = useCart();
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  // SSR-safe initial value, update after mount
  const [itemsToShow, setItemsToShow] = useState(5);
  const [isHovering, setIsHovering] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const hoverDelayMs = 1500;
  const autoPlayIntervalMs = 3000;
  let hoverDelayTimer: any = null;
  let autoPlayTimer: any = null;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Responsive items per view: mobile=3, tablet=4, desktop=5 (we will duplicate if fewer)
  useEffect(() => {
    const computeItemsToShow = () => {
      const width = typeof window !== "undefined" ? window.innerWidth : 1024;
      const base = width < 640 ? 3 : width < 1024 ? 4 : 5;
      return base;
    };
    setItemsToShow(computeItemsToShow());
    const handleResize = () => {
      setItemsToShow((prev) => {
        const next = computeItemsToShow();
        setCurrentIndex((idx) => {
          const maxStart = Math.max(0, flashProducts.length - next);
          return Math.min(idx, maxStart);
        });
        return next;
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        const canNext = prev < flashProducts.length - itemsToShow;
        return canNext ? prev + 1 : 0;
      });
    }, autoPlayIntervalMs);
    return () => {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    };
  }, [isAutoPlaying, itemsToShow]);

  // Build displayed list to ensure multiple items visible even with few products
  const displayedProducts = React.useMemo(() => {
    if (!flashProducts || flashProducts.length === 0)
      return [] as FlashProduct[];
    if (flashProducts.length >= itemsToShow) return flashProducts;
    const min = itemsToShow;
    const result: FlashProduct[] = [];
    for (let i = 0; i < min; i++) {
      result.push(flashProducts[i % flashProducts.length]);
    }
    return result;
  }, [itemsToShow]);

  const totalItems = displayedProducts.length;
  const canGoNext = currentIndex < Math.max(0, totalItems - itemsToShow);
  const canGoPrev = currentIndex > 0;
  const nextSlide = () => {
    if (canGoNext) setCurrentIndex((p) => p + 1);
  };
  const prevSlide = () => {
    if (canGoPrev) setCurrentIndex((p) => p - 1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-BJ", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-gradient-to-r from-beshop-secondary to-orange-600 rounded-xl p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg md:text-xl font-bold">Flash Sales</h2>
          <div className="flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="font-medium text-sm">Se termine dans:</span>
            <div className="flex space-x-1">
              <span className="bg-white text-beshop-secondary px-2 py-1 rounded font-bold min-w-[2rem] text-center text-sm">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-sm">:</span>
              <span className="bg-white text-beshop-secondary px-2 py-1 rounded font-bold min-w-[2rem] text-center text-sm">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-sm">:</span>
              <span className="bg-white text-beshop-secondary px-2 py-1 rounded font-bold min-w-[2rem] text-center text-sm">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        <Link href="/flash-sales">
          <Button
            variant="secondary"
            className="bg-white text-beshop-secondary hover:bg-gray-100 text-sm"
          >
            Voir tout
          </Button>
        </Link>
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
          {displayedProducts.map((product, index) => {
            return (
              <div
                key={`${product.id}-${index}`}
                className="flex-shrink-0 px-3"
                style={{ width: `${100 / itemsToShow}%` }}
              >
                <Card className="group hover-lift card-shadow bg-white text-gray-900 overflow-hidden h-full flex flex-col">
                  <div className="relative">
                    {/* Product Image */}
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Discount Badge */}
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                      -{product.discount}%
                    </Badge>

                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-7 h-7 md:w-8 md:h-8 bg-white/90 hover:bg-white"
                      >
                        <Heart className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-7 h-7 md:w-8 md:h-8 bg-white/90 hover:bg-white"
                      >
                        <Eye className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-2 md:p-4 flex flex-col flex-grow">
                    <div className="space-y-2 md:space-y-3 flex-grow">
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
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-200 text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-500 truncate">
                          ({product.reviews})
                        </span>
                      </div>

                      {/* Prices */}
                      <div className="space-y-1">
                        <div className="flex flex-col md:flex-row items-start md:items-center space-y-1 md:space-y-0 md:space-x-2">
                          <span className="font-bold text-beshop-primary text-sm md:text-lg">
                            {formatPrice(product.salePrice)}
                          </span>
                          <span className="text-xs md:text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="mt-3 md:mt-4">
                      <QuickAddToCart
                        productId={product.id}
                        productName={product.name}
                        price={product.salePrice}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
        {/* Overlay Navigation */}
        <div className="absolute inset-y-0 left-2 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            disabled={!canGoPrev}
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
            disabled={!canGoNext}
            aria-label="Suivant"
            className="w-10 h-10 bg-white/80 hover:bg-white text-gray-900 rounded-full shadow transition disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashSales;