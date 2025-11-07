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
import InteractiveFeedback from '@/components/ui/InteractiveFeedback';
import { useFeedback } from '@/components/ui/FeedbackProvider';
import { useAnalytics } from '@/hooks/useAnalytics';
import { generateConsistentRating, generateConsistentReviews } from '@/lib/utils/rating';

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
  const { showSuccess, showError } = useFeedback();
  const { trackProductView, trackAddToCart, trackAddToWishlist, trackButtonClick } = useAnalytics();

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

  // Responsive grid columns - uniformisé avec FlashSales
  const getGridCols = () => {
    // Grille adaptative : 4 colonnes sur mobile/tablette, 6 sur desktop
    return 'grid-cols-4 lg:grid-cols-6';
  };

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
        rating: generateConsistentRating(product.id, product.average_rating),
        reviews: generateConsistentReviews(product.id, product.reviews_count),
        discount: discountPercentage,
        category: product.category?.name || 'Catégorie inconnue',
        badge: product.featured ? 'Vedette' : undefined,
        badgeColor: product.featured ? 'bg-yellow-500' : undefined
      };
    });
  }, [displayedProducts]);

  // Masquer la section si pas de produits (après chargement et après tous les hooks)
  if (!isLoading && !error && displayedProducts.length === 0) {
    return null;
  }

  return (
    <section className={`py-6 ${backgroundColor}`}>
      <div className="container">
        {/* Header */}
        {isLoading ? (
          <HeaderSkeleton />
        ) : (
          <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ background: '#FF5722' }}>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
              {subtitle && <p className="text-orange-200 mt-1 text-sm truncate">{subtitle}</p>}
            </div>

            {viewAllLink && (
              <Link 
                href={viewAllLink} 
                className="text-white hover:text-orange-300 text-xs font-medium bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full transition-all"
                onClick={() => trackButtonClick('Voir tout', title)}
              >
                Voir tout
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

        {/* Empty State - Section masquée si pas de produits */}

        {/* Products Grid */}
        {!isLoading && !error && transformedProducts.length > 0 && (
          <div className={`grid ${getGridCols()} gap-2`}>
            {transformedProducts.map((transformedProduct) => (
              <Card key={transformedProduct.id} className="group hover:shadow-lg transition-all duration-300 border border-gray-200 h-full flex flex-col">
                  <Link href={`/product/${transformedProduct.slug}`} className="relative overflow-hidden block">
                  {/* Product Image - Uniformisé */}
                  <div className="aspect-square bg-gray-100 relative rounded">
                      <Image
                        src={transformedProduct.image}
                        alt={transformedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        loading="lazy"
                        quality={85}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder-product.jpg';
                        }}
                      />
                    </div>

                  {/* Badges - Uniformisé */}
                  <div className="absolute top-0.5 left-0.5 space-y-0.5">
                      {transformedProduct.discount && (
                      <Badge className="bg-red-500 text-white font-bold text-[10px] px-1 py-0">
                          -{transformedProduct.discount}%
                        </Badge>
                      )}
                      {transformedProduct.badge && (
                      <Badge className={`${transformedProduct.badgeColor || 'bg-green-500'} text-white text-[10px] px-1 py-0`}>
                          {transformedProduct.badge}
                        </Badge>
                      )}
                      {transformedProduct.status !== 'active' && (
                      <Badge className="bg-gray-500 text-white text-[10px] px-1 py-0">
                          Indisponible
                        </Badge>
                      )}
                    </div>

                    {/* Quick Actions - Optimisé pour mobile avec feedback */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-1 sm:space-y-2 z-10">
                      <InteractiveFeedback
                        action="wishlist"
                        onAction={() => {
                          trackAddToWishlist(transformedProduct.id, transformedProduct.name, transformedProduct.category, transformedProduct.price);
                          showSuccess('Ajouté aux favoris !');
                        }}
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                      >
                        <WishlistButton
                          productId={transformedProduct.id}
                          productName={transformedProduct.name}
                          price={transformedProduct.price}
                          productSlug={transformedProduct.slug}
                          size="sm"
                          variant="icon"
                          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                        />
                      </InteractiveFeedback>
                      
                      <InteractiveFeedback
                        action="view"
                        onAction={() => {
                          trackProductView(transformedProduct.id, transformedProduct.name, transformedProduct.category, transformedProduct.price);
                          showSuccess('Ouverture du produit...');
                        }}
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                      >
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white/90 hover:bg-white shadow-sm"
                          aria-label={`Voir les détails de ${transformedProduct.name}`}
                        >
                          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        </Button>
                      </InteractiveFeedback>
                    </div>
                  </Link>

                <CardContent className="p-1 flex flex-col flex-grow">
                  <div className="space-y-0.5 flex-grow">
                    {/* Product Name - Uniformisé */}
                    <h3 className="font-medium text-[10px] line-clamp-2 hover:text-jomionstore-primary transition-colors leading-tight">
                        {transformedProduct.name}
                      </h3>

                    {/* Rating - Uniformisé */}
                    <div className="flex items-center space-x-0.5">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2 h-2 ${i < Math.floor(transformedProduct.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                                }`}
                            />
                          ))}
                        </div>
                      <span className="text-gray-600 text-[9px]">({transformedProduct.reviews})</span>
                    </div>

                    {/* Price - Uniformisé */}
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-0.5 flex-wrap">
                        <span className="font-bold text-[11px] text-jomionstore-primary">
                            {formatPrice(transformedProduct.price)}
                          </span>
                          {transformedProduct.comparePrice && (
                          <span className="text-[9px] text-gray-500 line-through">
                              {formatPrice(transformedProduct.comparePrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                  {/* Add to Cart - Uniformisé */}
                  <div className="mt-auto">
                      <InteractiveFeedback
                        action="cart"
                        onAction={() => {
                          trackAddToCart(transformedProduct.id, transformedProduct.name, transformedProduct.category, transformedProduct.price);
                        }}
                        disabled={transformedProduct.status !== 'active' || (transformedProduct.track_quantity && transformedProduct.quantity <= 0)}
                        productName={transformedProduct.name}
                        className="w-full"
                      >
                      <Button
                        className="w-full bg-jomionstore-primary hover:bg-orange-700 text-white font-medium py-0.5 text-[10px] h-6"
                          disabled={transformedProduct.status !== 'active' || (transformedProduct.track_quantity && transformedProduct.quantity <= 0)}
                      >
                        {transformedProduct.status !== 'active' || (transformedProduct.track_quantity && transformedProduct.quantity <= 0)
                          ? 'Indisponible'
                          : 'Ajouter'
                        }
                      </Button>
                      </InteractiveFeedback>
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
              className="border-jomionstore-primary text-jomionstore-primary hover:bg-jomionstore-primary hover:text-white text-sm md:text-base"
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
                className="border-jomionstore-primary text-jomionstore-primary hover:bg-jomionstore-primary hover:text-white text-sm md:text-base"
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