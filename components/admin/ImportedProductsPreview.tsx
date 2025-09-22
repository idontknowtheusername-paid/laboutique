'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ExternalLink, Eye } from 'lucide-react';
import Image from 'next/image';
import { ProductsService, Product } from '@/lib/services';
import Link from 'next/link';

export default function ImportedProductsPreview() {
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
      <div className="py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beshop-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des produits importés...</p>
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit importé</h3>
          <p className="text-gray-600 mb-4">Commencez par importer des produits depuis AliExpress ou AliBaba</p>
          <Button
            onClick={() => window.location.href = '/admin/products/import'}
            className="bg-beshop-primary hover:bg-blue-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            Importer un produit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            🌍 Produits Importés
          </h3>
          <p className="text-gray-600 text-sm">
            Aperçu des {products.length} produits importés récemment
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
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                <CardContent className="p-0">
                  <div className="relative">
                    {product.images && product.images.length > 0 ? (
                      <div className="relative w-full h-40 bg-gray-100">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Aucune image</span>
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2">
                      {getPlatformBadge(product.source_platform || '')}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                      {product.name}
                    </h4>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-beshop-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        {product.source_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(product.source_url, '_blank');
                            }}
                            className="p-1 h-8 w-8"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-8 w-8"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>SKU: {product.sku}</span>
                      <Badge variant="outline" className="text-xs">
                        {product.status}
                      </Badge>
                    </div>
                    
                    {product.category && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {product.category.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {products.length > 4 && (
        <div className="flex justify-center mt-4">
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
  );
}
