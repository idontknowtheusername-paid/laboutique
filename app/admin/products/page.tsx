'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProductsService } from '@/lib/services/products.service';
import { Download, Search, Eye, Edit, RefreshCw, Plus } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminToolbar from '@/components/admin/AdminToolbar';
import ImportedProductsPreview from '@/components/admin/ImportedProductsPreview';
import { useToast } from '@/components/admin/Toast';

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
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<AdminProduct[]>([]);
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<string>('all');
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const { success, error, info } = useToast();

  // Test de connexion à la base de données
  async function testDatabaseConnection() {
    try {
      const client = (ProductsService as any).getSupabaseClient();
      const { data, error } = await client.from('products').select('count').limit(1);
      
      if (error) {
        error('Erreur de connexion', `Impossible de se connecter à la base: ${error.message}`);
      } else {
        success('Connexion réussie', 'La base de données est accessible');
      }
    } catch (err) {
      error('Erreur de connexion', 'Impossible de se connecter à la base de données');
    }
  }

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      // Récupérer tous les produits (pas seulement les actifs)
      const res = await ProductsService.getAll(
        { status: undefined }, // Pas de filtre de statut pour voir tous les produits
        { page: 1, limit: 200 }
      );
      
      if (res.success && res.data) {
        let list = res.data as any as AdminProduct[];
        
        // Appliquer les filtres côté client
        if (search) {
          list = list.filter((p) => 
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.sku?.toLowerCase().includes(search.toLowerCase()) ||
            p.brand?.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        if (category !== 'all') {
          list = list.filter((p) => p.category?.name?.toLowerCase() === category);
        }
        
        setItems(list);
        setTotalCount(res.pagination?.total || 0);
        success('Données chargées', `${list.length} produits chargés`);
      } else {
        console.error('Erreur lors du chargement des produits:', res.error);
        error('Erreur de chargement', res.error || 'Impossible de charger les produits');
        setItems([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
      error('Erreur inattendue', 'Une erreur est survenue lors du chargement des produits');
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [search, category, error, success]);

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
              onClick={() => (window.location.href = "/admin/products/new")}
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
              onClick={() => (window.location.href = "/admin/products/import")}
            >
              <Download className="w-4 h-4 mr-2" /> Importer
            </Button>
            <Button
              className="bg-jomiastore-primary hover:bg-blue-700"
              onClick={() =>
                (window.location.href = "/admin/products/bulk-import")
              }
            >
              <Download className="w-4 h-4 mr-2" /> Import masse
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
              <SelectTrigger className="w-56">
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
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
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
                          onClick={() => {
                            window.location.href = `/admin/products/${p.id}/edit`;
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

