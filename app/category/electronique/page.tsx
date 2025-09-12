'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/home/ProductGrid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Grid, List, Star } from 'lucide-react';

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
  },
  {
    id: '9',
    name: 'TV Samsung 55" 4K QLED',
    slug: 'tv-samsung-55-4k-qled',
    image: 'https://images.pexels.com/photos/1444416/pexels-photo-1444416.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 450000,
    comparePrice: 520000,
    rating: 4.6,
    reviews: 234,
    discount: 13,
    vendor: 'Samsung Official',
    category: 'TV & Audio'
  },
  {
    id: '10',
    name: 'Nintendo Switch OLED',
    slug: 'nintendo-switch-oled',
    image: 'https://images.pexels.com/photos/9820190/pexels-photo-9820190.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 220000,
    rating: 4.8,
    reviews: 456,
    vendor: 'Nintendo Official',
    category: 'Gaming'
  },
  {
    id: '11',
    name: 'Canon EOS R6 Mark II',
    slug: 'canon-eos-r6-mark-ii',
    image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 1200000,
    comparePrice: 1350000,
    rating: 4.9,
    reviews: 89,
    discount: 11,
    vendor: 'Canon Official',
    category: 'Appareils Photo'
  },
  {
    id: '12',
    name: 'Bose QuietComfort 45',
    slug: 'bose-quietcomfort-45',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 195000,
    comparePrice: 230000,
    rating: 4.7,
    reviews: 312,
    discount: 15,
    vendor: 'Bose Official',
    category: 'Audio'
  }
];

const categories = [
  { name: 'Smartphones', count: 1250, slug: 'smartphones' },
  { name: 'Ordinateurs', count: 890, slug: 'ordinateurs' },
  { name: 'TV & Audio', count: 650, slug: 'tv-audio' },
  { name: 'Gaming', count: 420, slug: 'gaming' },
  { name: 'Appareils Photo', count: 320, slug: 'appareils-photo' },
  { name: 'Accessoires', count: 1800, slug: 'accessoires' }
];

const brands = [
  { name: 'Apple', count: 450 },
  { name: 'Samsung', count: 380 },
  { name: 'Sony', count: 290 },
  { name: 'Dell', count: 180 },
  { name: 'HP', count: 160 },
  { name: 'Canon', count: 120 },
  { name: 'Bose', count: 95 },
  { name: 'Nintendo', count: 85 }
];

export default function ElectronicsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popularity');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />
      
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-beshop-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Électronique</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Électronique & High-Tech
          </h1>
          <p className="text-gray-600">
            Découvrez notre large sélection de produits électroniques de qualité
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Filter className="w-5 h-5 mr-2" />
                  <h3 className="font-semibold">Filtres</h3>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Catégories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.slug} className="flex items-center space-x-2">
                        <Checkbox 
                          id={category.slug}
                          checked={selectedCategories.includes(category.slug)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category.slug]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category.slug));
                            }
                          }}
                        />
                        <label htmlFor={category.slug} className="text-sm flex-1 cursor-pointer">
                          {category.name}
                        </label>
                        <span className="text-xs text-gray-500">({category.count})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Prix</h4>
                  <div className="space-y-4">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={2000000}
                      step={10000}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Marques</h4>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand.name} className="flex items-center space-x-2">
                        <Checkbox 
                          id={brand.name}
                          checked={selectedBrands.includes(brand.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBrands([...selectedBrands, brand.name]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(b => b !== brand.name));
                            }
                          }}
                        />
                        <label htmlFor={brand.name} className="text-sm flex-1 cursor-pointer">
                          {brand.name}
                        </label>
                        <span className="text-xs text-gray-500">({brand.count})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Note client</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <Checkbox id={`rating-${rating}`} />
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">& plus</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  Effacer les filtres
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {electronicsProducts.length} produits trouvés
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularité</SelectItem>
                    <SelectItem value="price-low">Prix croissant</SelectItem>
                    <SelectItem value="price-high">Prix décroissant</SelectItem>
                    <SelectItem value="rating">Meilleures notes</SelectItem>
                    <SelectItem value="newest">Plus récents</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products */}
            <ProductGrid
              title=""
              products={electronicsProducts}
              backgroundColor="bg-transparent"
            />

            {/* Pagination */}
            <div className="flex items-center justify-center mt-12 space-x-2">
              <Button variant="outline" disabled>Précédent</Button>
              <Button className="bg-beshop-primary">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">...</Button>
              <Button variant="outline">10</Button>
              <Button variant="outline">Suivant</Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}