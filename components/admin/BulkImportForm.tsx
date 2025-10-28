'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Search } from 'lucide-react';

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

export default function BulkImportForm() {
  const [formData, setFormData] = useState({
    keywords: '',
    min_price: '',
    max_price: '',
    sort: 'sales_desc',
    limit: '50',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [previewProducts, setPreviewProducts] = useState<PreviewProduct[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.keywords.trim()) {
      alert('Veuillez saisir des mots-clés');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setProgress(0);

    try {
      // Simuler une progression pendant l'import
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/products/import/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: formData.keywords,
          min_price: formData.min_price ? parseFloat(formData.min_price) : undefined,
          max_price: formData.max_price ? parseFloat(formData.max_price) : undefined,
          sort: formData.sort,
          limit: parseInt(formData.limit),
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

  const handlePreview = async () => {
    if (!formData.keywords.trim()) {
      alert('Veuillez saisir des mots-clés');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const response = await fetch('/api/products/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: formData.keywords,
          min_price: formData.min_price ? parseFloat(formData.min_price) : undefined,
          max_price: formData.max_price ? parseFloat(formData.max_price) : undefined,
          sort: formData.sort,
          limit: parseInt(formData.limit),
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();
      
      if (data.success && data.products) {
        setPreviewProducts(data.products.map((p: any) => ({ ...p, selected: true })));
        setShowPreview(true);
      } else {
        setResult({
          success: false,
          message: data.message || 'Aucun produit trouvé',
        });
      }

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setResult({
        success: false,
        message: 'Erreur de connexion lors de la recherche',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSelected = async () => {
    const selectedProducts = previewProducts.filter(p => p.selected);
    
    if (selectedProducts.length === 0) {
      alert('Veuillez sélectionner au moins un produit');
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      const response = await fetch('/api/products/import/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: formData.keywords,
          min_price: formData.min_price ? parseFloat(formData.min_price) : undefined,
          max_price: formData.max_price ? parseFloat(formData.max_price) : undefined,
          sort: formData.sort,
          limit: selectedProducts.length,
          selected_products: selectedProducts.map(p => p.id),
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();
      setResult(data);
      setShowPreview(false);

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

  const toggleProductSelection = (productId: string) => {
    setPreviewProducts(prev => 
      prev.map(p => 
        p.id === productId ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const selectAllProducts = () => {
    setPreviewProducts(prev => prev.map(p => ({ ...p, selected: true })));
  };

  const deselectAllProducts = () => {
    setPreviewProducts(prev => prev.map(p => ({ ...p, selected: false })));
  };

  const resetForm = () => {
    setResult(null);
    setProgress(0);
    setPreviewProducts([]);
    setShowPreview(false);
    setFormData({
      keywords: '',
      min_price: '',
      max_price: '',
      sort: 'sales_desc',
      limit: '50',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Import en masse par catégorie
          </CardTitle>
          <CardDescription>
            Recherchez et importez automatiquement des produits AliExpress par mots-clés et filtres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mots-clés */}
            <div className="space-y-2">
              <Label htmlFor="keywords">Mots-clés de recherche *</Label>
              <Input
                id="keywords"
                placeholder="ex: wireless earbuds, phone cases, electronics..."
                value={formData.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                disabled={isLoading}
                required
              />
            </div>

            {/* Filtres de prix */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_price">Prix minimum (USD)</Label>
                <Input
                  id="min_price"
                  type="number"
                  step="0.01"
                  placeholder="ex: 5"
                  value={formData.min_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_price: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_price">Prix maximum (USD)</Label>
                <Input
                  id="max_price"
                  type="number"
                  step="0.01"
                  placeholder="ex: 50"
                  value={formData.max_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_price: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Tri et limite */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort">Trier par</Label>
                <Select
                  value={formData.sort}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sort: value }))}
                  disabled={isLoading}
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
              <div className="space-y-2">
                <Label htmlFor="limit">Nombre de produits</Label>
                <Select
                  value={formData.limit}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, limit: value }))}
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
            </div>

            {/* Boutons */}
            <div className="flex gap-2 pt-4">
              <Button 
                type="button"
                onClick={handlePreview}
                disabled={isLoading || !formData.keywords.trim()}
                variant="outline"
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  'Prévisualiser'
                )}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !formData.keywords.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  'Import direct'
                )}
              </Button>
              {(result || showPreview) && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Nouveau
                </Button>
              )}
            </div>
          </form>
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

      {/* Preview des produits */}
      {showPreview && previewProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Produits trouvés ({previewProducts.length})</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={selectAllProducts}>
                  Tout sélectionner
                </Button>
                <Button size="sm" variant="outline" onClick={deselectAllProducts}>
                  Tout désélectionner
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleImportSelected}
                  disabled={isLoading || previewProducts.filter(p => p.selected).length === 0}
                >
                  Importer sélectionnés ({previewProducts.filter(p => p.selected).length})
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {previewProducts.map((product) => (
                <div 
                  key={product.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    product.selected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleProductSelection(product.id)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={product.selected}
                      onChange={() => toggleProductSelection(product.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                      )}
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {product.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>⭐ {product.rating || 'N/A'}</span>
                        <span>🛒 {product.sales || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600">
                          {product.price.toLocaleString()} XOF
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-xs text-gray-500 line-through">
                            {product.original_price.toLocaleString()} XOF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
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