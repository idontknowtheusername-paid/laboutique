'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Tag } from 'lucide-react';
import { ProductsService, Product } from '@/lib/services';
import ProductGrid from './ProductGrid';

const BudgetFriendly: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BUDGET_LIMIT = 10000; // 10,000 FCFA

  useEffect(() => {
    const loadBudgetFriendlyProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductsService.getAll({
          max_price: BUDGET_LIMIT
        }, { limit: 30 });

        if (response.success && response.data) {
          const budgetProducts = response.data
            .sort((a, b) => a.price - b.price)
            .slice(0, 8);

          setProducts(budgetProducts);
        }
      } catch (err) {
        setError('Erreur de chargement des produits économiques');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBudgetFriendlyProducts();
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
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Produits Économiques
              </h2>
            </div>
            <Badge className="bg-white text-blue-600 font-bold">
              <Tag className="w-3 h-3 mr-1" />
              Moins de {formatPrice(BUDGET_LIMIT)}
            </Badge>
          </div>
          
          <div className="text-right">
            <p className="text-blue-100 text-sm">
              💰 Des produits de qualité à petits prix
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
          viewAllLink={`/products?price_max=${BUDGET_LIMIT}&sort=price_asc`}
          maxItems={8}
        />
      </div>
    </section>
  );
};

export default BudgetFriendly;