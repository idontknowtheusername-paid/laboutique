'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp } from 'lucide-react';
import { ProductsService, Product } from '@/lib/services';
import ProductGrid from './ProductGrid';

const PopularBrands: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPopularBrands = async () => {
      try {
        setLoading(true);
        const response = await ProductsService.getAll({}, { limit: 50 });
        
        if (response.success && response.data) {
          // Grouper par vendeur et prendre le premier produit de chaque vendeur
          const vendorMap = new Map<string, Product>();
          
          response.data.forEach(product => {
            if (product.vendor?.name && !vendorMap.has(product.vendor.name)) {
              vendorMap.set(product.vendor.name, product);
            }
          });

          // Convertir en array et limiter à 8
          const brandProducts = Array.from(vendorMap.values()).slice(0, 8);
          setProducts(brandProducts);
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

  return (
    <section className="py-6 bg-white">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
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

        {/* Products using ProductGrid format */}
        <ProductGrid
          title=""
          subtitle=""
          products={products}
          isLoading={loading}
          error={error || undefined}
          viewAllLink="/brands"
          maxItems={8}
        />
      </div>
    </section>
  );
};

export default PopularBrands;