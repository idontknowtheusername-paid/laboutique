'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import ImprovedCategoryMenu from '@/components/layout/ImprovedCategoryMenu';
import Footer from '@/components/layout/Footer';
import { ProductsService, CategoriesService, Product, Category } from '@/lib/services';
import { ProductSkeleton } from '@/components/ui/loading-skeleton';
import LazySection from '@/components/ui/LazySection';
import DynamicMeta from '@/components/seo/DynamicMeta';
import ProductSectionMeta from '@/components/seo/ProductSectionMeta';
import { useAnalytics } from '@/hooks/useAnalytics';
import OptimizedProductSection from './OptimizedProductSection';

// Optimized lazy loading components with better loading states and code splitting
const HeroCarousel = dynamic(() => import('@/components/home/HeroCarousel'), {
  loading: () => <div className="h-[250px] lg:h-[300px] bg-gray-100 animate-pulse rounded-xl" />,
  ssr: true // Critical above-the-fold content
});

const FlashSalesConnected = dynamic(() => import('@/components/home/FlashSalesConnected'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const ProductGrid = dynamic(() => import('@/components/home/ProductGrid'), {
  loading: () => <ProductSkeleton />,
  ssr: false
});

const PersonalizedOffers = dynamic(() => import('@/components/home/PersonalizedOffers'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const TrendingProducts = dynamic(() => import('@/components/home/TrendingProducts'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const TrustElements = dynamic(() => import('@/components/home/TrustElements'), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

export default function HomePageContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackPageView, trackSearch } = useAnalytics();

  // Track page view
  useEffect(() => {
    trackPageView({
      page: '/',
      title: 'JomionStore - Centre commercial digital du Bénin',
      timestamp: Date.now(),
      loadTime: performance.now()
    });
  }, [trackPageView]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load categories only (products will be loaded per section)
        const categoriesRes = await CategoriesService.getAll();

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
      } catch (err) {
        setError('Erreur de chargement des données');
        console.error('Erreur lors du chargement:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Helper functions

  // Produits par catégorie dynamique
  const getCategoryProducts = (categorySlug: string) => {
    return products.filter(p => (p.category as any)?.slug === categorySlug).slice(0, 100);
  };

  // Catégories dynamiques (prendre les 4 premières catégories principales avec des produits)
  const mainCategories = categories
    .filter(cat => cat.slug !== 'maison-jardin' && cat.slug !== 'sport-loisirs') // Éviter les doublons
    .map(category => ({
      ...category,
      products: getCategoryProducts(category.slug)
    }))
    .filter(category => category.products.length > 0) // Seulement les catégories avec des produits
    .slice(0, 4); // Limiter à 4 sections dynamiques

  // Sections hardcodées existantes
  const homeProducts = getCategoryProducts('maison-jardin');
  const sportsProducts = getCategoryProducts('sport-loisirs');

  return (
    <>
      {/* Meta tags dynamiques */}
      <DynamicMeta
        title="JomionStore - Centre commercial digital du Bénin"
        description="Découvrez des milliers de produits authentiques sur JomionStore. Électronique, mode, maison, sport et bien plus. Livraison rapide et service client exceptionnel."
        keywords="e-commerce, Bénin, produits, électronique, mode, maison, sport, livraison, achat en ligne, JomionStore"
        section="Accueil"
      />
      
      <main className="min-h-screen bg-jomionstore-background">
        <Header />
        <ImprovedCategoryMenu />

        <div className="pt-2">
          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<div className="h-[250px] lg:h-[300px] bg-gray-100 animate-pulse rounded-xl" />}>
              <HeroCarousel />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
              <FlashSalesConnected />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <OptimizedProductSection
                title="Offres du Jour"
                subtitle="Offres limitées - Ne ratez pas ces bonnes affaires !"
                viewAllLink="/products?discount_min=20&sort=discount"
                maxItems={8}
                serviceMethod={ProductsService.getDailyDeals}
                serviceParams={[8]}
              />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <OptimizedProductSection
                title="Nouveautés"
                subtitle="Découvrez nos derniers produits"
                viewAllLink="/products?sort=newest"
                serviceMethod={ProductsService.getFeatured}
                serviceParams={[20]}
              />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <OptimizedProductSection
                title="Top Ventes"
                subtitle="Les produits les plus vendus cette semaine"
                viewAllLink="/products?sort=popular"
                maxItems={8}
                serviceMethod={ProductsService.getBestSellers}
                serviceParams={[8]}
              />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
              <TrendingProducts />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <OptimizedProductSection
                title="Marques Populaires"
                subtitle="Découvrez les marques les plus appréciées"
                viewAllLink="/brands"
                maxItems={8}
                serviceMethod={ProductsService.getByVendor}
                serviceParams={[8]}
              />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <OptimizedProductSection
                title="Produits que vous aimeriez"
                subtitle="Sélectionnés spécialement pour vous"
                viewAllLink="/products?featured=true"
                serviceMethod={ProductsService.getFeatured}
                serviceParams={[100]}
              />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
              <PersonalizedOffers />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <OptimizedProductSection
                title="Stock Limité"
                subtitle="Quantités limitées - Commandez maintenant !"
                viewAllLink="/products?stock_limited=true"
                maxItems={8}
                serviceMethod={ProductsService.getLimitedStock}
                serviceParams={[8]}
              />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <OptimizedProductSection
                title="Nouveautés de la Semaine"
                subtitle="Découvrez les derniers arrivages"
                viewAllLink="/products?sort=newest&days=7"
                maxItems={8}
                serviceMethod={ProductsService.getWeeklyNew}
                serviceParams={[8]}
              />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <ProductGrid
                title="Maison & Jardin"
                subtitle="Tout pour votre intérieur et extérieur"
                products={homeProducts}
                isLoading={loading}
                error={error || undefined}
                viewAllLink="/category/maison-jardin"
              />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <ProductGrid
                title="Sport & Loisirs"
                subtitle="Équipements et accessoires pour vos activités"
                products={sportsProducts}
                isLoading={loading}
                error={error || undefined}
                viewAllLink="/category/sport-loisirs"
              />
            </LazySection>
          </section>

          {/* Sections dynamiques par catégorie */}
          {mainCategories.map((category) => (
            <section key={category.id} className="container mb-4">
              <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
                <ProductGrid
                  title={category.name}
                  subtitle={category.description || `Découvrez nos produits ${category.name.toLowerCase()}`}
                  products={category.products}
                  isLoading={loading}
                  error={error || undefined}
                  viewAllLink={`/category/${category.slug}`}
                />
              </LazySection>
            </section>
          ))}

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <OptimizedProductSection
                title="Produits Économiques"
                subtitle="Des produits de qualité à petits prix"
                viewAllLink="/products?price_max=10000&sort=price_asc"
                maxItems={8}
                serviceMethod={ProductsService.getBudgetFriendly}
                serviceParams={[8, 10000]}
              />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <OptimizedProductSection
                title="Collection Premium"
                subtitle="L'excellence à son apogée"
                viewAllLink="/products?price_min=50000&sort=price_desc"
                maxItems={8}
                serviceMethod={ProductsService.getPremium}
                serviceParams={[8, 50000]}
              />
            </LazySection>
          </section>

          <LazySection className="mb-2.5" fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-xl" />}>
            <TrustElements />
          </LazySection>
        </div>

        <Footer />
      </main>
    </>
  );
}