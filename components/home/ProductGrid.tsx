'use client';

import React from 'react';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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

interface ProductGridProps {
  products: Product[];
  columns?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, columns = 4 }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const gridCols = {
    // Force 2 columns by default on mobile, scale up on larger screens
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-6`}>
      {products.map((product) => (
        <Card key={product.id} className="group hover-lift card-shadow h-full">
          <div className="relative overflow-hidden">
            {/* Product Image */}
            <div className="aspect-square bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Badges */}
            <div className="absolute top-2 left-2 space-y-1">
              {product.discount && (
                <Badge className="bg-red-500 text-white">
                  -{product.discount}%
                </Badge>
              )}
              {product.badge && (
                <Badge className={`${product.badgeColor || 'bg-green-500'} text-white`}>
                  {product.badge}
                </Badge>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
              <Button size="icon" variant="secondary" className="w-8 h-8 bg-white/90 hover:bg-white shadow-sm">
                <Heart className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="secondary" className="w-8 h-8 bg-white/90 hover:bg-white shadow-sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            {/* Vendor */}
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {product.vendor}
            </p>

            {/* Product Name */}
            <Link href={`/product/${product.slug}`}>
              <h3 className="font-medium text-sm line-clamp-2 hover:text-beshop-primary transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Rating */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-500">({product.reviews})</span>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-beshop-primary text-lg">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart */}
            <Button className="w-full bg-beshop-primary hover:bg-blue-700 text-sm">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ajouter au panier
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;