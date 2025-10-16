'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown, 
  Grid3X3, 
  Smartphone, 
  Shirt, 
  Home, 
  Sparkles, 
  Dumbbell, 
  ShoppingBag, 
  RefreshCw, 
  AlertCircle, 
  Search,
  TrendingUp,
  Star,
  Clock,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { CategoriesService, Category } from '@/lib/services/categories.service';
// import { useToast } from '@/components/admin/Toast';

// Icon mapping for categories
const categoryIcons: Record<string, React.ComponentType<any>> = {
  'electronique': Smartphone,
  'mode': Shirt,
  'maison-jardin': Home,
  'beaute-sante': Sparkles,
  'sport-loisirs': Dumbbell,
  'alimentation': ShoppingBag,
  'default': Grid3X3
};

// Cache configuration
const CACHE_KEY = 'categories_menu_v2';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

interface CachedCategories {
  data: Category[];
  timestamp: number;
  version: string;
}

interface CategoryMenuState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  retryCount: number;
  lastFetch: number;
}

const ImprovedCategoryMenu = () => {
  const pathname = usePathname();
  // const { success, error: showError } = useToast();
  
  const [state, setState] = useState<CategoryMenuState>({
    categories: [],
    loading: true,
    error: null,
    retryCount: 0,
    lastFetch: 0
  });
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Get icon for category
  const getCategoryIcon = useCallback((slug: string) => {
    return categoryIcons[slug] || categoryIcons['default'];
  }, []);

  // Enhanced cache functions with error handling
  const getCachedCategories = useCallback((): Category[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsedCache: CachedCategories = JSON.parse(cached);
        const isExpired = Date.now() - parsedCache.timestamp > CACHE_TTL;
        const isOldVersion = parsedCache.version !== '2.0';
        
        if (!isExpired && !isOldVersion) {
          return parsedCache.data;
        }
      }
    } catch (error) {
      console.warn('Error reading categories cache:', error);
      // Clear corrupted cache
      localStorage.removeItem(CACHE_KEY);
    }
    return null;
  }, []);

  const setCachedCategories = useCallback((data: Category[]) => {
    try {
      const cacheData: CachedCategories = {
        data,
        timestamp: Date.now(),
        version: '2.0'
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error saving categories to cache:', error);
    }
  }, []);

  // Enhanced load categories with retry logic
  const loadCategories = useCallback(async (isRetry = false) => {
    try {
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null 
      }));

      // Check cache first (only on initial load)
      if (!isRetry) {
        const cachedCategories = getCachedCategories();
        if (cachedCategories && cachedCategories.length > 0) {
          setState(prev => ({
            ...prev,
            categories: cachedCategories,
            loading: false,
            lastFetch: Date.now()
          }));
          return;
        }
      }

      const response = await CategoriesService.getCategoryTree();
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          categories: response.data || [],
          loading: false,
          error: null,
          retryCount: 0,
          lastFetch: Date.now()
        }));
        setCachedCategories(response.data);
        // success('Catégories chargées', 'Menu des catégories mis à jour');
      } else {
        throw new Error(response.error || 'Erreur lors du chargement des catégories');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors du chargement des catégories:', error);
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
        retryCount: prev.retryCount + 1
      }));

      // showError('Erreur de chargement', errorMessage);

      // Auto retry logic
      if (state.retryCount < RETRY_ATTEMPTS) {
        setTimeout(() => {
          loadCategories(true);
        }, RETRY_DELAY * Math.pow(2, state.retryCount)); // Exponential backoff
      }
    }
  }, [getCachedCategories, setCachedCategories, state.retryCount]);

  // Debounced scroll handler
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolled(window.scrollY > 100);
      }, 10);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return state.categories;
    
    const query = searchQuery.toLowerCase();
    return state.categories.filter(category => 
      category.name.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query) ||
      category.children?.some(child => 
        child.name.toLowerCase().includes(query) ||
        child.children?.some(grandchild => 
          grandchild.name.toLowerCase().includes(query)
        )
      )
    );
  }, [state.categories, searchQuery]);

  const topLevelCategories = useMemo(() => 
    filteredCategories.slice(0, 12), 
    [filteredCategories]
  );

  // Get current category from pathname
  const currentCategory = useMemo(() => {
    const pathSegments = pathname.split('/');
    const categorySlug = pathSegments[pathSegments.length - 1];
    return state.categories.find(cat => cat.slug === categorySlug);
  }, [pathname, state.categories]);

  // Loading state with better skeleton
  if (state.loading) {
    return (
      <div className={`bg-white border-b transition-all duration-300 z-40 ${
        isScrolled ? 'fixed top-0 left-0 right-0 py-2 shadow-md' : 'category-menu-offset py-3'
      }`}>
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-200 animate-pulse rounded-lg px-6 py-2 h-10 w-48"></div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-lg px-4 py-2 h-10 w-32"></div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 animate-pulse rounded-full w-8 h-8"></div>
              <div className="bg-gray-100 animate-pulse rounded-full w-8 h-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (state.error) {
    return (
      <div className={`bg-red-50 border-b border-red-200 transition-all duration-300 z-40 ${
        isScrolled ? 'fixed top-0 left-0 right-0 py-2 shadow-md' : 'category-menu-offset py-3'
      }`}>
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <span className="text-red-800 font-medium">Erreur de chargement des catégories</span>
                <p className="text-red-600 text-sm">Tentative {state.retryCount}/{RETRY_ATTEMPTS}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadCategories(true)}
                className="text-red-600 border-red-300 hover:bg-red-50"
                disabled={state.retryCount >= RETRY_ATTEMPTS}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
              {state.retryCount >= RETRY_ATTEMPTS && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-red-600 hover:bg-red-50"
                >
                  Recharger la page
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-b transition-all duration-300 z-40 ${
      isScrolled ? 'fixed top-0 left-0 right-0 py-2 shadow-lg' : 'category-menu-offset py-3'
    }`}>
      <div className="container">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile drawer trigger */}
            <div className="md:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button 
                    aria-label="Ouvrir les catégories" 
                    className="bg-jomionstore-primary text-white h-9 px-3 hover:bg-orange-700 transition-colors"
                  >
                    <Grid3X3 className="w-4 h-4 mr-2" /> 
                    Catégories
                    {state.categories.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                        {state.categories.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[88vw] sm:w-[420px] p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                      <Grid3X3 className="w-5 h-5" />
                      Parcourir les catégories
                    </SheetTitle>
                  </SheetHeader>
                  
                  {/* Search in mobile */}
                  <div className="p-4 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Rechercher une catégorie..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <nav className="p-4 space-y-3 max-h-[60vh] overflow-y-auto" role="navigation" aria-label="Catégories">
                    {topLevelCategories.map((category) => {
                      const Icon = getCategoryIcon(category.slug);
                      const isActive = currentCategory?.id === category.id;
                      
                      return (
                        <div key={category.id} className="space-y-2">
                          <Link
                            href={`/category/${category.slug}`}
                            className={`flex items-center justify-between py-3 px-3 rounded-lg transition-colors ${
                              isActive 
                                ? 'bg-jomionstore-primary text-white' 
                                : 'hover:bg-gray-100 text-gray-900'
                            }`}
                            onClick={() => setOpen(false)}
                          >
                            <span className="flex items-center gap-3 font-medium">
                              <Icon className="w-5 h-5" /> 
                              {category.name}
                            </span>
                            {category.children && category.children.length > 0 && (
                              <ChevronDown className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'} rotate-[-90deg]`} />
                            )}
                          </Link>
                          
                          {category.children && category.children.length > 0 && (
                            <ul className="pl-8 space-y-1">
                              {category.children.slice(0, 6).map((child) => (
                                <li key={child.id}>
                                  <Link
                                    href={`/category/${child.slug}`}
                                    className="block py-2 text-sm text-gray-600 hover:text-jomionstore-primary transition-colors"
                                    onClick={() => setOpen(false)}
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:block flex-1 min-w-0">
              <div className="bg-white rounded-xl border shadow-sm px-3 py-2">
                <NavigationMenu>
                  <NavigationMenuList className="flex flex-nowrap gap-1 overflow-x-auto no-scrollbar">
                    {/* All Categories Button */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="bg-jomionstore-primary text-white hover:bg-orange-700 px-5 py-2 h-auto rounded-md transition-colors">
                        <Grid3X3 className="w-4 h-4 mr-2" />
                        Toutes les catégories
                        {state.categories.length > 0 && (
                          <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                            {state.categories.length}
                          </Badge>
                        )}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid grid-cols-3 gap-6 p-6 w-[800px]">
                          {state.categories.map((category) => {
                            const IconComponent = getCategoryIcon(category.slug);
                            const isActive = currentCategory?.id === category.id;
                            
                            return (
                              <div key={category.id} className="space-y-3">
                                <Link
                                  href={`/category/${category.slug}`}
                                  className={`flex items-center space-x-2 font-semibold transition-colors ${
                                    isActive 
                                      ? 'text-jomionstore-primary' 
                                      : 'text-gray-700 hover:text-jomionstore-primary'
                                  }`}
                                >
                                  <IconComponent className="w-5 h-5" />
                                  <span>{category.name}</span>
                                  {isActive && <Star className="w-4 h-4 text-yellow-500" />}
                                </Link>
                                <div className="space-y-2">
                                  {category.children?.slice(0, 6).map((child) => (
                                    <div key={child.slug}>
                                      <Link
                                        href={`/category/${child.slug}`}
                                        className="block font-medium text-gray-700 hover:text-jomionstore-primary transition-colors"
                                      >
                                        {child.name}
                                      </Link>
                                      {child.children && child.children.length > 0 && (
                                        <ul className="ml-2 mt-1 space-y-1">
                                          {child.children.slice(0, 4).map((grandchild) => (
                                            <li key={grandchild.id}>
                                              <Link
                                                href={`/category/${grandchild.slug}`}
                                                className="text-sm text-gray-500 hover:text-jomionstore-secondary transition-colors"
                                              >
                                                {grandchild.name}
                                              </Link>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Individual Category Links */}
                    {topLevelCategories.slice(0, 8).map((category) => {
                      const IconComponent = getCategoryIcon(category.slug);
                      const isActive = currentCategory?.id === category.id;
                      
                      return (
                        <NavigationMenuItem key={category.id}>
                          <NavigationMenuTrigger 
                            className={`px-4 py-2 h-auto rounded-md transition-all ${
                              isActive
                                ? 'bg-jomionstore-primary text-white border-jomionstore-primary'
                                : 'text-gray-700 hover:text-jomionstore-primary bg-transparent border border-transparent hover:border-jomionstore-primary/20'
                            }`}
                            onMouseEnter={() => setHoveredCategory(category.id)}
                            onMouseLeave={() => setHoveredCategory(null)}
                          >
                            <IconComponent className="w-4 h-4 mr-2" />
                            {category.name}
                            {isActive && <Star className="w-3 h-3 ml-1" />}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <div className="grid grid-cols-2 gap-5 p-5 w-[520px]">
                              {category.children?.slice(0, 8).map((child) => (
                                <div key={child.slug} className="space-y-2">
                                  <Link
                                    href={`/category/${child.slug}`}
                                    className="block font-semibold text-jomionstore-primary hover:text-orange-800 transition-colors"
                                  >
                                    {child.name}
                                  </Link>
                                  {child.children && child.children.length > 0 && (
                                    <ul className="space-y-1">
                                      {child.children.slice(0, 5).map((grandchild) => (
                                        <li key={grandchild.id}>
                                          <Link
                                            href={`/category/${grandchild.slug}`}
                                            className="text-sm text-gray-600 hover:text-jomionstore-secondary transition-colors"
                                          >
                                            {grandchild.name}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      );
                    })}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>
          </div>

          {/* Right side - Quick actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-jomionstore-primary"
              title="Produits tendance"
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-jomionstore-primary"
              title="Nouveautés"
            >
              <Clock className="w-4 h-4" />
            </Button>
            {state.lastFetch > 0 && (
              <div className="text-xs text-gray-500">
                Mis à jour il y a {Math.floor((Date.now() - state.lastFetch) / 60000)}min
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedCategoryMenu;