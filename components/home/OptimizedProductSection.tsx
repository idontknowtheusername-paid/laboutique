'use client';

import React, { useState, useEffect } from 'react';
import ProductGrid from './ProductGrid';
import { ProductsService, Product } from '@/lib/services';
import { ProductSkeleton } from '@/components/ui/loading-skeleton';

interface OptimizedProductSectionProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  maxItems?: number;
  serviceMethod: () => Promise<any>;
  serviceParams?: any[];
}

const OptimizedProductSection: React.FC<OptimizedProductSectionProps> = ({
  title,
  subtitle,
  viewAllLink,
  maxItems = 8,
  serviceMethod,
  serviceParams = []
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await serviceMethod(...serviceParams);
        
        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          throw new Error(response.error || 'Erreur lors du chargement des produits');
        }
      } catch (err) {
        console.error(`Erreur lors du chargement des ${title}:`, err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [serviceMethod, serviceParams, title]);

  if (loading) {
    return <ProductSkeleton count={maxItems} />;
  }

  return (
    <ProductGrid
      title={title}
      subtitle={subtitle}
      products={products}
      viewAllLink={viewAllLink}
      isLoading={loading}
      error={error}
      maxItems={maxItems}
    />
  );
};

export default OptimizedProductSection;