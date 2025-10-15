'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QuickAddToCart from './QuickAddToCart';
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

  return (
    <section className={`py-12 ${backgroundColor}`}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
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
                <Card key={`${product.id}-${index}`} className="group hover:shadow-lg transition-shadow duration-300 snap-start shrink-0 w-[260px] flex flex-col">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <Link href={`/product/${product.slug}`}>
                      <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                          sizes="260px"
                        />
                      </div>
                    </Link>

                    {product.discount && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                        -{product.discount}%
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600">({product.reviews})</span>
                    </div>

                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-medium text-sm line-clamp-2 hover:text-primary">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>

                    <QuickAddToCart
                      productId={product.id}
                      productName={product.name}
                      price={product.price}
                      showQuantitySelector={false}
                    />
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