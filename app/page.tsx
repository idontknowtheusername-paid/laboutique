'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import HeroCarousel from '@/components/home/HeroCarousel';
import FlashSalesConnected from '@/components/home/FlashSalesConnected';
import TrendingProducts from '@/components/home/TrendingProducts';
import CategoriesConnected from '@/components/home/CategoriesConnected';
import ProductGrid from '@/components/home/ProductGrid';
import ProductSlider from '@/components/home/ProductSlider';
import FeaturedBrands from '@/components/home/FeaturedBrands';
import PersonalizedOffers from '@/components/home/PersonalizedOffers';
import Footer from '@/components/layout/Footer';
import { ProductsService, CategoriesService, Product, Category } from '@/lib/services';

// État pour les produits chargés depuis le backend
interface HomeState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export default function Home() {
  const [state, setState] = useState<HomeState>({
    products: [],
    categories: [],
    loading: true,
    error: null
  });

  // Charger les données depuis le backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Charger les produits et catégories en parallèle
        const [productsResponse, categoriesResponse] = await Promise.all([
          ProductsService.getAll({}, { limit: 50 }),
          CategoriesService.getAll()
        ]);

        let products: Product[] = [];
        let categories: Category[] = [];

        if (productsResponse.success && productsResponse.data) {
          products = productsResponse.data;
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          categories = categoriesResponse.data;
        }

        setState({
          products,
          categories,
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

  // Filtrer les produits par catégorie
  const getProductsByCategory = (categorySlug: string, limit: number = 8): Product[] => {
    const category = state.categories.find(cat => cat.slug === categorySlug);
    if (!category) return [];
    
    return state.products
      .filter(product => product.category_id === category.id)
      .slice(0, limit);
  };

  // Obtenir les produits en vedette
  const getFeaturedProducts = (limit: number = 8): Product[] => {
    return state.products
      .filter(product => product.featured)
      .slice(0, limit);
  };

  // Obtenir les nouveaux produits
  const getNewProducts = (limit: number = 8): Product[] => {
    return state.products
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  };

  if (state.loading) {
    return (
      <main className="min-h-screen bg-beshop-background">
        <Header />
        <CategoryMenu />
        <div className="container py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-beshop-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des produits...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (state.error) {
    return (
      <main className="min-h-screen bg-beshop-background">
        <Header />
        <CategoryMenu />
        <div className="container py-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erreur: {state.error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-beshop-primary text-white px-6 py-2 rounded hover:bg-blue-700"
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
  const beautyProducts = getProductsByCategory('beaute-sante');
  const featuredProducts = getFeaturedProducts();
  const newProducts = getNewProducts();

  return (
    <main className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />

      {/* Main Content */}
      <div className="pt-8">
        {/* Hero Section */}
        <section className="container mb-12">
          <HeroCarousel />
        </section>

        {/* Flash Sales - connecté au backend */}
        <FlashSalesConnected />

        {/* Produits Tendance - depuis le backend */}
        <TrendingProducts />

        {/* Categories Overview - connecté au backend */}
        <CategoriesConnected />

        {/* Produits en vedette */}
        {featuredProducts.length > 0 && (
          <ProductGrid
            title="Produits en Vedette"
            subtitle="Notre sélection de produits exceptionnels"
            products={featuredProducts}
            viewAllLink="/products?featured=true"
            backgroundColor="bg-white"
            maxItems={8}
          />
        )}

        {/* Nouveaux produits */}
        {newProducts.length > 0 && (
          <ProductGrid
            title="Nouveaux Produits"
            subtitle="Découvrez nos dernières nouveautés"
            products={newProducts}
            viewAllLink="/products?sort=newest"
            backgroundColor="bg-gray-50"
            maxItems={8}
          />
        )}

        {/* Électronique & High-Tech */}
        {electronicsProducts.length > 0 && (
          <ProductGrid
            title="Électronique & High-Tech"
            subtitle="Les dernières technologies et gadgets tendance"
            products={electronicsProducts}
            viewAllLink="/category/electronique"
            backgroundColor="bg-white"
            maxItems={8}
          />
        )}

        {/* Mode & Beauté */}
        {fashionProducts.length > 0 && (
          <ProductGrid
            title="Mode & Beauté"
            subtitle="Exprimez votre style unique avec nos collections tendance"
            products={fashionProducts}
            viewAllLink="/category/mode-beaute"
            backgroundColor="bg-gray-50"
            maxItems={8}
          />
        )}

        {/* Maison & Jardin */}
        {homeProducts.length > 0 && (
          <ProductGrid
            title="Maison & Jardin"
            subtitle="Tout pour embellir et équiper votre maison"
            products={homeProducts}
            viewAllLink="/category/maison-jardin"
            backgroundColor="bg-white"
            maxItems={8}
          />
        )}

        {/* Beauté & Santé */}
        {beautyProducts.length > 0 && (
          <ProductGrid
            title="Sport & Loisirs"
            subtitle="Équipements sportifs et activités de loisir"
            products={beautyProducts}
            viewAllLink="/category/sport-loisirs"
            backgroundColor="bg-gray-50"
            maxItems={8}
          />
        )}

        {/* Promotional Banner */}
        <section className="container my-12">
          <div className="bg-gradient-to-r from-beshop-accent to-amber-700 rounded-xl p-8 md:p-12 text-white text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Devenez vendeur sur Be Shop
            </h2>
            <p className="mb-6 text-lg md:text-2xl">
              Rejoignez notre marketplace et touchez des milliers de clients !
            </p>
            <a
              href="/vendor/register"
              className="inline-block bg-white text-beshop-accent font-semibold px-8 py-3 rounded-lg shadow hover:bg-gray-100 transition"
            >
              S'inscrire comme vendeur
            </a>
          </div>
        </section>

        <FeaturedBrands />

        {/* Personalized Offers */}
        <PersonalizedOffers />
      </div>

      <Footer />
    </main>
  );
}