'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronDown, Grid3X3, Smartphone, Shirt, Home, Sparkles, Dumbbell, ShoppingBag, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className={`bg-white border-b transition-all duration-300 z-40 ${
      isScrolled ? 'fixed top-0 left-0 right-0 py-2 shadow-md' : 'category-menu-offset py-3'
    }`}>
      <div className="container">
        <NavigationMenu>
          <NavigationMenuList className="flex flex-wrap gap-1">
            {/* All Categories Button */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-jomiastore-primary text-white hover:bg-blue-700 px-6 py-2 h-auto">
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
                          className="flex items-center space-x-2 font-semibold text-jomiastore-primary hover:text-blue-700"
                        >
                          <IconComponent className="w-5 h-5" />
                          <span>{category.name}</span>
                        </Link>
                        <div className="space-y-2">
                          {category.children?.map((child) => (
                            <div key={child.slug}>
                              <Link
                                href={`/category/${child.slug}`}
                                className="block font-medium text-gray-700 hover:text-jomiastore-primary transition-colors"
                              >
                                {child.name}
                              </Link>
                              {child.children && child.children.length > 0 && (
                                <ul className="ml-2 mt-1 space-y-1">
                                  {child.children.slice(0, 4).map((grandchild) => (
                                    <li key={grandchild.id}>
                                      <Link
                                        href={`/category/${grandchild.slug}`}
                                        className="text-sm text-gray-500 hover:text-jomiastore-secondary transition-colors"
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
            {categories.slice(0, 6).map((category) => {
              const IconComponent = getCategoryIcon(category.slug);
              return (
                <NavigationMenuItem key={category.id}>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-jomiastore-primary px-4 py-2 h-auto bg-transparent">
                    <IconComponent className="w-4 h-4 mr-2" />
                    {category.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid grid-cols-2 gap-6 p-6 w-[500px]">
                      {category.children?.map((child) => (
                        <div key={child.slug} className="space-y-2">
                          <Link
                            href={`/category/${child.slug}`}
                            className="block font-semibold text-jomiastore-primary hover:text-blue-700"
                          >
                            {child.name}
                          </Link>
                          {child.children && child.children.length > 0 && (
                            <ul className="space-y-1">
                              {child.children.slice(0, 5).map((grandchild) => (
                                <li key={grandchild.id}>
                                  <Link
                                    href={`/category/${grandchild.slug}`}
                                    className="text-sm text-gray-600 hover:text-jomiastore-secondary transition-colors"
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
  );
};

export default CategoryMenu;