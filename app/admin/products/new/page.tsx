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
import { VendorSelector } from '@/components/admin/VendorSelector';
import { CategorySelector } from '@/components/admin/CategorySelector';
import { Download, AlertCircle, CheckCircle } from 'lucide-react';

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

// Fonction utilitaire pour générer un SKU
function generateSKU(name: string, categoryId?: string): string {
  const timestamp = Date.now().toString().slice(-6); // 6 derniers chiffres du timestamp
  const namePrefix = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Garder seulement lettres et chiffres
    .slice(0, 4); // Max 4 caractères
  
  // Utiliser un préfixe simple basé sur les premières lettres du nom
  const categoryPrefix = 'PRD';
  
  return `${categoryPrefix}-${namePrefix}-${timestamp}`;
}

// Fonction utilitaire pour générer l'URL du produit
function generateProductURL(slug: string): string {
  return `${window.location.origin}/product/${slug}`;
}

export default function AdminNewProductPage() {
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string>('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
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
      
      // Générer automatiquement le SKU si le nom change et que le SKU est vide
      if (patch.name && !f.sku) {
        newForm.sku = generateSKU(patch.name, newForm.category_id);
      }
      
      // Régénérer le SKU si la catégorie change et qu'on a déjà un nom
      if (patch.category_id && f.name && f.sku) {
        newForm.sku = generateSKU(f.name, patch.category_id);
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
    
    // Effacer les erreurs quand l'utilisateur modifie le champ
    if (patch.name && errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
    if (patch.price && errors.price) {
      setErrors(prev => ({ ...prev, price: '' }));
    }
    if (patch.vendor_id && errors.vendor_id) {
      setErrors(prev => ({ ...prev, vendor_id: '' }));
    }
    if (patch.category_id && errors.category_id) {
      setErrors(prev => ({ ...prev, category_id: '' }));
    }
    if (patch.sku && errors.sku) {
      setErrors(prev => ({ ...prev, sku: '' }));
    }
  };

  // Fonction de validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name?.trim()) {
      newErrors.name = 'Le nom du produit est obligatoire';
    }
    
    if (!form.sku?.trim()) {
      newErrors.sku = 'Le code produit (SKU) est obligatoire';
    }
    
    if (!form.price || form.price <= 0) {
      newErrors.price = 'Le prix doit être supérieur à 0';
    }
    
    if (!form.vendor_id) {
      newErrors.vendor_id = 'Veuillez sélectionner un vendeur';
    }
    
    if (!form.category_id) {
      newErrors.category_id = 'Veuillez sélectionner une catégorie';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImportClick = () => {
    console.log('🚀 Import button clicked!');
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
    // Valider le formulaire avant de sauvegarder
    if (!validateForm()) {
      setMessage('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setSaving(true);
    setMessage('');
    setErrors({});
    
    try {
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
      
      const resp = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const res = await resp.json();
      if (resp.ok && res.success && res.data) {
        setMessage('Produit créé avec succès !');
        // Rediriger vers la liste des produits après 2 secondes
        setTimeout(() => {
          window.location.href = '/admin/products';
        }, 2000);
      } else {
        setMessage(res.error || 'Erreur lors de la création');
      }
    } catch (error: any) {
      setMessage(error.message || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Nouveau produit</h1>
          <div className="flex items-center gap-3">
            {message && (
              <Badge className={message.includes('succès') ? 'bg-green-600' : 'bg-red-600'}>
                {message.includes('succès') ? (
                  <><CheckCircle className="w-3 h-3 mr-1" />{message}</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" />{message}</>
                )}
              </Badge>
            )}
          </div>
        </div>

        {/* IMPORT ALIEXPRESS/ALIBABA - version compacte (-60%) */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md p-3 shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold mb-1">🚀 Import Rapide</h2>
              <p className="text-blue-100 text-xs">Importez des produits depuis AliExpress ou AliBaba en un clic !</p>
            </div>
            <Button 
              variant="secondary"
              className="flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 font-medium h-9 px-4"
              onClick={() => window.location.href = '/admin/products/import'}
            >
              <Download className="w-4 h-4" />
              Importer
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
                  <label className="block text-sm font-medium mb-2">
                    Nom du produit *
                    {errors.name && (
                      <span className="text-red-500 ml-2 text-xs">
                        <AlertCircle className="inline w-3 h-3 mr-1" />
                        {errors.name}
                      </span>
                    )}
                  </label>
                  <Input 
                    placeholder="Ex: iPhone 15 Pro Max 256GB"
                    value={form.name || ''} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ name: e.target.value })}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL du produit</label>
                  <Input 
                    placeholder="Ex: iphone-15-pro-max-256gb"
                    value={form.slug || ''} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ slug: e.target.value })} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Généré automatiquement à partir du nom</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description complète du produit</label>
                  <Textarea 
                    placeholder="Décrivez en détail votre produit, ses caractéristiques, avantages, spécifications techniques..."
                    rows={4}
                    value={form.description || ''} 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>update({ description: e.target.value })} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Description détaillée du produit</p>
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
                  <p className="text-xs text-gray-500 mt-1">{form.short_description?.length || 0}/150 caractères</p>
                </div>
                <div className="md:col-span-2">
                  <ImageUploader
                    label="Photos du produit"
                    bucket="images"
                    folder="products"
                    multiple={true}
                    value={(form.images || []).map((url: any)=>({ url }))}
                    onChange={(next)=>{
                      const urls = Array.isArray(next) ? next.map((n:any)=>n.url) : (next ? [next.url] : []);
                      update({ images: urls });
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Glissez-déposez ou cliquez pour sélectionner</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Vendeur *
                    {errors.vendor_id && (
                      <span className="text-red-500 ml-2 text-xs">
                        <AlertCircle className="inline w-3 h-3 mr-1" />
                        {errors.vendor_id}
                      </span>
                    )}
                  </label>
                  <VendorSelector
                    value={form.vendor_id}
                    onChange={(vendorId) => update({ vendor_id: vendorId })}
                    placeholder="Sélectionner un vendeur"
                  />
                  <p className="text-xs text-gray-500 mt-1">Choisissez le vendeur responsable de ce produit</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Catégorie *
                    {errors.category_id && (
                      <span className="text-red-500 ml-2 text-xs">
                        <AlertCircle className="inline w-3 h-3 mr-1" />
                        {errors.category_id}
                      </span>
                    )}
                  </label>
                  <CategorySelector
                    value={form.category_id}
                    onChange={(categoryId) => update({ category_id: categoryId })}
                    placeholder="Sélectionner une catégorie"
                  />
                  <p className="text-xs text-gray-500 mt-1">Choisissez la catégorie qui correspond le mieux à ce produit</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader><CardTitle>Prix et gestion du stock</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Code produit (SKU) *
                    {errors.sku && (
                      <span className="text-red-500 ml-2 text-xs">
                        <AlertCircle className="inline w-3 h-3 mr-1" />
                        {errors.sku}
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Ex: IPH15PM-256-BLK"
                      value={form.sku || ''} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ sku: e.target.value })}
                      className={errors.sku ? 'border-red-500' : ''}
                    />
                    {form.sku && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(form.sku!);
                          setMessage('SKU copié dans le presse-papiers !');
                          setTimeout(() => setMessage(''), 3000);
                        }}
                      >
                        Copier
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {form.name ? 'Généré automatiquement - Modifiable si nécessaire' : 'Identifiant unique du produit'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    URL du produit
                  </label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={form.slug ? generateProductURL(form.slug) : ''}
                      readOnly
                      className="bg-gray-50 text-gray-600"
                      placeholder="L'URL sera générée automatiquement"
                    />
                    {form.slug && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = generateProductURL(form.slug!);
                          navigator.clipboard.writeText(url);
                          setMessage('URL copiée dans le presse-papiers !');
                          setTimeout(() => setMessage(''), 3000);
                        }}
                      >
                        Copier
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">URL publique du produit (générée automatiquement)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Prix de vente (FCFA) *
                    {errors.price && (
                      <span className="text-red-500 ml-2 text-xs">
                        <AlertCircle className="inline w-3 h-3 mr-1" />
                        {errors.price}
                      </span>
                    )}
                  </label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 850000"
                    value={form.price ?? 0} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update({ price: Number(e.target.value) })}
                    className={errors.price ? 'border-red-500' : ''}
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
          <Button className="bg-jomiastore-primary hover:bg-blue-700" onClick={()=>handleSave('active')} disabled={saving}>
            {saving ? 'Publication...' : 'Publier le produit'}
          </Button>
        </div>
      </div>
  );
}

