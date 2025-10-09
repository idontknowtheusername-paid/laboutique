'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductsService } from '@/lib/services';

interface Brand {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  category: string;
}

const PopularBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPopularBrands = async () => {
      try {
        setLoading(true);
        
        // Charger les vrais vendeurs depuis les produits
        const response = await ProductsService.getAll({}, { limit: 100 });
        
        if (response.success && response.data) {
          // Grouper par vendeur et compter les produits
          const vendorMap = new Map<string, { count: number; category: string }>();
          
          response.data.forEach(product => {
            if (product.vendor?.name) {
              const vendorName = product.vendor.name;
              const category = product.category?.name || 'Général';
              
              if (vendorMap.has(vendorName)) {
                const existing = vendorMap.get(vendorName)!;
                existing.count++;
              } else {
                vendorMap.set(vendorName, { count: 1, category });
              }
            }
          });

          // Convertir en array et trier par nombre de produits
          const brands: Brand[] = Array.from(vendorMap.entries())
            .map(([name, data], index) => ({
              id: `vendor-${index}`,
              name,
              slug: name.toLowerCase().replace(/\s+/g, '-'),
              productCount: data.count,
              category: data.category
            }))
            .sort((a, b) => b.productCount - a.productCount)
            .slice(0, 8);

          setBrands(brands);
        }
      } catch (err) {
        setError('Erreur de chargement des marques');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPopularBrands();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="container">
          <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="container">
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Award className="w-6 h-6 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Marques Populaires
              </h2>
            </div>
            <Badge className="bg-white text-purple-600 font-bold">
              <TrendingUp className="w-3 h-3 mr-1" />
              Tendances
            </Badge>
          </div>
          
          <div className="text-right">
            <p className="text-purple-100 text-sm">
              🏆 Découvrez les marques les plus appréciées
            </p>
          </div>
        </div>

        {/* Brands Carousel */}
        {brands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {brands.map((brand) => (
              <Link key={brand.id} href={`/vendor/${brand.slug}`}>
                <Card className="group hover-lift card-shadow h-full flex flex-col bg-white hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                    {/* Brand Logo Placeholder */}
                    <div className="relative w-16 h-16 mb-2">
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center overflow-hidden">
                        <span className="text-2xl font-bold text-purple-600">
                          {brand.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Brand Name */}
                    <h3 className="font-semibold text-sm text-gray-900 group-hover:text-purple-600 transition-colors">
                      {brand.name}
                    </h3>

                    {/* Stats */}
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Produits:</span>
                        <span className="font-medium">{brand.productCount}</span>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                      {brand.category}
                    </Badge>

                    {/* View Brand Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs border-purple-200 text-purple-600 hover:bg-purple-50"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Voir les produits
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Aucune marque disponible
            </h3>
            <p className="text-gray-500">
              Les marques seront bientôt disponibles !
            </p>
          </div>
        )}

        {/* View All Brands Button */}
        {brands.length > 0 && (
          <div className="text-center mt-8">
            <Link href="/brands">
              <Button
                variant="outline"
                className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
              >
                Découvrir toutes les marques
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularBrands;