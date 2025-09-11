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
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 md:gap-6">
          {displayedProducts.map((product) => (
            <Card key={product.id} className="group hover-lift card-shadow h-full flex flex-col">
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
                    <Badge className="bg-red-500 text-white text-xs">
                      -{product.discount}%
                    </Badge>
                  )}
                  {product.badge && (
                    <Badge className={`${product.badgeColor || 'bg-green-500'} text-white text-xs`}>
                      {product.badge}
                    </Badge>
                  )}
                </div>
                
                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                  <Button size="icon" variant="secondary" className="w-7 h-7 md:w-8 md:h-8 bg-white/90 hover:bg-white shadow-sm">
                    <Heart className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="w-7 h-7 md:w-8 md:h-8 bg-white/90 hover:bg-white shadow-sm">
                    <Eye className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-2 md:p-4 flex flex-col flex-grow">
                <div className="space-y-1.5 md:space-y-2 flex-grow">
                  {/* Vendor */}
                  <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                    {product.vendor}
                  </p>

                  {/* Product Name */}
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium text-xs md:text-sm line-clamp-2 hover:text-beshop-primary transition-colors min-h-[2.5rem] md:min-h-[3rem]">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 text-xs">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-2.5 h-2.5 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-500 text-xs truncate">({product.reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-1 lg:space-x-2">
                      <span className="font-bold text-beshop-primary text-xs md:text-sm lg:text-lg truncate">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-xs text-gray-500 line-through truncate">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add to Cart - Toujours en bas */}
                <div className="mt-auto pt-2">
                  <Button className="w-full bg-beshop-primary hover:bg-blue-700 text-xs md:text-sm py-2 h-8 md:h-10">
                    <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Ajouter
                  </Button>
                </div>
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