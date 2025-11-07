import { Metadata } from 'next';
import BulkImportFormWithCategories from '@/components/admin/BulkImportFormWithCategories';

export const metadata: Metadata = {
  title: 'Import par catégorie AliExpress - Admin',
  description: 'Importez des produits depuis 573 catégories AliExpress réelles',
};

export default function BulkImportPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold">Import par catégorie AliExpress</h1>
        <p className="text-muted-foreground mt-2">
          Importez des produits depuis 573 catégories AliExpress réelles avec système de tags intelligent
        </p>
      </div>

      {/* Formulaire d'import avec catégories */}
      <BulkImportFormWithCategories />
    </div>
  );
}