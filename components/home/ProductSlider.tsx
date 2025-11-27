'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { SliderSkeleton, HeaderSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorState } from '@/components/ui/error-state';


interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  comparePrice?: number;
  rating: number;
  reviews: number;
  discount?: number;
  vendor: string;
  category: string;
  badge?: string;
  badgeColor?: string;
}

interface ProductSliderProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  backgroundColor?: string;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

const ProductSlider: React.FC<ProductSliderProps> = ({
  title,
  subtitle,
  products,
  viewAllLink,
  backgroundColor = 'bg-white',
  isLoading = false,
  error,
  onRetry
}) => {
  const { addToCart } = useCart();
  const [isHovering, setIsHovering] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-BJ", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Use products directly - no complex calculation needed
  const displayedProducts = products;

  // Masquer la section si pas de produits
  if (displayedProducts.length === 0) {
    return null;
  }

  return (
    <section className={`py-6 md:py-8 ${backgroundColor}`}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          {subtitle && <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
        </div>

        {/* Products Carousel */}
        <div className="relative">
          <div
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none]"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{ scrollbarWidth: 'none' as any }}
          >
            {displayedProducts.map((product, index) => (
              <Card key={`${product.id}-${index}`} className="group hover:shadow-lg transition-all duration-300 border border-gray-200 snap-start shrink-0 w-[180px] flex flex-col">
                <CardContent className="p-1">
                  <div className="relative mb-1">
                    <Link href={`/product/${product.slug}`}>
                      <div className="aspect-square relative overflow-hidden rounded bg-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="180px"
                          loading="lazy"
                          quality={85}
                        />
                      </div>
                    </Link>

                    {/* Ne pas afficher le badge si la réduction est exactement 23% (imports AliExpress) */}
                    {product.discount && product.discount !== 23 && (
                      <Badge className="absolute top-0.5 left-0.5 bg-red-500 text-white font-bold text-[10px] px-1 py-0">
                        -{product.discount}%
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
                          className={`w-2 h-2 ${
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                      <span className="text-[9px] text-gray-600">({product.reviews})</span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-0.5 flex-wrap">
                        <span className="font-bold text-[11px] text-jomionstore-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-[9px] text-gray-500 line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-jomionstore-primary hover:bg-orange-700 text-white font-medium py-0.5 text-[10px] h-6"
                      onClick={() => addToCart(product.id, product.name, product.price, 1, product.image)}
                    >
                      Ajouter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          {viewAllLink && (
            <Link href={viewAllLink}>
              <Button variant="outline" size="lg">
                Voir tous les produits
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;