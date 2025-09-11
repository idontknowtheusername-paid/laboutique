import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import HeroCarousel from '@/components/home/HeroCarousel';
import FlashSales from '@/components/home/FlashSales';
import Categories from '@/components/home/Categories';
import ProductGrid from '@/components/home/ProductGrid';
import ProductSlider from '@/components/home/ProductSlider';
import FeaturedBrands from '@/components/home/FeaturedBrands';
import Footer from '@/components/layout/Footer';

// Mock data pour les produits par catégorie
const electronicsProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max 256GB',
    slug: 'iphone-15-pro-max-256gb',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 850000,
    comparePrice: 950000,
    rating: 4.8,
    reviews: 324,
    discount: 11,
    vendor: 'Apple Store',
    category: 'Smartphones',
    badge: 'Populaire',
    badgeColor: 'bg-green-500'
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 780000,
    comparePrice: 890000,
    rating: 4.6,
    reviews: 256,
    discount: 12,
    vendor: 'Samsung Official',
    category: 'Smartphones'
  },
  {
    id: '3',
    name: 'MacBook Air M3 13"',
    slug: 'macbook-air-m3-13',
    image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 720000,
    comparePrice: 850000,
    rating: 4.9,
    reviews: 189,
    discount: 15,
    vendor: 'Apple Store',
    category: 'Ordinateurs',
    badge: 'Nouveau',
    badgeColor: 'bg-blue-500'
  },
  {
    id: '4',
    name: 'Sony WH-1000XM5 Casque',
    slug: 'sony-wh-1000xm5',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 180000,
    comparePrice: 220000,
    rating: 4.7,
    reviews: 445,
    discount: 18,
    vendor: 'Sony Official',
    category: 'Audio'
  },
  {
    id: '5',
    name: 'iPad Pro 12.9" M2',
    slug: 'ipad-pro-12-9-m2',
    image: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 650000,
    comparePrice: 750000,
    rating: 4.8,
    reviews: 167,
    discount: 13,
    vendor: 'Apple Store',
    category: 'Tablettes'
  },
  {
    id: '6',
    name: 'Dell XPS 13 Plus',
    slug: 'dell-xps-13-plus',
    image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 580000,
    comparePrice: 680000,
    rating: 4.5,
    reviews: 98,
    discount: 15,
    vendor: 'Dell Official',
    category: 'Ordinateurs'
  },
  {
    id: '7',
    name: 'AirPods Pro 2ème génération',
    slug: 'airpods-pro-2',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 140000,
    comparePrice: 180000,
    rating: 4.7,
    reviews: 891,
    discount: 22,
    vendor: 'Apple Store',
    category: 'Audio'
  },
  {
    id: '8',
    name: 'PlayStation 5 Console',
    slug: 'playstation-5',
    image: 'https://images.pexels.com/photos/9820190/pexels-photo-9820190.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 380000,
    comparePrice: 420000,
    rating: 4.9,
    reviews: 523,
    discount: 10,
    vendor: 'Sony Official',
    category: 'Gaming'
  }
];

const fashionProducts = [
  {
    id: '9',
    name: 'Nike Air Max 270 React',
    slug: 'nike-air-max-270-react',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 85000,
    rating: 4.6,
    reviews: 234,
    vendor: 'Nike Store',
    category: 'Chaussures',
    badge: 'Nouveau',
    badgeColor: 'bg-blue-500'
  },
  {
    id: '10',
    name: 'Robe élégante femme',
    slug: 'robe-elegante-femme',
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 45000,
    rating: 4.4,
    reviews: 156,
    vendor: 'Fashion House',
    category: 'Mode Femme',
    badge: 'Tendance',
    badgeColor: 'bg-pink-500'
  },
  {
    id: '11',
    name: 'Costume homme élégant',
    slug: 'costume-homme-elegant',
    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 120000,
    comparePrice: 150000,
    rating: 4.5,
    reviews: 89,
    discount: 20,
    vendor: 'Men\'s Fashion',
    category: 'Mode Homme'
  },
  {
    id: '12',
    name: 'Sac à main cuir premium',
    slug: 'sac-main-cuir-premium',
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 75000,
    rating: 4.7,
    reviews: 203,
    vendor: 'Luxury Bags',
    category: 'Accessoires'
  },
  {
    id: '13',
    name: 'Ensemble fitness homme',
    slug: 'ensemble-fitness-homme',
    image: 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 35000,
    rating: 4.3,
    reviews: 123,
    vendor: 'SportWear',
    category: 'Sport',
    badge: 'Nouveau',
    badgeColor: 'bg-blue-500'
  },
  {
    id: '14',
    name: 'Montre connectée Samsung',
    slug: 'montre-connectee-samsung',
    image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 150000,
    comparePrice: 180000,
    rating: 4.5,
    reviews: 267,
    discount: 17,
    vendor: 'Samsung Official',
    category: 'Montres'
  }
];

