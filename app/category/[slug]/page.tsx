'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import CategoryMenu from "@/components/layout/CategoryMenu";
import Footer from "@/components/layout/Footer";
import ProductGrid from "@/components/home/ProductGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Filter, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
  ProductsService,
  Product,
  ProductFilters,
  ProductSortOptions,
} from "@/lib/services/products.service";
import { CategoriesService, Category } from "@/lib/services/categories.service";
import { ErrorState } from "@/components/ui/error-state";

interface FilterState {
  priceRange: [number, number];
  brands: string[];
  tags: string[];
  inStock: boolean;
  minRating: number;
}

export default function DynamicCategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  // State
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters and sorting
  const [sortBy, setSortBy] = useState<ProductSortOptions>({
    field: "created_at",
    direction: "desc",
  });
  const [filters, setFilters] = useState<FilterState>(() => ({
    priceRange: [0, 1000000],
    brands: [],
    tags: [],
    inStock: false,
    minRating: 0,
  }));
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 20;

  // Load category data
  const loadCategory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await CategoriesService.getBySlug(slug);
      if (response.success && response.data) {
        setCategory(response.data);
      } else {
        throw new Error(response.error || "Catégorie non trouvée");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la catégorie:", error);
      setError("Erreur lors du chargement de la catégorie");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Load products
  const loadProducts = useCallback(async () => {
    if (!category) return;

    try {
      setLoading(true);
      setError(null);

      const productFilters: ProductFilters = {
        category_id: category.id,
        min_price: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
        max_price: filters.priceRange[1] < 1000000 ? filters.priceRange[1] : undefined,
        in_stock: filters.inStock || undefined,
        brand: filters.brands.length > 0 ? filters.brands.join(",") : undefined,
        tags: filters.tags.length > 0 ? filters.tags : undefined,
      };

      const response = await ProductsService.getAll(
        productFilters,
        { page: currentPage, limit: ITEMS_PER_PAGE },
        sortBy
      );

      if (response.success && response.data) {
        if (currentPage === 1) {
          setProducts(response.data);
        } else {
          setProducts(prev => [...prev, ...response.data]);
        }
        
        setTotalCount(response.pagination.total);
        setHasMore(response.pagination.hasNext);

        // Extract unique brands and tags for filter UI
        const brandsSet = new Set(
          response.data
            .map((p: Product) => p.brand)
            .filter(Boolean)
        );
        setAvailableBrands(Array.from(brandsSet) as string[]);
        
        const tags = response.data.flatMap(
          (p: Product) => p.tags || []
        );
        setAvailableTags(Array.from(new Set(tags)));
      } else {
        throw new Error(response.error || "Erreur lors du chargement des produits");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
      setError("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  }, [category, filters, sortBy, currentPage]);

  // Load category on mount
  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  // Load products when category or filters change
  useEffect(() => {
    if (category) {
      loadProducts();
    }
  }, [category, filters, sortBy, currentPage, loadProducts]);

  // Handle load more (pagination)
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore, loadingMore]);

  // Retry handler for error state
  const handleRetry = useCallback(() => {
    if (category) {
      loadProducts();
    } else {
      loadCategory();
    }
  }, [category, loadProducts, loadCategory]);

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    let newSort: ProductSortOptions;
    switch (value) {
      case "price-low":
        newSort = { field: "price", direction: "asc" };
        break;
      case "price-high":
        newSort = { field: "price", direction: "desc" };
        break;
      case "rating":
        newSort = { field: "average_rating", direction: "desc" };
        break;
      case "newest":
        newSort = { field: "created_at", direction: "desc" };
        break;
      default:
        newSort = { field: "created_at", direction: "desc" };
    }
    setSortBy(newSort);
    setCurrentPage(1);
  }, []);

  // Parse filters from URL
  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));
  const parseFiltersFromUrl = () => {
    let priceMin = Number(searchParams.get("min_price"));
    let priceMax = Number(searchParams.get("max_price"));
    // Handle NaN or invalid values
    if (isNaN(priceMin)) priceMin = 0;
    if (isNaN(priceMax)) priceMax = 1000000;
    // Clamp to allowed range
    priceMin = clamp(priceMin, 0, 1000000);
    priceMax = clamp(priceMax, 0, 1000000);
    // Auto-correct if min > max
    if (priceMin > priceMax) [priceMin, priceMax] = [priceMax, priceMin];
    const brands = searchParams.get("brands")?.split(",").filter(Boolean) || [];
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    const inStock = searchParams.get("in_stock") === "1";
    const minRating = Number(searchParams.get("min_rating")) || 0;
    return {
      priceRange: [priceMin, priceMax] as [number, number],
      brands,
      tags,
      inStock,
      minRating,
    };
  };

  // Update URL when filters change
  const updateUrlWithFilters = useCallback((nextFilters: FilterState) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("min_price", String(nextFilters.priceRange[0]));
    params.set("max_price", String(nextFilters.priceRange[1]));
    if (nextFilters.brands.length > 0) {
      params.set("brands", nextFilters.brands.join(","));
    } else {
      params.delete("brands");
    }
    if (nextFilters.tags.length > 0) {
      params.set("tags", nextFilters.tags.join(","));
    } else {
      params.delete("tags");
    }
    if (nextFilters.inStock) {
      params.set("in_stock", "1");
    } else {
      params.delete("in_stock");
    }
    if (nextFilters.minRating > 0) {
      params.set("min_rating", String(nextFilters.minRating));
    } else {
      params.delete("min_rating");
    }
    router.replace(`/category/${slug}?${params.toString()}`);
  }, [router, slug, searchParams]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...newFilters };
      updateUrlWithFilters(next);
      return next;
    });
    setCurrentPage(1);
  }, [updateUrlWithFilters]);

  // Update active filters display
  useEffect(() => {
    const active: string[] = [];
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
      active.push(
        `Prix: ${filters.priceRange[0]} - ${filters.priceRange[1]} XOF`
      );
    }
    if (filters.brands.length > 0) {
      active.push(`Marques: ${filters.brands.join(", ")}`);
    }
    if (filters.inStock) {
      active.push("En stock uniquement");
    }
    if (filters.minRating > 0) {
      active.push(`Note min: ${filters.minRating}★`);
    }
    setActiveFilters(active);
  }, [filters]);

  // Sync filters state with URL on mount
  useEffect(() => {
    setFilters(parseFiltersFromUrl());
    // eslint-disable-next-line
  }, [searchParams]);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-BJ", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Remove filter
  const removeFilter = (filterToRemove: string) => {
    if (filterToRemove.startsWith("Prix:")) {
      handleFilterChange({ priceRange: [0, 1000000] });
    } else if (filterToRemove.startsWith("Marques:")) {
      handleFilterChange({ brands: [] });
    } else if (filterToRemove === "En stock uniquement") {
      handleFilterChange({ inStock: false });
    } else if (filterToRemove.startsWith("Note min:")) {
      handleFilterChange({ minRating: 0 });
    }
  };

  // Loading state
  if (loading && !category) {
    return (
      <div className="min-h-screen bg-jomionstore-background">
        <Header />
        <CategoryMenu />
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded w-64"></div>
            <div className="h-8 bg-gray-200 rounded w-96"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error && !category) {
    return (
      <div className="min-h-screen bg-jomionstore-background">
        <Header />
        <CategoryMenu />
        <div className="container py-8">
          <ErrorState
            type="generic"
            title="Erreur de chargement"
            message={error}
            onRetry={handleRetry}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-jomionstore-primary">
            Accueil
          </Link>
          <span>/</span>
          {category?.parent && (
            <>
              <Link
                href={`/category/${category.parent.slug}`}
                className="hover:text-jomionstore-primary"
              >
                {category.parent.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-medium">{category?.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category?.name}
            </h1>
            {category?.description && (
              <p className="text-gray-600">{category.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Select
              value={`${sortBy.field}-${sortBy.direction}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Plus récents</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="average_rating-desc">
                  Meilleures notes
                </SelectItem>
                <SelectItem value="name-asc">Nom A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">
                Filtres actifs:
              </span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filter}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeFilter(filter)}
                  />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleFilterChange({
                    priceRange: [0, 1000000],
                    brands: [],
                    tags: [],
                    inStock: false,
                    minRating: 0,
                  })
                }
              >
                Effacer tout
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <Card className="sticky top-4">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center mb-4">
                  <Filter className="w-5 h-5 mr-2" />
                  <h3 className="font-semibold">Filtres</h3>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Prix</h4>
                  <div className="space-y-4">
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => {
                        // Clamp and auto-correct min > max
                        let [min, max] = value as [number, number];
                        min = clamp(min, 0, 1000000);
                        max = clamp(max, 0, 1000000);
                        if (min > max) [min, max] = [max, min];
                        handleFilterChange({ priceRange: [min, max] });
                      }}
                      max={1000000}
                      step={10000}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatPrice(filters.priceRange[0])}</span>
                      <span>{formatPrice(filters.priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Filter */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={filters.inStock}
                      onCheckedChange={(checked) =>
                        handleFilterChange({ inStock: !!checked })
                      }
                    />
                    <label htmlFor="inStock" className="text-sm cursor-pointer">
                      En stock uniquement
                    </label>
                  </div>
                </div>

                {/* Subcategories */}
                {category?.children && category.children.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Sous-catégories</h4>
                    <div className="space-y-2">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/category/${child.slug}`}
                          className="block text-sm text-gray-600 hover:text-jomionstore-primary transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands (multi-select) */}
                {availableBrands.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Marques</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableBrands.map((brand) => (
                        <div
                          key={brand}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={brand}
                            checked={filters.brands.includes(brand)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleFilterChange({
                                  brands: [...filters.brands, brand],
                                });
                              } else {
                                handleFilterChange({
                                  brands: filters.brands.filter(
                                    (b) => b !== brand
                                  ),
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={brand}
                            className="text-sm cursor-pointer"
                          >
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags (multi-select) */}
                {availableTags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Tags</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={tag}
                            checked={filters.tags.includes(tag)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleFilterChange({
                                  tags: [...filters.tags, tag],
                                });
                              } else {
                                handleFilterChange({
                                  tags: filters.tags.filter((t) => t !== tag),
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={tag}
                            className="text-sm cursor-pointer"
                          >
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Info */}
            <Card className="mb-6">
              <CardContent className="p-4 text-sm text-gray-600 flex items-center justify-between">
                <span>
                  {loading
                    ? "Chargement..."
                    : `${totalCount} produit${
                        totalCount !== 1 ? "s" : ""
                      } trouvé${totalCount !== 1 ? "s" : ""}`}
                </span>
                {error && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRetry}
                    className="text-red-600 hover:text-red-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réessayer
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Products Grid */}
            <ProductGrid
              title=""
              products={products}
              backgroundColor="bg-transparent"
              isLoading={loading}
              error={error || undefined}
              onRetry={handleRetry}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              loadingMore={loadingMore}
              totalCount={totalCount}
              maxItems={products.length} // Show all loaded products
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}