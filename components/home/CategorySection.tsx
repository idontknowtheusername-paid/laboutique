'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductsService } from '@/lib/services';
// Import des composants UI nécessaires pour les cartes produits
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Star, Heart, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CategorySectionProps {
  categoryId: string;
  title: string;
  subtitle: string;
  type: 'carousel' | 'grid';
  maxItems: number;
  viewAllLink: string;
  className?: string;
}

// Composant ProductCard simple pour les sections de catégories
const ProductCard = ({ product }: { product: Product }) => {
  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <Link href={`/product/${product.slug}`}>
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <Image
              src={product.images?.[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {discount > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                -{discount}%
              </Badge>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  {product.price.toLocaleString()} XOF
                </span>
                {product.compare_price && product.compare_price > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {product.compare_price.toLocaleString()} XOF
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">
                  {product.average_rating?.toFixed(1) || '0.0'}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};

export default function CategorySection({
  categoryId,
  title,
  subtitle,
  type,
  maxItems,
  viewAllLink,
  className = ''
}: CategorySectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Charger les produits de la catégorie
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await ProductsService.getByCategoryForHomepage(categoryId, maxItems);

        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          setError(response.error || 'Erreur lors du chargement des produits');
        }
      } catch (err) {
        setError('Erreur de connexion');
        console.error('Erreur chargement produits catégorie:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [categoryId, maxItems]);

  // Navigation carousel
  const nextSlide = () => {
    if (type === 'carousel') {
      const maxSlide = Math.ceil(products.length / 4) - 1;
      setCurrentSlide(prev => prev < maxSlide ? prev + 1 : 0);
    }
  };

  const prevSlide = () => {
    if (type === 'carousel') {
      const maxSlide = Math.ceil(products.length / 4) - 1;
      setCurrentSlide(prev => prev > 0 ? prev - 1 : maxSlide);
    }
  };

  // Rendu des produits
  const renderProducts = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: maxItems }).map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-64" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun produit disponible dans cette catégorie</p>
        </div>
      );
    }

    if (type === 'grid') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      );
    }

    // Carousel
    const itemsPerSlide = 4;
    const totalSlides = Math.ceil(products.length / itemsPerSlide);
    const startIndex = currentSlide * itemsPerSlide;
    const endIndex = startIndex + itemsPerSlide;
    const slideProducts = products.slice(startIndex, endIndex);

    return (
      <div className="relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {slideProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {totalSlides > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg hover:bg-gray-50"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg hover:bg-gray-50"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <section className={`container mb-4 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <Link href={viewAllLink}>
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </Link>
        </div>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      
      {renderProducts()}
    </section>
  );
}