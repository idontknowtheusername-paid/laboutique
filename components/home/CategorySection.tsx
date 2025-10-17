'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Category } from '@/lib/services';
import { useCart } from '@/contexts/CartContext';
import QuickAddToCart from './QuickAddToCart';

interface CategorySectionProps {
  category: Category;
  products: Product[];
  isLoading?: boolean;
  error?: string;
  maxItems?: number;
  showSubcategories?: boolean;
  layout?: 'grid' | 'carousel' | 'featured';
  className?: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  products,
  isLoading = false,
  error,
  maxItems = 8,
  showSubcategories = false,
  layout = 'grid',
  className = ''
}) => {
  const { addToCart } = useCart();
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (products && products.length > 0) {
      setDisplayedProducts(products.slice(0, maxItems));
    }
  }, [products, maxItems]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  if (isLoading) {
    return (
      <section className={`container mb-8 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: maxItems }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`container mb-8 ${className}`}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h2>
          <p className="text-red-600 mb-4">Erreur de chargement des produits</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={`container mb-8 ${className}`}>
      {/* Header de la section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {category.name}
            </h2>
            {category.icon && (
              <span className="text-2xl">{category.icon}</span>
            )}
            <Badge variant="secondary" className="bg-jomionstore-primary/10 text-jomionstore-primary">
              {products.length} produits
            </Badge>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            {category.description || `Découvrez nos produits ${category.name.toLowerCase()}`}
          </p>
        </div>
        
        <Link href={`/category/${category.slug}`}>
          <Button 
            variant="outline" 
            className="group hover:bg-jomionstore-primary hover:text-white transition-colors"
          >
            Voir tout
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* Produits */}
      {layout === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {displayedProducts.map((product) => {
            const discount = calculateDiscount(product.price, product.compare_price);
            
            return (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                <CardContent className="p-3">
                  <div className="relative mb-3">
                    <Link href={`/product/${product.slug}`}>
                      <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                            loading="lazy"
                            quality={85}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Pas d'image
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Badge de réduction */}
                    {discount > 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold">
                        -{discount}%
                      </Badge>
                    )}

                    {/* Actions rapides */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-8 h-8 bg-white/90 hover:bg-white"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-8 h-8 bg-white/90 hover:bg-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Informations produit */}
                  <div className="space-y-2">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-medium text-sm line-clamp-2 hover:text-jomionstore-primary transition-colors leading-tight">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Note */}
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.average_rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        ({product.reviews_count || 0})
                      </span>
                    </div>

                    {/* Prix */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-jomionstore-primary text-sm">
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price && product.compare_price > product.price && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(product.compare_price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bouton d'ajout au panier */}
                    <div className="pt-2">
                      <QuickAddToCart
                        productId={product.id}
                        productName={product.name}
                        price={product.price}
                        showQuantitySelector={false}
                        className="w-full text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Layout carousel pour les catégories importantes */}
      {layout === 'carousel' && (
        <div className="relative">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {displayedProducts.map((product) => {
              const discount = calculateDiscount(product.price, product.compare_price);
              
              return (
                <div key={product.id} className="flex-shrink-0 w-48">
                  <Card className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="relative mb-3">
                        <Link href={`/product/${product.slug}`}>
                          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="200px"
                                loading="lazy"
                                quality={85}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                Pas d'image
                              </div>
                            )}
                          </div>
                        </Link>

                        {discount > 0 && (
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                            -{discount}%
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Link href={`/product/${product.slug}`}>
                          <h3 className="font-medium text-sm line-clamp-2 hover:text-jomionstore-primary transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="flex items-center space-x-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(product.average_rating || 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            ({product.reviews_count || 0})
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-jomionstore-primary text-sm">
                              {formatPrice(product.price)}
                            </span>
                            {product.compare_price && product.compare_price > product.price && (
                              <span className="text-xs text-gray-500 line-through">
                                {formatPrice(product.compare_price)}
                              </span>
                            )}
                          </div>
                        </div>

                        <QuickAddToCart
                          productId={product.id}
                          productName={product.name}
                          price={product.price}
                          showQuantitySelector={false}
                          className="w-full text-xs"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default CategorySection;