'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import ImprovedCategoryMenu from '@/components/layout/ImprovedCategoryMenu';
import Footer from '@/components/layout/Footer';
import { ProductsService, CategoriesService, Product, Category } from '@/lib/services';
import { ProductSkeleton } from '@/components/ui/loading-skeleton';
import { useToast } from '@/components/admin/Toast';
import LazySection from '@/components/ui/LazySection';
import DynamicMeta from '@/components/seo/DynamicMeta';
import ProductSectionMeta from '@/components/seo/ProductSectionMeta';

// Optimized lazy loading components with better loading states and code splitting
const HeroCarousel = dynamic(() => import('@/components/home/HeroCarousel'), {
  loading: () => <div className="h-[250px] lg:h-[300px] bg-gray-100 animate-pulse rounded-xl" />,
  ssr: true // Critical above-the-fold content
});

const FlashSalesConnected = dynamic(() => import('@/components/home/FlashSalesConnected'), {
  loading: () => <ProductSkeleton count={4} />,
  ssr: false
});

const ProductGrid = dynamic(() => import('@/components/home/ProductGrid'), {
  loading: () => <ProductSkeleton count={8} />,
  ssr: false
});

// Composants lourds avec lazy loading optimisé
const FeaturedBrands = dynamic(() => import('@/components/home/FeaturedBrands'), {
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const PersonalizedOffers = dynamic(() => import('@/components/home/PersonalizedOffers'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const MobileAppSection = dynamic(() => import('@/components/home/MobileAppSection'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const TrustElements = dynamic(() => import('@/components/home/TrustElements'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

// Composants avec intersection observer pour lazy loading
const LazyProductGrid = dynamic(() => import('@/components/home/ProductGrid'), {
  loading: () => <ProductSkeleton count={8} />,
  ssr: false
});

interface HomeState {
  products: Product[];
  categories: Category[];
  trending: Product[];
  loading: boolean;
  error: string | null;
}

export default function Home() {
  const router = useRouter();
  const [state, setState] = useState<HomeState>({
    products: [],
    categories: [],
    trending: [],
    loading: true,
    error: null
  });
  const { success, error, info } = useToast();

  // Fonction de rechargement intelligente
  const handleRetry = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [productsResponse, categoriesResponse, trendingResponse] = await Promise.all([
        ProductsService.getAll({}, { limit: 50 }),
        CategoriesService.getAll(),
        ProductsService.getPopular(12)
      ]);

      let products: Product[] = [];
      let categories: Category[] = [];
      let trending: Product[] = [];

      if (productsResponse.success && productsResponse.data) {
        products = productsResponse.data;
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        categories = categoriesResponse.data;
      }

      if (trendingResponse.success && trendingResponse.data) {
        trending = trendingResponse.data;
      }

      setState({
        products,
        categories,
        trending,
        loading: false,
        error: null
      });

      success('Données rechargées', 'Les données ont été mises à jour avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de rechargement';
      error('Erreur de rechargement', `Impossible de recharger les données: ${errorMessage}`);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const [productsResponse, categoriesResponse, trendingResponse] = await Promise.all([
          ProductsService.getAll({}, { limit: 50 }),
          CategoriesService.getAll(),
          ProductsService.getPopular(12)
        ]);

        let products: Product[] = [];
        let categories: Category[] = [];
        let trending: Product[] = [];

        if (productsResponse.success && productsResponse.data) {
          products = productsResponse.data;
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          categories = categoriesResponse.data;
        }

        if (trendingResponse.success && trendingResponse.data) {
          trending = trendingResponse.data;
        }

        setState({
          products,
          categories,
          trending,
          loading: false,
          error: null
        });

        // Notification de succès
        success('Données chargées', `${products.length} produits, ${categories.length} catégories chargées`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement';
        
        // Notification d'erreur utilisateur
        error('Erreur de chargement', `Impossible de charger les données: ${errorMessage}`);
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
      }
    };

    loadData();
  }, []);

  const getProductsByCategory = (categorySlug: string, limit: number = 8): Product[] => {
    const category = state.categories.find(cat => cat.slug === categorySlug);
    if (!category) return [];
    
    return state.products
      .filter(product => product.category_id === category.id)
      .slice(0, limit);
  };

  const getFeaturedProducts = (limit: number = 8): Product[] => {
    return state.products
      .filter(product => product.featured)
      .slice(0, limit);
  };

  const getNewProducts = (limit: number = 8): Product[] => {
    return state.products
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  };

  if (state.loading) {
    return (
      <main className="min-h-screen bg-jomionstore-background">
        <Header />
        <ImprovedCategoryMenu />
        <div className="container py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-jomionstore-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des produits...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (state.error) {
    return (
      <main className="min-h-screen bg-jomionstore-background">
        <Header />
        <ImprovedCategoryMenu />
        <div className="container py-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erreur: {state.error}</p>
            <button 
              onClick={handleRetry}
              className="bg-jomionstore-primary text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const electronicsProducts = getProductsByCategory('electronique');
  const fashionProducts = getProductsByCategory('mode-beaute');
  const homeProducts = getProductsByCategory('maison-jardin');
  const sportsProducts = getProductsByCategory('sport-loisirs');
  const featuredProducts = getFeaturedProducts();
  const newProducts = getNewProducts();

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
          <HeroCarousel />
        </section>

        <div className="mb-2.5">
          <FlashSalesConnected />
        </div>
        {/* Sections avec lazy loading optimisé */}
        {state.trending.length > 0 && (
          <LazySection className="mb-2.5" fallback={<ProductSkeleton count={8} />}>
            <ProductSectionMeta
              sectionTitle="Produits Tendance"
              sectionDescription="Découvrez les produits les plus populaires du moment"
              products={state.trending}
              category="Tendance"
            />
            <ProductGrid
              title="Produits Tendance"
              subtitle="Découvrez les produits les plus populaires du moment"
              products={state.trending}
              viewAllLink="/search?sort=popular"
              backgroundColor="bg-white"
              maxItems={8}
            />
          </LazySection>
        )}
        
        <LazySection className="mb-2.5" fallback={<ProductSkeleton count={8} />}>
          <ProductGrid
            title="À découvrir"
            subtitle="Produits que vous pourriez aimer"
            products={newProducts}
            viewAllLink="/products?sort=newest"
            backgroundColor="bg-white"
            maxItems={8}
          />
        </LazySection>

        {featuredProducts.length > 0 && (
          <LazySection className="mb-2.5" fallback={<ProductSkeleton count={8} />}>
            <ProductGrid
              title="Produits en Vedette"
              subtitle="Notre sélection de produits exceptionnels"
              products={featuredProducts}
              viewAllLink="/products?featured=true"
              backgroundColor="bg-white"
              maxItems={8}
            />
          </LazySection>
        )}

        {newProducts.length > 0 && (
          <LazySection className="mb-2.5" fallback={<ProductSkeleton count={8} />}>
            <ProductGrid
              title="Nouveaux Produits"
              subtitle="Découvrez nos dernières nouveautés"
              products={newProducts}
              viewAllLink="/products?sort=newest"
              backgroundColor="bg-gray-50"
              maxItems={8}
            />
          </LazySection>
        )}

        {electronicsProducts.length > 0 && (
          <LazySection className="mb-2.5" fallback={<ProductSkeleton count={8} />}>
            <ProductSectionMeta
              sectionTitle="Électronique & High-Tech"
              sectionDescription="Les dernières technologies et gadgets électroniques"
              products={electronicsProducts}
              category="Électronique"
            />
            <ProductGrid
              title="Électronique & High-Tech"
              subtitle="Les dernières technologies"
              products={electronicsProducts}
              viewAllLink="/category/electronique"
              backgroundColor="bg-white"
              maxItems={8}
            />
          </LazySection>
        )}

        {fashionProducts.length > 0 && (
          <LazySection className="mb-2.5" fallback={<ProductSkeleton count={8} />}>
            <ProductSectionMeta
              sectionTitle="Mode & Beauté"
              sectionDescription="Collections tendance et produits de beauté"
              products={fashionProducts}
              category="Mode"
            />
            <ProductGrid
              title="Mode & Beauté"
              subtitle="Collections tendance"
              products={fashionProducts}
              viewAllLink="/category/mode-beaute"
              backgroundColor="bg-gray-50"
              maxItems={8}
            />
          </LazySection>
        )}

        {homeProducts.length > 0 && (
          <LazySection className="mb-2.5" fallback={<ProductSkeleton count={8} />}>
            <ProductGrid
              title="Maison & Jardin"
              subtitle="Tout pour votre intérieur"
              products={homeProducts}
              viewAllLink="/category/maison-jardin"
              backgroundColor="bg-white"
              maxItems={8}
            />
          </LazySection>
        )}

        {sportsProducts.length > 0 && (
          <LazySection className="mb-2.5" fallback={<ProductSkeleton count={8} />}>
            <ProductGrid
              title="Sport & Loisirs"
              subtitle="Équipements sportifs"
              products={sportsProducts}
              viewAllLink="/category/sport-loisirs"
              backgroundColor="bg-gray-50"
              maxItems={8}
            />
          </LazySection>
        )}

        {/* Recommandé pour vous - Section personnalisée avec lazy loading */}
        <LazySection className="mb-2.5" fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-xl" />}>
          <PersonalizedOffers />
        </LazySection>

        <LazySection className="mb-2.5" fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-xl" />}>
          <FeaturedBrands />
        </LazySection>
        
        {/* Mobile App Section avec lazy loading */}
        <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
          <MobileAppSection />
        </LazySection>
        
        {/* Trust Elements avec lazy loading */}
        <LazySection className="mb-2.5" fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-xl" />}>
          <TrustElements />
        </LazySection>
      </div>

      <Footer />
      </main>
    </>
  );
}