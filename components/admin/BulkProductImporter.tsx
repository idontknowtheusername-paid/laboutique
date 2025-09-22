'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, XCircle, AlertCircle, StopCircle } from 'lucide-react';
import { ScrapedProductData } from '@/lib/services/types';

interface ImportTask {
  url: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  data?: ScrapedProductData;
}

interface ImportTaskState extends ImportTask {
  error?: string;
  data?: ScrapedProductData;
}

export function BulkProductImporter() {
  const [urls, setUrls] = useState<string>('');
  const [tasks, setTasks] = useState<ImportTask[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [publishDirectly, setPublishDirectly] = useState(false);

  // Valider les URLs
  const validateUrls = (input: string): string[] => {
    return input
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && (url.includes('aliexpress.com') || url.includes('alibaba.com')));
  };

  // Gérer l'import
  const handleImport = async () => {
    const validUrls = validateUrls(urls);
    if (validUrls.length === 0) {
      return;
    }

    // Initialiser les tâches
    const newTasks: ImportTaskState[] = validUrls.map(url => ({
      url,
      status: 'pending',
      error: undefined,
      data: undefined
    }));
    setTasks(newTasks);
    setImporting(true);
    setProgress(0);

    // Traiter les URLs une par une
    for (let i = 0; i < newTasks.length; i++) {
      if (!importing) break; // Permettre l'annulation

      const task = newTasks[i];
      task.status = 'processing';
      setTasks([...newTasks]);

      try {
        const response = await fetch('/api/products/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url: task.url, 
            importDirectly: true,
            publishDirectly: publishDirectly 
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erreur lors de l\'import');
        }

        task.status = 'success';
        task.data = result.data;
      } catch (error: any) {
        task.status = 'error';
        task.error = error.message;
      }

      setTasks([...newTasks]);
      setProgress(((i + 1) / newTasks.length) * 100);
    }

    setImporting(false);
  };

  // Annuler l'import
  const cancelImport = () => {
    setImporting(false);
  };

  // Stats des imports
  const stats = {
    total: tasks.length,
    success: tasks.filter(t => t.status === 'success').length,
    error: tasks.filter(t => t.status === 'error').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    processing: tasks.filter(t => t.status === 'processing').length
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Import en masse
          </CardTitle>
          <CardDescription>
            Importez plusieurs produits en même temps. Collez une URL par ligne.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="https://www.aliexpress.com/item/...\nhttps://www.alibaba.com/product/..."
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            disabled={importing}
            rows={5}
          />

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={importing || !urls.trim()}
                className="min-w-[140px]"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Démarrer l'import
                  </>
                )}
              </Button>

              {importing && (
                <Button 
                  variant="outline" 
                  onClick={cancelImport}
                  className="gap-2"
                >
                  <StopCircle className="w-4 h-4" />
                  Annuler
                </Button>
              )}
            </div>

            {tasks.length > 0 && (
              <div className="flex gap-2">
                <Badge variant="outline">Total: {stats.total}</Badge>
                <Badge className="bg-green-100 text-green-800">Succès: {stats.success}</Badge>
                {stats.error > 0 && (
                  <Badge className="bg-red-100 text-red-800">Erreurs: {stats.error}</Badge>
                )}
              </div>
            )}
          </div>

          {importing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-500 text-center">
                Traitement : {stats.success + stats.error} sur {stats.total} produits
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des tâches */}
      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Statut des imports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1 truncate mr-4">
                  <p className="text-sm font-medium truncate">{task.url}</p>
                  {task.error && (
                    <p className="text-sm text-red-600">{task.error}</p>
                  )}
                </div>
                <Badge
                  className={
                    task.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : task.status === 'error'
                      ? 'bg-red-100 text-red-800'
                      : task.status === 'processing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {task.status === 'success'
                    ? 'Importé'
                    : task.status === 'error'
                    ? 'Erreur'
                    : task.status === 'processing'
                    ? 'En cours...'
                    : 'En attente'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}