'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Upload, Trash2 } from 'lucide-react';
import supabase from '@/lib/supabase';

export default function StorageDebugPage() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    checkBuckets();
  }, []);

  const checkBuckets = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('🔍 Vérification des buckets...');
      const { data, error } = await supabase.storage.listBuckets();
      
      console.log('📦 Résultat:', { data, error });
      
      if (error) {
        setError(`Erreur: ${error.message}`);
        console.error('❌ Erreur buckets:', error);
      } else {
        setBuckets(data || []);
        setSuccess(`${data?.length || 0} bucket(s) trouvé(s)`);
        console.log('✅ Buckets trouvés:', data);
      }
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
      console.error('❌ Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const testUpload = async () => {
    setLoading(true);
    setError(null);
    setTestResults(null);
    
    try {
      // Créer un fichier de test
      const testFile = new File(['Test content'], 'test.txt', { type: 'text/plain' });
      
      // Tester l'upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(`test-${Date.now()}.txt`, testFile);
      
      if (uploadError) {
        setTestResults({
          upload: { success: false, error: uploadError.message }
        });
      } else {
        setTestResults({
          upload: { success: true, path: uploadData.path }
        });
        
        // Tester la suppression
        const { error: deleteError } = await supabase.storage
          .from('images')
          .remove([uploadData.path]);
        
        setTestResults((prev: any) => ({
          ...prev,
          delete: { 
            success: !deleteError, 
            error: deleteError?.message 
          }
        }));
      }
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testPublicAccess = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Tester l'accès public à une URL
      const { data } = supabase.storage.from('images').getPublicUrl('test.txt');
      
      const response = await fetch(data.publicUrl);
      
      setTestResults((prev: any) => ({
        ...prev,
        publicAccess: {
          success: response.ok,
          status: response.status,
          url: data.publicUrl
        }
      }));
    } catch (err: any) {
      setTestResults((prev: any) => ({
        ...prev,
        publicAccess: { success: false, error: err.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug Storage Supabase</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Configuration Supabase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurée' : '❌ Manquante'}
          </div>
          <div>
            <strong>Clé:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurée' : '❌ Manquante'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buckets disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={checkBuckets} disabled={loading}>
              {loading ? 'Vérification...' : 'Vérifier les buckets'}
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Recharger la page
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
          
          <div className="space-y-2 mt-4">
            {buckets.map((bucket) => (
              <div key={bucket.name} className="flex items-center gap-2 p-2 border rounded">
                <span className="font-mono">{bucket.name}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  bucket.public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {bucket.public ? 'Public' : 'Privé'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tests du bucket "images"</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testUpload} disabled={loading}>
              <Upload className="w-4 h-4 mr-2" />
              Test Upload
            </Button>
            <Button onClick={testPublicAccess} disabled={loading} variant="outline">
              Test Accès Public
            </Button>
          </div>
          
          {testResults && (
            <div className="space-y-2">
              {testResults.upload && (
                <Alert variant={testResults.upload.success ? "default" : "destructive"}>
                  {testResults.upload.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    Upload: {testResults.upload.success ? '✅ Réussi' : `❌ ${testResults.upload.error}`}
                  </AlertDescription>
                </Alert>
              )}
              
              {testResults.delete && (
                <Alert variant={testResults.delete.success ? "default" : "destructive"}>
                  {testResults.delete.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    Suppression: {testResults.delete.success ? '✅ Réussie' : `❌ ${testResults.delete.error}`}
                  </AlertDescription>
                </Alert>
              )}
              
              {testResults.publicAccess && (
                <Alert variant={testResults.publicAccess.success ? "default" : "destructive"}>
                  {testResults.publicAccess.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    Accès Public: {testResults.publicAccess.success ? '✅ OK' : `❌ ${testResults.publicAccess.error}`}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions de correction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Si le bucket "images" n'existe pas :</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Allez dans le dashboard Supabase</li>
            <li>Storage → Create a new bucket</li>
            <li>Nom: "images"</li>
            <li>Public: Oui</li>
          </ol>
          
          <p className="mt-4"><strong>Si les politiques RLS sont manquantes :</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Storage → images → Policies</li>
            <li>Créez les politiques suivantes :</li>
            <li>INSERT: authenticated users can upload</li>
            <li>SELECT: public can read</li>
            <li>UPDATE: authenticated users can update</li>
            <li>DELETE: authenticated users can delete</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}