const homeGardenProducts = [
  {
    id: '15',
    name: 'Canapé 3 places moderne',
    slug: 'canape-3-places-moderne',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 280000,
    rating: 4.7,
    reviews: 89,
    vendor: 'HomeDecor',
    category: 'Mobilier'
  },
  {
    id: '16',
    name: 'Réfrigérateur Samsung 400L',
    slug: 'refrigerateur-samsung-400l',
    image: 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 450000,
    comparePrice: 520000,
    rating: 4.6,
    reviews: 145,
    discount: 13,
    vendor: 'Samsung Home',
    category: 'Électroménager'
  },
  {
    id: '17',
    name: 'Table à manger 6 places',
    slug: 'table-manger-6-places',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 180000,
    rating: 4.4,
    reviews: 67,
    vendor: 'Furniture Plus',
    category: 'Mobilier'
  },
  {
    id: '18',
    name: 'Machine à laver LG 8kg',
    slug: 'machine-laver-lg-8kg',
    image: 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 320000,
    comparePrice: 380000,
    rating: 4.5,
    reviews: 112,
    discount: 16,
    vendor: 'LG Home',
    category: 'Électroménager'
  }
];

const beautyHealthProducts = [
  {
    id: '19',
    name: 'Parfum Chanel No 5',
    slug: 'parfum-chanel-no-5',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 120000,
    rating: 4.9,
    reviews: 789,
    vendor: 'Chanel Official',
    category: 'Parfums'
  },
  {
    id: '20',
    name: 'Kit maquillage professionnel',
    slug: 'kit-maquillage-professionnel',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 85000,
    comparePrice: 110000,
    rating: 4.6,
    reviews: 234,
    discount: 23,
    vendor: 'Beauty Pro',
    category: 'Maquillage'
  },
  {
    id: '21',
    name: 'Crème anti-âge premium',
    slug: 'creme-anti-age-premium',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 65000,
    rating: 4.7,
    reviews: 156,
    vendor: 'SkinCare Plus',
    category: 'Soins visage'
  },
  {
    id: '22',
    name: 'Shampooing réparateur',
    slug: 'shampooing-reparateur',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 25000,
    rating: 4.4,
    reviews: 89,
    vendor: 'Hair Care',
    category: 'Soins cheveux'
  }
];

// Derived subcategory datasets for homepage sections
const smartphones = electronicsProducts.filter(p => p.category === 'Smartphones');
const laptops = electronicsProducts.filter(p => p.category === 'Ordinateurs');
const tablets = electronicsProducts.filter(p => p.category === 'Tablettes');
const tvAudio = electronicsProducts.filter(p => ['TV & Audio', 'Audio', 'TV'].includes(p.category));
const gaming = electronicsProducts.filter(p => p.category === 'Gaming');
const cameras = electronicsProducts.filter(p => p.category === 'Appareils Photo');

const electromenager = homeGardenProducts.filter(p => p.category === 'Électroménager');
const mobilier = homeGardenProducts.filter(p => p.category === 'Mobilier');
const jardin = homeGardenProducts.filter(p => p.category === 'Jardin');
const decoration = homeGardenProducts.filter(p => ['Décoration', 'Decoration'].includes(p.category as string));
const eclairage = homeGardenProducts.filter(p => ['Éclairage', 'Eclairage'].includes(p.category as string));
const textileMaison = homeGardenProducts.filter(p => p.category === 'Textile maison');

