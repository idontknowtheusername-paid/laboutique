'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Search, Copy, ExternalLink } from 'lucide-react';

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

interface PreviewProduct {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  image: string;
  images: string[];
  source_url: string;
  sku: string;
  rating?: string;
  sales?: number;
  short_description: string;
  selected?: boolean;
}

interface AliExpressCategory {
  category_id: string;
  category_name: string;
  parent_category_id?: string;
}

export default function BulkImportForm() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<AliExpressCategory[]>([]);
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
    const loadCategories = async () => {
      try {
        console.log('Loading categories...');
        const response = await fetch('/api/aliexpress/categories');
        const data = await response.json();

        console.log('Categories response:', data);

        if (data.success && data.categories) {
          setCategories(data.categories);
          console.log('Categories loaded:', data.categories.length);
        } else {
          console.error('Failed to load categories:', data);
        }
      } catch (error) {
        console.error('Erreur chargement catégories:', error);
      }
    };

    loadCategories();
  }, []);

  const generateUrls = async () => {
    if (!selectedCategory) {
      alert('Veuillez sélectionner une catégorie');
      return;
    }

    setIsGenerating(true);
    setGeneratedUrls([]);

    try {
      const response = await fetch('/api/products/generate-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: selectedCategory,
          count: parseInt(urlCount),
          min_price: priceRange.min ? parseFloat(priceRange.min) : undefined,
          max_price: priceRange.max ? parseFloat(priceRange.max) : undefined,
          sort: sortBy
        })
      });

      const data = await response.json();

      if (data.success && data.urls) {
        setGeneratedUrls(data.urls);
      } else {
        alert(data.error || 'Erreur lors de la génération des URLs');
      }
    } catch (error) {
      console.error('Erreur génération URLs:', error);
      alert('Erreur lors de la génération des URLs');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUrls = async () => {
    if (generatedUrls.length === 0) return;

    try {
      await navigator.clipboard.writeText(generatedUrls.join('\n'));
      alert(`${generatedUrls.length} URLs copiées dans le presse-papiers !`);
    } catch (error) {
      console.error('Erreur copie:', error);
      alert('Erreur lors de la copie');
    }
  };

  const importProducts = async () => {
    if (!selectedCategory) {
      alert('Veuillez sélectionner une catégorie');
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
          category_id: selectedCategory,
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
            <Search className="h-5 w-5" />
            Import par catégorie
          </CardTitle>
          <CardDescription>
            Recherchez et importez automatiquement des produits AliExpress par mots-clés et filtres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sélection de catégorie */}
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie AliExpress *</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={isGenerating || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtres */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="count">Nombre d'URLs</Label>
                <Select
                  value={urlCount}
                  onValueChange={setUrlCount}
                  disabled={isGenerating || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 URLs</SelectItem>
                    <SelectItem value="25">25 URLs</SelectItem>
                    <SelectItem value="50">50 URLs</SelectItem>
                    <SelectItem value="100">100 URLs</SelectItem>
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
                  disabled={isGenerating || isLoading}
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
                  disabled={isGenerating || isLoading}
                />
              </div>
            </div>

            {/* Tri */}
            <div className="space-y-2">
              <Label htmlFor="sort">Trier par</Label>
              <Select
                value={sortBy}
                onValueChange={setSortBy}
                disabled={isGenerating || isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales_desc">Meilleures ventes</SelectItem>
                  <SelectItem value="price_asc">Prix croissant</SelectItem>
                  <SelectItem value="price_desc">Prix décroissant</SelectItem>
                  <SelectItem value="rating_desc">Meilleure note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Boutons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                onClick={importProducts}
                disabled={isLoading || !selectedCategory}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Importer produits
                  </>
                )}
              </Button>

              <Button 
                type="button"
                onClick={generateUrls}
                disabled={isGenerating || !selectedCategory || isLoading}
                variant="outline"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération...
                  </>
                ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Générer URLs
                    </>
                )}
              </Button>

              {generatedUrls.length > 0 && (
                <Button
                  type="button"
                  onClick={copyUrls}
                  variant="outline"
                  disabled={isLoading}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copier URLs
                </Button>
              )}
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

      {/* URLs générées */}
      {generatedUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>URLs générées ({generatedUrls.length})</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyUrls}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copier toutes
                </Button>
                <Button size="sm" onClick={importUrls} className="bg-green-600 hover:bg-green-700">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Import en masse
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {generatedUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                  <span className="text-gray-500 min-w-[30px]">{index + 1}.</span>
                  <span className="flex-1 truncate font-mono text-xs">{url}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(url, '_blank')}
                    className="h-6 w-6 p-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              ))}
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
                {result.results.imported_products.length > 0 && (
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
                {result.results.errors.length > 0 && (
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