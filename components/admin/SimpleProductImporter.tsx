'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, CheckCircle, XCircle } from 'lucide-react';

interface SimpleProductImporterProps {
  onImport?: (url: string) => void;
  onClose?: () => void;
}

export function SimpleProductImporter({ onImport, onClose }: SimpleProductImporterProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImport = async () => {
    if (!url.trim()) {
      setError('Veuillez entrer une URL');
      return;
    }

    if (!url.includes('aliexpress.com') && !url.includes('alibaba.com')) {
      setError('URL non supportée. Seuls AliExpress et AliBaba sont supportés.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
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

      setSuccess('Produit importé avec succès !');
      
      if (onImport) {
        onImport(url);
      }

      setTimeout(() => {
        setUrl('');
        setSuccess(null);
        if (onClose) onClose();
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'import du produit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Import de produits</h2>
        <p className="text-gray-600 mt-2">
          Importez des produits depuis AliExpress ou AliBaba
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
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
              disabled={loading}
            />
            <Button 
              onClick={handleImport} 
              disabled={loading || !url.trim()}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Import...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Importer
                </>
              )}
            </Button>
          </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Comment utiliser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>1. Copiez l'URL complète du produit depuis AliExpress ou AliBaba</p>
          <p>2. Collez l'URL dans le champ ci-dessus</p>
          <p>3. Cliquez sur "Importer" pour créer le produit</p>
          <p>4. Le produit sera ajouté à votre catalogue</p>
        </CardContent>
      </Card>
    </div>
  );
}