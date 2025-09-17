'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BannersService, Banner } from '@/lib/services/banners.service';
import { Download, Plus, Search, Eye, Edit, Trash2, Rocket } from 'lucide-react';

export default function AdminAdsPage() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<Banner[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [filters, setFilters] = React.useState<{ slot?: Banner['slot']; is_active?: boolean; search?: string }>({});
  const [creating, setCreating] = React.useState(false);
  const [form, setForm] = React.useState<Partial<Banner>>({ title: '', slot: 'homepage-hero', image_url: '', link_url: '', is_active: true, priority: 10 });

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await BannersService.getAll(filters, { page, limit: 10 });
    setLoading(false);
    if (res.success) {
      setItems(res.data);
      setTotalPages(res.pagination?.totalPages || 1);
    }
  }, [filters, page]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <ProtectedRoute requireAuth={true} requireRole="admin">
      <div className="min-h-screen bg-beshop-background">
        <Header />
        <CategoryMenu />
        <div className="container py-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <a href="/" className="hover:text-beshop-primary">Accueil</a>
            <span>/</span>
            <a href="/admin/dashboard" className="hover:text-beshop-primary">Admin</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Annonces</span>
          </nav>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Gestion des annonces</h1>
            <div className="flex gap-2">
              <Button onClick={() => setCreating(v => !v)} className="bg-beshop-primary hover:bg-blue-700"><Plus className="w-4 h-4 mr-2"/>Nouvelle annonce</Button>
              <Button variant="outline"><Download className="w-4 h-4 mr-2"/>Exporter</Button>
            </div>
          </div>

          {/* Create/Edit */}
          {creating && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Créer une annonce</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Titre</label>
                  <Input value={form.title || ''} onChange={(e)=>setForm(f=>({...f, title: e.target.value}))} placeholder="Titre de l'annonce"/>
                </div>
                <div>
                  <label className="block text-sm mb-2">Slot</label>
                  <Select value={form.slot || 'homepage-hero'} onValueChange={(v)=>setForm(f=>({...f, slot: v as any}))}>
                    <SelectTrigger><SelectValue placeholder="Slot"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage-hero">Homepage – Hero</SelectItem>
                      <SelectItem value="homepage-mid">Homepage – Milieu</SelectItem>
                      <SelectItem value="category-top">Catégorie – Haut</SelectItem>
                      <SelectItem value="category-mid">Catégorie – Milieu</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Image URL</label>
                  <Input value={form.image_url || ''} onChange={(e)=>setForm(f=>({...f, image_url: e.target.value}))} placeholder="https://..."/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Lien (optionnel)</label>
                  <Input value={form.link_url || ''} onChange={(e)=>setForm(f=>({...f, link_url: e.target.value}))} placeholder="https://..."/>
                </div>
                <div>
                  <label className="block text-sm mb-2">Priorité</label>
                  <Input type="number" value={form.priority ?? 10} onChange={(e)=>setForm(f=>({...f, priority: Number(e.target.value)}))}/>
                </div>
                <div className="flex items-end gap-3">
                  <Button className="bg-beshop-primary hover:bg-blue-700" onClick={async ()=>{
                    const payload = { ...form, is_active: form.is_active ?? true } as any;
                    const res = await BannersService.create(payload);
                    if (res.success) {
                      setCreating(false);
                      setForm({ title: '', slot: 'homepage-hero', image_url: '', link_url: '', is_active: true, priority: 10 });
                      await load();
                    }
                  }}><Rocket className="w-4 h-4 mr-2"/>Publier</Button>
                  <Button variant="outline" onClick={()=>setCreating(false)}>Annuler</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="mb-4">
            <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                <Input className="pl-10" placeholder="Rechercher un titre..." onChange={(e)=>setFilters(f=>({...f, search: e.target.value}))}/>
              </div>
              <Select value={filters.slot} onValueChange={(v)=>setFilters(f=>({...f, slot: v as any}))}>
                <SelectTrigger className="w-56"><SelectValue placeholder="Tous les slots"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="homepage-hero">Homepage – Hero</SelectItem>
                  <SelectItem value="homepage-mid">Homepage – Milieu</SelectItem>
                  <SelectItem value="category-top">Catégorie – Haut</SelectItem>
                  <SelectItem value="category-mid">Catégorie – Milieu</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeof filters.is_active === 'boolean' ? String(filters.is_active) : undefined} onValueChange={(v)=>setFilters(f=>({...f, is_active: v === 'true' ? true : v === 'false' ? false : undefined}))}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Statut"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Actives</SelectItem>
                  <SelectItem value="false">Inactives</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" onClick={()=>setFilters({})}>Réinitialiser</Button>
              </div>
            </CardContent>
          </Card>

          {/* List */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((b) => (
                      <tr key={b.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{b.title}</div>
                          <div className="text-xs text-gray-600 truncate max-w-xs">{b.image_url}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.slot}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.priority}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={b.is_active ? 'bg-green-500' : 'bg-gray-400'}>{b.is_active ? 'Active' : 'Inactive'}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm"><Eye className="w-4 h-4"/></Button>
                            <Button variant="ghost" size="sm"><Edit className="w-4 h-4"/></Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={async ()=>{
                              const res = await BannersService.delete(b.id);
                              if (res.success) await load();
                            }}><Trash2 className="w-4 h-4"/></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center gap-2 py-4">
                <Button size="sm" variant="outline" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Précédent</Button>
                <span className="px-2 py-1 text-sm">Page {page} / {totalPages}</span>
                <Button size="sm" variant="outline" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Suivant</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

