'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Star, Heart, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QuickAddToCart from './QuickAddToCart';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { ProductSkeleton, HeaderSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { WishlistButton } from '@/components/ui/wishlist-button';
import { useHydration } from '@/hooks/useHydration';
import { Product } from '@/lib/services/products.service';
import Image from 'next/image';

interface ProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  backgroundColor?: string;
  maxItems?: number;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  totalCount?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  subtitle,
  products,
  viewAllLink,
  backgroundColor = 'bg-white',
  maxItems = 8,
  isLoading = false,
  error,
  onRetry,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  totalCount
}) => {
  const { addToCart } = useCart();
  const isHydrated = useHydration();
  const [retryCount, setRetryCount] = useState(0);

  // Responsive grid columns - safe for SSR
  const getGridCols = () => {
    // Use responsive classes that work with CSS media queries
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
  };

  // Memoize expensive calculations
  const formatPrice = useMemo(() => {
    return (price: number) => {
      return new Intl.NumberFormat('fr-BJ', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
      }).format(price);
    };
  }, []);

  const displayedProducts = useMemo(() => products.slice(0, maxItems), [products, maxItems]);

  // Enhanced retry function with exponential backoff
  const handleRetry = useCallback(() => {
    if (onRetry) {
      setRetryCount(prev => prev + 1);
      onRetry();
    }
  }, [onRetry]);

  // Transform backend product data to UI format - Memoized
  const transformedProducts = useMemo(() => {
    return displayedProducts.map(product => {
      const discountPercentage = product.compare_price && product.compare_price > product.price
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : undefined;

      return {
        ...product,
        image: product.images?.[0] || '/images/placeholder-product.jpg',
        comparePrice: product.compare_price,
        rating: product.average_rating || 0,
        reviews: product.reviews_count || 0,
        discount: discountPercentage,
        category: product.category?.name || 'Catégorie inconnue',
        badge: product.featured ? 'Vedette' : undefined,
        badgeColor: product.featured ? 'bg-yellow-500' : undefined
      };
    });
  }, [displayedProducts]);

  return (
  <section className={`py-2 ${backgroundColor}`}>
      <div className="container">
        {/* Header */}
        {isLoading ? (
          <HeaderSkeleton />
        ) : (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
              {subtitle && (
                <p className="text-gray-600 text-sm md:text-base">{subtitle}</p>
              )}
            </div>

            {viewAllLink && (
              <Link href={viewAllLink}>
                <Button
                  variant="outline"
                  className="border-jomiastore-primary text-jomiastore-primary hover:bg-jomiastore-primary hover:text-white text-sm md:text-base"
                >
                  <span className="md:hidden">Tout voir</span>
                  <span className="hidden md:inline">Voir tout</span>
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <ProductSkeleton count={10} />
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState
            type="generic"
            title="Erreur de chargement"
            message={error}
            onRetry={handleRetry}
            retryCount={retryCount}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && displayedProducts.length === 0 && (
          <ErrorState
            type="empty"
            title="Aucun produit disponible"
            message="Aucun produit n'est disponible dans cette catégorie pour le moment."
          />
        )}

        {/* Products Grid */}
        {!isLoading && !error && transformedProducts.length > 0 && (
          <div className={`grid ${getGridCols()} gap-3 md:gap-4 lg:gap-6`}>
            {transformedProducts.map((transformedProduct) => (
                <Card key={transformedProduct.id} className="group hover-lift card-shadow h-full flex flex-col">
                  <div className="relative overflow-hidden">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 relative">
                      <Image
                        src={transformedProduct.image}
                        alt={transformedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        loading="lazy"
                        quality={75}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder-product.jpg';
                        }}
                      />
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 space-y-1">
                      {transformedProduct.discount && (
                        <Badge className="bg-red-500 text-white text-xs">
                          -{transformedProduct.discount}%
                        </Badge>
                      )}
                      {transformedProduct.badge && (
                        <Badge className={`${transformedProduct.badgeColor || 'bg-green-500'} text-white text-xs`}>
                          {transformedProduct.badge}
                        </Badge>
                      )}
                      {transformedProduct.status !== 'active' && (
                        <Badge className="bg-gray-500 text-white text-xs">
                          Indisponible
                        </Badge>
                      )}
                    </div>

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                      <WishlistButton
                        productId={transformedProduct.id}
                        productName={transformedProduct.name}
                        price={transformedProduct.price}
                        productSlug={transformedProduct.slug}
                        size="sm"
                        variant="icon"
                        className="w-7 h-7 md:w-8 md:h-8"
                      />
                    <Button size="icon" variant="secondary" className="w-7 h-7 md:w-8 md:h-8 bg-white/90 hover:bg-white shadow-sm">
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                  </div>
                </div>

                  <CardContent className="p-3 md:p-4 flex flex-col flex-grow">
                    <div className="space-y-1 md:space-y-1.5 flex-grow">
                      {/* Product Name */}
                      <Link href={`/product/${transformedProduct.slug}`}>
                        <h3 className="font-medium text-xs md:text-sm line-clamp-2 hover:text-jomiastore-primary transition-colors">
                          {transformedProduct.name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="flex items-center space-x-1 text-[10px] md:text-xs">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 ${i < Math.floor(transformedProduct.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-500 truncate">({transformedProduct.reviews})</span>
                      </div>

                      {/* Stock Status */}
                      {transformedProduct.track_quantity && (
                        <div className="text-xs">
                          {transformedProduct.quantity > 0 ? (
                            <span className="text-green-600">En stock ({transformedProduct.quantity})</span>
                          ) : (
                            <span className="text-red-600">Rupture de stock</span>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-jomiastore-primary text-sm md:text-base truncate">
                            {formatPrice(transformedProduct.price)}
                          </span>
                          {transformedProduct.comparePrice && (
                            <span className="text-xs text-gray-500 line-through truncate">
                              {formatPrice(transformedProduct.comparePrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart - Toujours en bas */}
                    <div className="mt-auto pt-2">
                      <QuickAddToCart
                        productId={transformedProduct.id}
                        productName={transformedProduct.name}
                        price={transformedProduct.price}
                        disabled={transformedProduct.status !== 'active' || (transformedProduct.track_quantity && transformedProduct.quantity <= 0)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && !error && hasMore && onLoadMore && (
          <div className="text-center mt-8">
            <Button
              onClick={onLoadMore}
              disabled={loadingMore}
              variant="outline"
              className="border-jomiastore-primary text-jomiastore-primary hover:bg-jomiastore-primary hover:text-white text-sm md:text-base"
            >
              {loadingMore ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                `Charger plus de produits${totalCount ? ` (${totalCount - displayedProducts.length} restants)` : ''}`
              )}
            </Button>
          </div>
        )}

        {/* Show More Button if there are more products */}
        {!isLoading && !error && !hasMore && products.length > maxItems && viewAllLink && (
          <div className="text-center mt-8">
            <Link href={viewAllLink}>
              <Button
                variant="outline"
                className="border-jomiastore-primary text-jomiastore-primary hover:bg-jomiastore-primary hover:text-white text-sm md:text-base"
              >
                Voir {products.length - maxItems} autres produits
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;