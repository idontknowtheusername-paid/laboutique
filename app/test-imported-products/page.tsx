'use client';

import ImportedProductsPreview from '@/components/admin/ImportedProductsPreview';

export default function TestImportedProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test - Produits Importés
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ImportedProductsPreview />
        </div>
      </div>
    </div>
  );
}