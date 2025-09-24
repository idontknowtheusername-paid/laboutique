'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProductsService } from '@/lib/services/products.service';
import { Download, Search, Eye, Edit, RefreshCw } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminToolbar from '@/components/admin/AdminToolbar';
import ImportedProductsPreview from '@/components/admin/ImportedProductsPreview';

interface AdminProduct {
  id: string;
  name: string;
  price: number;
  slug?: string;
  status?: string;
  category?: { name: string };
  vendor?: { name: string };
}

export default function AdminProductsPage() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<AdminProduct[]>([]);
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<string>('all');

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await ProductsService.getNew(200);
    setLoading(false);
    if (res.success && res.data) {
      let list = res.data as any as AdminProduct[];
      if (search) {
        list = list.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));
      }
      if (category !== 'all') {
        list = list.filter((p) => p.category?.name?.toLowerCase() === category);
      }
      setItems(list);
    }
  }, [search, category]);

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
          <>
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" /> Rafraîchir
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/admin/products/import")}
            >
              <Download className="w-4 h-4 mr-2" /> Importer un article
            </Button>
            <Button
              className="bg-beshop-primary hover:bg-blue-700"
              onClick={() =>
                (window.location.href = "/admin/products/bulk-import")
              }
            >
              <Download className="w-4 h-4 mr-2" /> Import en masse
            </Button>
          </>
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
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {p.category?.name || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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

