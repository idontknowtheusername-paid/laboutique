'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Lock, Home, LogOut, AlertTriangle } from 'lucide-react';

export default function UnauthorizedPage() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-jomionstore-background flex items-center justify-center">
      <div className="container max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center">
              <Lock className="w-6 h-6 mr-2 text-red-600" />
              Accès non autorisé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-gray-600">
                  Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                </p>
                {profile && (
                  <p className="text-sm text-gray-500">
                    Votre rôle actuel : <span className="font-medium">{profile.role}</span>
                  </p>
                )}
              </div>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Si vous pensez que c'est une erreur, contactez un administrateur ou essayez de vous connecter avec un autre compte.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Link>
              </Button>
              
              {user && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}