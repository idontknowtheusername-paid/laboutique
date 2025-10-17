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
const HeroCarouselWithData = dynamic(() => import('@/components/home/HeroCarouselWithData'), {
  loading: () => <div className="h-[400px] lg:h-[500px] bg-gray-100 animate-pulse rounded-xl" />,
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
  
  // Nouvelles sections avec logique de filtrage
  const dailyDealsProducts = products
    .filter(product => {
      const discount = product.compare_price && product.compare_price > product.price
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : 0;
      return discount >= 20; // Au moins 20% de réduction
    })
    .slice(0, 8);

  const bestSellersProducts = products
    .filter(product => (product.reviews_count || 0) > 0)
    .sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0))
    .slice(0, 8);

  const limitedStockProducts = products
    .filter(product => product.track_quantity && product.quantity > 0 && product.quantity <= 10)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 8);

  const weeklyNewProducts = products
    .filter(product => {
      const createdDate = new Date(product.created_at);
      const daysAgo = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo <= 7; // Produits des 7 derniers jours
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const budgetFriendlyProducts = products
    .filter(product => product.price <= 10000) // Moins de 10,000 FCFA
    .sort((a, b) => a.price - b.price)
    .slice(0, 8);

  const premiumProducts = products
    .filter(product => product.price >= 50000) // Plus de 50,000 FCFA
    .sort((a, b) => b.price - a.price)
    .slice(0, 8);

  // Grouper par vendeur pour PopularBrands
  const vendorMap = new Map<string, Product>();
  products.forEach(product => {
    if (product.vendor?.name && !vendorMap.has(product.vendor.name)) {
      vendorMap.set(product.vendor.name, product);
    }
  });
  const popularBrandsProducts = Array.from(vendorMap.values()).slice(0, 8);
  
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
            <LazySection className="mb-2.5" fallback={<div className="h-[400px] lg:h-[500px] bg-gray-100 animate-pulse rounded-xl" />}>
              <HeroCarouselWithData 
                type="promotional"
                limit={5}
                autoRotate={true}
                showControls={true}
                showIndicators={true}
                showProgress={true}
              />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
              <FlashSalesConnected />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <ProductGrid
                title="Offres du Jour"
                subtitle="Offres limitées - Ne ratez pas ces bonnes affaires !"
                products={dailyDealsProducts}
                isLoading={loading}
                error={error || undefined}
                viewAllLink="/products?discount_min=20&sort=discount"
                maxItems={8}
              />
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
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <ProductGrid
                title="Top Ventes"
                subtitle="Les produits les plus vendus cette semaine"
                products={bestSellersProducts}
                isLoading={loading}
                error={error || undefined}
                viewAllLink="/products?sort=popular"
                maxItems={8}
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
              <ProductGrid
                title="Marques Populaires"
                subtitle="Découvrez les marques les plus appréciées"
                products={popularBrandsProducts}
                isLoading={loading}
                error={error || undefined}
                viewAllLink="/brands"
                maxItems={8}
              />
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
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <ProductGrid
                title="Stock Limité"
                subtitle="Quantités limitées - Commandez maintenant !"
                products={limitedStockProducts}
                isLoading={loading}
                error={error || undefined}
                viewAllLink="/products?stock_limited=true"
                maxItems={8}
              />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <ProductGrid
                title="Nouveautés de la Semaine"
                subtitle="Découvrez les derniers arrivages"
                products={weeklyNewProducts}
                isLoading={loading}
                error={error || undefined}
                viewAllLink="/products?sort=newest&days=7"
                maxItems={8}
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
              <ProductGrid
                title="Produits Économiques"
                subtitle="Des produits de qualité à petits prix"
                products={budgetFriendlyProducts}
                isLoading={loading}
                error={error || undefined}
                viewAllLink="/products?price_max=10000&sort=price_asc"
                maxItems={8}
              />
            </LazySection>
          </section>

          <section className="container mb-4">
            <LazySection className="mb-2.5" fallback={<ProductSkeleton />}>
              <ProductGrid
                title="Collection Premium"
                subtitle="L'excellence à son apogée"
                products={premiumProducts}
                isLoading={loading}
                error={error || undefined}
                viewAllLink="/products?price_min=50000&sort=price_desc"
                maxItems={8}
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