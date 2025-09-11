'use client';

import React from 'react';

export default function SimpleBlogPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Blog Simple - Test Hydratation
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Article de test
          </h2>
          <p className="text-gray-600 mb-4">
            Ceci est un article de test pour vérifier que l'hydratation fonctionne correctement.
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Auteur: Test</span>
            <span>Date: 2024-01-15</span>
            <span>Lecture: 2 min</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Deuxième article
          </h2>
          <p className="text-gray-600 mb-4">
            Un autre article pour tester la structure de base.
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Auteur: Test 2</span>
            <span>Date: 2024-01-14</span>
            <span>Lecture: 3 min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
