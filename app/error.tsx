'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react';

export default function GlobalError({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-beshop-background">
        <div className="container py-8">
          <div className="max-w-2xl mx-auto text-center">
            {/* Error Icon */}
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>

            {/* Error Content */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Oups ! Une erreur est survenue
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Nous nous excusons pour ce désagrément. Notre équipe technique a été notifiée.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && error?.message && (
              <div className="bg-gray-100 rounded-lg p-4 mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Détails de l'erreur :</h3>
                <p className="text-sm text-gray-700 font-mono">{error.message}</p>
                {error.digest && (
                  <p className="text-xs text-gray-500 mt-2">ID: {error.digest}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={reset} className="bg-beshop-primary hover:bg-blue-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
              <Link href="/">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Contacter le support
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-12 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Besoin d'aide ?</h3>
              <p className="text-sm text-gray-600">
                Si le problème persiste, n'hésitez pas à contacter notre équipe support.
                Nous sommes là pour vous aider !
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}


