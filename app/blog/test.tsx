'use client';

import React, { useState, useEffect } from 'react';

export default function TestPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Test Page
        </h1>
        <p className="text-gray-600">
          Cette page teste si l'hydratation fonctionne correctement.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Date: {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
}
