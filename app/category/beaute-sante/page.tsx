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

const beautyHealthProducts = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
    name: 'Shampooing réparateur',
    slug: 'shampooing-reparateur',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 25000,
    rating: 4.4,
    reviews: 89,
    vendor: 'Hair Care',
    category: 'Soins cheveux'
  },
  {
    id: '5',
    name: 'Sérum vitamine C',
    slug: 'serum-vitamine-c',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 45000,
    comparePrice: 55000,
    rating: 4.8,
    reviews: 267,
    discount: 18,
    vendor: 'Vitamin Skin',
    category: 'Soins visage',
    badge: 'Bestseller',
    badgeColor: 'bg-green-500'
  },
  {
    id: '6',
    name: 'Rouge à lèvres mat',
    slug: 'rouge-levres-mat',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 18000,
    rating: 4.5,
    reviews: 345,
    vendor: 'Lip Beauty',
    category: 'Maquillage'
  },
  {
    id: '7',
    name: 'Huile essentielle lavande',
    slug: 'huile-essentielle-lavande',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 35000,
    rating: 4.6,
    reviews: 123,
    vendor: 'Natural Oils',
    category: 'Aromathérapie'
  },
  {
    id: '8',
    name: 'Masque hydratant visage',
    slug: 'masque-hydratant-visage',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 28000,
    comparePrice: 35000,
    rating: 4.4,
    reviews: 189,
    discount: 20,
    vendor: 'Face Care',
    category: 'Soins visage'
  },
  {
    id: '9',
    name: 'Parfum homme Dior Sauvage',
    slug: 'parfum-homme-dior-sauvage',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 95000,
    rating: 4.8,
    reviews: 456,
    vendor: 'Dior Official',
    category: 'Parfums'
  },
  {
    id: '10',
    name: 'Brosse nettoyante visage',
    slug: 'brosse-nettoyante-visage',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 55000,
    comparePrice: 70000,
    rating: 4.5,
    reviews: 234,
    discount: 21,
    vendor: 'Clean Beauty',
    category: 'Accessoires beauté',
    badge: 'Nouveau',
    badgeColor: 'bg-blue-500'
  },
  {
    id: '11',
    name: 'Fond de teint longue tenue',
    slug: 'fond-teint-longue-tenue',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 42000,
    rating: 4.6,
    reviews: 312,
    vendor: 'Foundation Pro',
    category: 'Maquillage'
  },
  {
    id: '12',
    name: 'Complément alimentaire beauté',
    slug: 'complement-alimentaire-beaute',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 38000,
    rating: 4.3,
    reviews: 167,
    vendor: 'Beauty Nutrition',
    category: 'Compléments'
  }
];

const categories = [
  { name: 'Parfums', count: 1640, slug: 'parfums' },
  { name: 'Maquillage', count: 2100, slug: 'maquillage' },
  { name: 'Soins visage', count: 1850, slug: 'soins-visage' },
  { name: 'Soins cheveux', count: 1200, slug: 'soins-cheveux' },
  { name: 'Soins corps', count: 890, slug: 'soins-corps' },
  { name: 'Compléments', count: 650, slug: 'complements' }
];

const brands = [
  { name: 'Chanel', count: 180 },
  { name: 'Dior', count: 150 },
  { name: 'L\'Oréal', count: 320 },
  { name: 'Maybelline', count: 280 },
  { name: 'Nivea', count: 240 },
  { name: 'Garnier', count: 200 },
  { name: 'Clinique', count: 120 },
  { name: 'Lancôme', count: 95 }
];

const skinTypes = [
  'Peau normale',
  'Peau sèche',
  'Peau grasse',
  'Peau mixte',
  'Peau sensible',
  'Peau mature'
];

const concerns = [
  'Anti-âge',
  'Hydratation',
  'Acné',
  'Taches pigmentaires',
  'Rides',
  'Pores dilatés',
  'Rougeurs',
  'Éclat du teint'
];

export default function BeautyHealthPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
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
          <span className="text-gray-900 font-medium">Beauté & Santé</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Beauté & Santé
          </h1>
          <p className="text-gray-600">
            Prenez soin de vous avec nos produits de qualité
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
                      max={150000}
                      step={5000}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Skin Types */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Type de peau</h4>
                  <div className="space-y-2">
                    {skinTypes.map((skinType) => (
                      <div key={skinType} className="flex items-center space-x-2">
                        <Checkbox 
                          id={skinType}
                          checked={selectedSkinTypes.includes(skinType)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSkinTypes([...selectedSkinTypes, skinType]);
                            } else {
                              setSelectedSkinTypes(selectedSkinTypes.filter(s => s !== skinType));
                            }
                          }}
                        />
                        <label htmlFor={skinType} className="text-sm flex-1 cursor-pointer">
                          {skinType}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Concerns */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Préoccupations</h4>
                  <div className="space-y-2">
                    {concerns.map((concern) => (
                      <div key={concern} className="flex items-center space-x-2">
                        <Checkbox 
                          id={concern}
                          checked={selectedConcerns.includes(concern)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedConcerns([...selectedConcerns, concern]);
                            } else {
                              setSelectedConcerns(selectedConcerns.filter(c => c !== concern));
                            }
                          }}
                        />
                        <label htmlFor={concern} className="text-sm flex-1 cursor-pointer">
                          {concern}
                        </label>
                      </div>
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
                  {beautyHealthProducts.length} produits trouvés
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
              products={beautyHealthProducts}
              backgroundColor="bg-transparent"
            />

            {/* Pagination */}
            <div className="flex items-center justify-center mt-12 space-x-2">
              <Button variant="outline" disabled>Précédent</Button>
              <Button className="bg-beshop-primary">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">...</Button>
              <Button variant="outline">5</Button>
              <Button variant="outline">Suivant</Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}