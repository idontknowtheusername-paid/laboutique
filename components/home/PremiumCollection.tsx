'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Award } from 'lucide-react';
import { ProductsService, Product } from '@/lib/services';
import ProductGrid from './ProductGrid';

const PremiumCollection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const PREMIUM_LIMIT = 50000; // 50,000 FCFA

  useEffect(() => {
    const loadPremiumProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductsService.getAll({
          min_price: PREMIUM_LIMIT
        }, { limit: 20 });

        if (response.success && response.data) {
          const premiumProducts = response.data
            .sort((a, b) => b.price - a.price)
            .slice(0, 8);

          setProducts(premiumProducts);
        }
      } catch (err) {
        setError('Erreur de chargement de la collection premium');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPremiumProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-6 bg-white">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)' }}>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Collection Premium
              </h2>
            </div>
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-sm px-4 py-2">
              <Award className="w-4 h-4 mr-2" />
              Excellence
            </Badge>
          </div>
          
          <div className="text-right">
            <p className="text-gray-300 text-sm">
              👑 L'excellence à son apogée
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
          viewAllLink={`/products?price_min=${PREMIUM_LIMIT}&sort=price_desc`}
          maxItems={8}
        />
      </div>
    </section>
  );
};

export default PremiumCollection;