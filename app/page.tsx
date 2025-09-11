import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import HeroCarousel from '@/components/home/HeroCarousel';
import FlashSales from '@/components/home/FlashSales';
import Categories from '@/components/home/Categories';
import ProductGrid from '@/components/home/ProductGrid';
import ProductSlider from '@/components/home/ProductSlider';
import FeaturedBrands from '@/components/home/FeaturedBrands';
import NewsletterSection from '@/components/home/NewsletterSection';
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

        {/* Électronique - Section principale avec grille */}
        <section className="py-12 bg-white">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Électronique & High-Tech
                </h2>
                <p className="text-gray-600">
                  Les dernières technologies et gadgets tendance
                </p>
              </div>
              <a 
                href="/category/electronique" 
                className="text-beshop-primary hover:text-blue-700 font-semibold flex items-center group"
              >
                Voir tout
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <ProductGrid products={electronicsProducts} />
          </div>
        </section>

        {/* Mode & Style - Carousel */}
        <ProductSlider
          title="Mode & Style"
          subtitle="Exprimez votre style unique avec nos collections tendance"
          products={fashionProducts}
          viewAllLink="/category/mode"
          backgroundColor="bg-gray-50"
        />

        {/* Maison & Jardin - Section avec grille */}
        <section className="py-12 bg-white">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Maison & Jardin
                </h2>
                <p className="text-gray-600">
                  Tout pour embellir et équiper votre maison
                </p>
              </div>
              <a 
                href="/category/maison-jardin" 
                className="text-beshop-primary hover:text-blue-700 font-semibold flex items-center group"
              >
                Voir tout
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <ProductGrid products={homeGardenProducts} columns={4} />
          </div>
        </section>

        {/* Beauté & Santé - Carousel */}
        <ProductSlider
          title="Beauté & Santé"
          subtitle="Prenez soin de vous avec nos produits de qualité"
          products={beautyHealthProducts}
          viewAllLink="/category/beaute-sante"
        />

        {/* Marques partenaires */}
        <FeaturedBrands />

        {/* Newsletter */}
        <NewsletterSection />

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
      </div>

      <Footer />
    </main>
  );
}