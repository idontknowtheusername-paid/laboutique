'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ExternalLink, Download, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { ScrapedProductData } from '@/lib/services/types';
import {
  LocalCategory,
  getLocalCategories,
} from "@/lib/utils/category-mapping";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductImporterProps {
  onImport?: (productData: ScrapedProductData) => void;
  onClose?: () => void;
}

export function ProductImporter({ onImport, onClose }: ProductImporterProps) {
  const [url, setUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LocalCategory>();
  const categories = getLocalCategories();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [productData, setProductData] = useState<ScrapedProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const detectPlatform = (url: string): 'aliexpress' | 'alibaba' | null => {
    if (url.includes('aliexpress.com')) return 'aliexpress';
    if (url.includes('alibaba.com')) return 'alibaba';
    return null;
  };

  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'aliexpress':
        return { name: 'AliExpress', color: 'bg-orange-100 text-orange-800', icon: '🛒' };
      case 'alibaba':
        return { name: 'AliBaba', color: 'bg-orange-100 text-orange-800', icon: '🏭' };
      default:
        return { name: 'Inconnu', color: 'bg-gray-100 text-gray-800', icon: '❓' };
    }
  };

  const handleScrape = async () => {
    if (!url.trim()) {
      setError('Veuillez entrer une URL');
      return;
    }

    const platform = detectPlatform(url);
    if (!platform) {
      setError('URL non supportée. Seuls AliExpress et AliBaba sont supportés.');
      return;
    }

    setLoading(true);
    setError(null);
    setProductData(null);

    try {
      const response = await fetch("/api/products/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          importDirectly: false,
          selectedCategory,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du scraping');
      }

      setProductData(result.data);
      setSuccess('Données récupérées avec succès !');
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!productData) return;

    // Vérifier si une catégorie est sélectionnée
    if (!selectedCategory) {
      setError("Veuillez sélectionner une catégorie");
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const response = await fetch("/api/products/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          importDirectly: true,
          selectedCategory,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'import");
      }

      setSuccess("Produit importé avec succès !");

      // Appeler le callback si fourni
      if (onImport) {
        onImport(productData);
      }

      // Reset après 2 secondes
      setTimeout(() => {
        setProductData(null);
        setUrl("");
        setSuccess(null);
        if (onClose) onClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Erreur lors de l'import du produit");
    } finally {
      setImporting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Import de produits</h2>
        <p className="text-gray-600 mt-2">
          Importez des produits depuis AliExpress ou AliBaba en collant
          simplement l'URL
        </p>
      </div>

      {/* URL Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            URL du produit
          </CardTitle>
          <CardDescription>
            Collez l'URL complète du produit depuis AliExpress ou AliBaba
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://www.aliexpress.com/item/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading || importing}
            />
            <Button
              onClick={handleScrape}
              disabled={loading || importing || !url.trim()}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyse...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Analyser
                </>
              )}
            </Button>
          </div>

          {/* Platform Detection */}
          {url && detectPlatform(url) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Plateforme détectée :
              </span>
              {(() => {
                const platform = detectPlatform(url);
                const info = getPlatformInfo(platform!);
                return (
                  <Badge className={info.color}>
                    {info.icon} {info.name}
                  </Badge>
                );
              })()}
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Product Preview */}
      {productData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Aperçu du produit
              </span>
              <Badge
                className={getPlatformInfo(productData.source_platform).color}
              >
                {getPlatformInfo(productData.source_platform).icon}{" "}
                {getPlatformInfo(productData.source_platform).name}
              </Badge>
            </CardTitle>
            <CardDescription>
              Vérifiez les informations avant d'importer le produit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nom du produit
                  </label>
                  <p className="text-lg font-semibold">{productData.name}</p>
                </div>

                <div className="flex gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Prix de vente
                    </label>
                    <p className="text-xl font-bold text-green-600">
                      {formatPrice(productData.price)}
                    </p>
                  </div>
                  {productData.original_price && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Prix original
                      </label>
                      <p className="text-lg line-through text-gray-500">
                        {formatPrice(productData.original_price)}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Description courte
                  </label>
                  <p className="text-sm text-gray-600">
                    {productData.short_description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      SKU
                    </label>
                    <p className="text-sm font-mono">{productData.sku}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Stock
                    </label>
                    <p className="text-sm">
                      {productData.stock_quantity || 0} unités
                    </p>
                  </div>
                </div>
              </div>

              {/* Images Preview */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Images ({productData.images.length})
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {productData.images.slice(0, 6).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border"
                    >
                      <Image
                        src={image}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Specifications */}
            {productData.specifications &&
              Object.keys(productData.specifications).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Spécifications
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(productData.specifications).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Source URL */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Source
              </label>
              <a
                href={productData.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-600 hover:text-orange-800 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Voir le produit original
              </a>
            </div>

            {/* Category Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Catégorie
              </label>
              <Select
                value={selectedCategory}
                onValueChange={(value) =>
                  setSelectedCategory(value as LocalCategory)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() +
                        category.slice(1).replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Import Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setProductData(null)}>
                Annuler
              </Button>
              <Button
                onClick={handleImport}
                disabled={importing}
                className="min-w-[140px]"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Import...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Importer le produit
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Comment utiliser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            1. Copiez l'URL complète du produit depuis AliExpress ou AliBaba
          </p>
          <p>2. Collez l'URL dans le champ ci-dessus</p>
          <p>3. Cliquez sur "Analyser" pour récupérer les données</p>
          <p>4. Vérifiez les informations dans l'aperçu</p>
          <p>
            5. Cliquez sur "Importer le produit" pour l'ajouter à votre
            catalogue
          </p>
        </CardContent>
      </Card>
    </div>
  );
}