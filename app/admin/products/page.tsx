'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProductsService } from '@/lib/services/products.service';
import { Download, Search, Eye, Edit, RefreshCw, Plus, Trash2 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminToolbar from '@/components/admin/AdminToolbar';
import ImportedProductsPreview from '@/components/admin/ImportedProductsPreview';
import { useToast } from '@/components/admin/Toast';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface AdminProduct {
  id: string;
  name: string;
  price: number;
  slug?: string;
  sku?: string;
  brand?: string;
  status?: string;
  category?: { name: string };
  vendor?: { name: string };
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<AdminProduct[]>([]);
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<string>('all');
  const [platform, setPlatform] = React.useState<string>('all');
  const [status, setStatus] = React.useState<string>('all');
  const [priceMin, setPriceMin] = React.useState<string>('');
  const [priceMax, setPriceMax] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<string>('created_at');
  const [sortOrder, setSortOrder] = React.useState<string>('desc');
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const [page, setPage] = React.useState(1);
  const { success, error, info } = useToast();
  
  // Debounced search pour optimiser les performances
  const debouncedSearch = useDebounce(search, 300);
  const debouncedPriceMin = useDebounce(priceMin, 500);
  const debouncedPriceMax = useDebounce(priceMax, 500);

  // Test de connexion à la base de données
  async function testDatabaseConnection() {
    try {
      const client = (ProductsService as any).getSupabaseClient();
      
      // Test 1: Vérifier la connexion de base
      const { data: connectionTest, error: connectionError } = await client
        .from('products')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        error('Erreur de connexion', `Impossible de se connecter à la base: ${connectionError.message}`);
        return;
      }

      // Test 2: Vérifier les permissions de lecture
      const { data: readTest, error: readError } = await client
        .from('products')
        .select('id, name, price, status')
        .limit(5);
      
      if (readError) {
        error('Erreur de lecture', `Impossible de lire les données: ${readError.message}`);
        return;
      }

      // Test 3: Vérifier les permissions d'écriture (test en lecture seule)
      const { data: writeTest, error: writeError } = await client
        .from('products')
        .select('id')
        .limit(1);
      
      if (writeError) {
        error('Erreur d\'écriture', `Problème de permissions: ${writeError.message}`);
        return;
      }

      // Test 4: Vérifier la latence
      const startTime = Date.now();
      await client.from('products').select('count').limit(1);
      const latency = Date.now() - startTime;

      success('Connexion réussie', `Base de données accessible (latence: ${latency}ms, ${readTest?.length || 0} produits trouvés)`);
      
    } catch (err) {
      error('Erreur de connexion', `Impossible de se connecter à la base de données: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  }

  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      const { error: deleteError } = await (ProductsService as any).getSupabaseClient()
        .from('products')
        .delete()
        .eq('id', productId);

      if (!deleteError) {
        success('Produit supprimé', `Le produit "${productName}" a été supprimé avec succès.`);
        load(); // Recharger les produits après suppression
      } else {
        error('Erreur de suppression', `Impossible de supprimer le produit: ${deleteError.message}`);
      }
    } catch (err) {
      error('Erreur inattendue', 'Une erreur est survenue lors de la suppression du produit.');
    }
  };

  const handleExportProducts = () => {
    if (!items.length) {
      error('Aucune donnée', 'Aucun produit à exporter');
      return;
    }

    try {
      const headers = [
        "Nom",
        "SKU",
        "Marque",
        "Catégorie",
        "Vendeur",
        "Prix",
        "Statut",
        "Date de création"
      ];
      
      const csvRows = [headers.join(",")];
      
      items.forEach((product) => {
        csvRows.push([
          product.name || '',
          product.sku || '',
          product.brand || '',
          product.category?.name || '',
          product.vendor?.name || '',
          product.price || 0,
          product.status || '',
          new Date().toLocaleDateString('fr-FR') // Date de création simulée
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
      });
      
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `produits_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      success('Export réussi', 'Le fichier CSV a été téléchargé avec succès');
    } catch (err) {
      error('Erreur d\'export', 'Impossible d\'exporter les produits');
    }
  };

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      // Recherche côté serveur avec debouncing
      const filters = {
        status: status !== 'all' ? status : undefined,
        search: debouncedSearch || undefined,
        category: category !== 'all' ? category : undefined,
        platform: platform !== 'all' ? platform : undefined,
        price_min: debouncedPriceMin ? parseFloat(debouncedPriceMin) : undefined,
        price_max: debouncedPriceMax ? parseFloat(debouncedPriceMax) : undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      };
      
      const res = await ProductsService.getAll(
        filters,
        { page, limit: 20 }
      );
      
      if (res.success && res.data) {
        setItems(res.data as any as AdminProduct[]);
        setTotalCount(res.pagination?.total || 0);
        success('Données chargées', `${res.data.length} produits chargés`);
      } else {
        error('Erreur de chargement', res.error || 'Impossible de charger les produits');
        setItems([]);
        setTotalCount(0);
      }
    } catch (err) {
      error('Erreur inattendue', `Une erreur est survenue lors du chargement des produits: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, platform, status, debouncedPriceMin, debouncedPriceMax, sortBy, sortOrder, page, error, success]);

  React.useEffect(() => { load(); }, [load]);


  function statusColor(s?: string) {
    switch (s) {
      case 'draft': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      case 'active': return 'bg-green-600';
      case 'disabled': return 'bg-red-600';
      default: return 'bg-gray-400';
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Produits"
        subtitle="Catalogue et statut de publication"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Test de connexion */}
            <Button variant="outline" onClick={testDatabaseConnection}>
              🔍 Test DB
            </Button>
            
            {/* Bouton principal - Créer manuellement */}
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
              onClick={() => router.push("/admin/products/new")}
            >
              <Plus className="w-4 h-4 mr-2" /> Créer manuellement
            </Button>
            
            {/* Séparateur visuel */}
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            {/* Boutons secondaires */}
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" /> Rafraîchir
            </Button>
            <Button
              variant="outline"
              onClick={handleExportProducts}
            >
              <Download className="w-4 h-4 mr-2" /> Exporter
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/products/import")}
            >
              <Download className="w-4 h-4 mr-2" /> Importer
            </Button>
            <Button
              className="bg-jomionstore-primary hover:bg-blue-700"
              onClick={() => router.push("/admin/products/bulk-import")}
            >
              <Download className="w-4 h-4 mr-2" /> Import masse
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/categories")}
            >
              📁 Catégories
            </Button>
          </div>
        }
      />

      {/* Preview des produits importés */}
      <ImportedProductsPreview />

      <Card>
        <CardContent className="p-0">
          <AdminToolbar>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                className="pl-10"
                placeholder="Rechercher un produit"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
            </div>
            <Select
              value={category}
              onValueChange={(v: string) => setCategory(v)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="electronique">Électronique</SelectItem>
                <SelectItem value="mode">Mode</SelectItem>
                <SelectItem value="maison">Maison</SelectItem>
                <SelectItem value="beaute">Beauté</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={platform}
              onValueChange={(v: string) => setPlatform(v)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Plateforme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="aliexpress">AliExpress</SelectItem>
                <SelectItem value="alibaba">AliBaba</SelectItem>
                <SelectItem value="manual">Manuel</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={status}
              onValueChange={(v: string) => setStatus(v)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="disabled">Désactivé</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Prix min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-24"
              />
              <span className="text-gray-500">-</span>
              <Input
                type="number"
                placeholder="Prix max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-24"
              />
            </div>
            
            <Select
              value={sortBy}
              onValueChange={(v: string) => setSortBy(v)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date de création</SelectItem>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="price">Prix</SelectItem>
                <SelectItem value="updated_at">Dernière modification</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={sortOrder}
              onValueChange={(v: string) => setSortOrder(v)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ordre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Décroissant</SelectItem>
                <SelectItem value="asc">Croissant</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setPlatform("all");
                  setStatus("all");
                  setPriceMin("");
                  setPriceMax("");
                  setSortBy("created_at");
                  setSortOrder("desc");
                }}
              >
                Réinitialiser
              </Button>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Total: <span className="font-medium">{totalCount}</span>
              </span>
            </div>
          </AdminToolbar>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produits</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vendeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{p.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {p.category?.name || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {p.vendor?.name || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">
                      {new Intl.NumberFormat("fr-BJ", {
                        style: "currency",
                        currency: "XOF",
                        minimumFractionDigits: 0,
                      }).format(p.price || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusColor(p.status)}>
                        {p.status || "active"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (p.slug) {
                              window.open(`/product/${p.slug}`, "_blank");
                            } else {
                              alert("Slug du produit manquant.");
                            }
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/products/${p.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 py-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
            >
              Précédent
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {page} sur {Math.ceil(totalCount / 20)}
              </span>
              <span className="text-sm text-gray-500">
                ({items.length} produits)
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => prev + 1)}
              disabled={page >= Math.ceil(totalCount / 20) || loading}
            >
              Suivant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

