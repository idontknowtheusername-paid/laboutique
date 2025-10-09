'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  productCount: number;
  rating: number;
  isVerified: boolean;
  category: string;
  discount: number;
}

const PopularBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPopularBrands = async () => {
      try {
        setLoading(true);
        
        // Simuler des données de marques populaires
        const mockBrands: Brand[] = [
          {
            id: '1',
            name: 'Samsung',
            slug: 'samsung',
            logo: '/images/brands/samsung.png',
            description: 'Électronique et smartphones',
            productCount: 1250,
            rating: 4.8,
            isVerified: true,
            category: 'Électronique',
            discount: 15
          },
          {
            id: '2',
            name: 'Nike',
            slug: 'nike',
            logo: '/images/brands/nike.png',
            description: 'Sport et mode',
            productCount: 890,
            rating: 4.7,
            isVerified: true,
            category: 'Sport',
            discount: 20
          },
          {
            id: '3',
            name: 'Apple',
            slug: 'apple',
            logo: '/images/brands/apple.png',
            description: 'Technologie premium',
            productCount: 450,
            rating: 4.9,
            isVerified: true,
            category: 'Électronique',
            discount: 10
          },
          {
            id: '4',
            name: 'Adidas',
            slug: 'adidas',
            logo: '/images/brands/adidas.png',
            description: 'Sport et lifestyle',
            productCount: 750,
            rating: 4.6,
            isVerified: true,
            category: 'Sport',
            discount: 25
          },
          {
            id: '5',
            name: 'Sony',
            slug: 'sony',
            logo: '/images/brands/sony.png',
            description: 'Audio et vidéo',
            productCount: 680,
            rating: 4.5,
            isVerified: true,
            category: 'Électronique',
            discount: 18
          },
          {
            id: '6',
            name: 'LG',
            slug: 'lg',
            logo: '/images/brands/lg.png',
            description: 'Électroménager',
            productCount: 920,
            rating: 4.4,
            isVerified: true,
            category: 'Maison',
            discount: 22
          },
          {
            id: '7',
            name: 'HP',
            slug: 'hp',
            logo: '/images/brands/hp.png',
            description: 'Informatique',
            productCount: 540,
            rating: 4.3,
            isVerified: true,
            category: 'Informatique',
            discount: 12
          },
          {
            id: '8',
            name: 'Canon',
            slug: 'canon',
            logo: '/images/brands/canon.png',
            description: 'Photographie',
            productCount: 320,
            rating: 4.7,
            isVerified: true,
            category: 'Photo',
            discount: 30
          }
        ];

        setBrands(mockBrands);
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
              <Link key={brand.id} href={`/brands/${brand.slug}`}>
                <Card className="group hover-lift card-shadow h-full flex flex-col bg-white hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                    {/* Brand Logo */}
                    <div className="relative w-16 h-16 mb-2">
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          width={64}
                          height={64}
                          className="object-contain group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder-brand.png';
                          }}
                        />
                      </div>
                      
                      {/* Verified Badge */}
                      {brand.isVerified && (
                        <div className="absolute -top-1 -right-1">
                          <Badge className="bg-green-500 text-white text-xs p-1">
                            ✓
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Brand Name */}
                    <h3 className="font-semibold text-sm text-gray-900 group-hover:text-purple-600 transition-colors">
                      {brand.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {brand.description}
                    </p>

                    {/* Stats */}
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Produits:</span>
                        <span className="font-medium">{brand.productCount}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Note:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{brand.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Réduction:</span>
                        <span className="font-medium text-green-600">-{brand.discount}%</span>
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
                      Voir la marque
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