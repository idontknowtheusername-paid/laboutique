'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { ProductsService, Product } from '@/lib/services';
import Link from 'next/link';

export default function ImportedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImportedProducts = async () => {
      try {
        setLoading(true);
        
        // Récupérer les produits importés (avec source_platform)
        const response = await ProductsService.getAll(
          { 
            // Filtrer les produits importés
            status: 'active'
          }, 
          { limit: 20 }
        );

        if (response.success && response.data) {
          // Filtrer les produits qui ont été importés (avec source_platform)
          const importedProducts = response.data.filter(product => 
            product.source_platform === 'aliexpress' || product.source_platform === 'alibaba'
          );
          setProducts(importedProducts);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des produits importés:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadImportedProducts();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, products.length - 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, products.length - 3)) % Math.max(1, products.length - 3));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPlatformBadge = (platform: string) => {
    if (platform === 'aliexpress') {
      return <Badge className="bg-orange-100 text-orange-800">AliExpress</Badge>;
    } else if (platform === 'alibaba') {
      return <Badge className="bg-blue-100 text-blue-800">AliBaba</Badge>;
    }
    return null;
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beshop-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des produits importés...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null; // Ne pas afficher si pas de produits importés
  }

  return (
    <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              🌍 Produits Importés
            </h2>
            <p className="text-gray-600">
              Découvrez nos derniers produits importés depuis AliExpress et AliBaba
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={products.length <= 4}
              className="rounded-full p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={products.length <= 4}
              className="rounded-full p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 25}%)` }}
          >
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-1/4 px-3">
                <Link href={`/product/${product.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                    <CardContent className="p-0">
                      <div className="relative">
                        {product.images && product.images.length > 0 ? (
                          <div className="relative w-full h-48 bg-gray-100">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                            <span className="text-gray-400">Aucune image</span>
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2">
                          {getPlatformBadge(product.source_platform || '')}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-beshop-primary transition-colors">
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex flex-col">
                            <span className="text-xl font-bold text-beshop-primary">
                              {formatPrice(product.price)}
                            </span>
                            {product.original_price && product.original_price > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.original_price)}
                              </span>
                            )}
                          </div>
                          
                          {product.source_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(product.source_url, '_blank');
                              }}
                              className="p-1"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        {product.short_description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {product.short_description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>SKU: {product.sku}</span>
                          {product.category && (
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {product.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {products.length > 4 && (
          <div className="flex justify-center mt-6">
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(products.length / 4) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-beshop-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
