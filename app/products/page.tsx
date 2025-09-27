'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/home/ProductGrid';
import { ProductsService, Product } from '@/lib/services/products.service';
import { useSearchParams } from 'next/navigation';

export default function ProductsListingPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(() => {
    const featured = searchParams.get('featured') === 'true';
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    return { featured, category, search } as { featured: boolean; category?: string; search?: string };
  }, [searchParams]);

  const sortParam = searchParams.get('sort');
  const saleOnly = searchParams.get('sale') === 'true';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const builtFilters: any = {};
        if (filters.featured) builtFilters.featured = true;
        if (filters.category) builtFilters.category_slug = filters.category;
        if (filters.search) builtFilters.search = filters.search;

        const sort: any = { field: 'created_at', direction: 'desc' };
        if (sortParam === 'price_asc') sort.field = 'price', sort.direction = 'asc';
        if (sortParam === 'price_desc') sort.field = 'price', sort.direction = 'desc';
        if (sortParam === 'name') sort.field = 'name', sort.direction = 'asc';
        if (sortParam === 'newest') sort.field = 'created_at', sort.direction = 'desc';

        const res = await ProductsService.getAll(builtFilters, { limit: 60 }, sort);
        if (res.success && res.data) {
          const list = saleOnly
            ? (res.data as Product[]).filter(p => p.compare_price && p.compare_price > p.price)
            : (res.data as Product[]);
          setProducts(list);
        } else {
          setProducts([]);
          setError(res.error || 'Erreur lors du chargement des produits');
        }
      } catch (e: any) {
        setError(e?.message || 'Erreur lors du chargement des produits');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters, sortParam, saleOnly]);

  const title = useMemo(() => {
    if (filters.featured) return 'Produits en Vedette';
    if (saleOnly) return 'Offres en Promotion';
    if (filters.category) return 'Produits';
    return 'Tous les Produits';
  }, [filters, saleOnly]);

  return (
    <main className="min-h-screen bg-jomiastore-background">
      <Header />
      <CategoryMenu />
      <div className="container py-6">
        <ProductGrid
          title={title}
          products={products}
          backgroundColor="bg-white"
          isLoading={loading}
          error={error || undefined}
          maxItems={products.length || 8}
        />
      </div>
      <Footer />
    </main>
  );
}

