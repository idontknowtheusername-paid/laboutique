'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { ProductsService, Product } from '@/lib/services';
import Image from 'next/image';
import InteractiveFeedback from '@/components/ui/InteractiveFeedback';
import { useFeedback } from '@/components/ui/FeedbackProvider';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useCartAnimation } from '@/contexts/CartAnimationContext';

export default function FlashSalesConnected() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { addToCart } = useCart();
  const { showSuccess, showError } = useFeedback();
  const { trackAddToCart, trackButtonClick } = useAnalytics();
  const { triggerCartAnimation } = useCartAnimation();

  // Détection de la taille d'écran
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Charger les produits en promotion depuis le backend
  useEffect(() => {
    const loadFlashSaleProducts = async () => {
      try {
        setLoading(true);
        // Récupérer les produits avec compare_price (en promotion)
        const response = await ProductsService.getAll({}, { limit: 10 });
        
        if (response.success && response.data) {
          // Filtrer les produits qui ont un compare_price (donc en promotion)
          const saleProducts = response.data.filter(product => 
            product.compare_price && product.compare_price > product.price
          );
          setProducts(saleProducts.slice(0, 6)); // Limiter à 6 produits
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits Flash Sales:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFlashSaleProducts();
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (price: number, comparePrice: number) => {
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, product.name, product.price, 1);
      trackAddToCart(product.id, product.name, (product.category as any)?.name || 'unknown', product.price);
      triggerCartAnimation(product.name);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      showError('Erreur lors de l\'ajout au panier');
    }
  };

  const nextSlide = () => {
    trackButtonClick('Carousel Next', 'Flash Sales');
    const maxIndex = isMobile ? products.length - 1 : Math.max(1, products.length - 2);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, maxIndex));
  };

  const prevSlide = () => {
    trackButtonClick('Carousel Previous', 'Flash Sales');
    const maxIndex = isMobile ? products.length - 1 : Math.max(1, products.length - 2);
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, maxIndex)) % Math.max(1, maxIndex));
  };

  if (loading) {
    return (
      <section className="py-12 bg-jomionstore-background">
        <div className="container">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jomionstore-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des offres flash...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-12 bg-jomionstore-background">
        <div className="container">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">⚡ Ventes Flash</h2>
            <p className="text-gray-600">Aucune offre flash disponible pour le moment</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-jomionstore-background">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              ⚡ Ventes Flash
            </h2>
            <p className="text-gray-600">Offres limitées, ne les ratez pas !</p>
          </div>
          
          {/* Countdown Timer */}
          <div className="flex items-center space-x-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <Clock className="w-5 h-5 text-red-600" />
            <div className="flex space-x-2 text-red-600 font-mono">
              <div className="text-center">
                <div className="text-xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-xs">H</div>
              </div>
              <div className="text-xl">:</div>
              <div className="text-center">
                <div className="text-xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-xs">M</div>
              </div>
              <div className="text-xl">:</div>
              <div className="text-center">
                <div className="text-xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-xs">S</div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Carousel - Optimisé pour mobile */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / (isMobile ? 1 : 2))}%)` }}
            >
              {products.map((product) => {
                const discount = product.compare_price ? calculateDiscount(product.price, product.compare_price) : 0;
                
                return (
                  <div key={product.id} className="w-full sm:w-1/2 flex-shrink-0 px-2 sm:px-3">
                    <Card className="bg-white hover:shadow-xl transition-all duration-300 border border-gray-200">
                      <CardContent className="p-3 sm:p-4 md:p-6">
                        <div className="relative mb-4 sm:mb-6">
                          <Link href={`/product/${product.slug}`}>
                            <div className="aspect-square relative overflow-hidden rounded-xl bg-gray-100" style={{ minHeight: isMobile ? '250px' : '300px' }}>
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  fill
                                  className="object-cover hover:scale-105 transition-transform duration-300"
                                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                  loading="lazy"
                                  quality={85}
                                  placeholder="blur"
                                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  Pas d'image
                                </div>
                              )}
                            </div>
                          </Link>
                          
                          {discount > 0 && (
                            <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white font-bold text-xs sm:text-sm px-2 py-1 sm:px-3">
                              -{discount}%
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                          <Link href={`/product/${product.slug}`}>
                            <h3 className="font-semibold text-sm sm:text-base md:text-lg line-clamp-2 hover:text-jomionstore-primary transition-colors leading-tight">
                              {product.name}
                            </h3>
                          </Link>

                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${i < 4
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-200'
                                  }`}
                              />
                            ))}
                            <span className="text-xs sm:text-sm text-gray-600">(4.5)</span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                              <span className="font-bold text-lg sm:text-xl md:text-2xl text-jomionstore-primary">
                                {formatPrice(product.price)}
                              </span>
                              {product.compare_price && (
                                <span className="text-sm sm:text-base md:text-lg text-gray-500 line-through">
                                  {formatPrice(product.compare_price)}
                                </span>
                              )}
                            </div>
                          </div>

                          <InteractiveFeedback
                            action="cart"
                            onAction={() => handleAddToCart(product)}
                            disabled={product.status !== 'active' || (product.track_quantity && product.quantity <= 0)}
                            productName={product.name}
                            className="w-full"
                          >
                            <Button
                              className="w-full bg-jomionstore-primary hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 text-sm sm:text-base"
                              size={isMobile ? "default" : "lg"}
                              disabled={product.status !== 'active' || (product.track_quantity && product.quantity <= 0)}
                            >
                              {product.status !== 'active' || (product.track_quantity && product.quantity <= 0)
                                ? 'Indisponible'
                                : 'Ajouter au panier'
                              }
                            </Button>
                          </InteractiveFeedback>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons - Optimisé pour mobile */}
          {products.length > (isMobile ? 1 : 2) && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-1 sm:left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 p-0 shadow-lg border border-gray-200"
                onClick={prevSlide}
                aria-label="Produit précédent"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 sm:right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 p-0 shadow-lg border border-gray-200"
                onClick={nextSlide}
                aria-label="Produit suivant"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </Button>
            </>
          )}
        </div>

        {/* View All Link - Optimisé pour mobile */}
        <div className="text-center mt-6 sm:mt-8">
          <Link href="/products?sale=true">
            <Button 
              variant="outline" 
              className="bg-jomionstore-primary text-white border-jomionstore-primary hover:bg-blue-700 hover:border-blue-700 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base"
              onClick={() => trackButtonClick('Voir toutes les offres flash', 'Flash Sales')}
            >
              Voir toutes les offres flash
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}