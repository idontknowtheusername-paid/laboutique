'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductsService, CreateProductData } from '@/lib/services/products.service';
import { Badge } from '@/components/ui/badge';

export default function AdminNewProductPage() {
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string>('');
  const [form, setForm] = React.useState<Partial<CreateProductData>>({
    name: '', slug: '', sku: '', price: 0, vendor_id: '', category_id: '',
    status: 'draft', track_quantity: true, quantity: 0, featured: false,
    meta_title: '', meta_description: ''
  });

  const update = (patch: Partial<CreateProductData>) => setForm((f) => ({ ...f, ...patch }));

  async function handleSave(status: 'draft' | 'active') {
    setSaving(true);
    setMessage('');
    const payload: CreateProductData = {
      name: form.name || '',
      slug: (form.slug || '').trim(),
      sku: (form.sku || '').trim(),
      price: Number(form.price || 0),
      vendor_id: form.vendor_id || '',
      category_id: form.category_id,
      description: form.description,
      short_description: form.short_description,
      track_quantity: form.track_quantity ?? true,
      quantity: Number(form.quantity || 0),
      status,
      featured: !!form.featured,
      meta_title: form.meta_title,
      meta_description: form.meta_description,
      images: form.images || []
    };
    const res = await ProductsService.create(payload);
    setSaving(false);
    if (res.success && res.data) {
      setMessage('Produit créé avec succès.');
    } else {
      setMessage(res.error || 'Erreur lors de la création');
    }
  }

  return (
    <ProtectedRoute requireAuth={true} requireRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Nouveau produit</h1>
          {message && <Badge className="bg-blue-600">{message}</Badge>}
        </div>

        <Tabs defaultValue="infos" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="infos">Infos</TabsTrigger>
            <TabsTrigger value="pricing">Prix & Stock</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="infos">
            <Card>
              <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Nom</label>
                  <Input value={form.name || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Slug</label>
                  <Input value={form.slug || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ slug: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Description</label>
                  <Textarea value={form.description || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>update({ description: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Résumé</label>
                  <Textarea value={form.short_description || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>update({ short_description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Vendeur (ID)</label>
                  <Input value={form.vendor_id || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ vendor_id: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Catégorie (ID)</label>
                  <Input value={form.category_id || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ category_id: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader><CardTitle>Prix & Stock</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-2">SKU</label>
                  <Input value={form.sku || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ sku: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Prix</label>
                  <Input type="number" value={form.price ?? 0} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Quantité</label>
                  <Input type="number" value={form.quantity ?? 0} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ quantity: Number(e.target.value) })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Meta Title</label>
                  <Input value={form.meta_title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ meta_title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Meta Description</label>
                  <Input value={form.meta_description || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ meta_description: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={()=>handleSave('draft')} disabled={saving}>Enregistrer brouillon</Button>
          <Button className="bg-beshop-primary hover:bg-blue-700" onClick={()=>handleSave('active')} disabled={saving}>Publier</Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}

