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

const fashionProducts = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
    id: '5',
    name: 'Jean slim homme',
    slug: 'jean-slim-homme',
    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 35000,
    comparePrice: 45000,
    rating: 4.3,
    reviews: 178,
    discount: 22,
    vendor: 'Denim Co',
    category: 'Mode Homme'
  },
  {
    id: '6',
    name: 'Chaussures à talons femme',
    slug: 'chaussures-talons-femme',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 55000,
    rating: 4.4,
    reviews: 134,
    vendor: 'Elegant Shoes',
    category: 'Chaussures'
  },
  {
    id: '7',
    name: 'T-shirt basique femme',
    slug: 't-shirt-basique-femme',
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 15000,
    rating: 4.2,
    reviews: 267,
    vendor: 'Basic Wear',
    category: 'Mode Femme'
  },
  {
    id: '8',
    name: 'Montre homme classique',
    slug: 'montre-homme-classique',
    image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 95000,
    comparePrice: 120000,
    rating: 4.6,
    reviews: 145,
    discount: 21,
    vendor: 'Time Master',
    category: 'Accessoires'
  },
  {
    id: '9',
    name: 'Veste en cuir homme',
    slug: 'veste-cuir-homme',
    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 180000,
    comparePrice: 220000,
    rating: 4.8,
    reviews: 92,
    discount: 18,
    vendor: 'Leather Style',
    category: 'Mode Homme'
  },
  {
    id: '10',
    name: 'Robe de soirée',
    slug: 'robe-de-soiree',
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 125000,
    rating: 4.7,
    reviews: 78,
    vendor: 'Evening Wear',
    category: 'Mode Femme',
    badge: 'Exclusif',
    badgeColor: 'bg-purple-500'
  },
  {
    id: '11',
    name: 'Baskets sport femme',
    slug: 'baskets-sport-femme',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 65000,
    rating: 4.5,
    reviews: 189,
    vendor: 'Sport Fashion',
    category: 'Chaussures'
  },
  {
    id: '12',
    name: 'Ceinture cuir homme',
    slug: 'ceinture-cuir-homme',
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 25000,
    rating: 4.3,
    reviews: 156,
    vendor: 'Leather Goods',
    category: 'Accessoires'
  }
];

const categories = [
  { name: 'Mode Femme', count: 2800, slug: 'mode-femme' },
  { name: 'Mode Homme', count: 2100, slug: 'mode-homme' },
  { name: 'Chaussures', count: 1650, slug: 'chaussures' },
  { name: 'Accessoires', count: 1200, slug: 'accessoires' },
  { name: 'Mode Enfant', count: 890, slug: 'mode-enfant' },
  { name: 'Sport & Fitness', count: 750, slug: 'sport-fitness' }
];

const brands = [
  { name: 'Nike', count: 450 },
  { name: 'Adidas', count: 380 },
  { name: 'Zara', count: 320 },
  { name: 'H&M', count: 290 },
  { name: 'Puma', count: 180 },
  { name: 'Gucci', count: 120 },
  { name: 'Louis Vuitton', count: 95 },
  { name: 'Chanel', count: 85 }
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = [
  { name: 'Noir', value: '#000000' },
  { name: 'Blanc', value: '#FFFFFF' },
  { name: 'Rouge', value: '#EF4444' },
  { name: 'Bleu', value: '#3B82F6' },
  { name: 'Vert', value: '#10B981' },
  { name: 'Rose', value: '#EC4899' },
  { name: 'Jaune', value: '#F59E0B' },
  { name: 'Gris', value: '#6B7280' }
];

export default function FashionPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 300000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
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
          <span className="text-gray-900 font-medium">Mode & Style</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mode & Style
          </h1>
          <p className="text-gray-600">
            Exprimez votre style unique avec nos collections tendance
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
                      max={300000}
                      step={5000}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Sizes */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Tailles</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSizes.includes(size) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          if (selectedSizes.includes(size)) {
                            setSelectedSizes(selectedSizes.filter(s => s !== size));
                          } else {
                            setSelectedSizes([...selectedSizes, size]);
                          }
                        }}
                        className="h-8"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Couleurs</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => {
                          if (selectedColors.includes(color.name)) {
                            setSelectedColors(selectedColors.filter(c => c !== color.name));
                          } else {
                            setSelectedColors([...selectedColors, color.name]);
                          }
                        }}
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColors.includes(color.name) 
                            ? 'border-beshop-primary' 
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
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
                  {fashionProducts.length} produits trouvés
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
              products={fashionProducts}
              backgroundColor="bg-transparent"
            />

            {/* Pagination */}
            <div className="flex items-center justify-center mt-12 space-x-2">
              <Button variant="outline" disabled>Précédent</Button>
              <Button className="bg-beshop-primary">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">...</Button>
              <Button variant="outline">8</Button>
              <Button variant="outline">Suivant</Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}