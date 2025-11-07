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

  const ITEMS_PER_SLIDE = 12; // Grille 6x2 (encore plus de produits, cartes compactes)

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

          // Logique intelligente : trouver la date de fin la plus proche pour créer l'urgence
          let smartEndDate: Date | null = null;
          const now = new Date();
          const validEndDates: Date[] = [];

          // Collecter toutes les dates de fin valides
          flashProducts.forEach((product: any) => {
            if (product.flash_end_date) {
              const endDate = new Date(product.flash_end_date);
              if (endDate > now) { // Seulement les dates futures
                validEndDates.push(endDate);
              }
            }
          });

          if (validEndDates.length > 0) {
            // Trier par date croissante (plus proche en premier)
            validEndDates.sort((a, b) => a.getTime() - b.getTime());

            const closestDate = validEndDates[0];
            const hoursUntilClosest = (closestDate.getTime() - now.getTime()) / (1000 * 60 * 60);

            // Logique intelligente de sélection
            if (hoursUntilClosest <= 72) {
              // Si la plus proche est dans les 3 jours, l'utiliser (urgence réelle)
              smartEndDate = closestDate;
            } else {
              // Sinon, chercher une date dans une fourchette raisonnable (1-7 jours)
              const reasonableDate = validEndDates.find(date => {
                const hours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
                return hours >= 24 && hours <= 168; // Entre 1 jour et 7 jours
              });

              smartEndDate = reasonableDate || closestDate; // Fallback sur la plus proche
            }
          }

          // Définir le flashSale global pour le timer
          if (smartEndDate !== null) {
            setFlashSale({
              end_date: smartEndDate.toISOString(),
              is_active: smartEndDate > new Date()
            });
          } else {
            // Pas de date de fin définie, créer une date par défaut (6h pour plus d'urgence)
            const defaultEndDate = new Date();
            defaultEndDate.setHours(defaultEndDate.getHours() + 6);
            setFlashSale({
              end_date: defaultEndDate.toISOString(),
              is_active: true
            });
          }

          // Simuler les informations de stock pour la compatibilité
          const mockStockInfo = flashProducts.map((product: any) => ({
            product_id: product.id,
            is_available: product.status === 'active' && (product.quantity || 0) > 0,
            flash_sale_product_id: product.id,
            sold_quantity: product.flash_sold_quantity || 0,
            available_stock: product.quantity || 0,
            max_quantity: product.flash_max_quantity || null,
            stock_percentage: product.flash_max_quantity
              ? Math.round(((product.flash_sold_quantity || 0) / product.flash_max_quantity) * 100)
              : 0
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
    if (!flashSale || !flashSale.end_date) {
      // Pas de vente flash active, afficher un timer par défaut
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      setUrgencyMessage('Profitez des meilleures promotions - Jusqu\'à 70% de réduction');
      return;
    }

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
        setUrgencyMessage('🔥 DERNIÈRES MINUTES - Jusqu\'à 70% de réduction !');
      } else if (totalMinutes <= 30) {
        setUrgencyMessage('⚡ Plus que 30 minutes - Profitez des meilleures promotions !');
      } else if (totalMinutes <= 60) {
        setUrgencyMessage('⏰ Plus qu\'une heure - Jusqu\'à 70% de réduction !');
      } else if (totalMinutes <= 120) {
        setUrgencyMessage('🚀 Offres bientôt terminées - Profitez des meilleures promotions !');
      } else {
        setUrgencyMessage('Profitez des meilleures promotions - Jusqu\'à 70% de réduction');
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
    const maxIndex = Math.ceil(products.length / ITEMS_PER_SLIDE);
    setCurrentIndex((prev) => (prev + 1) % maxIndex);
  };

  const prevSlide = () => {
    trackButtonClick('Carousel Previous', 'Flash Sales');
    const maxIndex = Math.ceil(products.length / ITEMS_PER_SLIDE);
    setCurrentIndex((prev) => (prev - 1 + maxIndex) % maxIndex);
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

  // Si pas de ventes flash, ne rien afficher (masquer la section complètement)
  if (products.length === 0) {
    return null;
  }

  // Calculer le nombre total de slides
  const totalSlides = Math.ceil(products.length / ITEMS_PER_SLIDE);

  return (
    <section className="bg-jomionstore-background">
      <div className="container">
        {/* Header avec fond dégradé */}
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
          {/* Ligne principale : Titre - Countdown - Bouton */}
          <div className="flex items-center justify-between mb-3">
            {/* Titre à gauche */}
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              ⚡ Ventes Flash
            </h2>

            {/* Countdown Timer au centre */}
            <div className="flex items-center space-x-1 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-mono backdrop-blur-sm">
              <Clock className="w-4 h-4" />
              <span>
                {(() => {
                  const totalHours = timeLeft.hours;
                  const days = Math.floor(totalHours / 24);
                  const remainingHours = totalHours % 24;

                  if (days > 0) {
                    return `${days}j ${String(remainingHours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
                  }
                  return `${String(remainingHours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
                })()}
              </span>
            </div>

            {/* Bouton Voir tout à droite */}
            <Link href="/products?sale=true">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-red-600 border-white hover:bg-red-50 hover:border-red-100 whitespace-nowrap"
                onClick={() => trackButtonClick('Voir toutes les offres flash', 'Flash Sales Header')}
              >
                Voir tout
              </Button>
            </Link>
          </div>

          {/* Description en dessous */}
          <p className="text-red-100 text-sm">
            {urgencyMessage}
          </p>
        </div>

        {/* Products Carousel - Grille 2x2 */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => {
                const startIndex = slideIndex * ITEMS_PER_SLIDE;
                const slideProducts = products.slice(startIndex, startIndex + ITEMS_PER_SLIDE);

                return (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
                      {slideProducts.map((flashSaleProduct) => {
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
                          <Card key={product.id} className="bg-white hover:shadow-lg transition-all duration-300 border border-gray-200">
                            <CardContent className="p-1">
                              <div className="relative mb-1">
                                <Link href={`/product/${product.slug}`}>
                                  <div className="aspect-square relative overflow-hidden rounded bg-gray-100">
                                    {product.images?.[0] ? (
                                      <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                        loading="lazy"
                                        quality={85}
                                        placeholder="blur"
                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                                        Pas d'image
                                      </div>
                                    )}
                                  </div>
                                </Link>

                                {discount > 0 && (
                                  <Badge className="absolute top-0.5 left-0.5 bg-red-500 text-white font-bold text-[10px] px-1 py-0">
                                    -{discount}%
                                  </Badge>
                                )}
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
                                      className={`w-2 h-2 ${i < 4
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'fill-gray-200 text-gray-200'
                                        }`}
                                    />
                                  ))}
                                  <span className="text-[9px] text-gray-600">(4.5)</span>
                                </div>

                                <div className="space-y-0.5">
                                  <div className="flex items-center space-x-0.5 flex-wrap">
                                    <span className="font-bold text-[11px] text-jomionstore-primary">
                                      {formatPrice(product.flash_price || product.price)}
                                    </span>
                                    {(product.flash_price || product.compare_price) && (
                                      <span className="text-[9px] text-gray-500 line-through">
                                        {formatPrice(product.compare_price || product.price)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <InteractiveFeedback
                                  action="cart"
                                  onAction={() => handleAddToCart(flashSaleProduct)}
                                  disabled={!stockData?.is_available || product.status !== 'active'}
                                  productName={product.name}
                                  className="w-full"
                                >
                                  <Button
                                    className="w-full bg-jomionstore-primary hover:bg-orange-700 text-white font-medium py-0.5 text-[10px] h-6"
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
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          {totalSlides > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-1 sm:left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 p-0 shadow-lg border border-gray-200"
                onClick={prevSlide}
                aria-label="Produits précédents"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 sm:right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 p-0 shadow-lg border border-gray-200"
                onClick={nextSlide}
                aria-label="Produits suivants"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </Button>
            </>
          )}
        </div>

        {/* Indicateurs de pagination */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                  ? 'bg-red-500 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                aria-label={`Aller à la page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}