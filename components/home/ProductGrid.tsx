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
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  backgroundColor?: string;
  maxItems?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  subtitle,
  products,
  viewAllLink,
  backgroundColor = 'bg-white',
  maxItems = 8
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const displayedProducts = products.slice(0, maxItems);

  return (
    <section className={`py-12 ${backgroundColor}`}>
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            {subtitle && (
              <p className="text-gray-600">{subtitle}</p>
            )}
          </div>
          
          {viewAllLink && (
            <Link href={viewAllLink}>
              <Button variant="outline" className="border-beshop-primary text-beshop-primary hover:bg-beshop-primary hover:text-white">
                Voir tout
              </Button>
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
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
                  Ajouter
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Show More Button if there are more products */}
        {products.length > maxItems && viewAllLink && (
          <div className="text-center mt-8">
            <Link href={viewAllLink}>
              <Button variant="outline" className="border-beshop-primary text-beshop-primary hover:bg-beshop-primary hover:text-white">
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