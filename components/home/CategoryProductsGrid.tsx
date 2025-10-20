'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductsService, CategoriesService } from '@/lib/services';
import ProductGrid from './ProductGrid';

interface CategoryProductsGridProps {
  categorySlug: string;
  title: string;
  subtitle: string;
  maxItems?: number;
  className?: string;
}

export default function CategoryProductsGrid({
  categorySlug,
  title,
  subtitle,
  maxItems = 8,
  className = ''
}: CategoryProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer l'ID de la catégorie par son slug
        const categoryResponse = await CategoriesService.getBySlug(categorySlug);
        
        if (!categoryResponse.success || !categoryResponse.data) {
          setError('Catégorie non trouvée');
          return;
        }
        
        const categoryId = categoryResponse.data.id;
        
        // Récupérer les produits de la catégorie
        const response = await ProductsService.getAll(
          {
            category_id: categoryId,
            status: 'active'
          },
          { limit: maxItems }
        );

        if (response.success && response.data) {
          setProducts((response.data as any).data || []);
        } else {
          setError(response.error || 'Erreur lors du chargement des produits');
        }
      } catch (err) {
        setError('Erreur de connexion');
        console.error('Erreur chargement produits catégorie:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [categorySlug, maxItems]);

  return (
    <div className={className}>
      <ProductGrid
        title={title}
        subtitle={subtitle}
        products={products}
        viewAllLink={`/category/${categorySlug}`}
        maxItems={maxItems}
        isLoading={loading}
        error={error || undefined}
      />
    </div>
  );
}