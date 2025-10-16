'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, Grid3X3, Smartphone, Shirt, Home, Sparkles, Dumbbell, ShoppingBag, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { CategoriesService, Category } from '@/lib/services/categories.service';
import { ProductSkeleton } from '@/components/ui/loading-skeleton';

// Icon mapping for categories
const categoryIcons: Record<string, React.ComponentType<any>> = {
  'electronique': Smartphone,
  'mode': Shirt,
  'maison-jardin': Home,
  'beaute-sante': Sparkles,
  'sport-loisirs': Dumbbell,
  'alimentation': ShoppingBag,
  'mobilier': Home,
  'electromenager': Smartphone,
  'decoration': Sparkles,
  'jardin': Home,
  'eclairage': Sparkles,
  'textile-maison': Shirt,
  // Default fallback
  'default': Grid3X3
};

// Cache for categories
const CACHE_KEY = 'categories_menu';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface CachedCategories {
  data: Category[];
  timestamp: number;
}

const CategoryMenu = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Get icon for category
  const getCategoryIcon = (slug: string) => {
    return categoryIcons[slug] || categoryIcons['default'];
  };

  // Cache functions
  const getCachedCategories = useCallback((): Category[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsedCache: CachedCategories = JSON.parse(cached);
        const isExpired = Date.now() - parsedCache.timestamp > CACHE_TTL;
        if (!isExpired) {
          return parsedCache.data;
        }
      }
    } catch (error) {
      console.warn('Error reading categories cache:', error);
    }
    return null;
  }, []);

  const setCachedCategories = useCallback((data: Category[]) => {
    try {
      const cacheData: CachedCategories = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error saving categories to cache:', error);
    }
  }, []);

  // Load categories from backend
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedCategories = getCachedCategories();
      if (cachedCategories) {
        setCategories(cachedCategories);
        setLoading(false);
        return;
      }

      const response = await CategoriesService.getCategoryTree();
      if (response.success && response.data) {
        setCategories(response.data);
        setCachedCategories(response.data);
      } else {
        throw new Error(response.error || 'Erreur lors du chargement des catégories');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [getCachedCategories, setCachedCategories]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const topLevelCategories = useMemo(() => categories.slice(0, 12), [categories]);

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white border-b transition-all duration-300 z-40 ${
        isScrolled ? 'fixed top-0 left-0 right-0 py-2 shadow-md' : 'category-menu-offset py-3'
      }`}>
        <div className="container">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-200 animate-pulse rounded px-6 py-2 h-10 w-48"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded px-4 py-2 h-10 w-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white border-b transition-all duration-300 z-40 ${
        isScrolled ? 'fixed top-0 left-0 right-0 py-2 shadow-md' : 'category-menu-offset py-3'
      }`}>
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Erreur de chargement des catégories</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadCategories}
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 border-b transition-all duration-300 z-40 ${
      isScrolled ? 'fixed top-0 left-0 right-0 py-1.5 shadow-md' : 'category-menu-offset py-2'
    }`}>
      <div className="container">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile drawer trigger */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button aria-label="Ouvrir les catégories" className="bg-jomionstore-primary text-white h-9 px-3">
                  <Grid3X3 className="w-4 h-4 mr-2" /> Catégories
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] sm:w-[420px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Parcourir les catégories</SheetTitle>
                </SheetHeader>
                <nav className="p-4 space-y-3" role="navigation" aria-label="Catégories">
                  {topLevelCategories.map((category) => {
                    const Icon = getCategoryIcon(category.slug);
                    return (
                      <div key={category.id} className="">
                        <Link
                          href={`/category/${category.slug}`}
                          className="flex items-center justify-between py-2.5 hover:bg-gray-50 rounded-md px-2 -mx-2"
                          onClick={() => setOpen(false)}
                        >
                          <span className="flex items-center gap-2 font-medium text-gray-900">
                            <Icon className="w-4 h-4" /> {category.name}
                            {category.children && category.children.length > 0 && (
                              <span className="text-xs bg-jomionstore-primary/10 text-jomionstore-primary px-2 py-0.5 rounded-full">
                                {category.children.length}
                              </span>
                            )}
                          </span>
                          {category.children && category.children.length > 0 && (
                            <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                          )}
                        </Link>
                        {category.children && category.children.length > 0 && (
                          <div className="pl-6 pb-2 space-y-1 border-l-2 border-gray-100 ml-2">
                            {category.children.slice(0, 6).map((child) => (
                              <div key={child.id} className="py-1">
                                <Link
                                  href={`/category/${child.slug}`}
                                  className="block text-sm text-gray-600 hover:text-jomionstore-primary transition-colors"
                                  onClick={() => setOpen(false)}
                                >
                                  {child.name}
                                </Link>
                                {child.children && child.children.length > 0 && (
                                  <div className="ml-4 mt-1 space-y-1">
                                    {child.children.slice(0, 3).map((grandchild) => (
                                      <Link
                                        key={grandchild.id}
                                        href={`/category/${grandchild.slug}`}
                                        className="block text-xs text-gray-500 hover:text-jomionstore-secondary transition-colors"
                                        onClick={() => setOpen(false)}
                                      >
                                        {grandchild.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
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
              <NavigationMenuTrigger className="bg-jomionstore-primary text-white hover:bg-orange-700 px-5 py-2 h-auto rounded-md">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Toutes les catégories
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid grid-cols-3 gap-6 p-6 w-[800px]">
                  {categories.map((category) => {
                    const IconComponent = getCategoryIcon(category.slug);
                    return (
                      <div key={category.id} className="space-y-3">
                        <Link
                          href={`/category/${category.slug}`}
                          className="flex items-center space-x-2 font-semibold text-jomionstore-primary hover:text-orange-800"
                        >
                          <IconComponent className="w-5 h-5" />
                          <span>{category.name}</span>
                        </Link>
                        <div className="space-y-2">
                          {category.children?.map((child) => (
                            <div key={child.slug} className="space-y-1">
                              <Link
                                href={`/category/${child.slug}`}
                                className="block font-medium text-gray-700 hover:text-jomionstore-primary transition-colors py-1"
                              >
                                {child.name}
                              </Link>
                              {child.children && child.children.length > 0 && (
                                <div className="ml-3 space-y-1 border-l border-gray-200 pl-3">
                                  {child.children.slice(0, 4).map((grandchild) => (
                                    <div key={grandchild.id}>
                                      <Link
                                        href={`/category/${grandchild.slug}`}
                                        className="text-sm text-gray-500 hover:text-jomionstore-secondary transition-colors block py-0.5"
                                      >
                                        {grandchild.name}
                                      </Link>
                                    </div>
                                  ))}
                                </div>
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
              return (
                <NavigationMenuItem key={category.id}>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-jomionstore-primary px-4 py-2 h-auto bg-transparent rounded-md border border-transparent hover:border-jomionstore-primary/20">
                    <IconComponent className="w-4 h-4 mr-2" />
                    {category.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid grid-cols-2 gap-5 p-5 w-[520px]">
                      {category.children?.map((child) => (
                        <div key={child.slug} className="space-y-2">
                          <Link
                            href={`/category/${child.slug}`}
                            className="block font-semibold text-jomionstore-primary hover:text-orange-800"
                          >
                            {child.name}
                          </Link>
                          {child.children && child.children.length > 0 && (
                            <div className="space-y-1 border-l border-gray-200 pl-3 mt-1">
                              {child.children.slice(0, 5).map((grandchild) => (
                                <div key={grandchild.id}>
                                  <Link
                                    href={`/category/${grandchild.slug}`}
                                    className="text-sm text-gray-600 hover:text-jomionstore-secondary transition-colors block py-0.5"
                                  >
                                    {grandchild.name}
                                  </Link>
                                </div>
                              ))}
                            </div>
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
      </div>
    </div>
  );
};

export default CategoryMenu;