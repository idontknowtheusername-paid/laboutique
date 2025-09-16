import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import HeroCarousel from '@/components/home/HeroCarousel';
import FlashSales from '@/components/home/FlashSales';
import TrendingProducts from '@/components/home/TrendingProducts';
import Categories from '@/components/home/Categories';
import ProductGrid from '@/components/home/ProductGrid';
import ProductSlider from '@/components/home/ProductSlider';
import FeaturedBrands from '@/components/home/FeaturedBrands';
import PersonalizedOffers from '@/components/home/PersonalizedOffers';
import Footer from '@/components/layout/Footer';
import type { Product } from '@/lib/services/products.service';

// Mock data pour les produits par catégorie
const electronicsProducts = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB",
    slug: "iphone-15-pro-max-256gb",
    description: "Mock description",
    short_description: "Mock short",
    sku: "MOCK-1",
    price: 850000,
    compare_price: 950000,
    cost_price: 800000,
    track_quantity: false,
    quantity: 99,
    weight: 1,
    dimensions: null,
    category_id: "mock-cat",
    vendor_id: "mock-vendor",
    brand: "Apple",
    tags: [],
    images: [
      "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    status: "active",
    featured: true,
    meta_title: null,
    meta_description: null,
    created_at: "",
    updated_at: "",
  },
  {
        id: "2",
        name: "Samsung Galaxy S24 Ultra",
        slug: "samsung-galaxy-s24-ultra",
        description: "",
        short_description: "",
        sku: "MOCK-2",
        price: 780000,
        compare_price: 890000,
        cost_price: 700000,
        track_quantity: false,
        quantity: 99,
        weight: 1,
        dimensions: null,
        category_id: "mock-cat",
        vendor_id: "mock-vendor",
        brand: "Samsung",
        tags: [],
        images: [
          "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400",
        ],
        status: "active",
        featured: false,
        meta_title: null,
        meta_description: null,
        created_at: "",
        updated_at: "",
      },
      {
        id: "3",
        name: 'MacBook Air M3 13"',
        slug: "macbook-air-m3-13",
        description: "",
        short_description: "",
        sku: "MOCK-3",
        price: 720000,
        compare_price: 850000,
        cost_price: 650000,
        track_quantity: false,
        quantity: 99,
        weight: 1,
        dimensions: null,
        category_id: "mock-cat",
        vendor_id: "mock-vendor",
        brand: "Apple",
        tags: [],
        images: [
          "https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400",
        ],
        status: "active",
        featured: false,
        meta_title: null,
        meta_description: null,
        created_at: "",
        updated_at: "",
    },
  {
    id: "5",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: 'iPad Pro 12.9" M2',
    slug: "ipad-pro-12-9-m2",
    image:
      "https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 650000,
    comparePrice: 750000,
    rating: 4.8,
    reviews: 167,
    discount: 13,
    vendor: "Apple Store",
    category: "Tablettes",
  },
  {
    id: "6",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Dell XPS 13 Plus",
    slug: "dell-xps-13-plus",
    image:
      "https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 580000,
    comparePrice: 680000,
    rating: 4.5,
    reviews: 98,
    discount: 15,
    vendor: "Dell Official",
    category: "Ordinateurs",
  },
  {
    id: "7",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "AirPods Pro 2ème génération",
    slug: "airpods-pro-2",
    image:
      "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 140000,
    comparePrice: 180000,
    rating: 4.7,
    reviews: 891,
    discount: 22,
    vendor: "Apple Store",
    category: "Audio",
  },
  {
    id: "8",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "PlayStation 5 Console",
    slug: "playstation-5",
    image:
      "https://images.pexels.com/photos/9820190/pexels-photo-9820190.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 380000,
    comparePrice: 420000,
    rating: 4.9,
    reviews: 523,
    discount: 10,
    vendor: "Sony Official",
    category: "Gaming",
  },
];

