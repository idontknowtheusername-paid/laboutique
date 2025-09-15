'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { showSuccessToast, showErrorToast } from '@/components/ui/enhanced-toast';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
          // Get the code and state from URL parameters
          const code = searchParams.get('code');
          const error = searchParams.get('error');
          const errorDescription = searchParams.get('error_description');

          if (error) {
              throw new Error(errorDescription || error);
          }

          if (code) {
              // Exchange the code for a session
              const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

              if (exchangeError) {
                  throw exchangeError;
              }

            if (data.session) {
              setSuccess(true);
              showSuccessToast('Connexion réussie !');

              // Get redirect URL from state or default to home
              const redirectTo = searchParams.get('state') || '/';

              // Small delay to show success message
              setTimeout(() => {
                  router.push(redirectTo);
            }, 1500);
          } else {
                  throw new Error('Aucune session créée');
              }
          } else {
              throw new Error('Code d\'autorisation manquant');
          }
      } catch (error) {
            console.error('Auth callback error:', error);
            setError(error instanceof Error ? error.message : 'Erreur d\'authentification');
            showErrorToast('Erreur lors de la connexion');
        } finally {
            setLoading(false);
        }
    };

      handleAuthCallback();
  }, [searchParams, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-beshop-background flex items-center justify-center">
                <div className="container max-w-md">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center flex items-center justify-center">
                                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                Connexion en cours...
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-gray-600">
                                Veuillez patienter pendant que nous finalisons votre connexion.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-beshop-background flex items-center justify-center">
                <div className="container max-w-md">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center flex items-center justify-center text-green-600">
                                <CheckCircle className="w-6 h-6 mr-2" />
                                Connexion réussie !
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-gray-600">
                                Vous allez être redirigé automatiquement...
                            </p>
                            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
      <div className="min-h-screen bg-beshop-background flex items-center justify-center">
          <div className="container max-w-md">
              <Card>
                  <CardHeader>
                      <CardTitle className="text-center flex items-center justify-center text-red-600">
                          <AlertCircle className="w-6 h-6 mr-2" />
                          Erreur de connexion
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                              {error || 'Une erreur est survenue lors de la connexion.'}
                          </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                          <Button asChild className="w-full">
                              <Link href="/auth/login">
                                  Retour à la connexion
                              </Link>
                          </Button>

                          <Button asChild variant="outline" className="w-full">
                              <Link href="/">
                                  Retour à l'accueil
                              </Link>
                          </Button>
                      </div>
                  </CardContent>
              </Card>
          </div>
      </div>
  );
}