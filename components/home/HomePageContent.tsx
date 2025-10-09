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

const DailyDeals = dynamic(() => import('@/components/home/DailyDeals'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const BestSellers = dynamic(() => import('@/components/home/BestSellers'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const PopularBrands = dynamic(() => import('@/components/home/PopularBrands'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const PersonalizedOffers = dynamic(() => import('@/components/home/PersonalizedOffers'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const LimitedStock = dynamic(() => import('@/components/home/LimitedStock'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const WeeklyNewArrivals = dynamic(() => import('@/components/home/WeeklyNewArrivals'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const TrendingProducts = dynamic(() => import('@/components/home/TrendingProducts'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const BudgetFriendly = dynamic(() => import('@/components/home/BudgetFriendly'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const PremiumCollection = dynamic(() => import('@/components/home/PremiumCollection'), {
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

        // Load categories and products in parallel
        const [categoriesRes, productsRes] = await Promise.all([
          CategoriesService.getAll(),
          ProductsService.getAll({}, { limit: 200 }) // Augmenter pour supporter 100 produits par section
        ]);

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }

        if (productsRes.success && productsRes.data) {
          setProducts(productsRes.data);
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

  const getFeaturedProducts = () => {
    return products.filter(p => p.featured).slice(0, 100);
  };

  const getNewProducts = () => {
    return products
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20); // FIFO: les 20 plus récents, les anciens sont automatiquement supprimés
  };

  // Produits par catégorie dynamique
  const getCategoryProducts = (categorySlug: string) => {
    return products.filter(p => (p.category as any)?.slug === categorySlug).slice(0, 100);
  };

  // Sections principales
  const featuredProducts = getFeaturedProducts();
  const newProducts = getNewProducts();
  
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
            <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
              <DailyDeals />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <ProductGrid
                title="Nouveautés"
                subtitle="Découvrez nos derniers produits"
                products={newProducts}
                isLoading={loading}
                error={error || undefined}
                viewAllLink="/products?sort=newest"
              />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
              <BestSellers />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
              <TrendingProducts />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-xl" />}>
              <PopularBrands />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <ProductGrid
                title="Produits que vous aimeriez"
                subtitle="Sélectionnés spécialement pour vous"
                products={featuredProducts}
                isLoading={loading}
                error={error || undefined}
                viewAllLink="/products?featured=true"
              />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
              <PersonalizedOffers />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
              <LimitedStock />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
              <WeeklyNewArrivals />
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
            <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
              <BudgetFriendly />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
              <PremiumCollection />
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