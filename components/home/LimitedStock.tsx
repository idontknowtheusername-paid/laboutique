'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock } from 'lucide-react';
import { ProductsService, Product } from '@/lib/services';
import ProductGrid from './ProductGrid';

const LimitedStock: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLimitedStockProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductsService.getAll({}, { limit: 30 });

        if (response.success && response.data) {
          const limitedStockProducts = response.data
            .filter(product => product.track_quantity && product.quantity > 0 && product.quantity <= 10)
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 8);

          setProducts(limitedStockProducts);
        }
      } catch (err) {
        setError('Erreur de chargement des produits en stock limité');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLimitedStockProducts();
  }, []);

  return (
    <section className="py-6 bg-white">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' }}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Stock Limité
              </h2>
            </div>
            <Badge className="bg-white text-red-600 font-bold">
              <Clock className="w-3 h-3 mr-1" />
              Dépêchez-vous !
            </Badge>
          </div>
          
          <div className="text-right">
            <p className="text-red-100 text-sm">
              ⚠️ Quantités limitées - Commandez maintenant !
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
          viewAllLink="/products?stock_limited=true"
          maxItems={8}
        />
      </div>
    </section>
  );
};

export default LimitedStock;