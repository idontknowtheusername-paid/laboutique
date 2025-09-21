'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductsService, CreateProductData } from '@/lib/services/products.service';
import { Badge } from '@/components/ui/badge';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Download } from 'lucide-react';

// Fonction utilitaire pour générer un slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // Décomposer les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
    .trim() // Supprimer les espaces en début/fin
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début/fin
}

export default function AdminNewProductPage() {
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string>('');
  const [form, setForm] = React.useState<Partial<CreateProductData>>({
    name: '', slug: '', sku: '', price: 0, vendor_id: '', category_id: '',
    status: 'draft', track_quantity: true, quantity: 0, featured: false,
    meta_title: '', meta_description: '', images: []
  });

  const update = (patch: Partial<CreateProductData>) => {
    setForm((f) => {
      const newForm = { ...f, ...patch };
      
      // Générer automatiquement le slug si le nom change et que le slug est vide
      if (patch.name && !f.slug) {
        newForm.slug = generateSlug(patch.name);
      }
      
      // Générer automatiquement le SEO si le nom change
      if (patch.name) {
        // Meta title : nom du produit + " - La Boutique B"
        if (!f.meta_title) {
          newForm.meta_title = `${patch.name} - La Boutique B`;
        }
        
        // Meta description : résumé court ou début de la description
        if (!f.meta_description) {
          const description = f.short_description || f.description || '';
          const metaDesc = description.length > 0 
            ? description.substring(0, 150) + (description.length > 150 ? '...' : '')
            : `Découvrez ${patch.name} sur La Boutique B. Qualité garantie, livraison rapide au Bénin.`;
          newForm.meta_description = metaDesc;
        }
      }
      
      return newForm;
    });
  };

  const handleImportClick = () => {
    const url = prompt('Collez l\'URL du produit AliExpress ou AliBaba :');
    if (!url) return;

    if (!url.includes('aliexpress.com') && !url.includes('alibaba.com')) {
      alert('URL non supportée. Seuls AliExpress et AliBaba sont supportés.');
      return;
    }

    // Import direct
    handleDirectImport(url);
  };

  const handleDirectImport = async (url: string) => {
    try {
      setSaving(true);
      setMessage('');

      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, importDirectly: true }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'import');
      }

      setMessage('Produit importé avec succès !');
      setTimeout(() => {
        setMessage('');
        // Rediriger vers la liste des produits
        window.location.href = '/admin/products';
      }, 2000);

    } catch (error: any) {
      setMessage(error.message || 'Erreur lors de l\'import du produit');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Nouveau produit</h1>
          <div className="flex items-center gap-3">
            {message && <Badge className="bg-blue-600">{message}</Badge>}
          </div>
        </div>

        {/* Bouton d'import plus visible */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Import rapide</h3>
              <p className="text-xs text-blue-700">Importez des produits depuis AliExpress ou AliBaba</p>
            </div>
            <Button 
              variant="default" 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={handleImportClick}
            >
              <Download className="w-4 h-4" />
              Importer un produit
            </Button>
          </div>
        </div>

        <Tabs defaultValue="infos" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="infos">Informations de base</TabsTrigger>
            <TabsTrigger value="pricing">Prix et stock</TabsTrigger>
            <TabsTrigger value="seo">Référencement</TabsTrigger>
          </TabsList>

          <TabsContent value="infos">
            <Card>
              <CardHeader><CardTitle>Informations du produit</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom du produit *</label>
                  <Input 
                    placeholder="Ex: iPhone 15 Pro Max 256GB"
                    value={form.name || ''} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ name: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL du produit</label>
                  <Input 
                    placeholder="Ex: iphone-15-pro-max-256gb"
                    value={form.slug || ''} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ slug: e.target.value })} 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Partie de l'URL qui identifie votre produit (ex: laboutique.bj/produits/iphone-15-pro-max-256gb). 
                    <span className="font-medium text-green-600">Généré automatiquement</span> à partir du nom si laissé vide.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description complète du produit</label>
                  <Textarea 
                    placeholder="Décrivez en détail votre produit, ses caractéristiques, avantages, spécifications techniques..."
                    rows={4}
                    value={form.description || ''} 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>update({ description: e.target.value })} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Description détaillée qui apparaîtra sur la page produit complète</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Aperçu du produit</label>
                  <Textarea 
                    placeholder="Description courte qui apparaîtra dans les listes et cartes de produits (max 150 caractères)"
                    rows={2}
                    maxLength={150}
                    value={form.short_description || ''} 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>update({ short_description: e.target.value })} 
                  />
                  <p className="text-xs text-gray-500 mt-1">{form.short_description?.length || 0}/150 caractères - Utilisé dans les listes et aperçus</p>
                </div>
                <div className="md:col-span-2">
                  <ImageUploader
                    label="Photos du produit"
                    bucket="images"
                    folder="products"
                    multiple
                    value={(form.images || []).map((url: any)=>({ url }))}
                    onChange={(next)=>{
                      const urls = Array.isArray(next) ? next.map((n:any)=>n.url) : (next ? [next.url] : []);
                      update({ images: urls });
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Glissez-déposez plusieurs images ou cliquez pour sélectionner. La première image sera l'image principale.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Vendeur</label>
                  <Input 
                    placeholder="ID du vendeur (ex: 123)"
                    value={form.vendor_id || ''} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ vendor_id: e.target.value })} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Temporaire: sera remplacé par un sélecteur</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Catégorie</label>
                  <Input 
                    placeholder="ID de la catégorie (ex: 456)"
                    value={form.category_id || ''} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ category_id: e.target.value })} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Temporaire: sera remplacé par un sélecteur</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader><CardTitle>Prix et gestion du stock</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Code produit (SKU)</label>
                  <Input 
                    placeholder="Ex: IPH15PM-256-BLK"
                    value={form.sku || ''} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ sku: e.target.value })} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Identifiant unique du produit</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prix de vente (FCFA) *</label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 850000"
                    value={form.price ?? 0} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ price: Number(e.target.value) })} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Prix en francs CFA</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quantité en stock</label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 10"
                    value={form.quantity ?? 0} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ quantity: Number(e.target.value) })} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Nombre d'unités disponibles</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>Référencement (SEO)</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium text-green-600">Généré automatiquement</span> à partir du nom du produit
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre de la page</label>
                  <Input 
                    placeholder="Ex: iPhone 15 Pro Max 256GB - La Boutique B"
                    value={form.meta_title || ''} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ meta_title: e.target.value })} 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Titre qui apparaîtra dans les résultats Google (max 60 caractères). 
                    <span className="font-medium text-green-600">Généré automatiquement</span> si laissé vide.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description de la page</label>
                  <Textarea 
                    placeholder="Description qui apparaîtra sous le titre dans Google..."
                    rows={3}
                    value={form.meta_description || ''} 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>update({ meta_description: e.target.value })} 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Description pour les moteurs de recherche (max 160 caractères). 
                    <span className="font-medium text-green-600">Générée automatiquement</span> à partir de l'aperçu du produit.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={()=>handleSave('draft')} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer comme brouillon'}
          </Button>
          <Button className="bg-beshop-primary hover:bg-blue-700" onClick={()=>handleSave('active')} disabled={saving}>
            {saving ? 'Publication...' : 'Publier le produit'}
          </Button>
        </div>
      </div>
  );
}

