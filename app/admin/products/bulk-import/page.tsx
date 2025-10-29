import { Metadata } from 'next';
import BulkImportForm from '@/components/admin/BulkImportForm';

export const metadata: Metadata = {
  title: 'Import par catégorie - Admin',
  description: 'Rechercher et importer des produits AliExpress par mots-clés et filtres',
};

export default function BulkImportPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* En-tête simplifié */}
      <div>
        <h1 className="text-3xl font-bold">Import par catégorie</h1>
        <p className="text-muted-foreground mt-2">
          Recherchez et importez des produits AliExpress par mots-clés et filtres
        </p>
      </div>

      {/* Formulaire d'import */}
      <BulkImportForm />
    </div>
  );
}