'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/home/ProductGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Flame, 
  Clock, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid3X3, 
  List,
  Search,
  Zap,
  TrendingDown,
  Users,
  ShoppingBag,
  Star,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Product } from '@/lib/services/products.service';
import { CategoriesService, Category } from '@/lib/services';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useHydration } from '@/hooks/useHydration';
import { useFeedback } from '@/components/ui/FeedbackProvider';
import { useAnalytics } from '@/hooks/useAnalytics';

interface FlashSaleProduct extends Product {
  flash_sale_price: number;
  discount_percentage: number;
  flash_sale_end: string;
  stock_remaining: number;
  is_flash_sale: boolean;
  sku?: string;
  track_quantity?: boolean;
  vendor_id?: string;
  featured?: boolean;
}

interface FlashSaleStats {
  total_products: number;
  total_discount: number;
  average_discount: number;
  time_remaining: string;
}

export default function FlashSalesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const isHydrated = useHydration();
  const { showSuccess, showError } = useFeedback();
  const { trackButtonClick } = useAnalytics();

  // États principaux
  const [products, setProducts] = useState<FlashSaleProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<FlashSaleStats | null>(null);

  // États des filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [discountRange, setDiscountRange] = useState<[number, number]>([0, 100]);
  const [sortBy, setSortBy] = useState('discount_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalCount, setTotalCount] = useState(0);

  // Charger les ventes flash
  const loadFlashSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Données mockées pour tester la page
      const mockProducts: FlashSaleProduct[] = [
        {
          id: '1',
          name: 'iPhone 15 Pro Max 256GB',
          slug: 'iphone-15-pro-max-256gb',
          images: ['/images/placeholder-product.jpg'],
          brand: 'Apple',
          price: 450000, // Prix flash
          compare_price: 650000, // Prix original
          flash_sale_price: 450000,
          discount_percentage: 31,
          flash_sale_end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
          stock_remaining: 5,
          is_flash_sale: true,
          average_rating: 4.8,
          quantity: 5,
          status: 'active',
          category: { id: '1', name: 'Électronique', slug: 'electronique' },
          description: 'iPhone 15 Pro Max avec puce A17 Pro',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Samsung Galaxy S24 Ultra 512GB',
          slug: 'samsung-galaxy-s24-ultra-512gb',
          images: ['/images/placeholder-product.jpg'],
          brand: 'Samsung',
          price: 380000,
          compare_price: 550000,
          flash_sale_price: 380000,
          discount_percentage: 31,
          flash_sale_end: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12h
          stock_remaining: 8,
          is_flash_sale: true,
          average_rating: 4.6,
          quantity: 8,
          status: 'active',
          category: { id: '1', name: 'Électronique', slug: 'electronique' },
          description: 'Samsung Galaxy S24 Ultra avec S Pen',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'MacBook Air M3 13" 256GB',
          slug: 'macbook-air-m3-13-256gb',
          images: ['/images/placeholder-product.jpg'],
          brand: 'Apple',
          price: 750000,
          compare_price: 950000,
          flash_sale_price: 750000,
          discount_percentage: 21,
          flash_sale_end: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6h
          stock_remaining: 3,
          is_flash_sale: true,
          average_rating: 4.9,
          quantity: 3,
          status: 'active',
          category: { id: '2', name: 'Informatique', slug: 'informatique' },
          description: 'MacBook Air M3 avec puce M3',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          name: 'AirPods Pro 2ème génération',
          slug: 'airpods-pro-2eme-generation',
          images: ['/images/placeholder-product.jpg'],
          brand: 'Apple',
          price: 85000,
          compare_price: 120000,
          flash_sale_price: 85000,
          discount_percentage: 29,
          flash_sale_end: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18h
          stock_remaining: 15,
          is_flash_sale: true,
          average_rating: 4.7,
          quantity: 15,
          status: 'active',
          category: { id: '3', name: 'Audio', slug: 'audio' },
          description: 'AirPods Pro avec réduction de bruit active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          name: 'Nike Air Max 270',
          slug: 'nike-air-max-270',
          images: ['/images/placeholder-product.jpg'],
          brand: 'Nike',
          price: 45000,
          compare_price: 75000,
          flash_sale_price: 45000,
          discount_percentage: 40,
          flash_sale_end: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8h
          stock_remaining: 12,
          is_flash_sale: true,
          average_rating: 4.5,
          quantity: 12,
          status: 'active',
          category: { id: '4', name: 'Mode', slug: 'mode' },
          description: 'Chaussures Nike Air Max 270 confortables',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setProducts(mockProducts);
      setTotalCount(mockProducts.length);
      
      // Calculer les statistiques
      calculateStats(mockProducts);

      // Essayer aussi de charger les vraies données en arrière-plan
      try {
        const response = await fetch('/api/flash-sales?status=active&limit=100');
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data && data.data.length > 0) {
            // L'API retourne des flash sales avec des produits imbriqués
            const flashSaleProducts: FlashSaleProduct[] = [];
            
            data.data.forEach((sale: any) => {
              if (sale.products && sale.products.length > 0) {
                sale.products.forEach((fsp: any) => {
                  if (fsp.product) {
                    flashSaleProducts.push({
                      ...fsp.product,
                      flash_sale_price: fsp.flash_price,
                      discount_percentage: Math.round(((fsp.original_price - fsp.flash_price) / fsp.original_price) * 100),
                      flash_sale_end: sale.end_date,
                      stock_remaining: fsp.max_quantity || 999,
                      is_flash_sale: true,
                      price: fsp.flash_price, // Prix de vente flash
                      compare_price: fsp.original_price // Prix original
                    });
                  }
                });
              }
            });

            if (flashSaleProducts.length > 0) {
              setProducts(flashSaleProducts);
              setTotalCount(flashSaleProducts.length);
              calculateStats(flashSaleProducts);
            }
          }
        }
      } catch (apiError) {
        console.log('API flash-sales non disponible, utilisation des données mockées');
      }
    } catch (err) {
      console.error('Error loading flash sales:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les catégories
  const loadCategories = useCallback(async () => {
    try {
      const response = await CategoriesService.getAll();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);

  // Charger les données initiales
  useEffect(() => {
    if (isHydrated) {
      loadFlashSales();
      loadCategories();
    }
  }, [isHydrated, loadFlashSales, loadCategories]);

  // Calculer les statistiques
  const calculateStats = (products: FlashSaleProduct[]) => {
    const totalProducts = products.length;
    const totalDiscount = products.reduce((sum, product) => 
      sum + ((product.compare_price || product.price) - product.price), 0
    );
    const averageDiscount = totalProducts > 0 ? totalDiscount / totalProducts : 0;
    
    // Trouver la fin de vente la plus proche
    const endTimes = products.map(p => new Date(p.flash_sale_end).getTime());
    const nearestEnd = Math.min(...endTimes);
    const timeRemaining = nearestEnd - new Date().getTime();
    
    setStats({
      total_products: totalProducts,
      total_discount: totalDiscount,
      average_discount: averageDiscount,
      time_remaining: timeRemaining > 0 ? formatTimeRemaining(timeRemaining) : 'Terminé'
    });
  };

  // Formater le temps restant
  const formatTimeRemaining = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Filtrer et trier les produits
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Recherche par nom
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filtre par catégorie
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category?.id || '')) {
        return false;
      }

      // Filtre par prix
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // Filtre par réduction
      if (product.discount_percentage < discountRange[0] || product.discount_percentage > discountRange[1]) {
        return false;
      }

      return true;
    });

    // Trier les produits
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'discount_asc':
          return a.discount_percentage - b.discount_percentage;
        case 'discount_desc':
          return b.discount_percentage - a.discount_percentage;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'rating_desc':
          return (b.average_rating || 0) - (a.average_rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategories, priceRange, discountRange, sortBy]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  // Gestion des filtres
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
    setCurrentPage(1);
  };

  const handleDiscountRangeChange = (value: number[]) => {
    setDiscountRange([value[0], value[1]]);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange([0, 1000000]);
    setDiscountRange([0, 100]);
    setSortBy('discount_desc');
    setCurrentPage(1);
  };

  // Ajouter au panier
  const handleAddToCart = async (product: FlashSaleProduct) => {
    try {
      await addToCart(
        product.id,
        product.name,
        product.price,
        1,
        product.images?.[0]
      );
      showSuccess('Produit ajouté au panier !');
      trackButtonClick('add-to-cart', 'flash-sales');
    } catch (err) {
      showError('Erreur lors de l\'ajout au panier');
    }
  };

  // Retry en cas d'erreur
  const handleRetry = () => {
    loadFlashSales();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <CategoryMenu />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-2 text-lg">Chargement des ventes flash...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <CategoryMenu />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRetry} className="bg-orange-500 hover:bg-orange-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryMenu />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 via-orange-600 to-red-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Flame className="w-12 h-12 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold">VENTES FLASH</h1>
            </div>
            <p className="text-xl md:text-2xl text-orange-100 mb-6">
              Jusqu'à 80% de réduction sur des milliers de produits !
            </p>
            
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.total_products}</div>
                  <div className="text-sm text-orange-100">Produits</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold">{Math.round(stats.average_discount)}%</div>
                  <div className="text-sm text-orange-100">Réduction moy.</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold flex items-center justify-center">
                    <Clock className="w-6 h-6 mr-1" />
                    {stats.time_remaining}
                  </div>
                  <div className="text-sm text-orange-100">Temps restant</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('fr-BJ', {
                      style: 'currency',
                      currency: 'XOF',
                      minimumFractionDigits: 0,
                    }).format(stats.total_discount)}
                  </div>
                  <div className="text-sm text-orange-100">Économies</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filtres et tri */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher dans les ventes flash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Boutons de contrôle */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtres
              </Button>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount_desc">Plus de réduction</SelectItem>
                  <SelectItem value="discount_asc">Moins de réduction</SelectItem>
                  <SelectItem value="price_asc">Prix croissant</SelectItem>
                  <SelectItem value="price_desc">Prix décroissant</SelectItem>
                  <SelectItem value="name_asc">Nom A-Z</SelectItem>
                  <SelectItem value="name_desc">Nom Z-A</SelectItem>
                  <SelectItem value="rating_desc">Mieux notés</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
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

          {/* Filtres avancés */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Catégories */}
                <div>
                  <h3 className="font-semibold mb-3">Catégories</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                        />
                        <label htmlFor={category.id} className="text-sm">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prix */}
                <div>
                  <h3 className="font-semibold mb-3">Prix (FCFA)</h3>
                  <div className="space-y-4">
                    <Slider
                      value={priceRange}
                      onValueChange={handlePriceRangeChange}
                      max={1000000}
                      min={0}
                      step={1000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{priceRange[0].toLocaleString()} F</span>
                      <span>{priceRange[1].toLocaleString()} F</span>
                    </div>
                  </div>
                </div>

                {/* Réduction */}
                <div>
                  <h3 className="font-semibold mb-3">Réduction (%)</h3>
                  <div className="space-y-4">
                    <Slider
                      value={discountRange}
                      onValueChange={handleDiscountRangeChange}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{discountRange[0]}%</span>
                      <span>{discountRange[1]}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={clearFilters}>
                  Effacer les filtres
                </Button>
                <div className="text-sm text-gray-600">
                  {filteredAndSortedProducts.length} produit(s) trouvé(s)
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Résultats */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {paginatedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos filtres ou votre recherche
              </p>
              <Button onClick={clearFilters} variant="outline">
                Effacer les filtres
              </Button>
            </div>
          ) : (
            <>
              {/* Grille des produits */}
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {paginatedProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                    <div className="relative">
                      <div className="aspect-square relative overflow-hidden rounded-t-lg">
                        <Image
                          src={product.images?.[0] || '/images/placeholder-product.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <Badge className="bg-red-500 text-white font-bold">
                            -{product.discount_percentage}%
                          </Badge>
                          <Badge variant="secondary" className="bg-orange-500 text-white">
                            <Clock className="w-3 h-3 mr-1" />
                            Flash
                          </Badge>
                        </div>

                        {/* Stock limité */}
                        {product.stock_remaining < 10 && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="destructive" className="text-xs">
                              Stock limité
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {product.name}
                        </h3>

                        {/* Prix */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-red-600">
                            {new Intl.NumberFormat('fr-BJ', {
                              style: 'currency',
                              currency: 'XOF',
                              minimumFractionDigits: 0,
                            }).format(product.price)}
                          </span>
                          <span className="text-lg text-gray-500 line-through">
                            {new Intl.NumberFormat('fr-BJ', {
                              style: 'currency',
                              currency: 'XOF',
                              minimumFractionDigits: 0,
                            }).format(product.compare_price || product.price)}
                          </span>
                        </div>

                        {/* Économies */}
                        <div className="text-sm text-green-600 font-medium mb-3">
                          Économisez {new Intl.NumberFormat('fr-BJ', {
                            style: 'currency',
                            currency: 'XOF',
                            minimumFractionDigits: 0,
                          }).format((product.compare_price || product.price) - product.price)}
                        </div>

                        {/* Stock restant */}
                        {product.stock_remaining < 20 && (
                          <div className="text-sm text-orange-600 mb-3">
                            Plus que {product.stock_remaining} en stock !
                          </div>
                        )}

                        {/* Bouton d'ajout */}
                        <Button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                          disabled={product.stock_remaining === 0}
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          {product.stock_remaining === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}