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

export default function FlashSalesConnected() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

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
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, products.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, products.length - 2)) % Math.max(1, products.length - 2));
  };

  if (loading) {
    return (
      <section className="py-8 bg-gradient-to-r from-red-500 to-pink-600">
        <div className="container">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2">Chargement des offres flash...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-8 bg-gradient-to-r from-red-500 to-pink-600">
        <div className="container">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-2">⚡ Ventes Flash</h2>
            <p>Aucune offre flash disponible pour le moment</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gradient-to-r from-red-500 to-pink-600">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="text-white mb-4 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center">
              ⚡ Ventes Flash
            </h2>
            <p className="text-red-100">Offres limitées, ne les ratez pas !</p>
          </div>
          
          {/* Countdown Timer */}
          <div className="flex items-center space-x-4 bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <Clock className="w-5 h-5 text-white" />
            <div className="flex space-x-2 text-white font-mono">
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

        {/* Products Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
            >
              {products.map((product) => {
                const discount = product.compare_price ? calculateDiscount(product.price, product.compare_price) : 0;
                
                return (
                  <div key={product.id} className="w-1/3 flex-shrink-0 px-2">
                    <Card className="bg-white hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-4">
                        <div className="relative mb-4">
                          <Link href={`/product/${product.slug}`}>
                            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  fill
                                  className="object-cover hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  Pas d'image
                                </div>
                              )}
                            </div>
                          </Link>
                          
                          {discount > 0 && (
                            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                              -{discount}%
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Link href={`/product/${product.slug}`}>
                            <h3 className="font-medium text-sm line-clamp-2 hover:text-red-600">
                              {product.name}
                            </h3>
                          </Link>

                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < 4
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-200'
                                  }`}
                              />
                            ))}
                            <span className="text-xs text-gray-600">(4.5)</span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-red-600">
                                {formatPrice(product.price)}
                              </span>
                              {product.compare_price && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.compare_price)}
                                </span>
                              )}
                            </div>
                          </div>

                          <Button
                            className="w-full bg-red-500 hover:bg-red-600 text-white"
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.status !== 'active' || (product.track_quantity && product.quantity <= 0)}
                          >
                            {product.status !== 'active' || (product.track_quantity && product.quantity <= 0)
                              ? 'Indisponible'
                              : 'Ajouter au panier'
                            }
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          {products.length > 3 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-10 h-10 p-0"
                onClick={prevSlide}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-10 h-10 p-0"
                onClick={nextSlide}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* View All Link */}
        <div className="text-center mt-6">
          <Link href="/products?sale=true">
            <Button variant="outline" className="bg-white/20 border-white text-white hover:bg-white hover:text-red-600">
              Voir toutes les offres flash
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}