const fashionProducts = [
  {
    id: "9",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Nike Air Max 270 React",
    slug: "nike-air-max-270-react",
    image:
      "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 85000,
    rating: 4.6,
    reviews: 234,
    vendor: "Nike Store",
    category: "Chaussures",
    badge: "Nouveau",
    badgeColor: "bg-blue-500",
  },
  {
    id: "10",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Robe élégante femme",
    slug: "robe-elegante-femme",
    image:
      "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 45000,
    rating: 4.4,
    reviews: 156,
    vendor: "Fashion House",
    category: "Mode Femme",
    badge: "Tendance",
    badgeColor: "bg-pink-500",
  },
  {
    id: "11",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Costume homme élégant",
    slug: "costume-homme-elegant",
    image:
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 120000,
    comparePrice: 150000,
    rating: 4.5,
    reviews: 89,
    discount: 20,
    vendor: "Men's Fashion",
    category: "Mode Homme",
  },
  {
    id: "12",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Sac à main cuir premium",
    slug: "sac-main-cuir-premium",
    image:
      "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 75000,
    rating: 4.7,
    reviews: 203,
    vendor: "Luxury Bags",
    category: "Accessoires",
  },
  {
    id: "13",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Ensemble fitness homme",
    slug: "ensemble-fitness-homme",
    image:
      "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 35000,
    rating: 4.3,
    reviews: 123,
    vendor: "SportWear",
    category: "Sport",
    badge: "Nouveau",
    badgeColor: "bg-blue-500",
  },
  {
    id: "14",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Montre connectée Samsung",
    slug: "montre-connectee-samsung",
    image:
      "https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 150000,
    comparePrice: 180000,
    rating: 4.5,
    reviews: 267,
    discount: 17,
    vendor: "Samsung Official",
    category: "Montres",
  },
];

const homeGardenProducts = [
  {
    id: "15",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Canapé 3 places moderne",
    slug: "canape-3-places-moderne",
    image:
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 280000,
    rating: 4.7,
    reviews: 89,
    vendor: "HomeDecor",
    category: "Mobilier",
  },
  {
    id: "16",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Réfrigérateur Samsung 400L",
    slug: "refrigerateur-samsung-400l",
    image:
      "https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 450000,
    comparePrice: 520000,
    rating: 4.6,
    reviews: 145,
    discount: 13,
    vendor: "Samsung Home",
    category: "Électroménager",
  },
  {
    id: "17",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Table à manger 6 places",
    slug: "table-manger-6-places",
    image:
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 180000,
    rating: 4.4,
    reviews: 67,
    vendor: "Furniture Plus",
    category: "Mobilier",
  },
  {
    id: "18",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Machine à laver LG 8kg",
    slug: "machine-laver-lg-8kg",
    image:
      "https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 320000,
    comparePrice: 380000,
    rating: 4.5,
    reviews: 112,
    discount: 16,
    vendor: "LG Home",
    category: "Électroménager",
  },
];

const beautyHealthProducts = [
  {
    id: "19",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Parfum Chanel No 5",
    slug: "parfum-chanel-no-5",
    image:
      "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 120000,
    rating: 4.9,
    reviews: 789,
    vendor: "Chanel Official",
    category: "Parfums",
  },
  {
    id: "20",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Kit maquillage professionnel",
    slug: "kit-maquillage-professionnel",
    image:
      "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 85000,
    comparePrice: 110000,
    rating: 4.6,
    reviews: 234,
    discount: 23,
    vendor: "Beauty Pro",
    category: "Maquillage",
  },
  {
    id: "21",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Crème anti-âge premium",
    slug: "creme-anti-age-premium",
    image:
      "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 65000,
    rating: 4.7,
    reviews: 156,
    vendor: "SkinCare Plus",
    category: "Soins visage",
  },
  {
    id: "22",
    status: "active",
    track_quantity: false,
    quantity: 99,
    name: "Shampooing réparateur",
    slug: "shampooing-reparateur",
    image:
      "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: 25000,
    rating: 4.4,
    reviews: 89,
    vendor: "Hair Care",
    category: "Soins cheveux",
  },
];

// Helper to normalize mock items to strict Product type expected by ProductGrid
const toProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  description: p.description ?? undefined,
  short_description: p.short_description ?? undefined,
  sku: p.sku ?? `DEMO-${p.id}`,
  price: p.price,
  compare_price: p.compare_price ?? p.comparePrice,
  cost_price: p.cost_price ?? undefined,
  track_quantity: p.track_quantity ?? false,
  quantity: p.quantity ?? 0,
  weight: p.weight ?? undefined,
  dimensions: p.dimensions ?? undefined,
  category_id: p.category_id ?? undefined,
  vendor_id: p.vendor_id ?? 'demo',
  brand: p.brand ?? undefined,
  tags: p.tags ?? undefined,
  images: p.images ?? (p.image ? [p.image] : ['/placeholder-product.jpg']),
  status: (p.status === 'inactive' || p.status === 'draft') ? p.status : 'active',
  featured: p.featured ?? false,
  meta_title: p.meta_title ?? undefined,
  meta_description: p.meta_description ?? undefined,
  created_at: p.created_at || new Date(0).toISOString(),
  updated_at: p.updated_at || new Date(0).toISOString(),
  category: p.category ? { id: 'demo-cat', name: p.category, slug: String(p.category).toLowerCase().replace(/\s+/g, '-') } : undefined,
  vendor: p.vendor ? { id: 'demo-vendor', name: p.vendor, slug: 'demo-vendor' } : undefined,
  reviews_count: p.reviews ?? 0,
  average_rating: p.rating ?? 0,
});

