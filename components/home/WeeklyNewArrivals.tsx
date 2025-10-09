'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Sparkles, ShoppingCart, Heart, Eye, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductsService, Product } from '@/lib/services';
import { useCart } from '@/contexts/CartContext';
import { WishlistButton } from '@/components/ui/wishlist-button';
import { ErrorState } from '@/components/ui/error-state';
import QuickAddToCart from './QuickAddToCart';

interface WeeklyNewProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  comparePrice?: number;
  category: string;
  vendor: string;
  daysAgo: number;
  discount?: number;
  isNew: boolean;
  rating: number;
  reviews: number;
}

const WeeklyNewArrivals: React.FC = () => {
  const [products, setProducts] = useState<WeeklyNewProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadWeeklyNewArrivals = async () => {
      try {
        setLoading(true);
        const response = await ProductsService.getAll({}, { limit: 50 });

        if (response.success && response.data) {
          const now = new Date();
          const weeklyNewProducts: WeeklyNewProduct[] = response.data
            .map(product => {
              const createdDate = new Date(product.created_at);
              const daysAgo = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
              
              const discount = product.compare_price && product.compare_price > product.price
                ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                : undefined;

              return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                image: product.images?.[0] || '/images/placeholder-product.jpg',
                price: product.price,
                comparePrice: product.compare_price,
                category: product.category?.name || 'Catégorie',
                vendor: product.vendor?.name || 'Vendeur',
                daysAgo,
                discount,
                isNew: daysAgo <= 7,
                rating: product.average_rating || 0,
                reviews: product.reviews_count || 0
              };
            })
            .filter(product => product.isNew) // Seulement les produits des 7 derniers jours
            .sort((a, b) => a.daysAgo - b.daysAgo) // Trier par plus récent
            .slice(0, 8);

          setProducts(weeklyNewProducts);
        }
      } catch (err) {
        setError('Erreur de chargement des nouveautés de la semaine');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyNewArrivals();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDaysAgoText = (days: number) => {
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days <= 7) return `Il y a ${days} jours`;
    return `Il y a ${days} jours`;
  };

  const getNewnessBadgeColor = (days: number) => {
    if (days === 0) return 'bg-green-500 text-white';
    if (days <= 2) return 'bg-blue-500 text-white';
    if (days <= 4) return 'bg-purple-500 text-white';
    return 'bg-gray-500 text-white';
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container">
          <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-br from-green-50 to-emerald-50">
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
    <section className="py-12 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Nouveautés de la Semaine
              </h2>
            </div>
            <Badge className="bg-white text-green-600 font-bold">
              <Sparkles className="w-3 h-3 mr-1" />
              Cette semaine
            </Badge>
          </div>
          
          <div className="text-right">
            <p className="text-green-100 text-sm">
              ✨ Découvrez les derniers arrivages
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="group hover-lift card-shadow h-full flex flex-col bg-white">
                <div className="relative overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative" style={{ minHeight: '180px' }}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      loading="lazy"
                      quality={85}
                    />
                  </div>

                  {/* New Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className={`${getNewnessBadgeColor(product.daysAgo)} text-xs font-bold`}>
                      {getDaysAgoText(product.daysAgo)}
                    </Badge>
                  </div>

                  {/* Fresh Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500 text-white text-xs font-bold">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Nouveau
                    </Badge>
                  </div>

                  {/* Discount Badge */}
                  {product.discount && (
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-red-500 text-white text-xs font-bold">
                        -{product.discount}%
                      </Badge>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-1">
                    <WishlistButton
                      productId={product.id}
                      productName={product.name}
                      price={product.price}
                      productSlug={product.slug}
                      size="sm"
                      variant="icon"
                      className="w-6 h-6 bg-white/90 hover:bg-white shadow-sm"
                    />
                  </div>
                </div>

                <CardContent className="p-3 flex flex-col flex-grow">
                  <div className="space-y-2 flex-grow">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-medium text-sm line-clamp-2 hover:text-green-600 transition-colors leading-tight">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center space-x-1 text-xs">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(product.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-200'
                            }`}
                          >
                            ★
                          </div>
                        ))}
                      </div>
                      <span className="text-gray-500">({product.reviews})</span>
                    </div>

                    <div className="text-xs text-gray-500">
                      {product.category} • {product.vendor}
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600 text-sm">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>
                      {product.discount && (
                        <div className="text-xs text-green-600 font-medium">
                          Économisez {formatPrice(product.comparePrice! - product.price)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <div className="mt-auto pt-2">
                    <QuickAddToCart
                      productId={product.id}
                      productName={product.name}
                      price={product.price}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Aucune nouveauté cette semaine
            </h3>
            <p className="text-gray-500">
              Revenez bientôt pour découvrir de nouveaux produits !
            </p>
          </div>
        )}

        {/* View All Button */}
        {products.length > 0 && (
          <div className="text-center mt-8">
            <Link href="/products?sort=newest&days=7">
              <Button
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              >
                Voir toutes les nouveautés de la semaine
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default WeeklyNewArrivals;