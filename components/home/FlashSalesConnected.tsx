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

export default function FlashSalesConnected() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [urgencyMessage, setUrgencyMessage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [flashSale, setFlashSale] = useState<any>(null);
  const [stockInfo, setStockInfo] = useState<any[]>([]);
  const { addToCart } = useCart();
  const { showSuccess, showError } = useFeedback();
  const { trackAddToCart, trackButtonClick } = useAnalytics();

  // Détection de la taille d'écran - SSR compatible
  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 640);
      }
    };
    
    // Initial check avec timeout pour éviter hydration mismatch
    const timeoutId = setTimeout(checkScreenSize, 100);
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkScreenSize);
    }
    
    return () => {
      clearTimeout(timeoutId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkScreenSize);
      }
    };
  }, []);

  // Charger les flash sales depuis l'API
  useEffect(() => {
    const loadFlashSales = async () => {
      try {
        setLoading(true);
        
        // Utiliser l'API REST directement pour éviter les problèmes de ProductsService
        const response = await fetch('/api/products?limit=30');
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
          // Filtrer les produits en vente flash (nouveau système + fallback)
          const flashProducts = data.data.filter((product: any) => {
            // Nouveau système : is_flash_sale = true
            if (product.is_flash_sale) {
              const now = new Date();
              const endDate = product.flash_end_date ? new Date(product.flash_end_date) : null;
              return !endDate || endDate > now; // Actif si pas de date de fin ou pas encore expiré
            }
            // Fallback : compare_price > price
            return product.compare_price && product.compare_price > product.price;
          });

          setProducts(flashProducts.slice(0, 30));

          // Simuler les informations de stock pour la compatibilité
          const mockStockInfo = flashProducts.map((product: any) => ({
            product_id: product.id,
            is_available: product.status === 'active' && (product.quantity || 0) > 0,
            flash_sale_product_id: product.id,
            sold_quantity: 0,
            available_stock: product.quantity || 0,
            max_quantity: null,
            stock_percentage: 0
          }));

          setStockInfo(mockStockInfo);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des Flash Sales:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFlashSales();
  }, []);

  // Timer countdown synchronisé avec la DB
  useEffect(() => {
    if (!flashSale) return;

    const updateTimer = () => {
      const now = new Date();
      const endDate = new Date(flashSale.end_date);
      const timeLeftMs = endDate.getTime() - now.getTime();

      if (timeLeftMs <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setUrgencyMessage('🔚 VENTE TERMINÉE');
        return;
      }

      const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });

      // Messages d'urgence intelligents
      const totalMinutes = hours * 60 + minutes;
      if (totalMinutes <= 5) {
        setUrgencyMessage('🔥 DERNIÈRES MINUTES !');
      } else if (totalMinutes <= 30) {
        setUrgencyMessage('⚡ Plus que 30 minutes !');
      } else if (totalMinutes <= 60) {
        setUrgencyMessage('⏰ Plus qu\'une heure !');
      } else if (totalMinutes <= 120) {
        setUrgencyMessage('🚀 Offres bientôt terminées');
      } else {
        setUrgencyMessage('');
      }
    };

    // Mise à jour immédiate
    updateTimer();

    // Timer toutes les secondes
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [flashSale]);

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

  const handleAddToCart = async (flashSaleProduct: any) => {
    try {
      const product = flashSaleProduct.product || flashSaleProduct;
      
      // Vérifier le stock disponible
      const stockData = stockInfo.find(s => s.product_id === product.id);
      if (stockData && !stockData.is_available) {
        showError('Produit indisponible');
        return;
      }

      // Utiliser le prix flash si disponible (nouveau système ou fallback)
      const price = product.flash_price || product.price;
      
      await addToCart(product.id, product.name, price, 1, product.images?.[0]);
      trackAddToCart(product.id, product.name, (product.category as any)?.name || 'unknown', price);

      // Mettre à jour le stock vendu pour le nouveau système
      if (product.is_flash_sale && product.flash_sold_quantity !== undefined) {
        try {
          await fetch(`/api/admin/products/${product.id}/flash-sale`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              enabled: true,
              flash_price: product.flash_price,
              // Incrémenter la quantité vendue
              sold_quantity: (product.flash_sold_quantity || 0) + 1
            })
          });
        } catch (err) {
          console.warn('Erreur mise à jour stock flash sale:', err);
        }
      }

      showSuccess('Produit ajouté au panier !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      showError('Erreur lors de l\'ajout au panier');
    }
  };

  const nextSlide = () => {
    trackButtonClick('Carousel Next', 'Flash Sales');
    const maxIndex = Math.max(1, products.length - 2);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, maxIndex));
  };

  const prevSlide = () => {
    trackButtonClick('Carousel Previous', 'Flash Sales');
    const maxIndex = Math.max(1, products.length - 2);
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
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 md:mb-8 p-2 md:p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
          <div className="mb-2 md:mb-0">
            <h2 className="text-lg md:text-2xl font-bold text-white flex items-center">
              ⚡ Ventes Flash
            </h2>
            <p className="text-red-100 text-xs md:text-sm truncate">
              {urgencyMessage || 'Offres limitées, ne les ratez pas !'}
            </p>
          </div>
          
          {/* Countdown Timer */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-1 md:space-x-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-white/80" />
            </div>
            <div className="flex space-x-0.5 md:space-x-1 text-white font-mono">
              <div className="text-center px-1.5 md:px-2 py-0.5 md:py-1 min-w-[32px] md:min-w-[40px]">
                <div className="text-sm md:text-lg font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-[10px] md:text-xs text-white/80">H</div>
              </div>
              <div className="text-white/60 text-sm md:text-lg animate-pulse">:</div>
              <div className="text-center px-1.5 md:px-2 py-0.5 md:py-1 min-w-[32px] md:min-w-[40px]">
                <div className="text-sm md:text-lg font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-[10px] md:text-xs text-white/80">M</div>
              </div>
              <div className="text-white/60 text-sm md:text-lg animate-pulse">:</div>
              <div className="text-center px-1.5 md:px-2 py-0.5 md:py-1 min-w-[32px] md:min-w-[40px]">
                <div className="text-sm md:text-lg font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-[10px] md:text-xs text-white/80">S</div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Carousel - Optimisé pour mobile */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 50}%)` }}
            >
              {products.map((flashSaleProduct) => {
                const product = flashSaleProduct.product || flashSaleProduct;

                // Calculer la réduction (nouveau système ou fallback)
                let discount = 0;
                if (product.is_flash_sale && product.flash_price && product.price) {
                  discount = Math.round(((product.price - product.flash_price) / product.price) * 100);
                } else if (product.compare_price && product.compare_price > product.price) {
                  discount = calculateDiscount(product.price, product.compare_price);
                }

                const stockData = stockInfo.find(s => s.product_id === product.id);
                
                return (
                  <div key={product.id} className="w-1/2 flex-shrink-0 px-2">
                    <Card className="bg-white hover:shadow-xl transition-all duration-300 border border-gray-200 h-full">
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
                            <Badge className="absolute top-2 left-2 bg-red-500 text-white font-bold text-sm px-2 py-1">
                              -{discount}%
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Link href={`/product/${product.slug}`}>
                            <h3 className="font-semibold text-base line-clamp-2 hover:text-jomionstore-primary transition-colors leading-tight">
                              {product.name}
                            </h3>
                          </Link>

                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < 4
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-200'
                                  }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600">(4.5)</span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="font-bold text-xl text-jomionstore-primary">
                                {formatPrice(product.flash_price || product.price)}
                              </span>
                              {(product.flash_price || product.compare_price) && (
                                <span className="text-base text-gray-500 line-through">
                                  {formatPrice(product.compare_price || product.price)}
                                </span>
                              )}
                            </div>
                            
                            {/* Barre de progression du stock */}
                            {stockData && stockData.max_quantity && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-600">
                                  <span>Vendu: {stockData.sold_quantity}</span>
                                  <span>Disponible: {stockData.available_stock}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(stockData.stock_percentage, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>

                          <InteractiveFeedback
                            action="cart"
                            onAction={() => handleAddToCart(flashSaleProduct)}
                            disabled={!stockData?.is_available || product.status !== 'active'}
                            productName={product.name}
                            className="w-full"
                          >
                            <Button
                              className="w-full bg-jomionstore-primary hover:bg-orange-700 text-white font-semibold py-2 text-base"
                              disabled={!stockData?.is_available || product.status !== 'active'}
                            >
                              {!stockData?.is_available || product.status !== 'active'
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
          {products.length > 2 && (
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
              className="bg-jomionstore-primary text-white border-jomionstore-primary hover:bg-orange-700 hover:border-orange-700 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base"
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