const electronicsAsProducts: Product[] = electronicsProducts.map(toProduct);
const fashionAsProducts: Product[] = fashionProducts.map(toProduct);
const homeGardenAsProducts: Product[] = homeGardenProducts.map(toProduct);
const beautyAsProducts: Product[] = beautyHealthProducts.map(toProduct);

// Normalize electronics for ProductSlider component requirements
const electronicsForSlider = electronicsProducts.map((p: any) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  image: p.image ?? p.images?.[0] ?? '/placeholder-product.jpg',
  price: p.price,
  comparePrice: p.comparePrice ?? p.compare_price,
  rating: p.rating ?? 0,
  reviews: p.reviews ?? 0,
  discount: p.discount,
  vendor: p.vendor ?? p.brand ?? 'Vendeur',
  category: p.category ?? 'Autres',
  badge: p.badge,
  badgeColor: p.badgeColor,
}));

// Derived subcategory datasets for homepage sections (normalized to Product[])
const smartphones: Product[] = electronicsProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Smartphones')
  .map(toProduct);
const laptops: Product[] = electronicsProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Ordinateurs')
  .map(toProduct);
const tablets: Product[] = electronicsProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Tablettes')
  .map(toProduct);
const tvAudio: Product[] = electronicsProducts
  .filter((p: any) => ['TV & Audio', 'Audio', 'TV'].includes((p.category ?? p.category?.name) || ''))
  .map(toProduct);
const gaming: Product[] = electronicsProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Gaming')
  .map(toProduct);
const cameras: Product[] = electronicsProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Appareils Photo')
  .map(toProduct);

const electromenager: Product[] = homeGardenProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Électroménager')
  .map(toProduct);
const mobilier: Product[] = homeGardenProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Mobilier')
  .map(toProduct);
const jardin: Product[] = homeGardenProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Jardin')
  .map(toProduct);
const decoration: Product[] = homeGardenProducts
  .filter((p: any) => ['Décoration', 'Decoration'].includes((p.category ?? p.category?.name) || ''))
  .map(toProduct);
const eclairage: Product[] = homeGardenProducts
  .filter((p: any) => ['Éclairage', 'Eclairage'].includes((p.category ?? p.category?.name) || ''))
  .map(toProduct);
const textileMaison: Product[] = homeGardenProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Textile maison')
  .map(toProduct);

const parfums: Product[] = beautyHealthProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Parfums')
  .map(toProduct);
const maquillage: Product[] = beautyHealthProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Maquillage')
  .map(toProduct);
const soinsVisage: Product[] = beautyHealthProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Soins visage')
  .map(toProduct);
const soinsCheveux: Product[] = beautyHealthProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Soins cheveux')
  .map(toProduct);
const soinsCorps: Product[] = beautyHealthProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Soins corps')
  .map(toProduct);
const complements: Product[] = beautyHealthProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Compléments')
  .map(toProduct);
const accessoiresBeaute: Product[] = beautyHealthProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Accessoires beauté')
  .map(toProduct);

const modeFemme: Product[] = fashionProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Mode Femme')
  .map(toProduct);
const modeHomme: Product[] = fashionProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Mode Homme')
  .map(toProduct);
const chaussures: Product[] = fashionProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Chaussures')
  .map(toProduct);
const montres: Product[] = fashionProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Montres')
  .map(toProduct);
const sportFitness: Product[] = fashionProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Sport')
  .map(toProduct);
const accessoiresMode: Product[] = fashionProducts
  .filter((p: any) => (p.category ?? p.category?.name) === 'Accessoires')
  .map(toProduct);

// Ensure all variable declarations are closed before the component

