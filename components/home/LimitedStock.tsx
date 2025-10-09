'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, ShoppingCart, Heart, Eye, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductsService, Product } from '@/lib/services';
import { useCart } from '@/contexts/CartContext';
import { WishlistButton } from '@/components/ui/wishlist-button';
import { ErrorState } from '@/components/ui/error-state';
import QuickAddToCart from './QuickAddToCart';

interface LimitedStockProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  comparePrice?: number;
  stockLeft: number;
  totalStock: number;
  category: string;
  vendor: string;
  discount?: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

const LimitedStock: React.FC = () => {
  const [products, setProducts] = useState<LimitedStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadLimitedStockProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductsService.getAll({}, { limit: 30 });

        if (response.success && response.data) {
          const limitedStockProducts: LimitedStockProduct[] = response.data
            .filter(product => product.track_quantity && product.quantity > 0 && product.quantity <= 10)
            .map(product => {
              const discount = product.compare_price && product.compare_price > product.price
                ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                : undefined;

              const stockLeft = product.quantity;
              const totalStock = Math.floor(Math.random() * 50) + stockLeft; // Simuler le stock total
              
              let urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
              if (stockLeft <= 2) urgencyLevel = 'critical';
              else if (stockLeft <= 4) urgencyLevel = 'high';
              else if (stockLeft <= 7) urgencyLevel = 'medium';
              else urgencyLevel = 'low';

              return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                image: product.images?.[0] || '/images/placeholder-product.jpg',
                price: product.price,
                comparePrice: product.compare_price,
                stockLeft,
                totalStock,
                category: product.category?.name || 'Catégorie',
                vendor: product.vendor?.name || 'Vendeur',
                discount,
                urgencyLevel
              };
            })
            .sort((a, b) => a.stockLeft - b.stockLeft) // Trier par stock le plus faible
            .slice(0, 8);

          setProducts(limitedStockProducts);
        }
      } catch (err) {
        setError('Erreur de chargement des produits en stock limité');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLimitedStockProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getUrgencyText = (level: string) => {
    switch (level) {
      case 'critical': return 'Stock critique !';
      case 'high': return 'Stock très limité';
      case 'medium': return 'Stock limité';
      case 'low': return 'Stock réduit';
      default: return 'Stock limité';
    }
  };

  const getStockBarColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="container">
          <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
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
    <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' }}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Stock Limité
              </h2>
            </div>
            <Badge className="bg-white text-red-600 font-bold">
              <Clock className="w-3 h-3 mr-1" />
              Dépêchez-vous !
            </Badge>
          </div>
          
          <div className="text-right">
            <p className="text-red-100 text-sm">
              ⚠️ Quantités limitées - Commandez maintenant !
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

                  {/* Urgency Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className={`${getUrgencyColor(product.urgencyLevel)} text-xs font-bold`}>
                      {getUrgencyText(product.urgencyLevel)}
                    </Badge>
                  </div>

                  {/* Stock Left Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-red-600 text-white text-xs font-bold">
                      {product.stockLeft} restants
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
                      <h3 className="font-medium text-sm line-clamp-2 hover:text-red-600 transition-colors leading-tight">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="text-xs text-gray-500">
                      {product.category} • {product.vendor}
                    </div>

                    {/* Stock Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Stock disponible</span>
                        <span className="font-medium">{product.stockLeft}/{product.totalStock}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getStockBarColor(product.urgencyLevel)}`}
                          style={{ width: `${(product.stockLeft / product.totalStock) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-600 text-sm">
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
                      disabled={product.stockLeft <= 0}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Aucun produit en stock limité
            </h3>
            <p className="text-gray-500">
              Tous nos produits sont bien approvisionnés !
            </p>
          </div>
        )}

        {/* View All Button */}
        {products.length > 0 && (
          <div className="text-center mt-8">
            <Link href="/products?stock_limited=true">
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                Voir tous les produits en stock limité
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default LimitedStock;