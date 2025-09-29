'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { ProductsService, CategoriesService, Product, Category } from '@/lib/services';
import { ProductSkeleton } from '@/components/ui/loading-skeleton';

// Lazy load heavy components with suspense
const HeroCarousel = dynamic(() => import('@/components/home/HeroCarousel'), {
  loading: () => <div className="h-[500px] lg:h-[600px] bg-gray-100 animate-pulse rounded-xl" />
});

const FlashSalesConnected = dynamic(() => import('@/components/home/FlashSalesConnected'), {
  loading: () => <ProductSkeleton count={4} />
});

// Trending will be rendered as a ProductGrid using popular products

// "À découvrir" section will reuse ProductGrid with newest products

const ProductGrid = dynamic(() => import('@/components/home/ProductGrid'), {
  loading: () => <ProductSkeleton count={8} />
});

const FeaturedBrands = dynamic(() => import('@/components/home/FeaturedBrands'), {
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const PersonalizedOffers = dynamic(() => import('@/components/home/PersonalizedOffers'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const MobileAppSection = dynamic(() => import('@/components/home/MobileAppSection'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />
});

const TrustElements = dynamic(() => import('@/components/home/TrustElements'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
});

interface HomeState {
  products: Product[];
  categories: Category[];
  trending: Product[];
  loading: boolean;
  error: string | null;
}

export default function Home() {
  const [state, setState] = useState<HomeState>({
    products: [],
    categories: [],
    trending: [],
    loading: true,
    error: null
  });

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

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erreur de chargement'
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
      <main className="min-h-screen bg-jomiastore-background">
        <Header />
        <CategoryMenu />
        <div className="container py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-jomiastore-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des produits...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (state.error) {
    return (
      <main className="min-h-screen bg-jomiastore-background">
        <Header />
        <CategoryMenu />
        <div className="container py-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erreur: {state.error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-jomiastore-primary text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Recharger
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
    <main className="min-h-screen bg-jomiastore-background">
      <Header />
      <CategoryMenu />

      <div className="pt-2">
        <section className="container mb-4">
          <HeroCarousel />
        </section>

        <div className="mb-2.5">
          <FlashSalesConnected />
        </div>
        {state.trending.length > 0 && (
          <div className="mb-2.5">
            <ProductGrid
              title="Produits Tendance"
              subtitle="Découvrez les produits les plus populaires du moment"
              products={state.trending}
              viewAllLink="/search?sort=popular"
              backgroundColor="bg-white"
              maxItems={8}
            />
          </div>
        )}
        <div className="mb-2.5">
          <ProductGrid
            title="À découvrir"
            subtitle="Produits que vous pourriez aimer"
            products={newProducts}
            viewAllLink="/products?sort=newest"
            backgroundColor="bg-white"
            maxItems={8}
          />
        </div>

        {featuredProducts.length > 0 && (
          <div className="mb-2.5">
            <ProductGrid
              title="Produits en Vedette"
              subtitle="Notre sélection de produits exceptionnels"
              products={featuredProducts}
              viewAllLink="/products?featured=true"
              backgroundColor="bg-white"
              maxItems={8}
            />
          </div>
        )}

        {newProducts.length > 0 && (
          <div className="mb-2.5">
            <ProductGrid
              title="Nouveaux Produits"
              subtitle="Découvrez nos dernières nouveautés"
              products={newProducts}
              viewAllLink="/products?sort=newest"
              backgroundColor="bg-gray-50"
              maxItems={8}
            />
          </div>
        )}

        {electronicsProducts.length > 0 && (
          <div className="mb-2.5">
            <ProductGrid
              title="Électronique & High-Tech"
              subtitle="Les dernières technologies"
              products={electronicsProducts}
              viewAllLink="/category/electronique"
              backgroundColor="bg-white"
              maxItems={8}
            />
          </div>
        )}

        {fashionProducts.length > 0 && (
          <div className="mb-2.5">
            <ProductGrid
              title="Mode & Beauté"
              subtitle="Collections tendance"
              products={fashionProducts}
              viewAllLink="/category/mode-beaute"
              backgroundColor="bg-gray-50"
              maxItems={8}
            />
          </div>
        )}

        {homeProducts.length > 0 && (
          <div className="mb-2.5">
            <ProductGrid
              title="Maison & Jardin"
              subtitle="Tout pour votre intérieur"
              products={homeProducts}
              viewAllLink="/category/maison-jardin"
              backgroundColor="bg-white"
              maxItems={8}
            />
          </div>
        )}

        {sportsProducts.length > 0 && (
          <div className="mb-2.5">
            <ProductGrid
              title="Sport & Loisirs"
              subtitle="Équipements sportifs"
              products={sportsProducts}
              viewAllLink="/category/sport-loisirs"
              backgroundColor="bg-gray-50"
              maxItems={8}
            />
          </div>
        )}

        <div className="mb-2.5">
          <FeaturedBrands />
        </div>
        
        {/* Mobile App Section */}
        <div className="mb-2.5">
          <MobileAppSection />
        </div>
        
        {/* Trust Elements */}
        <div className="mb-2.5">
          <TrustElements />
        </div>
        
        <div>
          <PersonalizedOffers />
        </div>
      </div>

      <Footer />
    </main>
  );
}