const parfums = beautyHealthProducts.filter(p => p.category === 'Parfums');
const maquillage = beautyHealthProducts.filter(p => p.category === 'Maquillage');
const soinsVisage = beautyHealthProducts.filter(p => p.category === 'Soins visage');
const soinsCheveux = beautyHealthProducts.filter(p => p.category === 'Soins cheveux');
const soinsCorps = beautyHealthProducts.filter(p => p.category === 'Soins corps');
const complements = beautyHealthProducts.filter(p => p.category === 'Compléments');
const accessoiresBeaute = beautyHealthProducts.filter(p => p.category === 'Accessoires beauté');

const modeFemme = fashionProducts.filter(p => p.category === 'Mode Femme');
const modeHomme = fashionProducts.filter(p => p.category === 'Mode Homme');
const chaussures = fashionProducts.filter(p => p.category === 'Chaussures');
const montres = fashionProducts.filter(p => p.category === 'Montres');
const sportFitness = fashionProducts.filter(p => p.category === 'Sport');
const accessoiresMode = fashionProducts.filter(p => p.category === 'Accessoires');

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

        {/* Categories Overview */}
        <Categories />

        {/* Électronique & High-Tech - en grille */}
        <ProductGrid
          title="Électronique & High-Tech"
          subtitle="Les dernières technologies et gadgets tendance"
          products={electronicsProducts}
          viewAllLink="/category/electronique"
          backgroundColor="bg-white"
          maxItems={20}
        />

        {/* Mode & Style - Grille */}
        <ProductGrid
          title="Mode & Style"
          subtitle="Exprimez votre style unique avec nos collections tendance"
          products={fashionProducts}
          viewAllLink="/category/mode"
          backgroundColor="bg-gray-50"
          maxItems={20}
        />

        {/* Maison & Jardin - en grille */}
        <ProductGrid
          title="Maison & Jardin"
          subtitle="Tout pour embellir et équiper votre maison"
          products={homeGardenProducts}
          viewAllLink="/category/maison-jardin"
          backgroundColor="bg-white"
          maxItems={20}
        />

        {/* Beauté & Santé - Grille */}
        <ProductGrid
          title="Beauté & Santé"
          subtitle="Prenez soin de vous avec nos produits de qualité"
          products={beautyHealthProducts}
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
          {(tvAudio.length > 0 || gaming.length > 0 || tablets.length > 0 || cameras.length > 0) && (
            <div className="space-y-10">
              {tvAudio.length > 0 && (
                <ProductGrid
                  title="TV & Audio"
                  subtitle="Image nette, son immersif"
                  products={tvAudio}
                  viewAllLink="/category/electronique"
                  backgroundColor="bg-white"
                  maxItems={15}
                />
              )}
              {gaming.length > 0 && (
                <ProductGrid
                  title="Gaming"
                  subtitle="Consoles et accessoires"
                  products={gaming}
                  viewAllLink="/category/electronique"
                  backgroundColor="bg-gray-50"
                  maxItems={15}
                />
              )}
              {tablets.length > 0 && (
                <ProductGrid
                  title="Tablettes"
                  subtitle="Travail et divertissement"
                  products={tablets}
                  viewAllLink="/category/electronique"
                  backgroundColor="bg-white"
                  maxItems={15}
                />
              )}
              {cameras.length > 0 && (
                <ProductGrid
                  title="Appareils Photo"
                  subtitle="Capturez l'instant"
                  products={cameras}
                  viewAllLink="/category/electronique"
                  backgroundColor="bg-gray-50"
                  maxItems={15}
                />
              )}
            </div>
          )}

          {/* Mode - grilles */}
          {(modeFemme.length > 0 || modeHomme.length > 0 || chaussures.length > 0 || montres.length > 0 || sportFitness.length > 0 || accessoiresMode.length > 0) && (
            <div className="space-y-10">
              {modeFemme.length > 0 && (
                <ProductGrid title="Mode Femme" products={modeFemme} viewAllLink="/category/mode" backgroundColor="bg-white" maxItems={15} />
              )}
              {modeHomme.length > 0 && (
                <ProductGrid title="Mode Homme" products={modeHomme} viewAllLink="/category/mode" backgroundColor="bg-gray-50" maxItems={15} />
              )}
              {chaussures.length > 0 && (
                <ProductGrid title="Chaussures" products={chaussures} viewAllLink="/category/mode" backgroundColor="bg-white" maxItems={15} />
              )}
              {montres.length > 0 && (
                <ProductGrid title="Montres" products={montres} viewAllLink="/category/mode" backgroundColor="bg-gray-50" maxItems={15} />
              )}
              {sportFitness.length > 0 && (
                <ProductGrid title="Sport & Fitness" products={sportFitness} viewAllLink="/category/mode" backgroundColor="bg-white" maxItems={15} />
              )}
              {accessoiresMode.length > 0 && (
                <ProductGrid title="Accessoires" products={accessoiresMode} viewAllLink="/category/mode" backgroundColor="bg-gray-50" maxItems={15} />
              )}
            </div>
          )}

          {/* Maison & Jardin - grilles */}
          {(mobilier.length > 0 || jardin.length > 0 || decoration.length > 0 || eclairage.length > 0 || textileMaison.length > 0) && (
            <div className="space-y-10">
              {mobilier.length > 0 && (
                <ProductGrid title="Mobilier" products={mobilier} viewAllLink="/category/maison-jardin" backgroundColor="bg-white" maxItems={15} />
              )}
              {jardin.length > 0 && (
                <ProductGrid title="Jardin" products={jardin} viewAllLink="/category/maison-jardin" backgroundColor="bg-gray-50" maxItems={15} />
              )}
              {decoration.length > 0 && (
                <ProductGrid title="Décoration" products={decoration} viewAllLink="/category/maison-jardin" backgroundColor="bg-white" maxItems={15} />
              )}
              {eclairage.length > 0 && (
                <ProductGrid title="Éclairage" products={eclairage} viewAllLink="/category/maison-jardin" backgroundColor="bg-gray-50" maxItems={15} />
              )}
              {textileMaison.length > 0 && (
                <ProductGrid title="Textile maison" products={textileMaison} viewAllLink="/category/maison-jardin" backgroundColor="bg-white" maxItems={15} />
              )}
            </div>
          )}

          {/* Beauté & Santé - grilles */}
          {(maquillage.length > 0 || soinsVisage.length > 0 || soinsCheveux.length > 0 || soinsCorps.length > 0 || complements.length > 0 || accessoiresBeaute.length > 0) && (
            <div className="space-y-10">
              {maquillage.length > 0 && (
                <ProductGrid title="Maquillage" products={maquillage} viewAllLink="/category/beaute-sante" backgroundColor="bg-white" maxItems={15} />
              )}
              {soinsVisage.length > 0 && (
                <ProductGrid title="Soins visage" products={soinsVisage} viewAllLink="/category/beaute-sante" backgroundColor="bg-gray-50" maxItems={15} />
              )}
              {soinsCheveux.length > 0 && (
                <ProductGrid title="Soins cheveux" products={soinsCheveux} viewAllLink="/category/beaute-sante" backgroundColor="bg-white" maxItems={15} />
              )}
              {soinsCorps.length > 0 && (
                <ProductGrid title="Soins corps" products={soinsCorps} viewAllLink="/category/beaute-sante" backgroundColor="bg-gray-50" maxItems={15} />
              )}
              {complements.length > 0 && (
                <ProductGrid title="Compléments" products={complements} viewAllLink="/category/beaute-sante" backgroundColor="bg-white" maxItems={15} />
              )}
              {accessoiresBeaute.length > 0 && (
                <ProductGrid title="Accessoires beauté" products={accessoiresBeaute} viewAllLink="/category/beaute-sante" backgroundColor="bg-gray-50" maxItems={15} />
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
            <p className="text-xl mb-8 opacity-90">
              Rejoignez notre marketplace et développez votre business avec plus de 500,000 clients potentiels
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-beshop-accent hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-colors">
                Devenir vendeur
              </button>
              <button className="border-2 border-white hover:bg-white hover:text-beshop-accent font-bold py-4 px-8 rounded-lg transition-colors">
                En savoir plus
              </button>
            </div>
          </div>
        </section>

        {/* Marques partenaires */}
        <FeaturedBrands />
      </div>

      <Footer />
    </main>
  );
}