'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const BulkProductImporter = dynamic(
  () => import('@/components/admin/BulkProductImporter').then(m => m.BulkProductImporter),
  { ssr: false }
);

export default function BulkImportPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/admin/products')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux produits
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Import en masse</h1>
          <p className="text-gray-600">Importez plusieurs articles en même temps</p>
        </div>
      </div>

      {/* Bulk Importer Component */}
      <BulkProductImporter />
    </div>
  );
}
