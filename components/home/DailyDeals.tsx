'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, ShoppingCart, Heart, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductsService, Product } from '@/lib/services';
import { useCart } from '@/contexts/CartContext';
import { WishlistButton } from '@/components/ui/wishlist-button';
import { ErrorState } from '@/components/ui/error-state';
import QuickAddToCart from './QuickAddToCart';

interface DailyDeal {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  timeLeft: number;
  stockLeft: number;
  category: string;
  vendor: string;
}

const DailyDeals: React.FC = () => {
  const [deals, setDeals] = useState<DailyDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 heures en secondes
  const { addToCart } = useCart();

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Reset to 24 hours when countdown reaches 0
          return 24 * 60 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load daily deals
  useEffect(() => {
    const loadDailyDeals = async () => {
      try {
        setLoading(true);
        const response = await ProductsService.getAll({
          featured: true
        }, { limit: 20 });

        if (response.success && response.data) {
          const dailyDeals: DailyDeal[] = response.data
            .filter(product => {
              const discount = product.compare_price && product.compare_price > product.price
                ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                : 0;
              return discount >= 20; // Au moins 20% de réduction
            })
            .map(product => {
              const discount = product.compare_price && product.compare_price > product.price
                ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                : 0;

              return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                image: product.images?.[0] || '/images/placeholder-product.jpg',
                price: product.price,
                originalPrice: product.compare_price || product.price,
                discount,
                timeLeft: Math.floor(Math.random() * 24 * 60 * 60), // Random time left
                stockLeft: Math.floor(Math.random() * 10) + 1,
                category: product.category?.name || 'Catégorie',
                vendor: product.vendor?.name || 'Vendeur'
              };
            })
            .slice(0, 8);

          setDeals(dailyDeals);
        }
      } catch (err) {
        setError('Erreur de chargement des offres du jour');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDailyDeals();
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container">
          <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container">
          <ErrorState
            type="generic"
            title="Erreur de chargement"
            message={error}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)' }}>
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Offres du Jour
              </h2>
            </div>
            <Badge className="bg-white text-orange-600 font-bold">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-orange-100 text-sm">
              ⏰ Offres limitées - Ne ratez pas ces bonnes affaires !
            </p>
          </div>
        </div>

        {/* Deals Grid */}
        {deals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {deals.map((deal) => (
              <Card key={deal.id} className="group hover-lift card-shadow h-full flex flex-col bg-white">
                <div className="relative overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative" style={{ minHeight: '180px' }}>
                    <Image
                      src={deal.image}
                      alt={deal.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      loading="lazy"
                      quality={85}
                    />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 space-y-1">
                    <Badge className="bg-red-500 text-white text-xs font-bold">
                      -{deal.discount}%
                    </Badge>
                    <Badge className="bg-orange-500 text-white text-xs">
                      Offre du jour
                    </Badge>
                  </div>

                  {/* Stock indicator */}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-red-600 text-white text-xs">
                      {deal.stockLeft} restants
                    </Badge>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-1">
                    <WishlistButton
                      productId={deal.id}
                      productName={deal.name}
                      price={deal.price}
                      productSlug={deal.slug}
                      size="sm"
                      variant="icon"
                      className="w-6 h-6 bg-white/90 hover:bg-white shadow-sm"
                    />
                  </div>
                </div>

                <CardContent className="p-3 flex flex-col flex-grow">
                  <div className="space-y-2 flex-grow">
                    <Link href={`/product/${deal.slug}`}>
                      <h3 className="font-medium text-sm line-clamp-2 hover:text-orange-600 transition-colors leading-tight">
                        {deal.name}
                      </h3>
                    </Link>

                    <div className="text-xs text-gray-500">
                      {deal.category} • {deal.vendor}
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-orange-600 text-sm">
                          {formatPrice(deal.price)}
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          {formatPrice(deal.originalPrice)}
                        </span>
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Économisez {formatPrice(deal.originalPrice - deal.price)}
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <div className="mt-auto pt-2">
                    <QuickAddToCart
                      productId={deal.id}
                      productName={deal.name}
                      price={deal.price}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Aucune offre du jour disponible
            </h3>
            <p className="text-gray-500">
              Revenez demain pour découvrir de nouvelles offres !
            </p>
          </div>
        )}

        {/* View All Button */}
        {deals.length > 0 && (
          <div className="text-center mt-8">
            <Link href="/products?discount_min=20&sort=discount">
              <Button
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
              >
                Voir toutes les offres du jour
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default DailyDeals;