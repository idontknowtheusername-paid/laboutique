'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Crown, Star, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ProductGrid from './ProductGrid';
import { ProductsService, Product } from '@/lib/services/products.service';

const PersonalizedOffers = () => {
  const [userLevel, setUserLevel] = useState('Gold');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Gold': return 'bg-yellow-500';
      case 'Platinum': return 'bg-purple-500';
      case 'Diamond': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Gold': return <Crown className="w-4 h-4" />;
      case 'Platinum': return <Star className="w-4 h-4" />;
      case 'Diamond': return <Sparkles className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  // Load personalized items from backend
  useEffect(() => {
    const loadPersonalizedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load recently viewed from localStorage
        let recentIds: string[] = [];
        try {
          const raw = localStorage.getItem('recently_viewed_product_ids') || localStorage.getItem('recently_viewed');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) recentIds = parsed.slice(-3).reverse();
          }
        } catch {}

        let recs: Product[] = [];
        if (recentIds.length > 0) {
          // Use getSimilar on the most recent product id
          const similar = await ProductsService.getSimilar(recentIds[0], 8);
          if (similar.success && similar.data) recs = similar.data as Product[];
        }

        if (recs.length === 0) {
          // Fallback: featured then popular
          const featured = await ProductsService.getFeatured(8);
          if (featured.success && featured.data && featured.data.length > 0) {
            recs = featured.data as Product[];
          } else {
            const popular = await ProductsService.getPopular(8);
            if (popular.success && popular.data) recs = popular.data as Product[];
          }
        }

        setProducts(recs);
      } catch (err) {
        console.error('Erreur lors du chargement des produits personnalisés:', err);
        setError('Erreur lors du chargement des recommandations');
      } finally {
        setLoading(false);
      }
    };

    loadPersonalizedProducts();
  }, []);

  return (
    <section className="py-6 bg-white">
      <div className="container">
        {/* Header avec badge de niveau utilisateur */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ background: '#4169E1' }}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Recommandé pour vous
              </h2>
            </div>
            <Badge className={`${getLevelColor(userLevel)} text-white`}>
              {getLevelIcon(userLevel)}
              <span className="ml-1">{userLevel}</span>
            </Badge>
          </div>
        </div>

        {/* Utilisation du ProductGrid standard */}
        <ProductGrid
          title=""
          subtitle=""
          products={products}
          viewAllLink="/personalized"
          isLoading={loading}
          error={error}
          maxItems={8}
        />
      </div>
    </section>
  );
};

export default PersonalizedOffers;

