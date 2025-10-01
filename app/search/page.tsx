'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import CategoryMenu from "@/components/layout/CategoryMenu";
import Footer from "@/components/layout/Footer";
import ProductGrid from "@/components/home/ProductGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, Grid, List, Search, X, RefreshCw } from "lucide-react";
import {
  ProductsService,
  Product,
  ProductFilters,
  ProductSortOptions,
} from "@/lib/services/products.service";
import { CategoriesService, Category } from "@/lib/services/categories.service";
import { ErrorState } from "@/components/ui/error-state";

interface SearchFilters {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  inStock: boolean;
  minRating: number;
}

const SEARCH_HISTORY_KEY = "search_history";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  // State
  // Search history & suggestions
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // UI State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<ProductSortOptions>({
    field: "created_at",
    direction: "desc",
  });
  const [searchQuery, setSearchQuery] = useState(query);

  // Filters
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 1000000],
    categories: [],
    brands: [],
    inStock: false,
    minRating: 0,
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 20;

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    }
  }, []);

  // Update suggestions as user types
  useEffect(() => {
    if (searchQuery && searchHistory.length > 0) {
      setFilteredSuggestions(
        searchHistory
          .filter(
            (h) =>
              h.toLowerCase().includes(searchQuery.toLowerCase()) &&
              h !== searchQuery
          )
          .slice(0, 5)
      );
    } else {
      setFilteredSuggestions([]);
    }
  }, [searchQuery, searchHistory]);
  const loadCategories = useCallback(async () => {
    try {
      const response = await CategoriesService.getAll();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  }, []);

  // Search products
  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    setSearchHistory((prev) => {
      const updated = [query, ...prev.filter((q) => q !== query)].slice(0, 10);
      if (typeof window !== "undefined") {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const searchProducts = useCallback(
    async (searchQuery: string, page = 1, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const productFilters: ProductFilters = {
          search: searchQuery || undefined,
          min_price:
            filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
          max_price:
            filters.priceRange[1] < 1000000 ? filters.priceRange[1] : undefined,
          in_stock: filters.inStock || undefined,
          brand: filters.brands.length > 0 ? filters.brands[0] : undefined, // Simplified for now
          category_id:
            filters.categories.length > 0 ? filters.categories[0] : undefined,
        };

        const response = await ProductsService.search(
          searchQuery,
          productFilters,
          { page, limit: ITEMS_PER_PAGE },
          sortBy
        );

        if (response.success && response.data) {
          if (!append && searchQuery) saveToHistory(searchQuery);
          if (append) {
            setProducts((prev) => [...prev, ...response.data]);
          } else {
            setProducts(response.data);
          }
          setTotalCount(response.pagination.total);
          setHasMore(response.pagination.hasNext);
          setCurrentPage(page);

          // Extract unique brands from results for filter options
          const brands = [
            ...Array.from(
              new Set(response.data.map((p) => p.brand).filter(Boolean))
            ),
          ];
          setAvailableBrands(brands as string[]);
        } else {
          throw new Error(response.error || "Erreur lors de la recherche");
        }
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        setError(error instanceof Error ? error.message : "Erreur inconnue");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, sortBy]
  );

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      searchProducts(searchQuery, currentPage + 1, true);
    }
  }, [hasMore, loadingMore, currentPage, searchProducts, searchQuery]);

  // Handle retry
  const handleRetry = useCallback(() => {
    searchProducts(searchQuery, 1, false);
  }, [searchProducts, searchQuery]);

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

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      setCurrentPage(1);
    },
    []
  );

  // Handle search
  const handleSearch = useCallback(
    (newQuery: string) => {
      setSearchQuery(newQuery);
      const params = new URLSearchParams(searchParams.toString());
      if (newQuery) {
        params.set("q", newQuery);
      } else {
        params.delete("q");
      }
      router.push(`/search?${params.toString()}`);
      setShowSuggestions(false);
      if (inputRef.current) inputRef.current.blur();
    },
    [router, searchParams]
  );

  // Update active filters display
  useEffect(() => {
    const active: string[] = [];
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
      active.push(
        `Prix: ${formatPrice(filters.priceRange[0])} - ${formatPrice(
          filters.priceRange[1]
        )}`
      );
    }
    if (filters.categories.length > 0) {
      const categoryNames = filters.categories.map(
        (id) => categories.find((c) => c.id === id)?.name || id
      );
      active.push(`Catégories: ${categoryNames.join(", ")}`);
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
  }, [filters, categories]);

  // Load initial data
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Search when query or filters change
  useEffect(() => {
    if (
      searchQuery ||
      Object.values(filters).some((f) =>
        Array.isArray(f)
          ? f.length > 0
          : f !== false && f !== 0 && f !== 1000000
      )
    ) {
      searchProducts(searchQuery, 1, false);
    }
  }, [searchQuery, filters, sortBy, searchProducts]);

  // Update search query from URL params
  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-BJ", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const removeFilter = (filterToRemove: string) => {
    if (filterToRemove.startsWith("Prix:")) {
      handleFilterChange({ priceRange: [0, 1000000] });
    } else if (filterToRemove.startsWith("Catégories:")) {
      handleFilterChange({ categories: [] });
    } else if (filterToRemove.startsWith("Marques:")) {
      handleFilterChange({ brands: [] });
    } else if (filterToRemove === "En stock uniquement") {
      handleFilterChange({ inStock: false });
    } else if (filterToRemove.startsWith("Note min:")) {
      handleFilterChange({ minRating: 0 });
    }
  };

  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-4 md:py-8">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Rechercher des produits..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 150)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch(searchQuery);
                  }}
                  className="w-full"
                  autoComplete="off"
                />
                {/* Suggestions dropdown */}
                {showSuggestions &&
                  (filteredSuggestions.length > 0 ||
                    searchHistory.length > 0) && (
                    <div className="absolute z-10 left-0 right-0 bg-white border rounded shadow mt-1 max-h-56 overflow-y-auto">
                      {filteredSuggestions.length > 0 && (
                        <div>
                          <div className="px-3 py-2 text-xs text-gray-500">
                            Suggestions
                          </div>
                          {filteredSuggestions.map((sugg) => (
                            <div
                              key={sugg}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                              onMouseDown={() => handleSearch(sugg)}
                            >
                              {sugg}
                            </div>
                          ))}
                          <hr className="my-1" />
                        </div>
                      )}
                      {searchHistory.length > 0 && (
                        <div>
                          <div className="px-3 py-2 text-xs text-gray-500">
                            Historique
                          </div>
                          {searchHistory
                            .filter((h) => !filteredSuggestions.includes(h))
                            .slice(0, 5)
                            .map((hist) => (
                              <div
                                key={hist}
                                className="flex items-center px-4 py-2 group hover:bg-gray-100"
                              >
                                <span
                                  className="flex-1 cursor-pointer"
                                  onMouseDown={() => handleSearch(hist)}
                                >
                                  {hist}
                                </span>
                                <X
                                  className="w-4 h-4 text-gray-400 ml-2 opacity-0 group-hover:opacity-100 cursor-pointer"
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setSearchHistory((prev) => {
                                      const updated = prev.filter(
                                        (q) => q !== hist
                                      );
                                      if (typeof window !== "undefined") {
                                        localStorage.setItem(
                                          SEARCH_HISTORY_KEY,
                                          JSON.stringify(updated)
                                        );
                                      }
                                      return updated;
                                    });
                                  }}
                                />
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
            <Button
              onClick={() => handleSearch(searchQuery)}
              className="bg-jomionstore-primary"
            >
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>
          </div>

          {query && (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Résultats pour "{query}"
              </h1>
              <p className="text-gray-600">
                {loading
                  ? "Recherche en cours..."
                  : `${totalCount} produit${
                      totalCount !== 1 ? "s" : ""
                    } trouvé${totalCount !== 1 ? "s" : ""}`}
              </p>
            </>
          )}
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
                onClick={() => setActiveFilters([])}
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
                      onValueChange={(value) =>
                        handleFilterChange({
                          priceRange: value as [number, number],
                        })
                      }
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

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Catégories</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {categories.slice(0, 10).map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={category.id}
                            checked={filters.categories.includes(category.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleFilterChange({
                                  categories: [
                                    ...filters.categories,
                                    category.id,
                                  ],
                                });
                              } else {
                                handleFilterChange({
                                  categories: filters.categories.filter(
                                    (id) => id !== category.id
                                  ),
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={category.id}
                            className="text-sm cursor-pointer"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {availableBrands.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Marques</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableBrands.slice(0, 10).map((brand) => (
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
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {loading
                    ? "Recherche..."
                    : `${totalCount} résultat${totalCount !== 1 ? "s" : ""}`}
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
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <Select
                  value={`${sortBy.field}-${sortBy.direction}`}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-desc">
                      Plus récents
                    </SelectItem>
                    <SelectItem value="price-asc">Prix croissant</SelectItem>
                    <SelectItem value="price-desc">Prix décroissant</SelectItem>
                    <SelectItem value="average_rating-desc">
                      Meilleures notes
                    </SelectItem>
                    <SelectItem value="name-asc">Nom A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {!loading && !error && products.length === 0 && searchQuery ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun résultat trouvé pour "{searchQuery}"
                </h3>
                <p className="text-gray-600 mb-6">
                  Essayez de modifier vos critères de recherche ou vos filtres
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    handleFilterChange({
                      priceRange: [0, 1000000],
                      categories: [],
                      brands: [],
                      inStock: false,
                      minRating: 0,
                    });
                  }}
                  className="bg-jomionstore-primary hover:bg-blue-700"
                >
                  Effacer les filtres
                </Button>
              </div>
            ) : !loading && !error && products.length === 0 && !searchQuery ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Commencez votre recherche
                </h3>
                <p className="text-gray-600 mb-6">
                  Saisissez un terme de recherche pour trouver des produits
                </p>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}