'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/home/ProductGrid';
import { ProductsService, Product } from '@/lib/services/products.service';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ProductsListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSiteCount, setTotalSiteCount] = useState<number>(0);
  const [localSearch, setLocalSearch] = useState<string>(searchParams.get('search') || '');

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

  // Charger le nombre total de produits actifs (site entier)
  useEffect(() => {
    const loadTotal = async () => {
      try {
        const res = await ProductsService.getAll({}, { limit: 1 }, { field: 'created_at', direction: 'desc' });
        if (res.success) {
          setTotalSiteCount(res.pagination.total);
        }
      } catch (_) {
        // ignorer silencieusement
      }
    };
    loadTotal();
  }, []);

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (localSearch.trim()) {
      params.set('search', localSearch.trim());
    } else {
      params.delete('search');
    }
    router.push(`/products?${params.toString()}`);
  };

  const title = useMemo(() => {
    if (filters.featured) return 'Produits en Vedette';
    if (saleOnly) return 'Offres en Promotion';
    if (filters.category) return 'Produits';
    return 'Tous les Produits';
  }, [filters, saleOnly]);

  return (
    <main className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />
      <div className="container py-6">
        {/* Barre de recherche locale + compteur total */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-4">
          <form onSubmit={onSubmitSearch} className="flex-1">
            <div className="relative">
              <Input
                placeholder="Rechercher des produits..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pr-28 h-11"
              />
              <Button type="submit" className="absolute right-1 top-1 h-9">Rechercher</Button>
            </div>
          </form>
          <div className="flex items-center md:justify-end">
            <Badge className="text-sm">{totalSiteCount.toLocaleString('fr-FR')} produits</Badge>
          </div>
        </div>
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

