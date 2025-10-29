import { Metadata } from 'next';
import BulkImportForm from '@/components/admin/BulkImportForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Zap, Target, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Import par catégorie - Admin',
  description: 'Rechercher et importer des produits AliExpress par mots-clés et filtres',
};

export default function BulkImportPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold">Import par catégorie</h1>
        <p className="text-muted-foreground mt-2">
          Recherchez et importez automatiquement des produits AliExpress par mots-clés et filtres
        </p>
      </div>

      {/* Guide rapide */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">1. Cibler</h3>
                <p className="text-sm text-muted-foreground">
                  Définir mots-clés et filtres
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <h3 className="font-semibold">2. Rechercher</h3>
                <p className="text-sm text-muted-foreground">
                  API AliExpress trouve les produits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold">3. Importer</h3>
                <p className="text-sm text-muted-foreground">
                  Ajout automatique en base
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold">4. Vendre</h3>
                <p className="text-sm text-muted-foreground">
                  Produits prêts à la vente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire d'import */}
      <BulkImportForm />

      {/* Conseils */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Conseils pour un import réussi</CardTitle>
          <CardDescription>
            Optimisez vos imports avec ces bonnes pratiques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-600">✅ Bonnes pratiques</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li>• Utilisez des mots-clés spécifiques ("wireless earbuds" vs "electronics")</li>
                <li>• Définissez une fourchette de prix réaliste</li>
                <li>• Commencez par de petits lots (10-25 produits)</li>
                <li>• Triez par "Meilleures ventes" pour la qualité</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-600">❌ À éviter</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li>• Mots-clés trop génériques ("phone", "case")</li>
                <li>• Prix trop bas (&lt;1$) ou trop élevés (&gt;100$)</li>
                <li>• Importer 100 produits d'un coup au début</li>
                <li>• Ignorer les doublons (vérifiés automatiquement)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exemples de recherches populaires */}
      <Card>
        <CardHeader>
          <CardTitle>🔥 Recherches populaires</CardTitle>
          <CardDescription>
            Exemples de mots-clés qui fonctionnent bien
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              'wireless earbuds',
              'phone case',
              'bluetooth speaker',
              'smart watch',
              'car accessories',
              'home decor',
              'kitchen gadgets',
              'fitness tracker',
              'led lights',
              'power bank',
              'camera accessories',
              'gaming mouse'
            ].map((keyword) => (
              <div
                key={keyword}
                className="p-2 bg-gray-100 rounded text-sm text-center hover:bg-gray-200 cursor-pointer transition-colors"

              >
                {keyword}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}