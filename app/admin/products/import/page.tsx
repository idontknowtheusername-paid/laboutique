'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, ArrowLeft, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminImportProductPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  const handleImport = async () => {
    if (!url.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer une URL' });
      return;
    }

    if (!url.includes('aliexpress.com') && !url.includes('alibaba.com')) {
      setMessage({ type: 'error', text: 'Seuls AliExpress et AliBaba sont supportés' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, importDirectly: true }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'import');
      }

      setMessage({ type: 'success', text: 'Produit importé avec succès !' });
      
      // Rediriger vers la liste des produits après 2 secondes
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de l\'import' });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!url.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer une URL' });
      return;
    }

    if (!url.includes('aliexpress.com') && !url.includes('alibaba.com')) {
      setMessage({ type: 'error', text: 'Seuls AliExpress et AliBaba sont supportés' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, importDirectly: false }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la récupération des données');
      }

      setPreviewData(result.data);
      setMessage({ type: 'success', text: 'Données récupérées avec succès !' });

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la récupération' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromPreview = async () => {
    if (!previewData) return;

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, importDirectly: true }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'import');
      }

      setMessage({ type: 'success', text: 'Produit importé avec succès !' });
      
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de l\'import' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/admin/products')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux produits
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Importer un article</h1>
          <p className="text-gray-600">Importez des articles depuis AliExpress ou AliBaba</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Import d'article
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                URL du produit AliExpress ou AliBaba
              </label>
              <Input
                placeholder="https://www.aliexpress.com/item/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Collez l'URL complète du produit que vous souhaitez importer
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleImport}
                disabled={loading || !url.trim()}
                className="flex-1 bg-jomionstore-primary hover:bg-blue-700"
              >
                {loading ? 'Import en cours...' : 'Importer directement'}
              </Button>
              <Button 
                variant="outline"
                onClick={handlePreview}
                disabled={loading || !url.trim()}
              >
                Prévisualiser
              </Button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• <strong>Import direct</strong> : Le produit est créé immédiatement</p>
              <p>• <strong>Prévisualiser</strong> : Voir les données avant d'importer</p>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {previewData && (
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Aperçu de l'article
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium">{previewData.name}</h3>
                  <p className="text-sm text-gray-600">{previewData.short_description}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-lg font-bold text-green-600">
                      {new Intl.NumberFormat('fr-BJ', { 
                        style: 'currency', 
                        currency: 'XOF', 
                        minimumFractionDigits: 0 
                      }).format(previewData.price)}
                    </span>
                    {(previewData as any).compare_price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {new Intl.NumberFormat('fr-BJ', { 
                          style: 'currency', 
                          currency: 'XOF', 
                          minimumFractionDigits: 0 
                        }).format((previewData as any).compare_price)}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline">
                    {previewData.source_platform === 'aliexpress' ? 'AliExpress' : 'AliBaba'}
                  </Badge>
                </div>

                {previewData.images && previewData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {previewData.images.slice(0, 3).map((image: string, index: number) => (
                      <div key={index} className="relative w-full h-20">
                        <Image
                          src={image}
                          alt={`Image ${index + 1}`}
                          fill
                          className="object-cover rounded border"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleImportFromPreview}
                    disabled={loading}
                    className="w-full bg-jomionstore-primary hover:bg-blue-700"
                  >
                    {loading ? 'Import en cours...' : 'Importer cet article'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platform Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Plateformes supportées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    🛒
                  </div>
                  <div>
                    <h3 className="font-medium">AliExpress</h3>
                    <p className="text-sm text-gray-600">Produits individuels, électronique, mode</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    🏭
                  </div>
                  <div>
                    <h3 className="font-medium">AliBaba</h3>
                    <p className="text-sm text-gray-600">Grossiste, lots, produits en volume</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}