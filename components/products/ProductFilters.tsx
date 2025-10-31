'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

interface ProductFiltersProps {
  onFiltersChange: (filters: any) => void;
  activeFilters: any;
}

export default function ProductFilters({ onFiltersChange, activeFilters }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false); // Plié par défaut
  const [priceRange, setPriceRange] = useState({
    min: activeFilters.priceMin || 0,
    max: activeFilters.priceMax || 500000
  });

  const categories = [
    { name: 'Mobilier', count: 2100, slug: 'mobilier' },
    { name: 'Électroménager', count: 1850, slug: 'electromenager' },
    { name: 'Décoration', count: 1200, slug: 'decoration' },
    { name: 'Jardin', count: 890, slug: 'jardin' },
    { name: 'Éclairage', count: 650, slug: 'eclairage' },
    { name: 'Textile maison', count: 580, slug: 'textile-maison' }
  ];

  const pieces = [
    { name: 'Salon', slug: 'salon' },
    { name: 'Chambre', slug: 'chambre' },
    { name: 'Cuisine', slug: 'cuisine' },
    { name: 'Salle de bain', slug: 'salle-de-bain' },
    { name: 'Bureau', slug: 'bureau' },
    { name: 'Jardin', slug: 'jardin' },
    { name: 'Terrasse', slug: 'terrasse' },
    { name: 'Garage', slug: 'garage' }
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

  const handleCategoryToggle = (categorySlug: string) => {
    const newCategories = activeFilters.categories?.includes(categorySlug)
      ? activeFilters.categories.filter((c: string) => c !== categorySlug)
      : [...(activeFilters.categories || []), categorySlug];
    
    onFiltersChange({ ...activeFilters, categories: newCategories });
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = activeFilters.brands?.includes(brand)
      ? activeFilters.brands.filter((b: string) => b !== brand)
      : [...(activeFilters.brands || []), brand];
    
    onFiltersChange({ ...activeFilters, brands: newBrands });
  };

  const handlePieceToggle = (piece: string) => {
    const newPieces = activeFilters.pieces?.includes(piece)
      ? activeFilters.pieces.filter((p: string) => p !== piece)
      : [...(activeFilters.pieces || []), piece];
    
    onFiltersChange({ ...activeFilters, pieces: newPieces });
  };

  const handlePriceChange = () => {
    onFiltersChange({ 
      ...activeFilters, 
      priceMin: priceRange.min, 
      priceMax: priceRange.max 
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      brands: [],
      pieces: [],
      priceMin: 0,
      priceMax: 500000
    });
    setPriceRange({ min: 0, max: 500000 });
  };

  const hasActiveFilters = 
    (activeFilters.categories?.length > 0) ||
    (activeFilters.brands?.length > 0) ||
    (activeFilters.pieces?.length > 0) ||
    (activeFilters.priceMin > 0) ||
    (activeFilters.priceMax < 500000);

  return (
    <div className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button 
              variant={hasActiveFilters ? "default" : "outline"}
              className={`flex items-center gap-2 transition-all duration-200 ${hasActiveFilters
                ? "bg-jomionstore-primary hover:bg-orange-700 text-white"
                : "hover:bg-gray-50"
                }`}
            >
              <Filter className="w-4 h-4" />
              <span className="font-medium">
                {isOpen ? 'Masquer les filtres' : 'Afficher les filtres'}
              </span>
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className={`ml-1 ${hasActiveFilters ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'}`}
                >
                  {[
                    ...(activeFilters.categories || []),
                    ...(activeFilters.brands || []),
                    ...(activeFilters.pieces || [])
                  ].length}
                </Badge>
              )}
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4 mr-1" />
              Effacer les filtres
            </Button>
          )}
        </div>

        {/* Résumé des filtres actifs quand fermé */}
        {!isOpen && hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.categories?.map((category: string) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {categories.find(c => c.slug === category)?.name || category}
                <button
                  onClick={() => handleCategoryToggle(category)}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {activeFilters.brands?.map((brand: string) => (
              <Badge key={brand} variant="secondary" className="text-xs">
                {brand}
                <button
                  onClick={() => handleBrandToggle(brand)}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {activeFilters.pieces?.map((piece: string) => (
              <Badge key={piece} variant="secondary" className="text-xs">
                {pieces.find(p => p.slug === piece)?.name || piece}
                <button
                  onClick={() => handlePieceToggle(piece)}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {(activeFilters.priceMin > 0 || activeFilters.priceMax < 500000) && (
              <Badge variant="secondary" className="text-xs">
                Prix: {activeFilters.priceMin || 0} - {activeFilters.priceMax || 500000} F CFA
                <button
                  onClick={() => {
                    setPriceRange({ min: 0, max: 500000 });
                    onFiltersChange({ ...activeFilters, priceMin: 0, priceMax: 500000 });
                  }}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        <CollapsibleContent className="mt-4 animate-in slide-in-from-top-2 duration-200">
          <Card className="border-jomionstore-primary/20 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Catégories */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Catégories</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <label key={category.slug} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={activeFilters.categories?.includes(category.slug) || false}
                            onChange={() => handleCategoryToggle(category.slug)}
                            className="rounded"
                          />
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Prix */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Prix</h3>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 500000 })}
                        className="text-sm"
                      />
                    </div>
                    <Button 
                      size="sm" 
                      onClick={handlePriceChange}
                      className="w-full"
                    >
                      Appliquer
                    </Button>
                  </div>
                </div>

                {/* Marques */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Marques</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <label key={brand.name} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={activeFilters.brands?.includes(brand.name) || false}
                            onChange={() => handleBrandToggle(brand.name)}
                            className="rounded"
                          />
                          <span className="text-sm">{brand.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {brand.count}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pièces - Section séparée */}
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold text-sm mb-3">Pièces</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {pieces.map((piece) => (
                    <label key={piece.slug} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={activeFilters.pieces?.includes(piece.slug) || false}
                        onChange={() => handlePieceToggle(piece.slug)}
                        className="rounded"
                      />
                      <span className="text-sm">{piece.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}