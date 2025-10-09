'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown } from 'lucide-react';
import { ProductsService, Product } from '@/lib/services';
import ProductGrid from './ProductGrid';

const BestSellers: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBestSellers = async () => {
      try {
        setLoading(true);
        const response = await ProductsService.getAll({
          featured: true
        }, { limit: 20 });

        if (response.success && response.data) {
          const bestSellers = response.data
            .filter(product => (product.reviews_count || 0) > 0)
            .sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0))
            .slice(0, 8);

          setProducts(bestSellers);
        }
      } catch (err) {
        setError('Erreur de chargement des meilleures ventes');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBestSellers();
  }, []);

  return (
    <section className="py-6 bg-white">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Top Ventes
              </h2>
            </div>
            <Badge className="bg-white text-yellow-600 font-bold">
              <Crown className="w-3 h-3 mr-1" />
              Meilleurs vendeurs
            </Badge>
          </div>
          
          <div className="text-right">
            <p className="text-yellow-100 text-sm">
              🏆 Les produits les plus vendus cette semaine
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
          viewAllLink="/products?sort=popular"
          maxItems={8}
        />
      </div>
    </section>
  );
};

export default BestSellers;