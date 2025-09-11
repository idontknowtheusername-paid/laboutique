'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-beshop-background flex items-center">
      <div className="container py-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-6">La page demandée est introuvable.</p>
        <Link href="/" className="text-beshop-primary hover:underline">Retour à l'accueil</Link>
      </div>
    </div>
  );
}


