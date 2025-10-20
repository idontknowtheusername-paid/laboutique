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

const TrendingProducts = dynamic(() => import('@/components/home/TrendingProducts'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const CarouselCategories = dynamic(() => import('@/components/home/CarouselCategories'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});


const CategoryProductsGrid = dynamic(() => import('@/components/home/CategoryProductsGrid'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

const CategoryProductsCarousel = dynamic(() => import('@/components/home/CategoryProductsCarousel'), {
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

          {/* Carousel Categories Section - Positioned early for better UX */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CarouselCategories />
          </LazySection>

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











          {/* SECTIONS PRINCIPALES - 5 CATÉGORIES IMPORTANTES */}
          
          {/* 1. Électronique - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="electronique"
              title="Électronique & High-Tech"
              subtitle="Smartphones, ordinateurs, accessoires tech"
              maxItems={8}
            />
          </LazySection>

          {/* 2. Mode & Beauté - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="mode-beaute"
              title="Mode & Beauté"
              subtitle="Vêtements, chaussures, cosmétiques"
              maxItems={8}
            />
          </LazySection>

          {/* 3. Maison & Jardin - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="maison-jardin"
              title="Maison & Jardin"
              subtitle="Mobilier, décoration, jardinage"
              maxItems={8}
            />
          </LazySection>

          {/* 4. Téléphones & Accessoires - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="telephones-accessoires"
              title="Téléphones & Accessoires"
              subtitle="Smartphones, coques, chargeurs"
              maxItems={8}
            />
          </LazySection>

          {/* 5. Sport & Loisirs - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="sport-loisirs"
              title="Sport & Loisirs"
              subtitle="Équipements sportifs, jeux, loisirs"
              maxItems={8}
            />
          </LazySection>

          {/* SECTIONS SECONDAIRES - 8 CATÉGORIES MOYENNES */}
          
          {/* 6. Audio & Vidéo - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="audio-video"
              title="Audio & Vidéo"
              subtitle="Écouteurs, enceintes, TV"
              maxItems={6}
            />
          </LazySection>

          {/* 7. Gaming & VR - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="gaming-vr"
              title="Gaming & VR"
              subtitle="Jeux vidéo, consoles, VR"
              maxItems={6}
            />
          </LazySection>

          {/* 8. Vêtements Homme - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="vetements-homme"
              title="Vêtements Homme"
              subtitle="Mode masculine"
              maxItems={6}
            />
          </LazySection>

          {/* 9. Vêtements Femme - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="vetements-femme"
              title="Vêtements Femme"
              subtitle="Mode féminine"
              maxItems={6}
            />
          </LazySection>

          {/* 10. Chaussures - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="chaussures"
              title="Chaussures"
              subtitle="Toutes chaussures"
              maxItems={6}
            />
          </LazySection>

          {/* 11. Sacs & Maroquinerie - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="sacs-maroquinerie"
              title="Sacs & Maroquinerie"
              subtitle="Sacs, portefeuilles"
              maxItems={6}
            />
          </LazySection>

          {/* 12. Montres & Bijoux - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="montres-bijoux"
              title="Montres & Bijoux"
              subtitle="Montres, bijoux"
              maxItems={6}
            />
          </LazySection>

          {/* 13. Cosmétiques & Soins - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="cosmetiques-soins"
              title="Cosmétiques & Soins"
              subtitle="Beauté et soins"
              maxItems={6}
            />
          </LazySection>

          {/* SECTIONS SPÉCIALISÉES - 18 CATÉGORIES RESTANTES */}
          
          {/* 14. Mobilier - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="mobilier"
              title="Mobilier"
              subtitle="Meubles et décoration"
              maxItems={6}
            />
          </LazySection>

          {/* 15. Électroménager - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="electromenager"
              title="Électroménager"
              subtitle="Appareils ménagers"
              maxItems={6}
            />
          </LazySection>

          {/* 16. Luminaires - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="luminaires"
              title="Luminaires"
              subtitle="Éclairage et lampes"
              maxItems={6}
            />
          </LazySection>

          {/* 17. Cuisine & Salle de bain - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="cuisine-salle-bain"
              title="Cuisine & Salle de bain"
              subtitle="Équipements cuisine et salle de bain"
              maxItems={6}
            />
          </LazySection>

          {/* 18. Jardinage & Outils - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="jardinage-outils"
              title="Jardinage & Outils"
              subtitle="Outils et jardinage"
              maxItems={6}
            />
          </LazySection>

          {/* 19. Fitness & Musculation - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="fitness-musculation"
              title="Fitness & Musculation"
              subtitle="Équipements fitness"
              maxItems={6}
            />
          </LazySection>

          {/* 20. Sports d'extérieur - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="sports-exterieur"
              title="Sports d'extérieur"
              subtitle="Sports outdoor"
              maxItems={6}
            />
          </LazySection>

          {/* 21. Jeux & Jouets - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="jeux-jouets"
              title="Jeux & Jouets"
              subtitle="Jouets et jeux"
              maxItems={6}
            />
          </LazySection>

          {/* 22. Instruments de musique - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="instruments-musique"
              title="Instruments de musique"
              subtitle="Musique et instruments"
              maxItems={6}
            />
          </LazySection>

          {/* 23. Livre & Papeterie - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="livre-papeterie"
              title="Livre & Papeterie"
              subtitle="Livres et fournitures"
              maxItems={6}
            />
          </LazySection>

          {/* 24. Santé & Bien-être - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="sante-bien-etre"
              title="Santé & Bien-être"
              subtitle="Santé et bien-être"
              maxItems={6}
            />
          </LazySection>

          {/* 25. Bébé & Enfant - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="bebe-enfant"
              title="Bébé & Enfant"
              subtitle="Produits bébé"
              maxItems={6}
            />
          </LazySection>

          {/* 26. Automobile & Moto - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="automobile-moto"
              title="Automobile & Moto"
              subtitle="Auto et moto"
              maxItems={6}
            />
          </LazySection>

          {/* 27. Outils & Bricolage - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="outils-bricolage"
              title="Outils & Bricolage"
              subtitle="Outils et bricolage"
              maxItems={6}
            />
          </LazySection>

          {/* 28. Voyage & Bagages - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="voyage-bagages"
              title="Voyage & Bagages"
              subtitle="Voyage et bagages"
              maxItems={6}
            />
          </LazySection>

          {/* 29. Animaux & Accessoires - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="animaux-accessoires"
              title="Animaux & Accessoires"
              subtitle="Animaux et accessoires"
              maxItems={6}
            />
          </LazySection>

          {/* 30. Ordinateurs & Tablettes - GRILLE */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsGrid
              categorySlug="ordinateurs-tablettes"
              title="Ordinateurs & Tablettes"
              subtitle="Laptops, PC, tablettes"
              maxItems={6}
            />
          </LazySection>

          {/* 31. Vêtements Enfant - CARROUSEL */}
          <LazySection className="mb-2.5" fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <CategoryProductsCarousel
              categorySlug="vetements-enfant"
              title="Vêtements Enfant"
              subtitle="Mode enfant"
              maxItems={6}
            />
          </LazySection>

          <LazySection className="mb-2.5" fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-xl" />}>
            <TrustElements />
          </LazySection>
        </div>

        <Footer />
      </main>
    </>
  );
}