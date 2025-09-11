'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({ error }: { error: Error }) {
  return (
    <html>
      <body className="min-h-screen bg-beshop-background flex items-center">
        <div className="container py-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Une erreur est survenue</h1>
          <p className="text-gray-600 mb-6">{error?.message || 'Veuillez réessayer plus tard.'}</p>
          <Link href="/" className="text-beshop-primary hover:underline">Retour à l'accueil</Link>
        </div>
      </body>
    </html>
  );
}


