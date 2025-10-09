'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, ShoppingCart, Heart, Eye, Crown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductsService, Product } from '@/lib/services';
import { useCart } from '@/contexts/CartContext';
import { WishlistButton } from '@/components/ui/wishlist-button';
import { ErrorState } from '@/components/ui/error-state';
import QuickAddToCart from './QuickAddToCart';

interface BestSeller {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  comparePrice?: number;
  rating: number;
  reviews: number;
  category: string;
  vendor: string;
  discount?: number;
}

const BestSellers: React.FC = () => {
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadBestSellers = async () => {
      try {
        setLoading(true);
        // Simuler des données de bestsellers basées sur les ventes
        const response = await ProductsService.getAll({
          featured: true
        }, { limit: 10 });

        if (response.success && response.data) {
          const bestSellersData: BestSeller[] = response.data
            .map(product => {
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
                rating: product.average_rating || 0,
                reviews: product.reviews_count || 0,
                category: product.category?.name || 'Catégorie',
                vendor: product.vendor?.name || 'Vendeur',
                discount
              };
            })
            .filter(product => product.reviews > 0) // Seulement les produits avec des avis
            .sort((a, b) => b.reviews - a.reviews) // Trier par nombre d'avis
            .slice(0, 8);

          setBestSellers(bestSellersData);
        }
      } catch (err) {
        setError('Erreur de chargement des meilleures ventes');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBestSellers();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Trophy className="w-4 h-4 text-gray-400" />;
    if (index === 2) return <Trophy className="w-4 h-4 text-orange-500" />;
    return <span className="text-sm font-bold text-gray-600">#{index + 1}</span>;
  };

  const getRankBadgeColor = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (index === 2) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="container">
          <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-br from-yellow-50 to-orange-50">
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
    <section className="py-12 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Top Ventes
              </h2>
            </div>
            <Badge className="bg-white text-yellow-600 font-bold">
              <Crown className="w-3 h-3 mr-1" />
              Meilleurs vendeurs
            </Badge>
          </div>
          
          <div className="text-right">
            <p className="text-yellow-100 text-sm">
              🏆 Les produits les plus vendus cette semaine
            </p>
          </div>
        </div>

        {/* Best Sellers Grid */}
        {bestSellers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {bestSellers.map((product, index) => (
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

                  {/* Rank Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className={`${getRankBadgeColor(index)} text-xs font-bold flex items-center gap-1`}>
                      {getRankIcon(index)}
                    </Badge>
                  </div>

                  {/* Bestseller Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-red-500 text-white text-xs font-bold">
                      Bestseller
                    </Badge>
                  </div>

                  {/* Reviews Count */}
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-green-500 text-white text-xs">
                      {product.reviews} avis
                    </Badge>
                  </div>

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
                      <h3 className="font-medium text-sm line-clamp-2 hover:text-yellow-600 transition-colors leading-tight">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center space-x-1 text-xs">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                            }`}
                          />
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
                        <span className="font-bold text-yellow-600 text-sm">
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
                          -{product.discount}% de réduction
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
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Aucune donnée de vente disponible
            </h3>
            <p className="text-gray-500">
              Les données de vente seront disponibles bientôt !
            </p>
          </div>
        )}

        {/* View All Button */}
        {bestSellers.length > 0 && (
          <div className="text-center mt-8">
            <Link href="/products?sort=popular">
              <Button
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white"
              >
                Voir le classement complet
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;