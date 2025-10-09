'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap } from 'lucide-react';
import { ProductsService, Product } from '@/lib/services';
import ProductGrid from './ProductGrid';

const DailyDeals: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 heures en secondes

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 24 * 60 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load daily deals
  useEffect(() => {
    const loadDailyDeals = async () => {
      try {
        setLoading(true);
        const response = await ProductsService.getAll({
          featured: true
        }, { limit: 20 });

        if (response.success && response.data) {
          const dailyDeals = response.data
            .filter(product => {
              const discount = product.compare_price && product.compare_price > product.price
                ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                : 0;
              return discount >= 20; // Au moins 20% de réduction
            })
            .slice(0, 8);

          setProducts(dailyDeals);
        }
      } catch (err) {
        setError('Erreur de chargement des offres du jour');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDailyDeals();
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="py-6 bg-white">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)' }}>
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Offres du Jour
              </h2>
            </div>
            <Badge className="bg-white text-orange-600 font-bold">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-orange-100 text-sm">
              ⏰ Offres limitées - Ne ratez pas ces bonnes affaires !
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
          viewAllLink="/products?discount_min=20&sort=discount"
          maxItems={8}
        />
      </div>
    </section>
  );
};

export default DailyDeals;