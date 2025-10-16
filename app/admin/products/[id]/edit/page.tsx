'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductsService, UpdateProductData, Product } from '@/lib/services/products.service';
import { Badge } from '@/components/ui/badge';
import WysiwygEditor from '@/components/admin/WysiwygEditor';
import { showSuccessToast, showErrorToast } from '@/components/ui/enhanced-toast';

export default function AdminEditProductPage() {
  const params = useParams();
  const productId = Array.isArray(params?.id) ? params?.id[0] : (params as any)?.id;
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [product, setProduct] = React.useState<Product | null>(null);

  React.useEffect(() => {
    (async () => {
      // There is no getById in service; fetch directly by id
      const { data, error } = await (ProductsService as any).getSupabaseClient()
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      setLoading(false);
      if (!error) setProduct(data as Product);
    })();
  }, [productId]);

  async function save(patch: Partial<Product>) {
    if (!product) return;
    setSaving(true);
    setMessage('');
    const res = await ProductsService.update({ id: product.id, ...patch } as UpdateProductData);
    setSaving(false);
    if (res.success && res.data) {
      setProduct(res.data as Product);
      setMessage('Produit mis à jour.');
      showSuccessToast('Produit publié avec succès !');
    } else {
      setMessage(res.error || 'Erreur de sauvegarde');
      showErrorToast(res.error || 'Erreur de sauvegarde');
    }
  }

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!product) return <div className="p-6">Produit introuvable.</div>;

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Éditer produit</h1>
          {message && <Badge className="bg-orange-600">{message}</Badge>}
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
                  <Input value={product.name} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setProduct({ ...product, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Slug</label>
                  <Input value={product.slug} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setProduct({ ...product, slug: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Description</label>
                  <WysiwygEditor
                    value={product.description || ''}
                    onChange={(content) => setProduct({ ...product, description: content })}
                    placeholder="Description du produit..."
                    height={300}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Résumé</label>
                  <Textarea value={product.short_description || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>setProduct({ ...product, short_description: e.target.value })} />
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
                  <Input value={product.sku} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setProduct({ ...product, sku: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Prix</label>
                  <Input type="number" value={product.price} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setProduct({ ...product, price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Quantité</label>
                  <Input type="number" value={product.quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setProduct({ ...product, quantity: Number(e.target.value) })} />
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
                  <Input value={product.meta_title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setProduct({ ...product, meta_title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Meta Description</label>
                  <Input value={product.meta_description || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setProduct({ ...product, meta_description: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={()=>save({})} disabled={saving}>Enregistrer</Button>
          <Button className="bg-jomionstore-primary hover:bg-orange-700" onClick={()=>save({ status: 'active' })} disabled={saving}>Publier</Button>
        </div>
      </div>
  );
}

