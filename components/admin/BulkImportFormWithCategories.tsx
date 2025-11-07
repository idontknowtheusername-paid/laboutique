'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Search, Copy, ExternalLink, FolderTree } from 'lucide-react';

interface ImportResult {
  success: boolean;
  message: string;
  results?: {
    total_found: number;
    imported: number;
    failed: number;
    errors: string[];
    imported_products: Array<{
      id: string;
      name: string;
      sku: string;
      price: number;
    }>;
  };
}

interface AliExpressCategory {
  id: string;
  name: string;
  parent_id: string | null;
  has_children: boolean;
}

interface FeedOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

const feedOptions: FeedOption[] = [
  {
    value: 'mixed',
    label: 'Mélange varié (Recommandé)',
    description: 'Combine tous les feeds pour plus de diversité',
    icon: '🎯'
  },
  {
    value: 'ds-bestselling',
    label: 'Meilleures ventes',
    description: 'Produits les plus vendus',
    icon: '🔥'
  },
  {
    value: 'ds-new-arrival',
    label: 'Nouveautés',
    description: 'Derniers produits ajoutés',
    icon: '✨'
  },
  {
    value: 'ds-promotion',
    label: 'Promotions',
    description: 'Produits en solde',
    icon: '💰'
  },
  {
    value: 'ds-choice',
    label: 'Sélection AliExpress',
    description: 'Choix éditorial',
    icon: '⭐'
  }
];

export default function BulkImportFormWithCategories() {
  const [selectedFeed, setSelectedFeed] = useState('mixed');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<AliExpressCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [urlCount, setUrlCount] = useState('50');
  const [priceRange, setPriceRange] = useState({ min: '5', max: '100' });
  const [sortBy, setSortBy] = useState('sales_desc');

  // Charger les catégories au montage
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('/api/aliexpress/categories');
      const data = await response.json();

      if (data.success && data.categories) {
        // Filtrer seulement les catégories principales
        const topLevel = data.categories.filter((cat: AliExpressCategory) => !cat.parent_id);
        setCategories(topLevel);
        console.log(`Loaded ${topLevel.length} top-level categories`);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const importProducts = async () => {
    if (!selectedFeed) {
      alert('Veuillez sélectionner un type de produits');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/products/import/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feed_type: selectedFeed,
          category_id: selectedCategory || undefined,
          min_price: priceRange.min ? parseFloat(priceRange.min) : undefined,
          max_price: priceRange.max ? parseFloat(priceRange.max) : undefined,
          sort: sortBy,
          limit: parseInt(urlCount),
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();
      setResult(data);

    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      setResult({
        success: false,
        message: 'Erreur de connexion lors de l\'import',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Import par catégorie AliExpress
          </CardTitle>
          <CardDescription>
            Importez des produits depuis 573 catégories AliExpress réelles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sélection de catégorie */}
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie AliExpress (optionnel)</Label>
              <Select
                value={selectedCategory || "all"}
                onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}
                disabled={loadingCategories || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Chargement..." : "Toutes les catégories"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {categories.length} catégories principales disponibles
              </p>
            </div>

            {/* Sélection du type de feed */}
            <div className="space-y-2">
              <Label htmlFor="feed">Type de contenu *</Label>
              <Select
                value={selectedFeed}
                onValueChange={setSelectedFeed}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type de contenu..." />
                </SelectTrigger>
                <SelectContent>
                  {feedOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {feedOptions.find(f => f.value === selectedFeed)?.description || 'Sélectionnez un type de contenu'}
              </p>
            </div>

            {/* Filtres */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="count">Nombre de produits</Label>
                <Select
                  value={urlCount}
                  onValueChange={setUrlCount}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 produits</SelectItem>
                    <SelectItem value="25">25 produits</SelectItem>
                    <SelectItem value="50">50 produits</SelectItem>
                    <SelectItem value="100">100 produits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_price">Prix min (USD)</Label>
                <Input
                  id="min_price"
                  type="number"
                  placeholder="5"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_price">Prix max (USD)</Label>
                <Input
                  id="max_price"
                  type="number"
                  placeholder="100"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Bouton d'import */}
            <div className="pt-4">
              <Button
                type="button"
                onClick={importProducts}
                disabled={isLoading || !selectedFeed}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Importer les produits
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barre de progression */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Import en cours...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Résultats de l'import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                {result.message}
              </AlertDescription>
            </Alert>

            {result.results && (
              <div className="space-y-4">
                {/* Statistiques */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.results.total_found}
                    </div>
                    <div className="text-sm text-blue-600">Trouvés</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {result.results.imported}
                    </div>
                    <div className="text-sm text-green-600">Importés</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {result.results.failed}
                    </div>
                    <div className="text-sm text-red-600">Échecs</div>
                  </div>
                </div>

                {/* Produits importés */}
                {result.results.imported_products && result.results.imported_products.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Produits importés avec succès :</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.results.imported_products.map((product) => (
                        <div key={product.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.sku}</div>
                          </div>
                          <div className="text-sm font-medium">
                            {product.price.toLocaleString()} XOF
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Erreurs */}
                {result.results.errors && result.results.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Erreurs :</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {result.results.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 p-2 bg-red-50 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
