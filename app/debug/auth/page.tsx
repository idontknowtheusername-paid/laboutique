'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function AuthDebugPage() {
  const { user, session, profile, loading, error } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const getDebugInfo = async () => {
    setRefreshing(true);
    try {
      // Check localStorage
      const localStorageKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || key.includes('auth') || key.includes('supabase')
      );
      
      const localStorageData: any = {};
      localStorageKeys.forEach(key => {
        try {
          localStorageData[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
          localStorageData[key] = localStorage.getItem(key);
        }
      });

      // Check session directly from Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      // Check user directly from Supabase
      const { data: userData, error: userError } = await supabase.auth.getUser();

      setDebugInfo({
        localStorage: localStorageData,
        supabaseSession: {
          data: sessionData,
          error: sessionError
        },
        supabaseUser: {
          data: userData,
          error: userError
        },
        contextState: {
          user: user ? {
            id: user.id,
            email: user.email,
            created_at: user.created_at
          } : null,
          session: session ? {
            access_token: session.access_token ? 'Present' : 'Missing',
            refresh_token: session.refresh_token ? 'Present' : 'Missing',
            expires_at: session.expires_at,
            expires_in: session.expires_in
          } : null,
          profile: profile ? {
            id: profile.id,
            email: profile.email,
            role: profile.role
          } : null,
          loading,
          error: error ? {
            type: error.type,
            message: error.message,
            retryable: error.retryable
          } : null
        }
      });
    } catch (error) {
      console.error('Error getting debug info:', error);
      setDebugInfo({ error: 'Failed to get debug info' });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getDebugInfo();
  }, [user, session, profile, loading, error]);

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => {
    return condition ? (
      <Badge variant="default" className="bg-green-500">
        <CheckCircle className="w-3 h-3 mr-1" />
        {trueText}
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        {falseText}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug Authentification</h1>
          <p className="text-gray-600">Informations de débogage pour diagnostiquer les problèmes d'authentification</p>
          
          <Button 
            onClick={getDebugInfo} 
            disabled={refreshing}
            className="mt-4"
          >
            {refreshing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Actualiser
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                État Général
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getStatusBadge(!!user, 'Utilisateur connecté', 'Pas d\'utilisateur')}
              {getStatusBadge(!!session, 'Session active', 'Pas de session')}
              {getStatusBadge(!!profile, 'Profil chargé', 'Pas de profil')}
              {getStatusBadge(!loading, 'Chargement terminé', 'En cours de chargement')}
              {getStatusBadge(!error, 'Pas d\'erreur', 'Erreur détectée')}
            </CardContent>
          </Card>

          {/* Context State */}
          <Card>
            <CardHeader>
              <CardTitle>État du Contexte</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                {JSON.stringify(debugInfo?.contextState, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Supabase Session */}
          <Card>
            <CardHeader>
              <CardTitle>Session Supabase</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                {JSON.stringify(debugInfo?.supabaseSession, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Supabase User */}
          <Card>
            <CardHeader>
              <CardTitle>Utilisateur Supabase</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                {JSON.stringify(debugInfo?.supabaseUser, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* LocalStorage */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>LocalStorage (Clés Auth)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                {JSON.stringify(debugInfo?.localStorage, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Actions de Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                Vider LocalStorage & Recharger
              </Button>
              
              <Button 
                variant="outline"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/auth/login';
                }}
              >
                Déconnexion Forcée
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  window.location.href = '/account/profile';
                }}
              >
                Tester Page Profil
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Instructions:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Vérifiez que l'utilisateur, la session et le profil sont présents</li>
                <li>Si la session est manquante, essayez de vider le localStorage</li>
                <li>Si l'erreur persiste, vérifiez la configuration Supabase</li>
                <li>Utilisez les actions ci-dessus pour tester différents scénarios</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}