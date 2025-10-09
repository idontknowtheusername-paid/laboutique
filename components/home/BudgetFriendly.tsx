'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, Heart, Eye, Star, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductsService, Product } from '@/lib/services';
import { useCart } from '@/contexts/CartContext';
import { WishlistButton } from '@/components/ui/wishlist-button';
import { ErrorState } from '@/components/ui/error-state';
import QuickAddToCart from './QuickAddToCart';

interface BudgetProduct {
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
  priceRange: 'very-low' | 'low' | 'medium';
}

const BudgetFriendly: React.FC = () => {
  const [products, setProducts] = useState<BudgetProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  const BUDGET_LIMIT = 10000; // 10,000 FCFA

  useEffect(() => {
    const loadBudgetFriendlyProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductsService.getAll({
          max_price: BUDGET_LIMIT
        }, { limit: 30 });

        if (response.success && response.data) {
          const budgetProducts: BudgetProduct[] = response.data
            .map(product => {
              const discount = product.compare_price && product.compare_price > product.price
                ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                : undefined;

              let priceRange: 'very-low' | 'low' | 'medium';
              if (product.price <= 3000) priceRange = 'very-low';
              else if (product.price <= 6000) priceRange = 'low';
              else priceRange = 'medium';

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
                priceRange
              };
            })
            .sort((a, b) => a.price - b.price) // Trier par prix croissant
            .slice(0, 8);

          setProducts(budgetProducts);
        }
      } catch (err) {
        setError('Erreur de chargement des produits économiques');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBudgetFriendlyProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPriceRangeColor = (range: string) => {
    switch (range) {
      case 'very-low': return 'bg-green-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      case 'medium': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriceRangeText = (range: string) => {
    switch (range) {
      case 'very-low': return 'Très économique';
      case 'low': return 'Économique';
      case 'medium': return 'Bon rapport qualité-prix';
      default: return 'Économique';
    }
  };

  const getPriceRangeIcon = (range: string) => {
    switch (range) {
      case 'very-low': return '💰';
      case 'low': return '💵';
      case 'medium': return '💸';
      default: return '💳';
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container">
          <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-br from-blue-50 to-cyan-50">
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
    <section className="py-12 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Produits Économiques
              </h2>
            </div>
            <Badge className="bg-white text-blue-600 font-bold">
              <Tag className="w-3 h-3 mr-1" />
              Moins de {formatPrice(BUDGET_LIMIT)}
            </Badge>
          </div>
          
          <div className="text-right">
            <p className="text-blue-100 text-sm">
              💰 Des produits de qualité à petits prix
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

                  {/* Price Range Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className={`${getPriceRangeColor(product.priceRange)} text-xs font-bold`}>
                      {getPriceRangeIcon(product.priceRange)} {getPriceRangeText(product.priceRange)}
                    </Badge>
                  </div>

                  {/* Budget Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-blue-500 text-white text-xs font-bold">
                      <DollarSign className="w-3 h-3 mr-1" />
                      Budget
                    </Badge>
                  </div>

                  {/* Discount Badge */}
                  {product.discount && (
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-green-500 text-white text-xs font-bold">
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
                      <h3 className="font-medium text-sm line-clamp-2 hover:text-blue-600 transition-colors leading-tight">
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

                    {/* Price - Highlighted */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600 text-lg">
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
                      <div className="text-xs text-gray-600">
                        💡 Excellent rapport qualité-prix
                      </div>
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
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Aucun produit économique disponible
            </h3>
            <p className="text-gray-500">
              Aucun produit ne correspond à votre budget pour le moment.
            </p>
          </div>
        )}

        {/* View All Button */}
        {products.length > 0 && (
          <div className="text-center mt-8">
            <Link href={`/products?price_max=${BUDGET_LIMIT}&sort=price_asc`}>
              <Button
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              >
                Voir tous les produits économiques
              </Button>
            </Link>
          </div>
        )}

        {/* Budget Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Conseils pour acheter malin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">💰</span>
              <div>
                <strong>Comparez les prix</strong>
                <p className="text-blue-600">Utilisez nos filtres pour trouver les meilleures offres</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">⭐</span>
              <div>
                <strong>Lisez les avis</strong>
                <p className="text-blue-600">Vérifiez la qualité avant d'acheter</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">🎯</span>
              <div>
                <strong>Profitez des réductions</strong>
                <p className="text-blue-600">Saisissez les offres limitées dans le temps</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BudgetFriendly;