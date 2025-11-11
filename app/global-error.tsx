'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Auto-reload on chunk loading errors
  useEffect(() => {
    const isChunkError = error?.message?.includes('Failed to load chunk') ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('ChunkLoadError');

    if (isChunkError && typeof window !== 'undefined') {
      console.warn('Chunk loading error detected, reloading...');
      if (!sessionStorage.getItem('chunk-reload-attempted')) {
        sessionStorage.setItem('chunk-reload-attempted', 'true');
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  }, [error]);
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <div className="max-w-2xl mx-auto text-center">
            {/* Error Icon */}
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>

            {/* Error Content */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Erreur Critique
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Une erreur critique est survenue. Veuillez réessayer ou contacter le support.
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
              <button
                onClick={reset}
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
