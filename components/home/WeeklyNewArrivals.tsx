'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Sparkles } from 'lucide-react';
import { ProductsService, Product } from '@/lib/services';
import ProductGrid from './ProductGrid';

const WeeklyNewArrivals: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeeklyNewArrivals = async () => {
      try {
        setLoading(true);
        const response = await ProductsService.getAll({}, { limit: 50 });

        if (response.success && response.data) {
          const now = new Date();
          const weeklyNewProducts = response.data
            .filter(product => {
              const createdDate = new Date(product.created_at);
              const daysAgo = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
              return daysAgo <= 7; // Produits des 7 derniers jours
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 8);

          setProducts(weeklyNewProducts);
        }
      } catch (err) {
        setError('Erreur de chargement des nouveautés de la semaine');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyNewArrivals();
  }, []);

  return (
    <section className="py-6 bg-white">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Nouveautés de la Semaine
              </h2>
            </div>
            <Badge className="bg-white text-green-600 font-bold">
              <Sparkles className="w-3 h-3 mr-1" />
              Cette semaine
            </Badge>
          </div>
          
          <div className="text-right">
            <p className="text-green-100 text-sm">
              ✨ Découvrez les derniers arrivages
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
          viewAllLink="/products?sort=newest&days=7"
          maxItems={8}
        />
      </div>
    </section>
  );
};

export default WeeklyNewArrivals;