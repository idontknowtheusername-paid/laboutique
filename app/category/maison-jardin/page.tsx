'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/home/ProductGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Grid, List, Star } from 'lucide-react';

const homeGardenProducts = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
  },
  {
    id: '5',
    name: 'Lit double avec matelas',
    slug: 'lit-double-avec-matelas',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 220000,
    comparePrice: 280000,
    rating: 4.6,
    reviews: 134,
    discount: 21,
    vendor: 'Sleep Comfort',
    category: 'Mobilier',
    badge: 'Promo',
    badgeColor: 'bg-red-500'
  },
  {
    id: '6',
    name: 'Micro-ondes Panasonic',
    slug: 'micro-ondes-panasonic',
    image: 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 85000,
    rating: 4.3,
    reviews: 89,
    vendor: 'Panasonic Home',
    category: 'Électroménager'
  },
  {
    id: '7',
    name: 'Armoire 3 portes',
    slug: 'armoire-3-portes',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 150000,
    rating: 4.4,
    reviews: 76,
    vendor: 'Storage Solutions',
    category: 'Mobilier'
  },
  {
    id: '8',
    name: 'Aspirateur robot Roomba',
    slug: 'aspirateur-robot-roomba',
    image: 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 195000,
    comparePrice: 240000,
    rating: 4.8,
    reviews: 156,
    discount: 19,
    vendor: 'iRobot',
    category: 'Électroménager',
    badge: 'Nouveau',
    badgeColor: 'bg-blue-500'
  },
  {
    id: '9',
    name: 'Ensemble salon de jardin',
    slug: 'ensemble-salon-jardin',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 320000,
    rating: 4.5,
    reviews: 92,
    vendor: 'Garden Style',
    category: 'Jardin'
  },
  {
    id: '10',
    name: 'Climatiseur split 12000 BTU',
    slug: 'climatiseur-split-12000-btu',
    image: 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 280000,
    comparePrice: 320000,
    rating: 4.6,
    reviews: 123,
    discount: 13,
    vendor: 'Cool Air',
    category: 'Électroménager'
  },
  {
    id: '11',
    name: 'Bibliothèque 5 étagères',
    slug: 'bibliotheque-5-etageres',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 95000,
    rating: 4.3,
    reviews: 67,
    vendor: 'Book Storage',
    category: 'Mobilier'
  },
  {
    id: '12',
    name: 'Lave-vaisselle Bosch',
    slug: 'lave-vaisselle-bosch',
    image: 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 380000,
    comparePrice: 450000,
    rating: 4.7,
    reviews: 98,
    discount: 16,
    vendor: 'Bosch Home',
    category: 'Électroménager'
  }
];

const categories = [
  { name: 'Mobilier', count: 2100, slug: 'mobilier' },
  { name: 'Électroménager', count: 1850, slug: 'electromenager' },
  { name: 'Décoration', count: 1200, slug: 'decoration' },
  { name: 'Jardin', count: 890, slug: 'jardin' },
  { name: 'Éclairage', count: 650, slug: 'eclairage' },
  { name: 'Textile maison', count: 580, slug: 'textile-maison' }
];

const brands = [
  { name: 'Samsung', count: 320 },
  { name: 'LG', count: 280 },
  { name: 'Bosch', count: 240 },
  { name: 'Panasonic', count: 180 },
  { name: 'Whirlpool', count: 160 },
  { name: 'IKEA', count: 450 },
  { name: 'HomeDecor', count: 380 },
  { name: 'Garden Style', count: 120 }
];

const rooms = [
  'Salon',
  'Chambre',
  'Cuisine',
  'Salle de bain',
  'Bureau',
  'Jardin',
  'Terrasse',
  'Garage'
];

export default function HomeGardenPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
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
          <a href="/" className="hover:text-beshop-primary">Accueil</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">Maison & Jardin</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Maison & Jardin
          </h1>
          <p className="text-gray-600">
            Tout pour embellir et équiper votre maison
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
                      max={500000}
                      step={10000}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Rooms */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Pièces</h4>
                  <div className="space-y-2">
                    {rooms.map((room) => (
                      <div key={room} className="flex items-center space-x-2">
                        <Checkbox 
                          id={room}
                          checked={selectedRooms.includes(room)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRooms([...selectedRooms, room]);
                            } else {
                              setSelectedRooms(selectedRooms.filter(r => r !== room));
                            }
                          }}
                        />
                        <label htmlFor={room} className="text-sm flex-1 cursor-pointer">
                          {room}
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
                  {homeGardenProducts.length} produits trouvés
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
            <ProductGrid products={homeGardenProducts} columns={viewMode === 'grid' ? 3 : 1} />

            {/* Pagination */}
            <div className="flex items-center justify-center mt-12 space-x-2">
              <Button variant="outline" disabled>Précédent</Button>
              <Button className="bg-beshop-primary">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">...</Button>
              <Button variant="outline">6</Button>
              <Button variant="outline">Suivant</Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}