export default function Home() {
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

        {/* Flash Sales */}
        <section className="container mb-12">
          <FlashSales />
        </section>

        {/* Produits Tendance - Carrousel intelligent */}
        <ProductSlider
          title="Produits Tendance"
          subtitle="Découvrez les produits les plus populaires du moment"
          products={electronicsForSlider}
          viewAllLink="/products"
          backgroundColor="bg-white"
        />

        {/* Categories Overview */}
        <Categories />

        {/* Électronique & High-Tech - en grille */}
        <ProductGrid
          title="Électronique & High-Tech"
          subtitle="Les dernières technologies et gadgets tendance"
          products={electronicsAsProducts}
          viewAllLink="/category/electronique"
          backgroundColor="bg-white"
          maxItems={20}
        />

        {/* Mode & Style - Grille */}
        <ProductGrid
          title="Mode & Style"
          subtitle="Exprimez votre style unique avec nos collections tendance"
          products={fashionAsProducts}
          viewAllLink="/category/mode"
          backgroundColor="bg-gray-50"
          maxItems={20}
        />

        {/* Maison & Jardin - en grille */}
        <ProductGrid
          title="Maison & Jardin"
          subtitle="Tout pour embellir et équiper votre maison"
          products={homeGardenAsProducts}
          viewAllLink="/category/maison-jardin"
          backgroundColor="bg-white"
          maxItems={20}
        />

        {/* Beauté & Santé - Grille */}
        <ProductGrid
          title="Beauté & Santé"
          subtitle="Prenez soin de vous avec nos produits de qualité"
          products={beautyAsProducts}
          viewAllLink="/category/beaute-sante"
          maxItems={20}
        />

        {/* Explorer par catégorie - sections détaillées en grilles */}
        <section className="my-12 space-y-12">
          {/* Sections importantes en grilles */}
          {smartphones.length > 0 && (
            <ProductGrid
              title="Smartphones"
              subtitle="Les meilleurs modèles du moment"
              products={smartphones}
              viewAllLink="/category/electronique"
              backgroundColor="bg-white"
              maxItems={15}
            />
          )}

          {laptops.length > 0 && (
            <ProductGrid
              title="Ordinateurs"
              subtitle="Laptops & ultrabooks performants"
              products={laptops}
              viewAllLink="/category/electronique"
              backgroundColor="bg-gray-50"
              maxItems={15}
            />
          )}

          {electromenager.length > 0 && (
            <ProductGrid
              title="Électroménager"
              subtitle="Équipez votre maison avec les essentiels"
              products={electromenager}
              viewAllLink="/category/maison-jardin"
              backgroundColor="bg-white"
              maxItems={15}
            />
          )}

          {parfums.length > 0 && (
            <ProductGrid
              title="Parfums"
              subtitle="Sélection premium pour lui & elle"
              products={parfums}
              viewAllLink="/category/beaute-sante"
              backgroundColor="bg-gray-50"
              maxItems={15}
            />
          )}

          {/* Électronique - autres en grilles */}
          {(tvAudio.length > 0 ||
            gaming.length > 0 ||
            tablets.length > 0 ||
            cameras.length > 0) && (
            <div className="space-y-10">
              {tvAudio.length > 0 && (
                <ProductGrid
                  title="TV & Audio"
                  subtitle="Image nette, son immersif"
                  products={tvAudio.map(toProduct)}
                  viewAllLink="/category/electronique"
                  backgroundColor="bg-white"
                  maxItems={15}
                />
              )}
              {gaming.length > 0 && (
                <ProductGrid
                  title="Gaming"
                  subtitle="Consoles et accessoires"
                  products={gaming.map(toProduct)}
                  viewAllLink="/category/electronique"
                  backgroundColor="bg-gray-50"
                  maxItems={15}
                />
              )}
              {tablets.length > 0 && (
                <ProductGrid
                  title="Tablettes"
                  subtitle="Travail et divertissement"
                  products={tablets.map(toProduct)}
                  viewAllLink="/category/electronique"
                  backgroundColor="bg-white"
                  maxItems={15}
                />
              )}
              {cameras.length > 0 && (
                <ProductGrid
                  title="Appareils Photo"
                  subtitle="Capturez l'instant"
                  products={cameras.map(toProduct)}
                  viewAllLink="/category/electronique"
                  backgroundColor="bg-gray-50"
                  maxItems={15}
                />
              )}
            </div>
          )}

          {/* Mode - grilles */}
          {(modeFemme.length > 0 ||
            modeHomme.length > 0 ||
            chaussures.length > 0 ||
            montres.length > 0 ||
            sportFitness.length > 0 ||
            accessoiresMode.length > 0) && (
            <div className="space-y-10">
              {modeFemme.length > 0 && (
                <ProductGrid
                  title="Mode Femme"
                  products={modeFemme.map(toProduct)}
                  viewAllLink="/category/mode"
                  backgroundColor="bg-white"
                  maxItems={15}
                />
              )}
              {modeHomme.length > 0 && (
                <ProductGrid
                  title="Mode Homme"
                  products={modeHomme.map(toProduct)}
                  viewAllLink="/category/mode"
                  backgroundColor="bg-gray-50"
                  maxItems={15}
                />
              )}
              {chaussures.length > 0 && (
                <ProductGrid
                  title="Chaussures"
                  products={chaussures.map(toProduct)}
                  viewAllLink="/category/mode"
                  backgroundColor="bg-white"
                  maxItems={15}
                />
              )}
              {montres.length > 0 && (
                <ProductGrid
                  title="Montres"
                  products={montres.map(toProduct)}
                  viewAllLink="/category/mode"
                  backgroundColor="bg-gray-50"
                  maxItems={15}
                />
              )}
              {sportFitness.length > 0 && (
                <ProductGrid
                  title="Sport & Fitness"
                  products={sportFitness.map(toProduct)}
                  viewAllLink="/category/mode"
                  backgroundColor="bg-white"
                  maxItems={15}
                />
              )}
              {accessoiresMode.length > 0 && (
                <ProductGrid
                  title="Accessoires"
                  products={accessoiresMode.map(toProduct)}
                  viewAllLink="/category/mode"
                  backgroundColor="bg-gray-50"
                  maxItems={15}
                />
              )}
            </div>
          )}

          {/* Maison & Jardin - grilles */}
          {(mobilier.length > 0 ||
            jardin.length > 0 ||
            decoration.length > 0 ||
            eclairage.length > 0 ||
            textileMaison.length > 0) && (
            <div className="space-y-10">
              {mobilier.length > 0 && (
                <ProductGrid
                  title="Mobilier"
                  products={mobilier}
                  viewAllLink="/category/maison-jardin"
                  backgroundColor="bg-white"
                  maxItems={15}
                />
              )}
              {jardin.length > 0 && (
                <ProductGrid
                  title="Jardin"
                  products={jardin}
                  viewAllLink="/category/maison-jardin"
                  backgroundColor="bg-gray-50"
                  maxItems={15}
                />
              )}
              {decoration.length > 0 && (
                <ProductGrid
                  title="Décoration"
                  products={decoration}
                  viewAllLink="/category/maison-jardin"
                  backgroundColor="bg-white"
                  maxItems={15}
                />
              )}
              {eclairage.length > 0 && (
                <ProductGrid
                  title="Éclairage"
                  products={eclairage}
                  viewAllLink="/category/maison-jardin"
                  backgroundColor="bg-gray-50"
                  maxItems={15}
                />
              )}
              {textileMaison.length > 0 && (
                <ProductGrid
                  title="Textile maison"
                  products={textileMaison}
                  viewAllLink="/category/maison-jardin"
                  backgroundColor="bg-white"
                  maxItems={15}
                />
              )}
            </div>
          )}

          {/* Beauté & Santé - grilles */}
          {(maquillage.length > 0 ||
            soinsVisage.length > 0 ||
            soinsCheveux.length > 0 ||
            soinsCorps.length > 0 ||
            complements.length > 0 ||
            accessoiresBeaute.length > 0) && (
            <div className="space-y-10">
              {maquillage.length > 0 && (
                <ProductGrid
                  title="Maquillage"
                  products={maquillage.map(toProduct)}
                  viewAllLink="/category/beaute-sante"
                  backgroundColor="bg-white"
                  maxItems={15}
                />
              )}
              {soinsVisage.length > 0 && (
                <ProductGrid
                  title="Soins visage"
                  products={soinsVisage.map(toProduct)}
                  viewAllLink="/category/beaute-sante"
                  backgroundColor="bg-gray-50"
                  maxItems={15}
                />
              )}
              {soinsCheveux.length > 0 && (
                <ProductGrid
                  title="Soins cheveux"
                  products={soinsCheveux.map(toProduct)}
                  viewAllLink="/category/beaute-sante"
                  backgroundColor="bg-white"
                  maxItems={15}
                />
              )}
              {soinsCorps.length > 0 && (
                <ProductGrid
                  title="Soins corps"
                  products={soinsCorps.map(toProduct)}
                  viewAllLink="/category/beaute-sante"
                  backgroundColor="bg-gray-50"
                  maxItems={15}
                />
              )}
              {complements.length > 0 && (
                <ProductGrid
                  title="Compléments"
                  products={complements.map(toProduct)}
                  viewAllLink="/category/beaute-sante"
                  backgroundColor="bg-white"
                  maxItems={15}
                />
              )}
              {accessoiresBeaute.length > 0 && (
                <ProductGrid
                  title="Accessoires beauté"
                  products={accessoiresBeaute.map(toProduct)}
                  viewAllLink="/category/beaute-sante"
                  backgroundColor="bg-gray-50"
                  maxItems={15}
                />
              )}
            </div>
          )}
        </section>

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