'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, ShoppingCart, Heart, Eye, Award, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductsService, Product } from '@/lib/services';
import { useCart } from '@/contexts/CartContext';
import { WishlistButton } from '@/components/ui/wishlist-button';
import { ErrorState } from '@/components/ui/error-state';
import QuickAddToCart from './QuickAddToCart';

interface PremiumProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  comparePrice?: number;
  category: string;
  vendor: string;
  discount?: number;
  rating: number;
  reviews: number;
  premiumLevel: 'luxury' | 'premium' | 'high-end';
}

const PremiumCollection: React.FC = () => {
  const [products, setProducts] = useState<PremiumProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  const PREMIUM_LIMIT = 50000; // 50,000 FCFA

  useEffect(() => {
    const loadPremiumProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductsService.getAll({
          min_price: PREMIUM_LIMIT
        }, { limit: 20 });

        if (response.success && response.data) {
          const premiumProducts: PremiumProduct[] = response.data
            .map(product => {
              const discount = product.compare_price && product.compare_price > product.price
                ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                : undefined;

              let premiumLevel: 'luxury' | 'premium' | 'high-end';
              if (product.price >= 100000) premiumLevel = 'luxury';
              else if (product.price >= 75000) premiumLevel = 'premium';
              else premiumLevel = 'high-end';

              return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                image: product.images?.[0] || '/images/placeholder-product.jpg',
                price: product.price,
                comparePrice: product.compare_price,
                category: product.category?.name || 'Catégorie',
                vendor: product.vendor?.name || 'Vendeur',
                discount,
                rating: product.average_rating || 0,
                reviews: product.reviews_count || 0,
                premiumLevel
              };
            })
            .sort((a, b) => b.price - a.price) // Trier par prix décroissant
            .slice(0, 8);

          setProducts(premiumProducts);
        }
      } catch (err) {
        setError('Erreur de chargement de la collection premium');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPremiumProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPremiumLevelColor = (level: string) => {
    switch (level) {
      case 'luxury': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
      case 'premium': return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white';
      case 'high-end': return 'bg-gradient-to-r from-gray-700 to-gray-900 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPremiumLevelText = (level: string) => {
    switch (level) {
      case 'luxury': return 'Luxe';
      case 'premium': return 'Premium';
      case 'high-end': return 'Haut de gamme';
      default: return 'Premium';
    }
  };

  const getPremiumLevelIcon = (level: string) => {
    switch (level) {
      case 'luxury': return '👑';
      case 'premium': return '💎';
      case 'high-end': return '⭐';
      default: return '✨';
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-gray-900 to-black">
        <div className="container">
          <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-br from-gray-900 to-black">
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
    <section className="py-12 bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 p-6 rounded-lg" style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)' }}>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Collection Premium
              </h2>
            </div>
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-sm px-4 py-2">
              <Award className="w-4 h-4 mr-2" />
              Excellence
            </Badge>
          </div>
          
          <div className="text-right">
            <p className="text-gray-300 text-sm">
              👑 L'excellence à son apogée
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group hover-lift card-shadow h-full flex flex-col bg-gray-800 border-gray-700 hover:border-yellow-400 transition-all duration-300">
                <div className="relative overflow-hidden">
                  <div className="aspect-square bg-gray-700 relative" style={{ minHeight: '200px' }}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      loading="lazy"
                      quality={90}
                    />
                  </div>

                  {/* Premium Level Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={`${getPremiumLevelColor(product.premiumLevel)} text-xs font-bold px-3 py-1`}>
                      {getPremiumLevelIcon(product.premiumLevel)} {getPremiumLevelText(product.premiumLevel)}
                    </Badge>
                  </div>

                  {/* Premium Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </div>

                  {/* Discount Badge */}
                  {product.discount && (
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-red-600 text-white text-xs font-bold">
                        -{product.discount}%
                      </Badge>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                    <WishlistButton
                      productId={product.id}
                      productName={product.name}
                      price={product.price}
                      productSlug={product.slug}
                      size="sm"
                      variant="icon"
                      className="w-7 h-7 bg-white/90 hover:bg-white shadow-lg"
                    />
                  </div>
                </div>

                <CardContent className="p-4 flex flex-col flex-grow">
                  <div className="space-y-3 flex-grow">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-sm line-clamp-2 hover:text-yellow-400 transition-colors leading-tight text-white">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-600 text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400">({product.reviews})</span>
                    </div>

                    <div className="text-xs text-gray-400">
                      {product.category} • {product.vendor}
                    </div>

                    {/* Premium Level Info */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-xs text-gray-300">
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                        <span>Qualité {product.premiumLevel}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-300">
                        <Crown className="w-3 h-3 text-yellow-400" />
                        <span>Collection exclusive</span>
                      </div>
                    </div>

                    {/* Price - Highlighted */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-yellow-400 text-lg">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>
                      {product.discount && (
                        <div className="text-sm text-green-400 font-medium">
                          Économisez {formatPrice(product.comparePrice! - product.price)}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        💎 Qualité exceptionnelle garantie
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <div className="mt-auto pt-3">
                    <QuickAddToCart
                      productId={product.id}
                      productName={product.name}
                      price={product.price}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Crown className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-400 mb-3">
              Aucun produit premium disponible
            </h3>
            <p className="text-gray-500">
              Notre collection premium sera bientôt disponible !
            </p>
          </div>
        )}

        {/* View All Button */}
        {products.length > 0 && (
          <div className="text-center mt-10">
            <Link href={`/products?price_min=${PREMIUM_LIMIT}&sort=price_desc`}>
              <Button
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-semibold px-8 py-3"
              >
                <Crown className="w-4 h-4 mr-2" />
                Découvrir toute la collection premium
              </Button>
            </Link>
          </div>
        )}

        {/* Premium Features */}
        <div className="mt-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            ✨ Pourquoi choisir notre collection premium ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto">
                <Crown className="w-8 h-8 text-black" />
              </div>
              <h4 className="text-lg font-semibold text-white">Qualité Exceptionnelle</h4>
              <p className="text-gray-400 text-sm">Produits sélectionnés pour leur excellence</p>
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white">Garantie Étendue</h4>
              <p className="text-gray-400 text-sm">Protection renforcée pour votre investissement</p>
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white">Service VIP</h4>
              <p className="text-gray-400 text-sm">Accompagnement personnalisé et prioritaire</p>
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white">Exclusivité</h4>
              <p className="text-gray-400 text-sm">Produits rares et limités</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumCollection;